import { Worker, Job } from 'bullmq';
import { db } from '@ai-workforce/db';
import { icps, companies, leads, suppression_list } from '@ai-workforce/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { ApolloLeadProvider, DiscoveredLead } from '@ai-workforce/core/providers/lead-provider';
import { ZeroBounceMockProvider } from '@ai-workforce/core/providers/email-verifier';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const FREE_MAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];

export const discoverLeadsWorker = new Worker(
  'discover-leads-queue',
  async (job: Job) => {
    const { icpId, orgId } = job.data;
    console.log(`[DiscoverLeads] Starting discovery for ICP ${icpId}`);

    const icp = await db.query.icps.findFirst({
      where: eq(icps.id, icpId),
    });

    if (!icp) {
      throw new Error(`ICP ${icpId} not found`);
    }

    const provider = new ApolloLeadProvider();
    const verifier = new ZeroBounceMockProvider();

    // 1. Fetch target companies
    const criteria = icp.criteria as any;
    const persona = icp.persona as any;
    
    console.log(`[DiscoverLeads] Fetching companies for ICP criteria...`);
    const fetchedCompanies = await provider.searchCompanies(criteria, 10);
    
    // Filter out freemail domains immediately
    const validDomains = fetchedCompanies.filter(c => !FREE_MAIL_DOMAINS.includes(c.domain.toLowerCase()));

    // 2. Dedupe against existing companies and suppression list
    const domainNames = validDomains.map(c => c.domain.toLowerCase());
    
    const existingCompanies = await db.query.companies.findMany({
      where: and(eq(companies.org_id, orgId), inArray(companies.domain, domainNames))
    });
    
    const suppressed = await db.query.suppression_list.findMany({
      where: and(eq(suppression_list.org_id, orgId), eq(suppression_list.entity_type, 'domain'), inArray(suppression_list.entity_value, domainNames))
    });

    const existingDomains = new Set(existingCompanies.map(c => c.domain.toLowerCase()));
    const suppressedDomains = new Set(suppressed.map(s => s.entity_value.toLowerCase()));

    const newCompanies = validDomains.filter(c => !existingDomains.has(c.domain.toLowerCase()) && !suppressedDomains.has(c.domain.toLowerCase()));

    const companyIdMap = new Map<string, string>();
    existingCompanies.forEach(c => companyIdMap.set(c.domain.toLowerCase(), c.id));

    // Save new companies
    for (const company of newCompanies) {
      const [inserted] = await db.insert(companies).values({
        org_id: orgId,
        domain: company.domain.toLowerCase(),
        name: company.name,
        industry: company.industry,
        employee_count: company.employee_count.toString()
      }).returning({ id: companies.id });
      
      companyIdMap.set(company.domain.toLowerCase(), inserted.id);
    }

    // 3. Fetch contacts matching persona
    const allContacts: DiscoveredLead[] = [];
    for (const domain of domainNames) {
      if (suppressedDomains.has(domain.toLowerCase())) continue;
      
      const contacts = await provider.searchContacts(domain, persona, 3);
      allContacts.push(...contacts);
    }

    // Dedupe contacts against suppression list (emails)
    const emails = allContacts.map(c => c.email.toLowerCase());
    const suppressedEmails = await db.query.suppression_list.findMany({
      where: and(eq(suppression_list.org_id, orgId), eq(suppression_list.entity_type, 'email'), inArray(suppression_list.entity_value, emails))
    });
    const suppressedEmailSet = new Set(suppressedEmails.map(s => s.entity_value.toLowerCase()));

    const validContacts = allContacts.filter(c => !suppressedEmailSet.has(c.email.toLowerCase()));

    // 4. Verify emails and save leads
    let leadsCreated = 0;
    for (const contact of validContacts) {
      // Dedupe against existing leads
      const existingLead = await db.query.leads.findFirst({
        where: and(eq(leads.org_id, orgId), eq(leads.email, contact.email.toLowerCase()))
      });

      if (existingLead) continue;

      const verification = await verifier.verify(contact.email);
      
      if (verification.status === 'invalid') {
        continue; // Skip invalid emails
      }

      await db.insert(leads).values({
        org_id: orgId,
        icp_id: icpId,
        company_id: companyIdMap.get(contact.company_domain.toLowerCase()),
        name: contact.name,
        email: contact.email.toLowerCase(),
        email_status: verification.status,
        company: contact.company,
        linkedin_url: contact.linkedin_url,
        status: 'new',
        metadata: contact.metadata
      });
      leadsCreated++;
    }

    console.log(`[DiscoverLeads] Finished. Created ${leadsCreated} new leads.`);
    
    await db.update(icps).set({ last_run_at: new Date() }).where(eq(icps.id, icpId));

    return { success: true, leadsCreated };
  },
  {
    connection: new (require("ioredis").default || require("ioredis"))(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, lazyConnect: true, retryStrategy: () => null }),
    concurrency: 2
  }
);

discoverLeadsWorker.on('failed', (job, err) => {
  if (String(`Job ${job?.id} failed with error ${err.message}`).includes('ECONNREFUSED')) { return; } 
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});

import { Worker, Job } from 'bullmq';
import { db } from '@ai-workforce/db';
import { leads, companies, suppression_list, integrations } from '@ai-workforce/db/schema';
import { eq, and } from 'drizzle-orm';
import { CRMProviderFactory } from '@ai-workforce/core/providers/crm-provider';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const crmSyncWorker = new Worker(
  'crm-sync-queue',
  async (job: Job) => {
    const { integrationId, orgId } = job.data;
    console.log(`[CRMSync] Starting 2-way sync for integration ${integrationId}`);

    const integration = await db.query.integrations.findFirst({
      where: eq(integrations.id, integrationId)
    });

    if (!integration) throw new Error('Integration not found');

    const provider = CRMProviderFactory.getProvider(integration.provider);

    // 1. Pull Customers into Suppression
    const crmContacts = await provider.pullContacts(integrationId, integration.credentials);
    let suppressedCount = 0;

    for (const contact of crmContacts) {
      if (contact.isCustomer) {
        const domain = contact.email.split('@')[1].toLowerCase();
        
        // Idempotent suppression insert
        const existing = await db.query.suppression_list.findFirst({
          where: and(
            eq(suppression_list.org_id, orgId),
            eq(suppression_list.entity_type, 'domain'),
            eq(suppression_list.entity_value, domain)
          )
        });

        if (!existing) {
          await db.insert(suppression_list).values({
            org_id: orgId,
            entity_type: 'domain',
            entity_value: domain,
            reason: 'customer'
          });
          suppressedCount++;
        }
      }
    }

    // 2. Push Leads out to CRM (Contacted or Enriched)
    const syncableLeads = await db.query.leads.findMany({
      where: eq(leads.org_id, orgId)
    });
    
    let pushedCount = 0;
    for (const lead of syncableLeads) {
      if (lead.status !== 'new') {
        const success = await provider.pushLead(integrationId, lead, integration.credentials);
        if (success) pushedCount++;
      }
    }

    await db.update(integrations).set({ last_sync_at: new Date() }).where(eq(integrations.id, integrationId));
    console.log(`[CRMSync] Finished. Suppressed ${suppressedCount} new domains, Pushed ${pushedCount} leads.`);
    
    return { success: true, suppressedCount, pushedCount };
  },
  { connection: new (require("ioredis").default || require("ioredis"))(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, lazyConnect: true, retryStrategy: () => null }) }
);

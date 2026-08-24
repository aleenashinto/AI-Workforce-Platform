import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/ai_workforce";
const sqlClient = postgres(DB_URL, { max: 1 });
const db = drizzle(sqlClient, { schema });

const ORG_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_TAG = "seed:ai-workforce-sales-demo-v1";

const companyNames = [
  "NovaStack Technologies",
  "CloudBridge AI",
  "FinCore Systems",
  "BrightCommerce",
  "DataSphere Labs",
  "GreenGrid Solutions",
  "HealthSync Technologies",
  "MarketPilot",
  "Vertex Analytics",
  "QuantumFlow",
  "BlueOrbit Software",
  "Nexora Systems",
  "PixelForge",
  "SecureLayer",
  "Optima Cloud",
  "ScaleWorks",
  "CoreVista",
  "RapidDesk",
  "IntelliRoute",
  "FusionPeak",
  "NorthStar Digital",
  "CloudNest Labs",
  "BrightPath AI",
  "DataForge Systems",
  "FlowMetric",
  "TechVista",
  "CodeHarbor",
  "OrbitStack",
  "InsightWorks",
  "ElevateCloud",
];

const industries = [
  "SaaS",
  "FinTech",
  "Healthcare",
  "E-commerce",
  "AI",
  "Cybersecurity",
  "Education",
  "Manufacturing",
];
const locations = [
  "San Francisco",
  "New York",
  "London",
  "Berlin",
  "Austin",
  "Singapore",
  "Toronto",
];

const firstNames = [
  "Alex",
  "Maria",
  "Sarah",
  "James",
  "Emily",
  "Daniel",
  "Michael",
  "Emma",
  "John",
  "Jessica",
  "David",
  "Sophia",
];
const lastNames = [
  "Johnson",
  "Wilson",
  "Thomas",
  "Anderson",
  "Carter",
  "Miller",
  "Brown",
  "Davis",
  "Smith",
  "Taylor",
  "White",
  "Harris",
];
const jobTitles = [
  "CEO",
  "Founder",
  "CTO",
  "CIO",
  "CMO",
  "VP Engineering",
  "VP Sales",
  "Head of Marketing",
  "Head of Operations",
  "Procurement Manager",
  "IT Director",
];

const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T>(arr: T[]): T => arr[getRandomInt(0, arr.length - 1)];

async function generateDemoData() {
  console.log("�c�️ Starting Demo Data Seed for AI Sales Assistant...");

  await sqlClient`SELECT set_config('app.current_org_id', ${ORG_ID}, false)`;

  console.log("1. Checking for existing demo data...");
  const existingCompanies = await db
    .select({ id: schema.companies.id })
    .from(schema.companies)
    .where(sql`metadata->>'demo' = ${DEMO_TAG}`);
  if (existingCompanies.length > 0) {
    console.log(
      "⚠️ Demo data already exists! Safely skipping to avoid duplicates.",
    );
    process.exit(0);
  }

  // CREATE USERS
  console.log("2. Creating Sales Representatives...");
  const salesUsers = [
    { name: "Alex Johnson", email: "alex.j@demo.aiworkforce" },
    { name: "Maria Wilson", email: "maria.w@demo.aiworkforce" },
    { name: "Sarah Thomas", email: "sarah.t@demo.aiworkforce" },
    { name: "James Anderson", email: "james.a@demo.aiworkforce" },
    { name: "Emily Carter", email: "emily.c@demo.aiworkforce" },
    { name: "Daniel Miller", email: "daniel.m@demo.aiworkforce" },
  ];

  const createdUsers = [];
  for (const su of salesUsers) {
    let existingUser = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(sql`email = ${su.email}`);
    if (existingUser.length > 0) {
      createdUsers.push(existingUser[0].id);
    } else {
      const [u] = await db
        .insert(schema.users)
        .values({
          id: uuidv4(),
          name: su.name,
          email: su.email,
          email_verified: true,
          job_title: "Sales Representative",
        })
        .returning({ id: schema.users.id });
      createdUsers.push(u.id);
    }
  }

  // CREATE CAMPAIGNS
  console.log("3. Creating Campaigns...");
  const campaignNames = [
    "European SaaS Outreach",
    "FinTech CTO Campaign",
    "AI Startup Campaign",
    "Enterprise Support Campaign",
    "AWS Technology Campaign",
  ];
  const createdCampaigns = [];
  for (const name of campaignNames) {
    let existingCamp = await db
      .select({ id: schema.campaigns.id })
      .from(schema.campaigns)
      .where(sql`name = ${name}`);
    if (existingCamp.length > 0) {
      createdCampaigns.push(existingCamp[0].id);
    } else {
      const [c] = await db
        .insert(schema.campaigns)
        .values({
          id: uuidv4(),
          org_id: ORG_ID,
          name,
          status: "active",
        })
        .returning({ id: schema.campaigns.id });
      createdCampaigns.push(c.id);
    }
  }

  // CREATE COMPANIES
  console.log(`4. Creating ${companyNames.length} Companies...`);
  const createdCompanyIds = [];
  for (const name of companyNames) {
    const domain = name.toLowerCase().replace(/\s+/g, "") + "-demo.example";
    const [c] = await db
      .insert(schema.companies)
      .values({
        id: uuidv4(),
        org_id: ORG_ID,
        name,
        domain,
        industry: getRandomItem(industries),
        employee_count: getRandomInt(10, 1000).toString(),
        metadata: { demo: DEMO_TAG, location: getRandomItem(locations) },
      })
      .returning({ id: schema.companies.id });
    createdCompanyIds.push(c.id);
  }

  // CREATE CONTACTS
  console.log("5. Creating Contacts...");
  const createdContactIds = [];
  for (let i = 0; i < 60; i++) {
    const fn = getRandomItem(firstNames);
    const ln = getRandomItem(lastNames);
    const companyId = getRandomItem(createdCompanyIds);
    const [c] = await db
      .insert(schema.contacts)
      .values({
        id: uuidv4(),
        org_id: ORG_ID,
        company_id: companyId,
        first_name: fn,
        last_name: ln,
        full_name: `${fn} ${ln}`,
        job_title: getRandomItem(jobTitles),
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@demo.example`,
        lead_score: getRandomInt(20, 99).toString(),
        status: "new",
      })
      .returning({ id: schema.contacts.id });
    createdContactIds.push({ id: c.id, companyId });
  }

  // CREATE LEADS / PROSPECTS
  console.log("6. Creating Leads & Prospects...");
  const statuses = ["new", "enriched", "contacted", "converted"];
  const createdLeadIds = [];
  for (let i = 0; i < 75; i++) {
    const cInfo = getRandomItem(createdContactIds);
    const score = getRandomInt(30, 98);
    let qualification = "";
    if (score > 80)
      qualification =
        "Strong ICP match. The company operates in the target segment and has recently expanded.";
    else qualification = "Moderate ICP match.";

    const [l] = await db
      .insert(schema.leads)
      .values({
        id: uuidv4(),
        org_id: ORG_ID,
        company_id: cInfo.companyId,
        name: `Lead from ${companyNames[createdCompanyIds.indexOf(cInfo.companyId)]}`,
        status: getRandomItem(statuses),
        score: score.toString(),
        metadata: {
          demo: DEMO_TAG,
          source: "AI Discovery",
          contact_id: cInfo.id,
          qualification,
        },
      })
      .returning({ id: schema.leads.id });
    createdLeadIds.push({
      id: l.id,
      companyId: cInfo.companyId,
      contactId: cInfo.id,
    });
  }

  // CREATE BUYING SIGNALS
  console.log("7. Creating Buying Signals...");
  const signalTypes = [
    "Funding",
    "Hiring",
    "Expansion",
    "Technology Migration",
    "Leadership Change",
  ];
  for (let i = 0; i < 50; i++) {
    await db.insert(schema.buying_signals).values({
      id: uuidv4(),
      org_id: ORG_ID,
      company_id: getRandomItem(createdCompanyIds),
      type: getRandomItem(signalTypes),
      title: "Demo Signal",
      strength: getRandomItem(["High", "Medium", "Low"]),
    });
  }

  // CREATE OPPORTUNITIES
  console.log("8. Creating Opportunities...");
  const oppStages = [
    "Qualified",
    "Meeting",
    "Proposal",
    "Negotiation",
    "Won",
    "Lost",
  ];
  const createdOppIds = [];
  for (let i = 0; i < 25; i++) {
    const lInfo = getRandomItem(createdLeadIds);
    const stage = getRandomItem(oppStages);
    const value = getRandomItem([180000, 320000, 480000, 750000, 120000]);
    const [opp] = await db
      .insert(schema.opportunities)
      .values({
        id: uuidv4(),
        org_id: ORG_ID,
        company_id: lInfo.companyId,
        contact_id: lInfo.contactId,
        lead_id: lInfo.id,
        owner_id: getRandomItem(createdUsers),
        name: `Opportunity for ${companyNames[createdCompanyIds.indexOf(lInfo.companyId)]}`,
        value: value.toString(),
        currency: "INR",
        stage: stage,
        probability:
          stage === "Won"
            ? "100"
            : stage === "Lost"
              ? "0"
              : getRandomInt(20, 80).toString(),
      })
      .returning({ id: schema.opportunities.id });
    createdOppIds.push(opp.id);
  }

  // CREATE ACTIVITIES
  console.log("9. Creating Sales Activities...");
  const actTypes = ["Email", "Call", "Meeting", "Note", "Stage Changed"];
  for (let i = 0; i < 100; i++) {
    await db.insert(schema.sales_activities).values({
      id: uuidv4(),
      org_id: ORG_ID,
      user_id: getRandomItem(createdUsers),
      company_id: getRandomItem(createdCompanyIds),
      opportunity_id: Math.random() > 0.5 ? getRandomItem(createdOppIds) : null,
      type: getRandomItem(actTypes),
      description: "Demo activity interaction",
    });
  }

  // FOLLOW-UPS & MEETINGS
  console.log("10. Creating Follow-ups & Meetings...");
  for (let i = 0; i < 25; i++) {
    await db.insert(schema.follow_ups).values({
      id: uuidv4(),
      org_id: ORG_ID,
      contact_id: getRandomItem(createdContactIds).id,
      company_id: getRandomItem(createdCompanyIds),
      owner_id: getRandomItem(createdUsers),
      status: getRandomItem(["today", "upcoming", "overdue"]), // Actually just pending is fine
      description: "Follow up on proposal",
      due_date: new Date(Date.now() + getRandomInt(-5, 5) * 86400000),
    });
  }

  for (let i = 0; i < 15; i++) {
    await db.insert(schema.meetings).values({
      id: uuidv4(),
      org_id: ORG_ID,
      contact_id: getRandomItem(createdContactIds).id,
      company_id: getRandomItem(createdCompanyIds),
      owner_id: getRandomItem(createdUsers),
      type: getRandomItem(["Discovery Call", "Product Demo", "Negotiation"]),
      status: "scheduled",
      date: new Date(Date.now() + getRandomInt(1, 10) * 86400000),
    });
  }

  // OUTREACH
  console.log("11. Creating Outreach Events...");
  const outStatuses = ["sent", "opened", "replied", "bounced"];
  for (let i = 0; i < 50; i++) {
    await db.insert(schema.outreach_events).values({
      id: uuidv4(),
      lead_id: getRandomItem(createdLeadIds).id,
      campaign_id: getRandomItem(createdCampaigns),
      type: "email",
      content: "Demo email content",
      status: getRandomItem(outStatuses),
    });
  }

  // AI INSIGHTS
  console.log("12. Creating AI Insights & Recommendations...");
  for (let i = 0; i < 15; i++) {
    await db.insert(schema.ai_sales_insights).values({
      id: uuidv4(),
      org_id: ORG_ID,
      type: getRandomItem(["Opportunity", "Risk", "Growth"]),
      title: "Demo Insight",
      description: "Pipeline risk detected",
      priority: getRandomItem(["High", "Medium", "Low"]),
    });
  }

  for (let i = 0; i < 15; i++) {
    await db.insert(schema.ai_recommended_actions).values({
      id: uuidv4(),
      org_id: ORG_ID,
      title: "Contact 3 hot leads",
      action: "Follow up",
      priority: "High",
      status: "Pending",
    });
  }

  console.log("✅ Demo Data Seed completed successfully!");
  process.exit(0);
}

generateDemoData().catch((e) => {
  console.error("❌ Error seeding demo data:", e);
  process.exit(1);
});

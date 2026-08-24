import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const DB_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/ai_workforce";
const sqlClient = postgres(DB_URL, { max: 1 });
const db = drizzle(sqlClient, { schema });

const ORG_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_TAG = "seed:ai-workforce-sales-demo-v1";

async function resetDemoData() {
  console.log("��A Starting Reset of Sales Demo Data...");

  await sqlClient`SELECT set_config('app.current_org_id', ${ORG_ID}, false)`;

  console.log("Finding demo companies...");
  const companies = await db
    .select({ id: schema.companies.id })
    .from(schema.companies)
    .where(sql`metadata->>'demo' = ${DEMO_TAG}`);
  const cIds = companies.map((c) => c.id);

  if (cIds.length === 0) {
    console.log("No demo data found to reset.");
    process.exit(0);
  }

  console.log("Cleaning up related data...");

  await db.delete(schema.ai_recommended_actions).where(sql`true`);
  await db.delete(schema.ai_sales_insights).where(sql`true`);

  for (const cId of cIds) {
    await db
      .delete(schema.outreach_events)
      .where(sql`lead_id IN (SELECT id FROM leads WHERE company_id = ${cId})`);
    await db.delete(schema.meetings).where(sql`company_id = ${cId}`);
    await db.delete(schema.follow_ups).where(sql`company_id = ${cId}`);
    await db.delete(schema.sales_activities).where(sql`company_id = ${cId}`);
    await db.delete(schema.opportunities).where(sql`company_id = ${cId}`);
    await db.delete(schema.buying_signals).where(sql`company_id = ${cId}`);
    await db.delete(schema.leads).where(sql`company_id = ${cId}`);
    await db.delete(schema.contacts).where(sql`company_id = ${cId}`);
    await db.delete(schema.companies).where(sql`id = ${cId}`);
  }

  console.log("℅ Demo Data Reset completed successfully!");
  process.exit(0);
}

resetDemoData().catch((e) => {
  console.error("❌ Error resetting demo data:", e);
  process.exit(1);
});

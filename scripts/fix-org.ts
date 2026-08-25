import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import postgres from "postgres";

const DB_URL = process.env.DATABASE_URL!;
const sql = postgres(DB_URL, { max: 1 });
const DEMO_ORG = "00000000-0000-0000-0000-000000000001";

async function main() {
  console.log("Connected to:", DB_URL.substring(0, 40) + "...");
  
  const users = await sql`SELECT id, email, name FROM users `;
  console.log("\n=== USERS ===");
  users.forEach((u: any) => console.log(u.id, "|", u.email, "|", u.name));

  const memberships = await sql`
    SELECT m.id, m.user_id, m.org_id, o.name as org_name 
    FROM memberships m 
    JOIN organizations o ON o.id = m.org_id
  `;
  console.log("\n=== MEMBERSHIPS ===");
  memberships.forEach((m: any) => console.log(m.user_id, "->", m.org_id, "|", m.org_name));

  const leads = await sql`SELECT COUNT(*) as cnt, org_id FROM leads GROUP BY org_id`;
  console.log("\n=== LEADS BY ORG ===");
  leads.forEach((l: any) => console.log("org:", l.org_id, "count:", l.cnt));

  // Update all real user memberships to point to the demo org
  console.log(`\n?? Migrating all user memberships to demo org (${DEMO_ORG})...`);
  for (const m of memberships) {
    if (m.org_id !== DEMO_ORG) {
      await sql`UPDATE memberships SET org_id = ${DEMO_ORG} WHERE id = ${m.id}`;
      console.log(`  ? Updated membership ${m.id} from ${m.org_id} -> ${DEMO_ORG}`);
    }
  }

  console.log("\n? Done! All users now point to the demo org with data.");
  await sql.end();
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });

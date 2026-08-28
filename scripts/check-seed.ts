import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const DEMO_ORG = "00000000-0000-0000-0000-000000000001";
async function main() {
  const tables = ["leads","icps","companies","contacts","mailboxes","sequences","mailbox_activities","opportunities","sequence_enrollments"];
  for (const t of tables) {
    try {
      const r = await sql.unsafe(`SELECT COUNT(*) as cnt FROM ${t} WHERE org_id = '${DEMO_ORG}'`);
      console.log(`${t}: ${r[0].cnt}`);
    } catch(e: any) {
      // Try without org_id filter
      try {
        const r = await sql.unsafe(`SELECT COUNT(*) as cnt FROM ${t}`);
        console.log(`${t} (no org filter): ${r[0].cnt}`);
      } catch(e2: any) { console.log(`${t}: ERROR - ${e2.message}`); }
    }
  }
  await sql.end(); process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });

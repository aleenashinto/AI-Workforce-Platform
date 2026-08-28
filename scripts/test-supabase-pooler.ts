import postgres from "postgres";
import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const poolerUrl = "postgresql://postgres.xarcuonsgcexagzevwdu:Aleena%40123%23@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
const sql = postgres(poolerUrl, { max: 1 });

async function main() {
  try {
    const r = await sql`SELECT 1 as result`;
    console.log("Pooler connection SUCCESS:", r);
  } catch (e: any) {
    console.log("Pooler connection FAILED:", e.message);
  } finally {
    await sql.end();
  }
}
main();

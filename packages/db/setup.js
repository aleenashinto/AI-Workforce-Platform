const postgres = require("postgres");
const sql = postgres(
  "postgresql://postgres:Aleena%40123%23@db.xarcuonsgcexagzevwdu.supabase.co:5432/postgres",
);
async function run() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    console.log("Extensions enabled");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();

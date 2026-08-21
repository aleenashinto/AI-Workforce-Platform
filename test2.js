const postgres = require('postgres');
require('dotenv').config();
const sql = postgres(process.env.DATABASE_URL);
async function test() {
  const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
  console.log('Org ID:', orgs[0]?.id);
  const convs = await sql`SELECT count(*) FROM conversations WHERE org_id = ${orgs[0]?.id}`;
  console.log('Convs for Org 1:', convs[0]?.count);
  process.exit(0);
}
test().catch(console.error);

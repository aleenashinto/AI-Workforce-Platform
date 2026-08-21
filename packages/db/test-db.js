const postgres = require('postgres');
require('dotenv').config({ path: '../../.env' });
const sql = postgres(process.env.DATABASE_URL);
async function test() {
  const res = await sql`SELECT count(*) FROM conversations`;
  console.log('Conversations count:', res[0].count);
  const orgs = await sql`SELECT id, name FROM organizations`;
  console.log('Orgs:', orgs);
  const convs = await sql`SELECT org_id FROM conversations LIMIT 1`;
  console.log('Conv org_id:', convs);
  process.exit(0);
}
test().catch(console.error);
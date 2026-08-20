const postgres = require('postgres');
const sql = postgres('postgresql://neondb_owner:npg_KJ9L6qHSCMGI@ep-little-wildflower-ayh4ii0z-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require');
sql`CREATE EXTENSION IF NOT EXISTS vector`.then(() => {
  console.log('Vector extension enabled');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});

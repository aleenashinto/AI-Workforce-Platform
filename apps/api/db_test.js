const postgres = require('postgres');
const sql = postgres('postgres://postgres:postgres@127.0.0.1:5435/ai_workforce');
sql`SELECT 1`.then(console.log).catch(console.error).finally(() => sql.end());

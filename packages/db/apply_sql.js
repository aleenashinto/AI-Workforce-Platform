require("dotenv").config();
const postgres = require("postgres");
const fs = require("fs");

async function main() {
  const sqlContent = fs.readFileSync(
    "packages/db/drizzle/0011_rls_policies.sql",
    "utf8",
  );

  const sql = postgres(
    process.env.DATABASE_URL ||
      "postgres://postgres:postgres@127.0.0.1:5435/ai_workforce",
  );

  try {
    await sql.unsafe(sqlContent);
    console.log("Successfully applied RLS policies");
  } catch (err) {
    console.error("Error applying RLS:", err);
  } finally {
    await sql.end();
  }
}

main();

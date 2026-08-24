const postgres = require("postgres");
require("dotenv").config({ path: ".env" });

async function run() {
  console.log("Connecting to database...");
  const sql = postgres(process.env.DATABASE_URL);
  try {
    await sql.unsafe(
      "ALTER TABLE leads ADD COLUMN IF NOT EXISTS icp_score NUMERIC;",
    );
    await sql.unsafe("ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT;");
    await sql.unsafe(
      "ALTER TABLE leads ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);",
    );
    await sql.unsafe(
      "ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id);",
    );
    await sql.unsafe(
      "ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE;",
    );
    await sql.unsafe(
      "ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMP WITH TIME ZONE;",
    );
    console.log("Successfully altered leads table");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
  }
}

run();

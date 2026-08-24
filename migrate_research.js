const postgres = require("postgres");
require("dotenv").config({ path: ".env" });

async function run() {
  console.log("Connecting to database...");
  const sql = postgres(process.env.DATABASE_URL);
  try {
    await sql.unsafe(
      "CREATE TABLE IF NOT EXISTS research_projects (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), org_id UUID NOT NULL REFERENCES organizations(id), created_by UUID REFERENCES users(id), title TEXT NOT NULL, question TEXT NOT NULL, objective TEXT, type TEXT, depth TEXT, status TEXT DEFAULT 'planning', payload JSONB, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());",
    );
    console.log("Successfully created research_projects table");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sql.end();
  }
}

run();

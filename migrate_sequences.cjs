const postgres = require("postgres");

async function migrate() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/ai_workforce";
  const sql = postgres(connectionString);

  try {
    console.log("Adding columns to sequences...");
    await sql`ALTER TABLE sequences ADD COLUMN IF NOT EXISTS description TEXT`;
    await sql`ALTER TABLE sequences ADD COLUMN IF NOT EXISTS goal TEXT`;
    await sql`ALTER TABLE sequences ADD COLUMN IF NOT EXISTS tags JSONB`;
    await sql`ALTER TABLE sequences ADD COLUMN IF NOT EXISTS settings JSONB`;
    await sql`ALTER TABLE sequences ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1`;

    console.log("Adding columns to sequence_steps...");
    await sql`ALTER TABLE sequence_steps ADD COLUMN IF NOT EXISTS name TEXT`;
    await sql`ALTER TABLE sequence_steps ADD COLUMN IF NOT EXISTS type TEXT`;

    console.log("Creating sequence_enrollments table...");
    await sql`
      CREATE TABLE IF NOT EXISTS sequence_enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL REFERENCES organizations(id),
        sequence_id UUID NOT NULL REFERENCES sequences(id),
        lead_id UUID NOT NULL REFERENCES leads(id),
        status TEXT NOT NULL DEFAULT 'active',
        current_step INTEGER NOT NULL DEFAULT 0,
        next_action_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

migrate();

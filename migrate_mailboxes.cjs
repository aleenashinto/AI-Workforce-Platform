const postgres = require("postgres");

async function migrate() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/ai_workforce";
  const sql = postgres(connectionString);

  try {
    console.log("Adding columns to mailboxes...");
    await sql`ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS display_name TEXT`;
    await sql`ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS reply_to TEXT`;
    await sql`ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS signature TEXT`;
    await sql`ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS timezone TEXT`;
    await sql`ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS working_days JSONB`;
    await sql`ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS working_hours JSONB`;
    await sql`ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS tracking_settings JSONB`;

    console.log("Adding columns to sequences...");
    await sql`ALTER TABLE sequences ADD COLUMN IF NOT EXISTS mailbox_id UUID REFERENCES mailboxes(id)`;

    console.log("Creating mailbox_activities table...");
    await sql`
      CREATE TABLE IF NOT EXISTS mailbox_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL REFERENCES organizations(id),
        mailbox_id UUID NOT NULL REFERENCES mailboxes(id),
        lead_id UUID REFERENCES leads(id),
        sequence_id UUID REFERENCES sequences(id),
        event_type TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

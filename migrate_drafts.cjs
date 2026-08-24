const { sql } = require("postgres");
const postgres = require("postgres");

async function migrate() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/ai_workforce";
  const sqlClient = postgres(connectionString);

  try {
    await sqlClient`ALTER TABLE drafts ALTER COLUMN lead_id DROP NOT NULL;`;
    await sqlClient`ALTER TABLE drafts ADD COLUMN IF NOT EXISTS title TEXT;`;
    await sqlClient`ALTER TABLE drafts ADD COLUMN IF NOT EXISTS type TEXT;`;
    await sqlClient`ALTER TABLE drafts ADD COLUMN IF NOT EXISTS source_type TEXT;`;
    await sqlClient`ALTER TABLE drafts ADD COLUMN IF NOT EXISTS source_id UUID;`;
    await sqlClient`ALTER TABLE drafts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);`;
    await sqlClient`ALTER TABLE drafts ADD COLUMN IF NOT EXISTS metadata JSONB;`;
    await sqlClient`ALTER TABLE drafts ADD COLUMN IF NOT EXISTS tags JSONB;`;
    await sqlClient`ALTER TABLE drafts ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;`;
    await sqlClient`ALTER TABLE drafts ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;`;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS draft_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL REFERENCES organizations(id),
        draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        body TEXT,
        subject TEXT,
        metadata JSONB,
        created_by UUID REFERENCES users(id),
        change_type TEXT DEFAULT 'manual_save',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed", error);
  } finally {
    await sqlClient.end();
  }
}

migrate();

const postgres = require("postgres");
const DB_URL = process.env.DATABASE_URL;
const sql = postgres(DB_URL, { max: 1 });
async function run() {
  const query =
    "ALTER TABLE follow_ups ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(); ALTER TABLE icps ADD COLUMN IF NOT EXISTS description text; ALTER TABLE icps ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft'; ALTER TABLE icps ADD COLUMN IF NOT EXISTS match_rate numeric; ALTER TABLE icps ADD COLUMN IF NOT EXISTS performance_metrics jsonb; CREATE TABLE IF NOT EXISTS icp_versions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), org_id uuid NOT NULL, icp_id uuid NOT NULL, version_num numeric NOT NULL, criteria jsonb NOT NULL, change_summary text, created_at timestamptz DEFAULT now());";
  await sql.unsafe(query);
  console.log("Tables altered and created");
  process.exit(0);
}
run();

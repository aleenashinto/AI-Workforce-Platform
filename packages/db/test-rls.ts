import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

async function testRLS() {
  const client = postgres(
    "postgres://postgres:postgres@localhost:5432/ai_workforce",
  );
  const db = drizzle(client);

  try {
    // Attempt to insert an org
    await db.execute(
      sql`INSERT INTO organizations (id, name, slug) VALUES ('00000000-0000-0000-0000-000000000001', 'Org A', 'org-a') ON CONFLICT DO NOTHING`,
    );
    await db.execute(
      sql`INSERT INTO organizations (id, name, slug) VALUES ('00000000-0000-0000-0000-000000000002', 'Org B', 'org-b') ON CONFLICT DO NOTHING`,
    );

    // Insert api keys for each org
    await db.execute(
      sql`INSERT INTO api_keys (org_id, name, hashed_key) VALUES ('00000000-0000-0000-0000-000000000001', 'Key A', 'hash1') ON CONFLICT DO NOTHING`,
    );
    await db.execute(
      sql`INSERT INTO api_keys (org_id, name, hashed_key) VALUES ('00000000-0000-0000-0000-000000000002', 'Key B', 'hash2') ON CONFLICT DO NOTHING`,
    );

    console.log("Testing context for Org A...");
    await db.execute(
      sql`SET LOCAL app.current_org_id = '00000000-0000-0000-0000-000000000001'`,
    );
    const keysA = await db.execute(sql`SELECT * FROM api_keys`);
    console.log(`Org A sees ${keysA.length} keys.`);

    console.log("Testing context for Org B...");
    await db.execute(
      sql`SET LOCAL app.current_org_id = '00000000-0000-0000-0000-000000000002'`,
    );
    const keysB = await db.execute(sql`SELECT * FROM api_keys`);
    console.log(`Org B sees ${keysB.length} keys.`);
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await client.end();
  }
}

testRLS();

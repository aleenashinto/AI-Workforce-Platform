import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db, withTenant } from "./client";
import { organizations, api_keys } from "./schema";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import postgres from "postgres";

const isDummyDb = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("supabase.co");

describe.skipIf(isDummyDb)("Database Row Level Security - Tenant Isolation", () => {
  const orgA = crypto.randomUUID();
  const orgB = crypto.randomUUID();
  const keyA = crypto.randomUUID();
  const keyB = crypto.randomUUID();

  beforeAll(async () => {
    // We run setup without withTenant so we can setup global state (or we run it as superuser)
    await db.insert(organizations).values([
      { id: orgA, name: "Tenant A", slug: `tenant-a-${orgA}` },
      { id: orgB, name: "Tenant B", slug: `tenant-b-${orgB}` },
    ]);

    await db.insert(api_keys).values([
      { id: keyA, org_id: orgA, name: "Key A", hashed_key: "hashA", hint: "A" },
      { id: keyB, org_id: orgB, name: "Key B", hashed_key: "hashB", hint: "B" },
    ]);
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(api_keys).where(eq(api_keys.id, keyA));
    await db.delete(api_keys).where(eq(api_keys.id, keyB));
    await db.delete(organizations).where(eq(organizations.id, orgA));
    await db.delete(organizations).where(eq(organizations.id, orgB));
  });

  it("Tenant A should only see Tenant A's data", async () => {
    await withTenant(db, orgA, async () => {
      const keys = await db.select().from(api_keys);
      // Even without app-level WHERE clause, it should only return orgA's keys
      expect(keys.length).toBeGreaterThanOrEqual(1);
      keys.forEach((key) => {
        expect(key.org_id).toBe(orgA);
      });
    });
  });

  it("Tenant B should only see Tenant B's data", async () => {
    await withTenant(db, orgB, async () => {
      const keys = await db.select().from(api_keys);
      expect(keys.length).toBeGreaterThanOrEqual(1);
      keys.forEach((key) => {
        expect(key.org_id).toBe(orgB);
      });
    });
  });

  it("Tenant A cannot update Tenant B's data", async () => {
    await withTenant(db, orgA, async () => {
      // Attempt to update keyB
      const result = await db.update(api_keys).set({ name: "Hacked" }).where(eq(api_keys.id, keyB)).returning();
      expect(result.length).toBe(0);
    });

    // Verify keyB was not updated
    const check = await db.select().from(api_keys).where(eq(api_keys.id, keyB));
    expect(check[0].name).toBe("Key B");
  });
});

import { db } from "@ai-workforce/db";
import { conversations } from "@ai-workforce/db/schema";
import { eq } from "drizzle-orm";

async function test() {
  try {
    const org_id = "00000000-0000-0000-0000-000000000001";
    await db
      .select()
      .from(conversations)
      .where(eq(conversations.org_id, org_id));
    console.log("Success");
  } catch (e: any) {
    console.error("DB Error:", e);
  } finally {
    process.exit(0);
  }
}
test();

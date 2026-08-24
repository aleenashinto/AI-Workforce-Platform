const { db } = require("./packages/db/dist/index.js");
const { conversations, end_users } = require("./packages/db/dist/schema.js");
const { eq, sql } = require("drizzle-orm");

async function check() {
  const org_id = "00000000-0000-0000-0000-000000000001";
  let orgConversations = await db
    .select({
      conversation: conversations,
      end_user: end_users,
    })
    .from(conversations)
    .leftJoin(
      end_users,
      eq(conversations.visitor_id, sql`${end_users.id}::text`),
    )
    .where(eq(conversations.org_id, org_id))
    .limit(2);

  const all = orgConversations.map((r) => ({
    ...r.conversation,
    end_user: r.end_user,
  }));
  console.log(JSON.stringify(all, null, 2));
  process.exit(0);
}
check();

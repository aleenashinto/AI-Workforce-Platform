const { pgTable, text, uuid } = require("drizzle-orm/pg-core");
const { sql, eq } = require("drizzle-orm");
const { drizzle } = require("drizzle-orm/node-postgres");

const end_users = pgTable("end_users", { id: uuid("id") });
const conversations = pgTable("conversations", {
  visitor_id: text("visitor_id"),
});

const db = drizzle(null);
const q = db
  .select()
  .from(conversations)
  .leftJoin(
    end_users,
    sql`${conversations.visitor_id} = ${end_users.id}::text`,
  );
console.log(q.toSQL().sql);

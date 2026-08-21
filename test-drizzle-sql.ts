import { db } from '@ai-workforce/db';
import { conversations, end_users } from '@ai-workforce/db/schema';
import { sql, eq } from 'drizzle-orm';

const q1 = db.select().from(conversations).leftJoin(end_users, sql`${conversations.visitor_id} = ${end_users.id}::text`).toSQL();
console.log("Q1:", q1.sql);

const q2 = db.select().from(conversations).leftJoin(end_users, eq(conversations.visitor_id, sql`${end_users.id}::text`)).toSQL();
console.log("Q2:", q2.sql);

const q3 = db.select().from(conversations).leftJoin(end_users, sql`cast(${end_users.id} as text) = ${conversations.visitor_id}`).toSQL();
console.log("Q3:", q3.sql);

const fs = require("fs");
let content = fs.readFileSync("packages/db/schema.ts", "utf8");

const tableCode = `
export const sequence_enrollments = pgTable('sequence_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  org_id: uuid('org_id').references(() => organizations.id).notNull(),
  sequence_id: uuid('sequence_id').references(() => sequences.id).notNull(),
  lead_id: uuid('lead_id').references(() => leads.id).notNull(),
  status: text('status').notNull().default('active'), // 'pending', 'active', 'paused', 'completed', 'replied'
  current_step: integer('current_step').notNull().default(0),
  next_action_at: timestamp('next_action_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  rls: pgPolicy('tenant_isolation', { as: 'permissive', to: 'public', for: 'all', using: sql\`org_id = current_setting('app.current_org_id', true)::uuid\` })
}));
`;

if (!content.includes("sequence_enrollments = pgTable")) {
  content = content + "\n" + tableCode;
  fs.writeFileSync("packages/db/schema.ts", content);
  console.log("Added sequence_enrollments to schema.ts");
} else {
  console.log("sequence_enrollments already exists");
}

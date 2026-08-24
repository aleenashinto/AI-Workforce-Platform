const fs = require("fs");
let content = fs.readFileSync("packages/db/schema.ts", "utf8");

// Update mailboxes
content = content.replace(
  /export const mailboxes = pgTable\('mailboxes', \{([\s\S]*?)\}, \(table\) => \(\{/m,
  (match, p1) => {
    let newInner = p1;
    if (!newInner.includes("display_name: text('display_name')"))
      newInner += `  display_name: text('display_name'),\n`;
    if (!newInner.includes("reply_to: text('reply_to')"))
      newInner += `  reply_to: text('reply_to'),\n`;
    if (!newInner.includes("signature: text('signature')"))
      newInner += `  signature: text('signature'),\n`;
    if (!newInner.includes("timezone: text('timezone')"))
      newInner += `  timezone: text('timezone'),\n`;
    if (!newInner.includes("working_days: jsonb('working_days')"))
      newInner += `  working_days: jsonb('working_days'),\n`;
    if (!newInner.includes("working_hours: jsonb('working_hours')"))
      newInner += `  working_hours: jsonb('working_hours'),\n`;
    if (!newInner.includes("tracking_settings: jsonb('tracking_settings')"))
      newInner += `  tracking_settings: jsonb('tracking_settings'),\n`;
    return `export const mailboxes = pgTable('mailboxes', {${newInner}}, (table) => ({`;
  },
);

// Update sequences
content = content.replace(
  /export const sequences = pgTable\('sequences', \{([\s\S]*?)\}, \(table\) => \(\{/m,
  (match, p1) => {
    let newInner = p1;
    if (!newInner.includes("mailbox_id: uuid('mailbox_id')")) {
      newInner += `  mailbox_id: uuid('mailbox_id').references(() => mailboxes.id),\n`;
    }
    return `export const sequences = pgTable('sequences', {${newInner}}, (table) => ({`;
  },
);

// Add mailbox_activities
const tableCode = `
export const mailbox_activities = pgTable('mailbox_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  org_id: uuid('org_id').references(() => organizations.id).notNull(),
  mailbox_id: uuid('mailbox_id').references(() => mailboxes.id).notNull(),
  lead_id: uuid('lead_id').references(() => leads.id),
  sequence_id: uuid('sequence_id').references(() => sequences.id),
  event_type: text('event_type').notNull(), // 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  rls: pgPolicy('tenant_isolation', { as: 'permissive', to: 'public', for: 'all', using: sql\`org_id = current_setting('app.current_org_id', true)::uuid\` })
}));
`;

if (!content.includes("mailbox_activities = pgTable")) {
  content = content + "\n" + tableCode;
}

fs.writeFileSync("packages/db/schema.ts", content);
console.log("Updated schema.ts for mailboxes");

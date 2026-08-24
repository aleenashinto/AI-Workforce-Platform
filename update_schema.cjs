const fs = require("fs");
let content = fs.readFileSync("packages/db/schema.ts", "utf8");

const replacement = `export const drafts = pgTable('drafts', {
  id: uuid('id').primaryKey().defaultRandom(),
  org_id: uuid('org_id').references(() => organizations.id).notNull(),
  title: text('title'),
  type: text('type'),
  source_type: text('source_type'),
  source_id: uuid('source_id'),
  owner_id: uuid('owner_id').references(() => users.id),
  lead_id: uuid('lead_id').references(() => leads.id),
  campaign_id: uuid('campaign_id').references(() => campaigns.id),
  status: text('status').notNull().default('draft'),
  subject: text('subject'),
  body: text('body'),
  variants: jsonb('variants'),
  validation_results: jsonb('validation_results'),
  personalized_hooks: jsonb('personalized_hooks'),
  metadata: jsonb('metadata'),
  tags: jsonb('tags'),
  version_number: integer('version_number').default(1),
  archived_at: timestamp('archived_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  rls: pgPolicy('tenant_isolation', { as: 'permissive', to: 'public', for: 'all', using: sql\`org_id = current_setting('app.current_org_id', true)::uuid\` })
}));

export const draft_versions = pgTable('draft_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  org_id: uuid('org_id').references(() => organizations.id).notNull(),
  draft_id: uuid('draft_id').references(() => drafts.id, { onDelete: 'cascade' }).notNull(),
  version_number: integer('version_number').notNull(),
  body: text('body'),
  subject: text('subject'),
  metadata: jsonb('metadata'),
  created_by: uuid('created_by').references(() => users.id),
  change_type: text('change_type').default('manual_save'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  rls: pgPolicy('tenant_isolation', { as: 'permissive', to: 'public', for: 'all', using: sql\`org_id = current_setting('app.current_org_id', true)::uuid\` })
}));
`;

content = content.replace(
  /export const drafts = pgTable\('drafts', \{[\s\S]*?\}\)\);/m,
  replacement,
);
fs.writeFileSync("packages/db/schema.ts", content);

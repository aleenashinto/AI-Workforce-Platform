import {
  pgTable,
  pgPolicy,
  uuid,
  text,
  jsonb,
  timestamp,
  bigserial,
  numeric,
  index,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";

// Shared / Tenancy

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("free"), // 'free' | 'starter' | 'growth' | 'enterprise'
  stripe_customer_id: text("stripe_customer_id"),
  settings: jsonb("settings"), // timezone, locale
  branding: jsonb("branding"), // logo, primary_color
  retention_days: numeric("retention_days").default("30"),
  approval_gate_active: boolean("approval_gate_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  auth_provider_id: text("auth_provider_id"),
  password_hash: text("password_hash"),
  email_verified: boolean("email_verified").notNull().default(false),
  avatar_url: text("avatar_url"),
  phone_number: text("phone_number"),
  job_title: text("job_title"),
});

export const password_reset_tokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
});

export const email_verification_tokens = pgTable("email_verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").notNull().default(false),
});

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    user_id: uuid("user_id")
      .references(() => users.id)
      .notNull(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const membership_roles = pgTable("membership_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  membership_id: uuid("membership_id")
    .references(() => memberships.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role").notNull(), // 'owner' | 'admin' | 'support_lead' | 'support_agent' | 'sales_lead' | 'sales_rep' | 'viewer'
});

export const organization_invitations = pgTable(
  "organization_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("viewer"),
    token: text("token").notNull().unique(),
    status: text("status").notNull().default("pending"), // 'pending', 'accepted', 'revoked'
    invited_by: uuid("invited_by").references(() => users.id),
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const api_keys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    hashed_key: text("hashed_key").notNull(),
    name: text("name").notNull(),
    scopes: text("scopes").array(),
    last_used_at: timestamp("last_used_at", { withTimezone: true }),
    revoked_at: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const audit_logs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    user_id: uuid("user_id").references(() => users.id),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entity_id: text("entity_id"),
    metadata: jsonb("metadata"),
    ip_address: text("ip_address"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const usage_events = pgTable(
  "usage_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    kind: text("kind").notNull(), // 'llm_tokens' | 'message' | 'lead_enriched' | 'email_sent'
    quantity: numeric("quantity").notNull(),
    metadata: jsonb("metadata"),
    occurred_at: timestamp("occurred_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const tools = pgTable(
  "tools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    endpoint: text("endpoint").notNull(),
    auth_header: text("auth_header"),
    schema: jsonb("schema").notNull(), // JSON schema for parameters
    requires_confirmation: boolean("requires_confirmation")
      .notNull()
      .default(true),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

// Module A: Knowledge Management

const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(3072)";
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const knowledge_sources = pgTable(
  "knowledge_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    type: text("type").notNull(), // 'file', 'url', 'text', 'integration'
    name: text("name").notNull(),
    status: text("status").notNull().default("pending"), // 'pending', 'processing', 'ready', 'failed'
    config: jsonb("config"), // e.g. { url: '...', depth: 2 } or { file_path: '...' }
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const knowledge_documents = pgTable(
  "knowledge_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source_id: uuid("source_id")
      .references(() => knowledge_sources.id)
      .notNull(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    title: text("title").notNull(),
    content_hash: text("content_hash").notNull(), // SHA-256 of parsed text for deduplication
    sync_status: text("sync_status").notNull().default("pending"),
    metadata: jsonb("metadata"), // original file name, page count, etc.
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    source_idx: index("document_source_idx").on(table.source_id),
  }),
);

export const knowledge_chunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    document_id: uuid("document_id")
      .references(() => knowledge_documents.id)
      .notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding"),
    fts: tsvector("fts"),
    metadata: jsonb("metadata"), // e.g. { pageNumber: 1, chunkIndex: 0, headings: ['Chapter 1'] }
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    document_idx: index("chunk_document_idx").on(table.document_id),
    fts_idx: index("chunk_fts_idx").using("gin", table.fts),
  }),
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    visitor_id: text("visitor_id").notNull(),
    status: text("status").notNull().default("active"), // 'active', 'escalated', 'resolved'
    csat_score: numeric("csat_score"),
    tags: text("tags").array(),
    channel: text("channel").notNull().default("widget"), // 'widget', 'email', 'whatsapp', 'api'
    assigned_to: uuid("assigned_to").references(() => users.id),
    ai_paused: boolean("ai_paused").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversation_id: uuid("conversation_id")
      .references(() => conversations.id)
      .notNull(),
    role: text("role").notNull(), // 'user', 'assistant', 'system', 'agent'
    content: text("content").notNull(),
    metadata: jsonb("metadata"), // e.g. { confidence: 0.85, citations: [{chunk_id: '...'}], rank_score: 0.92 }
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    conv_idx: index("message_conv_idx").on(table.conversation_id),
  }),
);

export const end_users = pgTable(
  "end_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    external_id: text("external_id"), // optional provided by widget
    name: text("name"),
    email: text("email"),
    metadata: jsonb("metadata"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const knowledge_gaps = pgTable(
  "knowledge_gaps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    question: text("question").notNull(),
    occurrence_count: numeric("occurrence_count").notNull().default("1"),
    status: text("status").notNull().default("open"), // 'open', 'answered', 'dismissed'
    last_seen_at: timestamp("last_seen_at", {
      withTimezone: true,
    }).defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

// Module B: AI Sales Assistant

export const icps = pgTable(
  "icps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").default("draft"), // active, inactive, draft
    match_rate: numeric("match_rate"),
    criteria: jsonb("criteria").notNull(), // { industries, companySize, geography, keywords, targetTitles, valueProp, proofPoints }
    disqualifiers: jsonb("disqualifiers"), // Array of strings
    persona: jsonb("persona"), // { titles, seniority, departments }
    performance_metrics: jsonb("performance_metrics"), // { companies_discovered, matched_companies, qualified_leads, opportunities, won_deals }
    last_run_at: timestamp("last_run_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const icp_versions = pgTable(
  "icp_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    icp_id: uuid("icp_id")
      .references(() => icps.id)
      .notNull(),
    version_num: numeric("version_num").notNull(),
    criteria: jsonb("criteria").notNull(),
    change_summary: text("change_summary"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    domain: text("domain").notNull(),
    name: text("name").notNull(),
    industry: text("industry"),
    employee_count: numeric("employee_count"),
    metadata: jsonb("metadata"), // Extra firmographics
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    domain_idx: index("company_domain_idx").on(table.domain),
  }),
);

export const suppression_list = pgTable(
  "suppression_list",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    entity_type: text("entity_type").notNull(), // 'domain', 'email'
    entity_value: text("entity_value").notNull(),
    reason: text("reason"), // 'competitor', 'customer', 'opt_out'
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    icp_id: uuid("icp_id").references(() => icps.id),
    company_id: uuid("company_id").references(() => companies.id),
    name: text("name").notNull(),
    email: text("email"),
    email_status: text("email_status").default("unknown"), // 'valid', 'risky', 'invalid', 'unknown'
    company: text("company"),
    linkedin_url: text("linkedin_url"),
    status: text("status").notNull().default("new"), // 'new', 'enriched', 'contacted', 'converted', 'bounced', 'suppressed'
    score: numeric("score"),
    icp_score: numeric("icp_score"),
    source: text("source"),
    owner_id: uuid("owner_id").references(() => users.id),
    contact_id: uuid("contact_id").references(() => contacts.id),
    last_activity_at: timestamp("last_activity_at", { withTimezone: true }),
    next_follow_up_at: timestamp("next_follow_up_at", { withTimezone: true }),
    score_breakdown: jsonb("score_breakdown"),
    score_reasons: jsonb("score_reasons"), // Array of { factor, contribution, explanation }
    signals: jsonb("signals"), // Array of { type, text, url, date }
    metadata: jsonb("metadata"), // e.g. title, industry, enriched data
    research_brief: jsonb("research_brief"), // e.g. { summary, hooks, sources, timeline }
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    name: text("name").notNull(),
    status: text("status").notNull().default("draft"), // 'draft', 'active', 'paused', 'completed'
    prompt_template: text("prompt_template"), // Instructions for LLM
    schedule: jsonb("schedule"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const outreach_events = pgTable("outreach_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  lead_id: uuid("lead_id")
    .references(() => leads.id)
    .notNull(),
  campaign_id: uuid("campaign_id")
    .references(() => campaigns.id)
    .notNull(),
  type: text("type").notNull(), // 'email', 'linkedin'
  content: text("content").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'sent', 'failed', 'replied'
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const drafts = pgTable(
  "drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    title: text("title"),
    type: text("type"),
    source_type: text("source_type"),
    source_id: uuid("source_id"),
    owner_id: uuid("owner_id").references(() => users.id),
    lead_id: uuid("lead_id").references(() => leads.id),
    campaign_id: uuid("campaign_id").references(() => campaigns.id),
    status: text("status").notNull().default("draft"),
    subject: text("subject"),
    body: text("body"),
    variants: jsonb("variants"),
    validation_results: jsonb("validation_results"),
    personalized_hooks: jsonb("personalized_hooks"),
    metadata: jsonb("metadata"),
    tags: jsonb("tags"),
    version_number: integer("version_number").default(1),
    archived_at: timestamp("archived_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const draft_versions = pgTable(
  "draft_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    draft_id: uuid("draft_id")
      .references(() => drafts.id, { onDelete: "cascade" })
      .notNull(),
    version_number: integer("version_number").notNull(),
    body: text("body"),
    subject: text("subject"),
    metadata: jsonb("metadata"),
    created_by: uuid("created_by").references(() => users.id),
    change_type: text("change_type").default("manual_save"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const sequences = pgTable(
  "sequences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    name: text("name").notNull(),
    status: text("status").notNull().default("draft"), // 'draft', 'active', 'paused'
    metrics: jsonb("metrics"), // { open_rate, reply_rate, bounce_rate }
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    description: text("description"),
    goal: text("goal"),
    tags: jsonb("tags"),
    settings: jsonb("settings"),
    version: integer("version").default(1),
    mailbox_id: uuid("mailbox_id").references(() => mailboxes.id),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const sequence_steps = pgTable("sequence_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  sequence_id: uuid("sequence_id")
    .references(() => sequences.id)
    .notNull(),
  day_offset: numeric("day_offset").notNull(),
  channel: text("channel").notNull().default("email"),
  template: text("template").notNull(),
  stop_conditions: jsonb("stop_conditions"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  name: text("name"),
  type: text("type"),
});

// Module D: Deliverability & Mailboxes

export const mailboxes = pgTable(
  "mailboxes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    provider: text("provider").notNull(), // 'gmail', 'outlook', 'smtp'
    email: text("email").notNull(),
    credentials: text("credentials").notNull(), // Encrypted string
    status: text("status").notNull().default("warmup"), // 'active', 'paused', 'warmup', 'error'
    daily_cap: numeric("daily_cap").notNull().default("5"),
    warmup_stage: numeric("warmup_stage").notNull().default("0"), // 0, 1, 2, 3
    health_score: numeric("health_score").notNull().default("100"),
    metrics: jsonb("metrics"), // { bounces, complaints, opens }
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    display_name: text("display_name"),
    reply_to: text("reply_to"),
    signature: text("signature"),
    timezone: text("timezone"),
    working_days: jsonb("working_days"),
    working_hours: jsonb("working_hours"),
    tracking_settings: jsonb("tracking_settings"),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const replies = pgTable(
  "replies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    lead_id: uuid("lead_id")
      .references(() => leads.id)
      .notNull(),
    draft_id: uuid("draft_id").references(() => drafts.id),
    status: text("status").notNull().default("new"), // 'new', 'processed'
    classification: text("classification").notNull(), // 'interested', 'not_now', 'not_interested', 'wrong_person', 'unsubscribe', 'out_of_office', 'auto_reply', 'bounce'
    thread_id: text("thread_id"),
    content: text("content").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const integrations = pgTable(
  "integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    category: text("category").notNull(), // 'crm', 'helpdesk', 'billing'
    provider: text("provider").notNull(), // 'hubspot', 'salesforce', 'zendesk', 'intercom', 'stripe'
    credentials: text("credentials"), // Encrypted string or JSON for OAuth tokens
    config: jsonb("config"), // e.g. field_mappings, webhook_urls
    sync_status: text("sync_status").notNull().default("disconnected"), // 'disconnected', 'active', 'error'
    last_sync_at: timestamp("last_sync_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

// --- Sales Assistant Extended Models ---

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    company_id: uuid("company_id").references(() => companies.id),
    first_name: text("first_name"),
    last_name: text("last_name"),
    full_name: text("full_name").notNull(),
    job_title: text("job_title"),
    department: text("department"),
    seniority: text("seniority"),
    email: text("email"),
    phone: text("phone"),
    location: text("location"),
    linkedin_url: text("linkedin_url"),
    lead_score: numeric("lead_score"),
    status: text("status").default("new"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const buying_signals = pgTable(
  "buying_signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    company_id: uuid("company_id")
      .references(() => companies.id)
      .notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    strength: text("strength"), // High, Medium, Low
    detected_at: timestamp("detected_at", { withTimezone: true }).defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const opportunities = pgTable(
  "opportunities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    company_id: uuid("company_id").references(() => companies.id),
    contact_id: uuid("contact_id").references(() => contacts.id),
    lead_id: uuid("lead_id").references(() => leads.id),
    owner_id: uuid("owner_id").references(() => users.id),
    name: text("name").notNull(),
    value: numeric("value"),
    currency: text("currency").default("USD"),
    stage: text("stage").notNull(), // Qualified, Meeting, Proposal, Negotiation, Won, Lost
    probability: numeric("probability"),
    expected_close_date: timestamp("expected_close_date", {
      withTimezone: true,
    }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const sales_activities = pgTable(
  "sales_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    user_id: uuid("user_id").references(() => users.id),
    lead_id: uuid("lead_id").references(() => leads.id),
    company_id: uuid("company_id").references(() => companies.id),
    opportunity_id: uuid("opportunity_id").references(() => opportunities.id),
    type: text("type").notNull(),
    description: text("description").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const follow_ups = pgTable(
  "follow_ups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    contact_id: uuid("contact_id").references(() => contacts.id),
    company_id: uuid("company_id").references(() => companies.id),
    owner_id: uuid("owner_id").references(() => users.id),
    status: text("status").notNull().default("pending"),
    description: text("description"),
    due_date: timestamp("due_date", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const meetings = pgTable(
  "meetings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    contact_id: uuid("contact_id").references(() => contacts.id),
    company_id: uuid("company_id").references(() => companies.id),
    owner_id: uuid("owner_id").references(() => users.id),
    type: text("type"),
    status: text("status").notNull().default("scheduled"),
    date: timestamp("date", { withTimezone: true }),
    time: text("time"),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const ai_sales_insights = pgTable(
  "ai_sales_insights",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    type: text("type").notNull(),
    priority: text("priority"),
    title: text("title").notNull(),
    description: text("description"),
    recommendation: text("recommendation"),
    related_lead_id: uuid("related_lead_id").references(() => leads.id),
    related_opportunity_id: uuid("related_opportunity_id").references(
      () => opportunities.id,
    ),
    is_read: boolean("is_read").default(false).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const ai_recommended_actions = pgTable(
  "ai_recommended_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    priority: text("priority"),
    title: text("title").notNull(),
    description: text("description"),
    action: text("action"),
    related_entity: text("related_entity"),
    related_entity_id: uuid("related_entity_id"),
    status: text("status").default("Pending"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const research_projects = pgTable("research_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  org_id: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  created_by: uuid("created_by").references(() => users.id),
  title: text("title").notNull(),
  question: text("question").notNull(),
  objective: text("objective"),
  type: text("type"),
  depth: text("depth"),
  status: text("status").default("planning"), // planning, searching, analyzing, completed, failed, archived
  payload: jsonb("payload"), // Stores plan, sources, findings, conflicts, recommendations, report
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const sequence_enrollments = pgTable(
  "sequence_enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    sequence_id: uuid("sequence_id")
      .references(() => sequences.id)
      .notNull(),
    lead_id: uuid("lead_id")
      .references(() => leads.id)
      .notNull(),
    status: text("status").notNull().default("active"), // 'pending', 'active', 'paused', 'completed', 'replied'
    current_step: integer("current_step").notNull().default(0),
    next_action_at: timestamp("next_action_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

export const mailbox_activities = pgTable(
  "mailbox_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
      .references(() => organizations.id)
      .notNull(),
    mailbox_id: uuid("mailbox_id")
      .references(() => mailboxes.id)
      .notNull(),
    lead_id: uuid("lead_id").references(() => leads.id),
    sequence_id: uuid("sequence_id").references(() => sequences.id),
    event_type: text("event_type").notNull(), // 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'
    metadata: jsonb("metadata"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    rls: pgPolicy("tenant_isolation", {
      as: "permissive",
      to: "public",
      for: "all",
      using: sql`org_id = current_setting('app.current_org_id', true)::uuid`,
    }),
  }),
);

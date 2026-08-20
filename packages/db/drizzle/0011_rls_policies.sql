ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON memberships;
CREATE POLICY tenant_isolation ON memberships AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON organization_invitations;
CREATE POLICY tenant_isolation ON organization_invitations AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON api_keys;
CREATE POLICY tenant_isolation ON api_keys AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON audit_logs;
CREATE POLICY tenant_isolation ON audit_logs AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON usage_events;
CREATE POLICY tenant_isolation ON usage_events AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON tools;
CREATE POLICY tenant_isolation ON tools AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON knowledge_sources;
CREATE POLICY tenant_isolation ON knowledge_sources AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON knowledge_documents;
CREATE POLICY tenant_isolation ON knowledge_documents AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON knowledge_chunks;
CREATE POLICY tenant_isolation ON knowledge_chunks AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON conversations;
CREATE POLICY tenant_isolation ON conversations AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON messages;
CREATE POLICY tenant_isolation ON messages AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE end_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON end_users;
CREATE POLICY tenant_isolation ON end_users AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE knowledge_gaps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON knowledge_gaps;
CREATE POLICY tenant_isolation ON knowledge_gaps AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE icps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON icps;
CREATE POLICY tenant_isolation ON icps AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON companies;
CREATE POLICY tenant_isolation ON companies AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE suppression_list ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON suppression_list;
CREATE POLICY tenant_isolation ON suppression_list AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON leads;
CREATE POLICY tenant_isolation ON leads AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON campaigns;
CREATE POLICY tenant_isolation ON campaigns AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE outreach_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON outreach_events;
CREATE POLICY tenant_isolation ON outreach_events AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON drafts;
CREATE POLICY tenant_isolation ON drafts AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON sequences;
CREATE POLICY tenant_isolation ON sequences AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON sequence_steps;
CREATE POLICY tenant_isolation ON sequence_steps AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE mailboxes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON mailboxes;
CREATE POLICY tenant_isolation ON mailboxes AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON replies;
CREATE POLICY tenant_isolation ON replies AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON integrations;
CREATE POLICY tenant_isolation ON integrations AS PERMISSIVE FOR ALL TO public USING (org_id = current_setting('app.current_org_id', true)::uuid);


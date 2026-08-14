-- Enable RLS on all tenant-scoped tables
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_events" ENABLE ROW LEVEL SECURITY;

-- Create policies that check the current_org_id setting
CREATE POLICY "tenant_isolation_api_keys" ON "api_keys"
AS PERMISSIVE FOR ALL
TO public
USING (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY "tenant_isolation_memberships" ON "memberships"
AS PERMISSIVE FOR ALL
TO public
USING (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY "tenant_isolation_usage_events" ON "usage_events"
AS PERMISSIVE FOR ALL
TO public
USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- For users, maybe no direct org_id, so they're isolated through memberships if needed.
-- Organizations themselves might be visible to members only:
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_organizations" ON "organizations"
AS PERMISSIVE FOR ALL
TO public
USING (id = current_setting('app.current_org_id', true)::uuid);

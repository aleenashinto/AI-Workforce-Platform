CREATE TABLE IF NOT EXISTS "membership_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" uuid NOT NULL,
	"role" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "membership_roles" ADD CONSTRAINT "membership_roles_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Migrate existing roles to membership_roles
INSERT INTO "membership_roles" ("membership_id", "role")
SELECT "id", "role" FROM "memberships" WHERE "role" IN ('owner', 'admin', 'viewer');

-- Migrate 'agent' to 'support_agent' and 'sales_rep'
INSERT INTO "membership_roles" ("membership_id", "role")
SELECT "id", 'support_agent' FROM "memberships" WHERE "role" = 'agent';

INSERT INTO "membership_roles" ("membership_id", "role")
SELECT "id", 'sales_rep' FROM "memberships" WHERE "role" = 'agent';

--> statement-breakpoint
-- Drop the old role column
ALTER TABLE "memberships" DROP COLUMN IF EXISTS "role";

-- Create RLS helper functions
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
  SELECT current_setting('request.jwt.claim.sub', true)::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth.org_id() RETURNS uuid AS $$
  SELECT current_setting('request.jwt.claim.org_id', true)::uuid;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION has_role(required_role text) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "membership_roles" mr
    JOIN "memberships" m ON m.id = mr.membership_id
    WHERE m.user_id = auth.uid()
    AND m.org_id = auth.org_id()
    AND mr.role = required_role
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enable RLS on core tables
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "drafts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sequences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "icps" ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for org isolation
-- For now, all authenticated users in the org can read their org's data,
-- but only those with specific roles can modify them. We'll implement
-- the detailed role checks in the API layer, but provide baseline org isolation here.
-- Wait, the prompt asks for "Cross-role RLS isolation tests".
-- Let's add RLS policies that check roles.

-- Conversations & Messages: support_agent, support_lead, admin, owner
CREATE POLICY "Conversations select policy" ON "conversations"
  FOR SELECT USING (org_id = auth.org_id());

CREATE POLICY "Conversations modify policy" ON "conversations"
  FOR ALL USING (
    org_id = auth.org_id() AND (
      has_role('owner') OR has_role('admin') OR has_role('support_lead') OR has_role('support_agent')
    )
  );

CREATE POLICY "Messages select policy" ON "messages"
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM "conversations" c WHERE c.id = "messages".conversation_id AND c.org_id = auth.org_id())
  );

CREATE POLICY "Messages modify policy" ON "messages"
  FOR ALL USING (
    EXISTS (SELECT 1 FROM "conversations" c WHERE c.id = "messages".conversation_id AND c.org_id = auth.org_id())
    AND (
      has_role('owner') OR has_role('admin') OR has_role('support_lead') OR has_role('support_agent')
    )
  );

-- Leads, Drafts, Sequences, ICPs: sales_rep, sales_lead, admin, owner
CREATE POLICY "Leads select policy" ON "leads"
  FOR SELECT USING (org_id = auth.org_id());

CREATE POLICY "Leads modify policy" ON "leads"
  FOR ALL USING (
    org_id = auth.org_id() AND (
      has_role('owner') OR has_role('admin') OR has_role('sales_lead') OR has_role('sales_rep')
    )
  );

CREATE POLICY "Drafts select policy" ON "drafts"
  FOR SELECT USING (org_id = auth.org_id());

CREATE POLICY "Drafts modify policy" ON "drafts"
  FOR ALL USING (
    org_id = auth.org_id() AND (
      has_role('owner') OR has_role('admin') OR has_role('sales_lead') OR has_role('sales_rep')
    )
  );

CREATE POLICY "Sequences select policy" ON "sequences"
  FOR SELECT USING (org_id = auth.org_id());

CREATE POLICY "Sequences modify policy" ON "sequences"
  FOR ALL USING (
    org_id = auth.org_id() AND (
      has_role('owner') OR has_role('admin') OR has_role('sales_lead') OR has_role('sales_rep')
    )
  );

CREATE POLICY "ICPs select policy" ON "icps"
  FOR SELECT USING (org_id = auth.org_id());

CREATE POLICY "ICPs modify policy" ON "icps"
  FOR ALL USING (
    org_id = auth.org_id() AND (
      has_role('owner') OR has_role('admin') OR has_role('sales_lead') OR has_role('sales_rep')
    )
  );

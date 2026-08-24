CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  company_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  full_name text NOT NULL,
  job_title text,
  department text,
  seniority text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  lead_score numeric,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS buying_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  company_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  strength text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  company_id uuid,
  contact_id uuid,
  lead_id uuid,
  owner_id uuid,
  name text NOT NULL,
  value numeric,
  currency text DEFAULT 'USD',
  stage text NOT NULL,
  probability numeric,
  expected_close_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  company_id uuid,
  opportunity_id uuid,
  type text NOT NULL,
  description text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  company_id uuid,
  owner_id uuid NOT NULL,
  status text DEFAULT 'pending',
  description text,
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  contact_id uuid NOT NULL,
  company_id uuid,
  owner_id uuid NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'scheduled',
  date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_sales_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  priority text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_recommended_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  title text NOT NULL,
  action text NOT NULL,
  priority text,
  status text DEFAULT 'pending',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

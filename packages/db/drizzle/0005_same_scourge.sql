CREATE TABLE "icps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" text NOT NULL,
	"criteria" jsonb NOT NULL,
	"last_run_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "icp_id" uuid;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "email_status" text DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "score" numeric;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "score_breakdown" jsonb;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "signals" jsonb;--> statement-breakpoint
ALTER TABLE "icps" ADD CONSTRAINT "icps_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_icp_id_icps_id_fk" FOREIGN KEY ("icp_id") REFERENCES "public"."icps"("id") ON DELETE no action ON UPDATE no action;
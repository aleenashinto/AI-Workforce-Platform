CREATE TABLE "tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"endpoint" text NOT NULL,
	"auth_header" text,
	"schema" jsonb NOT NULL,
	"requires_confirmation" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "assigned_to" uuid;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "ai_paused" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD CONSTRAINT "tools_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
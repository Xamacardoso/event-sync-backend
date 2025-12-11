ALTER TABLE "events" ADD COLUMN "requires_approval" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "registration_start" timestamp;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "registration_end" timestamp;
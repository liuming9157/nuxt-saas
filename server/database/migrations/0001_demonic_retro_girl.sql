ALTER TABLE "subscription" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."status";--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "status" SET DATA TYPE "public"."status" USING "status"::"public"."status";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "emailVerified" smallint DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "loginip" varchar(45) DEFAULT '';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "logintime" timestamp DEFAULT now();
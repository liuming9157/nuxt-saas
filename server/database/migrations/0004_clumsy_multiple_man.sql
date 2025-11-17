CREATE TABLE "accounts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"userId" varchar(36) NOT NULL,
	"provider" "provider",
	"providerId" varchar(50),
	"refresh_token" varchar(45) DEFAULT '',
	"access_token" varchar(45) DEFAULT '',
	"expires_at" smallint,
	"scope" varchar(45) DEFAULT '',
	"token_type" varchar(45) DEFAULT '',
	"id_token" varchar(45) DEFAULT '',
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "users_provider_id_idx";--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "provider";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "providerId";
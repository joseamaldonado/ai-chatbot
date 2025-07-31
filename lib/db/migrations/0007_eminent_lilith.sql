ALTER TABLE "User" ADD COLUMN "stripeCustomerId" varchar(255);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionId" varchar(255);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "subscriptionTier" varchar DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" varchar;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "subscriptionEndsAt" timestamp;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "createdAt" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "updatedAt" timestamp NOT NULL;
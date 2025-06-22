ALTER TABLE "comment" RENAME COLUMN "auth_id" TO "auth";--> statement-breakpoint
ALTER TABLE "post" RENAME COLUMN "auth_id" TO "auth";--> statement-breakpoint
ALTER TABLE "institute" RENAME COLUMN "boolean" TO "verified";--> statement-breakpoint
ALTER TABLE "comment" DROP CONSTRAINT "comment_auth_id_auth_id_fk";
--> statement-breakpoint
ALTER TABLE "post" DROP CONSTRAINT "post_auth_id_auth_id_fk";
--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_auth_auth_id_fk" FOREIGN KEY ("auth") REFERENCES "public"."auth"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_auth_auth_id_fk" FOREIGN KEY ("auth") REFERENCES "public"."auth"("id") ON DELETE no action ON UPDATE no action;
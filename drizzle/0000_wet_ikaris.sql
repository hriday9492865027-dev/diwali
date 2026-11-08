CREATE TABLE "admin_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid,
	"action" varchar(64) NOT NULL,
	"target_type" varchar(32) NOT NULL,
	"target_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "administrators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(64) NOT NULL,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "administrators_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "student_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"blob_pathname" text NOT NULL,
	"content_type" varchar(64) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"width" integer,
	"height" integer,
	"caption" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"music_enabled" boolean DEFAULT true NOT NULL,
	"effects_enabled" boolean DEFAULT true NOT NULL,
	"reduced_motion" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_settings_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roll_number" varchar(64) NOT NULL,
	"display_name" varchar(128) NOT NULL,
	"password_hash" text NOT NULL,
	"greeting_message" text,
	"secret_message" text,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "students_roll_number_unique" UNIQUE("roll_number")
);
--> statement-breakpoint
ALTER TABLE "admin_audit_log" ADD CONSTRAINT "admin_audit_log_admin_id_administrators_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."administrators"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_photos" ADD CONSTRAINT "student_photos_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_settings" ADD CONSTRAINT "student_settings_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;
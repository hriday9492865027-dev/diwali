# Database Design — Neon PostgreSQL + Drizzle

This is a logical starting schema. Inspect the PRD and existing repository before implementing. Confirm exact requirements and constraints before migrations.

## Core entities
### users
- `id` UUID primary key.
- `roll_number` unique, normalized, not nullable.
- `password_hash` not nullable; never store plaintext DOB/password.
- `role` enum: `ADMIN`, `STUDENT`.
- `display_name` for greetings; independent of roll number.
- `status` enum: `ACTIVE`, `INACTIVE`, `LOCKED`.
- `must_change_password` boolean.
- `created_at`, `updated_at`, `last_login_at`.
- Optional security fields for failed attempts/lockout, preferably managed with a robust rate-limit strategy.

### student_greetings
- `id` UUID.
- `student_id` unique FK to users.
- `headline`, `message`, optional `secret_message`.
- `updated_at`, `updated_by`.

### student_photos
- `id` UUID.
- `student_id` FK to users or an explicit audience/assignment table if photos are shared.
- `blob_key` / provider object identifier; do not store a public URL as authorization.
- `original_filename` sanitized.
- `mime_type`, `size_bytes`, `width`, `height`.
- `sort_order`, `is_active`.
- `created_at`, `created_by`.
- Optional checksum and processing metadata.

### audit_logs
- `id` UUID.
- `actor_user_id` nullable FK.
- `action`, `target_type`, `target_id`.
- `metadata` JSONB with safe non-sensitive context.
- `created_at`, request correlation ID.
- Never log passwords, DOBs, session cookies, private tokens, or full private image URLs.

### sessions (if database-backed sessions are chosen)
- Use secure random session identifiers stored hashed where appropriate.
- Include user, expiry, revocation, creation time, and metadata.
- Alternatively use a reviewed secure session library with appropriate storage.

## Constraints and indexes
- Unique normalized roll number.
- Foreign keys with deliberate deletion policy.
- Index photo lookup by student and sort order.
- Index audit log by created_at and actor.
- Enforce valid status/role values.
- Avoid cascade deletion that unintentionally removes audit evidence.
- Use transactions for multi-table admin operations.

## Migrations
- Use Drizzle schema as source of truth.
- Generate and review migrations.
- Never run destructive migrations against production without backup/approval.
- Keep seed data development-only; never commit real student data.
- Separate dev/preview/prod database branches where practical.

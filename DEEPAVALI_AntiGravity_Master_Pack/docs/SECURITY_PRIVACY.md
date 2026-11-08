# Security, Privacy, and Operations

## Authentication
- No public signup.
- Admin provisions accounts and display names.
- Student login: roll number + initial credential as defined in PRD.
- DOB in DDMMYYYY is predictable and must be treated as a temporary bootstrap credential, not a strong long-term password.
- Require password change at first login where feasible, or implement an owner-approved additional PIN/activation process.
- Hash with Argon2id using a maintained library compatible with deployment runtime.
- Generic login errors; rate-limit by account and network signals.
- Secure, HttpOnly, SameSite cookies; Secure in production.
- Rotate/revoke sessions after credential changes and account deactivation.

## Authorization
- Enforce role checks on the server for every admin route/action.
- Enforce student ownership/audience checks for every student resource.
- Never rely on hidden buttons or client-side route guards as security.
- Validate inputs and file metadata server-side.

## Private images
- Photos are private by default.
- Verify uploader role, type, size, dimensions, and ownership.
- Use Vercel Blob private access according to current provider documentation.
- Do not expose private Blob tokens or unrestricted object paths.
- Authorize every media request before streaming.
- Avoid permanent public URLs for student portraits.
- Require permission from people depicted and provide a deletion process.

## Data minimization
- Store only information required by the experience.
- Do not log credentials or DOB.
- Avoid analytics that expose student identity or photo content.
- Define retention/deletion expectations with the project owner.
- Protect backups and production data.

## Abuse and reliability
- Rate-limit login, uploads, and admin mutation endpoints.
- Validate MIME type and inspect actual image content; do not trust file extension.
- Restrict upload size and pixel dimensions to prevent decompression/resource abuse.
- Add safe error handling and audit important admin actions.
- Use CSRF protection where applicable to the chosen session/auth approach.
- Set security headers and a restrictive Content Security Policy compatible with WebGL/assets.
- Keep dependencies updated and audit vulnerabilities.

## Operational setup
- Keep `.env.local` out of version control.
- Commit `.env.example` with placeholder names only.
- Use separate development, preview, and production resources.
- Document restore/rollback and migration procedures.
- Never put secrets in client-side `NEXT_PUBLIC_` variables.

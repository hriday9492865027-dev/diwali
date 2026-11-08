# Technical Architecture

## Fixed platform choices
- Frontend and application: Next.js App Router, React, TypeScript.
- Hosting/runtime: Vercel.
- Database: Neon Serverless PostgreSQL, connected through Vercel Marketplace or linked Neon account.
- ORM/migrations: Drizzle ORM + drizzle-kit.
- Database driver: `@neondatabase/serverless` when suitable for the deployment runtime.
- Private media: Vercel Blob.
- Signature visuals: Three.js/WebGL2/GLSL; Canvas preprocessing; GSAP timeline orchestration where useful.
- Optional vision: MediaPipe Image Segmenter and Face Landmarker, only after a quality/performance evaluation.

## High-level boundaries
### Browser/client
- Landing, login form, dashboard and activity UI.
- Particle rendering and animation.
- Local image sampling/preprocessing where feasible.
- No database credentials, privileged Blob tokens, password hashes, or authorization decisions.

### Vercel server
- Authentication and session lifecycle.
- Admin and student authorization.
- Input validation and rate limiting.
- CRUD for accounts, greeting configuration and image metadata.
- Private Blob upload authorization and protected media streaming.
- Audit logging and server-side database access.

### Neon PostgreSQL
Store structured records and metadata only:
- Users, roles, credential hashes, account status.
- Display names and greeting configuration.
- Photo metadata, ordering, Blob identifiers, ownership/association.
- Activity configuration and audit events.
Do not store image binary data in PostgreSQL.

### Vercel Blob
Store actual images and other media. Use private access for student photos. Keep Blob tokens server-only. A server route must authenticate and authorize before serving a private object.

## Suggested application layout
```text
src/
  app/
    (public)/
      page.tsx
      login/page.tsx
    (student)/
      welcome/page.tsx
      dashboard/page.tsx
      activities/
        portrait/page.tsx
        diya/page.tsx
        lanterns/page.tsx
        gift/page.tsx
        memory-wall/page.tsx
        rangoli/page.tsx
        finale/page.tsx
    admin/
      page.tsx
      students/page.tsx
      media/page.tsx
      settings/page.tsx
    api/
      auth/
      admin/
      media/
  components/
    layout/
    ui/
    motion/
    fireworks/
    particle-portrait/
    activities/
  features/
    auth/
    students/
    media/
    greetings/
    activities/
  lib/
    auth/
    db/
    blob/
    validation/
    rate-limit/
    security/
  styles/
  types/
drizzle/
docs/
public/
```

Adapt this layout to the existing repository; do not force a restructure if a sound structure already exists.

## Data flow for a private photo
1. Admin submits an authenticated upload request.
2. Server validates role, file type, file size, image dimensions, and allowed format.
3. Server issues/handles authorized upload according to Vercel Blob's private access model.
4. Server records Blob object identity and metadata in Neon.
5. Student requests a photo through a protected endpoint.
6. Server verifies session and access policy, resolves the stored object identity from the database, and streams/returns the authorized object.
7. Never let the browser submit an arbitrary Blob path and receive it without ownership checks.

## Environment variables
Create `.env.example` with names confirmed against actual provider integration settings. Likely categories:
- `DATABASE_URL` or the exact Neon connection variable injected by integration.
- Session/auth secret.
- Vercel Blob token (server-only; exact name from current Vercel integration).
- Optional rate-limit storage configuration if used.
Do not guess live values. Document where each variable comes from. Do not prefix secrets with `NEXT_PUBLIC_`.

## Deployment environments
- Development: isolated development database/branch and non-production media.
- Preview: isolated preview database branch where practical; never accidentally point previews at production data.
- Production: production Neon branch and private Blob store.
- Apply migrations deliberately during deployment; avoid destructive automatic schema changes.
- Confirm Vercel function/runtime compatibility for chosen database driver and image-processing libraries.

## Rendering and performance
- Keep particle simulation outside React's per-frame render cycle.
- Use one renderer/canvas and reusable GPU buffers.
- Load heavy rendering/vision modules dynamically when the portrait activity is opened.
- Measure real device performance before setting particle counts.
- Provide a graceful fallback when WebGL2 is unavailable.

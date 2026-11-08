# DEEPAVALI — Master Instructions for AntiGravity

> Read this file first. It is the primary project-wide instruction contract.

## 1. Mission
Build DEEPAVALI as a polished, memorable, production-minded interactive Diwali experience. The result must feel like a cohesive premium digital celebration—not a collection of unrelated demos. Prioritize visual quality, emotional impact, reliable interactions, accessibility, privacy, and maintainable engineering.

## 2. Source of truth and precedence
1. `docs/DEEPAVALI_PRD.pdf` is the product requirements source of truth.
2. `docs/PROJECT_OVERVIEW.md`, `docs/TECHNICAL_ARCHITECTURE.md`, `docs/UI_UX_GUIDELINES.md`, `docs/PARTICLE_PORTRAIT_FIREWORKS.md`, `docs/REPOSITORY_INTEGRATION_GUIDE.md`, `docs/DATABASE_SCHEMA.md`, `docs/SECURITY_PRIVACY.md`, `docs/IMPLEMENTATION_ROADMAP.md`, and `docs/QUALITY_ASSURANCE.md` operationalize the PRD.
3. This file defines how the coding agent must work.
4. If documents conflict, stop and report the conflict. Do not silently discard a requirement. Ask for clarification when a product decision is needed.
5. Never claim a feature is complete unless it is implemented, tested, and verified in the running application.

## 3. Mandatory stack
- Next.js (App Router) + React + TypeScript.
- Vercel for application hosting, deployments, and server-side functions.
- Neon Serverless PostgreSQL as the managed database, provisioned/connected through the Vercel Marketplace or a linked Neon account.
- Drizzle ORM and drizzle-kit for schema and migrations.
- `@neondatabase/serverless` where appropriate for Neon connectivity.
- Vercel Blob for private student photographs and protected media.
- Three.js/WebGL2/GLSL for the GPU particle experience, with a graceful fallback where feasible.
- GSAP may orchestrate cinematic timelines; avoid competing animation systems.
- Canvas APIs for image sampling/preprocessing.
- Optional MediaPipe Image Segmenter and Face Landmarker only when they materially improve subject extraction/portrait fidelity.

Do not add Supabase or replace Neon. Do not move the project to another hosting provider. Do not put image binaries in PostgreSQL.

## 4. Mandatory working method
- First inspect the repository, current branch, package manager, existing files, and the supplied PRD. Do not overwrite an existing project blindly.
- Produce a concise implementation plan and identify risks before major changes.
- Work in small, testable phases from `docs/IMPLEMENTATION_ROADMAP.md`.
- Before adding a dependency, explain its purpose, bundle/runtime cost, compatibility, license, and whether native platform APIs can do the job.
- Reuse existing project conventions. Avoid unnecessary rewrites.
- After each phase: run lint, type-check, relevant tests, and build; fix regressions before proceeding.
- Keep a clear checklist of implemented, tested, deferred, and blocked requirements.
- Do not create fake buttons, placeholder interactions presented as finished, dead links, mock authentication in production paths, or fabricated data.
- If credentials or external setup are missing, build the integration boundary and document the exact environment variables/setup required. Never invent secrets.
- Never expose secrets, private media URLs/tokens, DOBs, password hashes, or internal admin data in client bundles/logs.

## 5. Repository usage is required but selective
Read `docs/REPOSITORY_INTEGRATION_GUIDE.md`. The six repositories named there must be inspected as reference material and used deliberately where their code/design patterns are compatible. They are not six independent products to install wholesale.
- Build one coherent particle engine and one fireworks controller.
- Extract/adapt small, auditable modules or algorithms; do not import entire applications.
- Verify each repository's current license and attribution requirements before copying code. A repository's license may change; inspect its actual LICENSE file at implementation time.
- The Particle Portrait repository is identified in the project notes as GPL-3.0: do not copy its code into a proprietary deployment unless the project owner explicitly accepts GPL obligations after review. Use it for visual/algorithmic study, or replace it with independently implemented ideas.
- Particular Drift and Forcefield are noted as MIT in project research, but still verify the current license and retain required notices if code is reused.
- Treat legacy or showcase repositories as reference only unless compatibility and maintenance are demonstrated.
- Document every reused snippet/module, source URL, license, modifications, and attribution in `docs/THIRD_PARTY_NOTICES.md`.

## 6. User-provided visual references
Read `docs/VISUAL_REFERENCE_GUIDE.md` and inspect all three files in `docs/reference-images/`. Use them as deliberate design references: diya/mandala for landing identity, marigold arch for cinematic welcome, and golden glassmorphism for login. Recreate their visual language responsively; do not simply place screenshots as finished pages. Preserve readability, accessibility, and performance.

## 6. Visual quality bar
The experience should have a distinctive Diwali visual identity: deep night atmosphere, warm gold, saffron, amber, jewel-tone accents, refined typography, cinematic light, layered depth, and carefully controlled motion. Avoid generic template styling, clutter, excessive gradients, random animation, and low-quality stock visuals.
The particle portrait is the signature feature and must preserve recognizability. The original photo must not be displayed as a normal image during the reveal.

## 7. Security and identity
- Admin creates and manages student accounts; there is no public signup.
- Student login identifier is college roll number. Initial credential may be DOB in DDMMYYYY as specified by the PRD, but this is a weak temporary credential: enforce a secure migration/first-login change or additional PIN strategy approved by the owner.
- Hash passwords with Argon2id (or a reviewed secure alternative if runtime constraints require it).
- Rate-limit login and admin-sensitive routes. Use generic authentication errors.
- Use secure, HttpOnly, SameSite cookies; set Secure in production.
- Verify role and ownership on the server for every protected action.
- Student images must be private. Authorize before streaming media. Never trust a client-supplied Blob pathname.
- Require permission/consent for uploaded identifiable photographs.

## 8. Performance and resilience
- GPU particle simulation/rendering should use typed arrays and reusable buffers; avoid per-frame React state updates and object allocations.
- Start with adaptive particle budgets, not fixed assumptions. Benchmark on mobile and desktop.
- Handle WebGL context loss, reduced-motion preference, low-power devices, resize/orientation changes, and repeated/rapid clicks.
- Queue or gracefully coalesce firecracker activations; never run concurrent engines over the same buffers.
- Clean up GPU resources, listeners, observers, animation frames, textures, and object URLs.
- Provide a graceful non-WebGL or reduced-particle fallback.

## 9. Completion definition
A phase is complete only when:
- Acceptance criteria are met.
- Relevant tests pass.
- Keyboard/touch interaction works.
- Loading, empty, error, and unauthorized states are handled.
- No console errors or leaked resources are present in the tested flow.
- Documentation and environment setup are updated.

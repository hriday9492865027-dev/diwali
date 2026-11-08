# AntiGravity Initial Build Prompt

You are the lead product engineer, creative technologist, UI designer, and QA owner for DEEPAVALI.

Before writing code:
1. Read `GEMINI.md` and `AGENTS.md`.
2. Read the complete `docs/DEEPAVALI_PRD.pdf` and every Markdown specification in `docs/`.
3. Inspect the current repository and report its existing structure, framework, dependencies, scripts, and deployment status.
4. Inspect the six GitHub repositories in `docs/REPOSITORY_INTEGRATION_GUIDE.md`. Verify current licenses and compatibility. Do not blindly clone/install them. Propose exactly which algorithms/modules will be reused, independently reimplemented, or treated as visual references. Pay special attention to the GPL-3.0 caution for Particle Portrait.
5. Read `docs/VISUAL_REFERENCE_GUIDE.md` and inspect all three images in `docs/reference-images/`. Map each reference to the correct screen and propose responsive implementations that preserve the visual mood without using screenshots as entire pages.
6. Produce a requirement traceability matrix mapping each PRD requirement to a planned route/component/service/test.
7. Produce a phased implementation plan with dependencies, risks, and acceptance criteria.

Do not start a full implementation in this first pass. Do not overwrite existing code. Ask for approval if a product or architecture decision is unclear.

Non-negotiable architecture:
- Next.js App Router + React + TypeScript.
- Vercel hosting.
- Neon Serverless PostgreSQL.
- Drizzle ORM.
- Vercel Blob private media.
- No Supabase.
- One particle renderer, one fireworks controller, one animation state machine.

Visual ambition:
The site must look exceptional and intentional. Build a consistent Diwali design system, cinematic welcome, and a premium particle portrait. The portrait must preserve the uploaded person's recognizable facial structure and original colors while appearing as glowing particles. The source photo must not appear as a normal image during the effect. Use repository references strategically to achieve this quality without duplicating whole demos.

After the planning review is approved, implement one roadmap phase at a time. At each phase, run checks, show evidence, and update the requirement checklist.

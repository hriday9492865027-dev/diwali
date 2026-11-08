# DEEPAVALI — AntiGravity Master Pack

This pack contains project instructions and implementation specifications for building DEEPAVALI.

## Start here
1. Place the supplied PRD PDF at `docs/DEEPAVALI_PRD.pdf`.
2. Copy `GEMINI.md` and `AGENTS.md` into the project root.
3. Copy the contents of `docs/` into the project's `docs/` folder.
4. Open the project in AntiGravity.
5. Ask the agent to read `GEMINI.md`, `AGENTS.md`, and the complete PRD before making changes.
6. Ask it to audit the repository and create a phased implementation plan. Do not ask it to generate the entire product in one pass.

## Suggested first prompt
"Read GEMINI.md, AGENTS.md, docs/DEEPAVALI_PRD.pdf and every relevant Markdown specification in docs/. Inspect the existing repository without overwriting anything. Create a requirement traceability checklist and a phased implementation plan. Identify missing credentials, infrastructure setup, licensing checks and technical risks. Do not start implementation until you show me the plan."

## Technology decisions
Next.js + React + TypeScript, Vercel, Neon Serverless PostgreSQL, Drizzle ORM, Vercel Blob private storage, and a single GPU particle/fireworks engine. No Supabase.

## Important
The repository URLs are research references, not permission to copy code. Verify licenses and compatibility before reuse. Record all third-party code and attribution in `THIRD_PARTY_NOTICES.md`.

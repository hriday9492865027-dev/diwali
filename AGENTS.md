# Agent Operating Rules — DEEPAVALI

These rules apply to any coding agent working in this repository.

## Before coding
1. Read `GEMINI.md` and all relevant documents in `/docs`.
2. Inspect the current codebase and identify what already exists.
3. Summarize the task, files likely to change, dependencies, risks, and tests.
4. Preserve existing user work. Never delete or replace files without understanding their purpose.

## During coding
- Use TypeScript strict mode. Avoid `any`; justify unavoidable exceptions.
- Prefer small components, typed domain services, and clear separation between server and client code.
- Keep secrets and database access server-side.
- Validate all inputs on the server with a schema validator.
- Use parameterized queries/Drizzle. Never concatenate untrusted SQL.
- Use accessible semantic HTML, labels, focus states, and keyboard support.
- Make motion responsive to `prefers-reduced-motion`.
- Avoid unnecessary dependencies and oversized client bundles.
- Do not put database credentials, Blob tokens, private URLs, or admin-only data in public environment variables.
- Never expose the original portrait image in the particle reveal layer.
- Do not duplicate the particle engine or create a separate renderer for each photo/activity.

## After coding
- Run formatting, lint, type-check, tests, and production build as applicable.
- Report exact commands run and results. Do not report tests as passing if they were not run.
- Update docs, migrations, and third-party notices.
- Summarize changed files, known limitations, and manual setup steps.

## Change control
Do not change the hosting provider, database provider, authentication model, data retention, photo privacy model, or core signature animation without explicit approval.

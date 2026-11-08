# Implementation Roadmap

Build in controlled phases. Do not attempt the entire product in one generation.

## Phase 0 — Repository and requirements audit
- Read PRD and all specifications.
- Inspect existing source, package manager, dependencies, and deployment config.
- Create requirement traceability matrix.
- Inspect all six reference repositories and verify licenses.
- Identify required Vercel/Neon/Blob setup and secrets.
Exit: approved plan, risk list, no destructive changes.

## Phase 1 — Foundation and design system
- Configure Next.js App Router and TypeScript strict mode.
- Establish lint, formatting, test and build scripts.
- Create design tokens, typography, responsive shell, shared components.
- Build landing page with lightweight ambient Diwali atmosphere.
Exit: responsive, accessible visual foundation; build passes.

## Phase 2 — Database and authentication
- Configure Neon and Drizzle.
- Implement reviewed schema/migrations.
- Implement admin/student roles, account provisioning, secure sessions, login rate limits.
- Implement first-login credential policy.
Exit: authentication tested; unauthorized requests blocked; no secrets in client bundle.

## Phase 3 — Admin and private media
- Student CRUD and status management.
- Display-name and greeting configuration.
- Private photo upload, validation, ordering, replacement and deletion.
- Protected media delivery.
- Audit events.
Exit: admin workflow works end-to-end; student cannot access another student's private media.

## Phase 4 — Cinematic welcome
- Rocket launch and layered firework reveal.
- “HAPPY DIWALI” typography and personalized display name.
- Continue/skip/reduced-motion behaviour.
Exit: timing, responsive behaviour and accessibility verified.

## Phase 5 — Particle portrait engine (highest visual priority)
- Build one renderer and state machine.
- Implement image sampling and target buffers.
- Integrate selective techniques from repository references.
- Implement rocket, burst, dispersion, reconstruction, idle shimmer and dissolve.
- Add photo cycling and rapid-click queue/coalescing.
- Benchmark and tune mobile/desktop.
Exit: recognizable portrait, no normal-image flash, stable repeated use, fallback and cleanup.

## Phase 6 — Dashboard and activities
- Build dashboard around the signature feature.
- Add diya, lanterns, gift, memory wall, rangoli, secret message and finale modules.
- Use shared design system and consistent motion/audio controls.
Exit: every visible control works; activities are coherent and responsive.

## Phase 7 — Hardening and QA
- Unit, integration, end-to-end and visual checks.
- Security review, access-control tests, upload abuse tests.
- Performance profiling, WebGL fallback, reduced-motion tests.
- Browser/device matrix.
Exit: acceptance criteria pass; no critical security or functional defects.

## Phase 8 — Deployment and release
- Configure Vercel project and environment variables.
- Connect Neon integration and verify database URL variable names.
- Configure private Vercel Blob.
- Run reviewed migrations.
- Test preview deployment with non-production data.
- Run production smoke test and rollback plan.
Exit: production verified and owner receives setup/deployment documentation.

## Agent reporting format
At the end of each phase report:
- Completed requirements.
- Files changed.
- Commands/tests run and exact outcomes.
- Screens/devices checked.
- Remaining issues and risks.
- Next phase proposal.

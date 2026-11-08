# GitHub Repository Integration Guide

## Core rule
Use the repositories as focused engineering references to improve quality and speed. Do not install or merge six complete projects. The target is one cohesive DEEPAVALI visual system, one particle renderer, and one fireworks controller.

Before reuse, inspect the repository's current source, commit activity, dependencies, build setup, license file, demo behaviour, browser support, and whether code is compatible with the current Next.js/Three.js version. Record findings in `THIRD_PARTY_NOTICES.md`.

## 1. Particular Drift
URL: https://github.com/collidingScopes/particular-drift
Demo: https://particular-drift.netlify.app/
Best use:
- Study image-to-particle conversion and image sampling.
- Study flow-field motion and particle organization.
- Adapt the approach for image target positions and subtle organic movement.
Integration:
- Extract only the minimal image-to-points/flow-field logic if the implementation is compatible and license permits.
- Convert data to the DEEPAVALI engine's typed-array format.
- Do not import its full UI or duplicate its animation loop.
License note: project research previously identified MIT; verify the current LICENSE file and preserve copyright/license notices if copying.

## 2. IMG-2-Particles-Morph-Physics-System
URL: https://github.com/shifatmasud/IMG-2-Particles-Morph-Physics-System
Demo: https://conclusive-form-676715.framer.app/
Best use:
- Study morphing between image targets.
- Study attraction/repulsion and transition easing.
Integration:
- Reuse the mathematical approach or small compatible utilities for target morphing.
- Integrate into the single particle state machine; do not run a second engine.
- Benchmark shader/CPU costs and adapt to mobile.
License: verify repository license before copying any code.

## 3. Particle Portrait
URL: https://github.com/bhuvanesh-m-dev/particle-portrait
Best use:
- Study portrait point-cloud composition, face/contour density, and recognizable point placement.
Integration:
- Treat primarily as a visual/algorithmic reference unless legal review approves code reuse.
- Project research identified GPL-3.0. Do not copy or link its code into a proprietary deployment without explicitly accepting GPL obligations after review.
- Independently implement compatible portrait sampling if needed.
License: verify current LICENSE and dependencies; GPL-3.0 obligations may affect distribution.

## 4. GrandFireworks JS
URL: https://github.com/travisjmac/grand-fireworks-js
Best use:
- Study rocket lifecycle, launch timing, burst patterns, trails, and layered firework composition.
Integration:
- Extract only compatible reusable concepts or small modules.
- Check maintenance, dependency age, browser compatibility, and license carefully; treat as legacy/showcase until proven otherwise.
- Keep firework particles coordinated with the portrait engine's renderer/timeline.

## 5. Forcefield
URL: https://github.com/collidingScopes/forcefield
Demo: https://collidingscopes.github.io/forcefield/
Best use:
- Study particle scattering, attraction/repulsion, and force-field interactions.
Integration:
- Adapt force calculations into shader uniforms or typed-array update logic.
- Use forces for burst dispersion, reconstruction attraction, and subtle idle motion.
- Do not create a second canvas or render loop.
License note: project research previously identified MIT; verify current LICENSE and preserve notices.

## 6. Three.js Fireworks
URL: https://github.com/toddegray/fireworks
Demo: https://fireworks.thetoddgray.com/
Best use:
- Study procedural fireworks in Three.js, burst variation, and particle trajectories.
Integration:
- Borrow ideas for burst patterns and trajectory curves.
- Align all effects to the project's single scene, camera, renderer, and animation scheduler.
- Verify maintenance, API compatibility, and license before reuse.

## Required integration workflow
For each repository:
1. Inspect source and LICENSE.
2. Write a short evaluation: useful module/algorithm, compatibility, maintenance, performance, license.
3. Decide: copy a small module, adapt an algorithm independently, or use visual reference only.
4. If copying, retain required notices and document modifications.
5. Add an automated test or visual regression/manual verification for the adapted behaviour.
6. Record source commit/tag and license in `THIRD_PARTY_NOTICES.md`.

## Recommended mapping
| DEEPAVALI need | Primary references |
|---|---|
| Image sampling / image-to-points | Particular Drift |
| Portrait point distribution | Particle Portrait (reference-first due to GPL) |
| Morphing / reconstruction | IMG-2-Particles-Morph-Physics-System |
| Attraction / repulsion / flow | Forcefield |
| Rocket and burst choreography | GrandFireworks JS |
| Three.js procedural burst ideas | Three.js Fireworks |

## Cohesion rules
- One renderer, one canvas, one animation loop, one state machine.
- Avoid importing duplicate Three.js versions.
- Avoid copying complete demos and their CSS/UI.
- Reconcile coordinate systems, color spaces, pixel ratios, cleanup, and timing.
- Keep portrait particle attributes and firework attributes compatible where possible.
- Prefer independently implemented clean abstractions over brittle copy/paste.

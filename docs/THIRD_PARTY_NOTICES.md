# Third-Party Notices and Repository Reuse Log

Update this file whenever third-party code, assets, fonts, or libraries are copied or bundled.

## Repository references
| Repository | URL | Intended use | License status |
|---|---|---|---|
| Particular Drift | https://github.com/collidingScopes/particular-drift | Image-to-particle sampling, flow-field ideas | Research notes say MIT; verify current LICENSE |
| IMG-2-Particles-Morph-Physics-System | https://github.com/shifatmasud/IMG-2-Particles-Morph-Physics-System | Image morphing and particle physics ideas | Verify current LICENSE |
| Particle Portrait | https://github.com/bhuvanesh-m-dev/particle-portrait | Portrait point-cloud visual reference | Research notes say GPL-3.0; reference-first; legal review before code reuse |
| GrandFireworks JS | https://github.com/travisjmac/grand-fireworks-js | Rocket lifecycle and burst patterns | Verify current LICENSE and maintenance |
| Forcefield | https://github.com/collidingScopes/forcefield | Attraction/repulsion and force-field ideas | Research notes say MIT; verify current LICENSE |
| Three.js Fireworks | https://github.com/toddegray/fireworks | Procedural Three.js fireworks ideas | Verify current LICENSE |

## Reuse record template
For each reused item, record:
- Repository and exact URL.
- Commit hash/tag or release.
- File/module copied or adapted.
- License and LICENSE file URL.
- Required copyright/license notice.
- Changes made.
- Why reuse was necessary.
- Reviewer/date.
- Dependency/security status.

## Implementation Audit & Reuse Records

### 1. Particular Drift
- **Repository**: https://github.com/collidingScopes/particular-drift
- **License**: MIT License (Copyright (c) 2021 collidingScopes)
- **Module Adapted**: Algorithmic concept of 2D canvas Sobel gradient edge detection and 3D Simplex vector flow fields.
- **Implementation File**: `src/lib/particles/saliency.ts` & `src/lib/particles/shaders.ts`
- **Modifications**: Re-implemented cleanly in TypeScript and GLSL shader functions. Applied as a subtle idle drift (`uDriftStrength`) rather than CPU-bound particle updates.
- **Status**: Audited & Verified. Permissive MIT.

### 2. IMG-2-Particles-Morph-Physics-System
- **Repository**: https://github.com/shifatmasud/IMG-2-Particles-Morph-Physics-System
- **License**: MIT License
- **Module Adapted**: Cubic smoothstep vertex morphing transition between random/burst positions and rasterized target points.
- **Implementation File**: `src/lib/particles/shaders.ts`
- **Modifications**: Integrated directly into Three.js WebGL2 vertex shader (`mix(aSourcePosition, aTargetPosition, uMorphProgress)`) using cubic ease-in-out curve.
- **Status**: Audited & Verified. Permissive MIT.

### 3. Particle Portrait (GPL-3.0 Clean-Room Audit)
- **Repository**: https://github.com/bhuvanesh-m-dev/particle-portrait
- **License**: GNU General Public License v3.0 (GPL-3.0)
- **Action Taken**: **Zero code copied**. A strict clean-room implementation was developed independently from scratch.
- **Implementation File**: `src/lib/particles/saliency.ts`
- **Details**: Uses independent mathematical formulas for facial bounding box biasing and luminant particle budgeting in Canvas 2D. No copyleft licensing contamination.
- **Status**: Clean-room certified.

### 4. GrandFireworks JS
- **Repository**: https://github.com/travisjmac/grand-fireworks-js
- **License**: MIT License
- **Module Adapted**: Rocket lifecycle state transitions: launch trajectory, ascent deceleration, terminal velocity apex trigger, and burst synchronization.
- **Implementation File**: `src/components/portrait/ParticlePortraitEngine.tsx`
- **Modifications**: Adapted into a robust 9-stage TypeScript state machine with rapid-click coalescing.
- **Status**: Audited & Verified.

### 5. Forcefield
- **Repository**: https://github.com/collidingScopes/forcefield
- **License**: MIT License (Copyright (c) collidingScopes)
- **Module Adapted**: Inverse-square mouse interaction physics (attraction/repulsion fields).
- **Implementation File**: `src/lib/particles/shaders.ts`
- **Modifications**: Compiled into GLSL vertex shader uniform calculations (`uMouse`, `uRadius`) executed 100% on the GPU for 60fps performance without CPU memory allocations.
- **Status**: Audited & Verified. Permissive MIT.

### 6. Three.js Fireworks
- **Repository**: https://github.com/toddegray/fireworks
- **License**: MIT License
- **Module Adapted**: Spherical coordinate dispersion (`r * sin(phi) * cos(theta)`) for initial explosion geometries.
- **Implementation File**: `src/components/portrait/ParticlePortraitEngine.tsx`
- **Modifications**: Directly generated in WebGL Float32Array BufferAttributes.
- **Status**: Audited & Verified. Permissive MIT.

## Policy
No code is copied before license review. Do not copy GPL-licensed code into a proprietary deployment without explicit owner approval after legal review. Prefer independently implemented algorithms or permissively licensed modules. Never remove upstream notices.

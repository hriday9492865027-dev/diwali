# Signature Feature: Fireworks-to-Particle Portrait

## Product outcome
A firecracker click launches a rocket, bursts into fireworks, and the glowing multicolor particles gather to reconstruct a recognizable person from one of the admin-configured photos. The photo itself must not appear as a normal visible image during this effect.

## Visual treatment
- Preserve source-image colors; do not convert all points to a single gold color.
- Use a hybrid animation: gentle shimmer/twinkle, organic flow, subtle breathing/floating, and restrained depth/parallax.
- Maintain facial recognizability: eyes, eyebrows, nose, mouth, face outline, hairline, and silhouette must remain sufficiently dense and stable.
- Clothing and body contours should be represented with medium/high density; background can be sparse.
- Particles should feel luminous and dimensional, not like a flat pixelated screenshot.
- Use multiple particle sizes/brightness levels with restrained bloom.
- Do not distort face proportions to fit a fixed rectangle; preserve aspect ratio and crop intentionally.

## State machine
Implement one explicit state machine:
`READY → ROCKET_LAUNCH → EXPLOSION → PARTICLE_DISPERSION → IMAGE_RECONSTRUCTION → PORTRAIT_IDLE → PARTICLE_DISSOLVE → NEXT_IMAGE → READY`

Rules:
- Only one active sequence may control the renderer.
- Rapid clicks must queue, coalesce, or safely advance; they must never start competing animation loops.
- Disable or debounce the control only as needed and communicate state.
- If a photo fails to load/process, show a graceful error/fallback and allow retry.
- On each activation, select the next active configured photo in admin order, then loop to the first.
- If only one photo is configured, replay it gracefully.

## Image preprocessing pipeline
1. Fetch image only through an authorized private-media flow.
2. Decode in browser where feasible; handle orientation and transparency.
3. Downscale to a bounded processing resolution while preserving aspect ratio.
4. Optionally segment the person from the background using MediaPipe Image Segmenter.
5. Sample pixels and build target positions/colors/weights.
6. Use optional face landmarks to protect key facial regions, not to identify the person.
7. Build typed arrays for positions, colors, alpha/weight, size, and motion parameters.
8. Transfer data efficiently to renderer; consider OffscreenCanvas/worker only if browser support and complexity justify it.
9. Dispose decoded bitmaps, temporary canvases, textures, and object URLs when no longer needed.

## Weighted sampling
Use saliency/region weighting rather than uniform random sampling:
- Very high: eyes, brows, nose, mouth, face boundary.
- High: hairline, ears, neck, distinctive head outline.
- Medium-high: clothing and shoulders/body silhouette.
- Low: background.
Do not make facial details so sparse that the person becomes unrecognizable at normal viewing distance.

## GPU implementation
- One Three.js scene/canvas and one particle material/shader pipeline.
- Store positions and attributes in typed arrays / BufferAttributes.
- Prefer shader-driven interpolation and motion over per-particle JavaScript objects.
- Use spring/attraction or eased interpolation toward target positions.
- Use seeded deterministic variation where useful to avoid flicker.
- Avoid React state updates every animation frame.
- Handle resize, device pixel ratio, WebGL context loss, visibility changes, and cleanup.
- Dynamically import the heavy portrait engine when required.

## Motion layers
1. Rocket: upward acceleration, trail, slight curvature, fade.
2. Burst: radial/hemispherical expansion, shockwave ring, flash, sparks.
3. Dispersion: particles spread and decelerate.
4. Reconstruction: particles attract to target coordinates with a controlled wave/region reveal.
5. Idle: subtle breathing, low-amplitude flow, shimmer/twinkle, gentle depth.
6. Dissolve: release particles outward or into a controlled stream before next portrait.

Avoid continuous high-amplitude motion while the portrait is meant to be viewed.

## Performance strategy
- Begin with conservative adaptive budgets, e.g. a few thousand on mobile and more on desktop; benchmark rather than hard-code a universal count.
- Adapt to frame time and device capability.
- Use reduced particle counts, lower pixel ratio, simpler bloom, and fewer secondary sparks on mobile.
- Keep a static/Canvas fallback if WebGL2 is unavailable.
- Test low-memory devices and repeated activation.
- Do not promise a fixed FPS until measured.

## Acceptance criteria
- Portrait is recognizable at the intended display size.
- Original photo is not visibly rendered as a conventional image during the effect.
- Source colors are retained.
- 3–5 photos cycle in admin order.
- Rapid clicks do not corrupt buffers or create multiple render loops.
- Portrait remains stable enough to appreciate.
- Reduced-motion mode and fallback work.
- No GPU/resource leaks after repeated use.

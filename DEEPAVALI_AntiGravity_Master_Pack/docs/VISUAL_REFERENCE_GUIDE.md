# Visual Reference Direction — DEEPAVALI

The three images in `docs/reference-images/` are user-provided visual references. Use them as inspiration for the product's visual language. They are not mandatory pixel-perfect templates and should not be copied blindly.

## Reference 01 — Diya, mandala and festival identity
File: `reference-images/reference-01-diya-mandala.jpg`

Use this direction for:
- Landing-page hero identity and festival emblem.
- A central illuminated diya as a strong focal point.
- Fine mandala/rangoli linework behind the focal element.
- Deep navy/near-black background with restrained gold, amber and saffron light.
- Small floating sparks, bokeh and warm glow.
- Elegant festival typography and carefully balanced negative space.

Implementation guidance:
- Prefer CSS/SVG geometry or optimized artwork for ornamental linework; do not use a huge raster screenshot as the whole page background.
- Keep the diya focal point crisp and readable at phone widths.
- Make decorative mandala opacity subtle enough that text remains legible.
- Animate flame flicker and tiny sparks gently; avoid distracting continuous motion.

## Reference 02 — Marigold floral entrance arch
File: `reference-images/reference-02-floral-entrance.jpg`

Use this direction for:
- The cinematic welcome screen after successful login.
- A festive gateway/arch framing the personalized greeting.
- Layered marigold garlands, foliage, warm fairy lights and glowing particles.
- A deep, warm night scene with the greeting as the visual focal point.
- Optional dashboard section transitions or a special finale scene.

Implementation guidance:
- Recreate the arch as layered responsive DOM/CSS/SVG or optimized image assets, not as a screenshot with text baked in.
- Keep the centre opening clear for rocket/firework animation and the user's display name.
- Use depth layers: background bokeh, arch structure, garlands/lights, foreground particles.
- On small screens, simplify side decorations while preserving the arch silhouette and central greeting.
- Ensure the rocket and fireworks do not obscure the name or essential controls.

## Reference 03 — Dark glassmorphism login with golden accents
File: `reference-images/reference-03-golden-glass-login.jpg`

Use this direction for:
- Student and admin login panels.
- Glass-like dark translucent surface, subtle gold border, warm ambient light and elegant controls.
- Soft floating orb/lighting effects used sparingly behind the form.
- Refined gold typography and clear field labels.

Important product-specific adaptation:
- Replace the reference's generic email field with **College Roll Number**.
- Keep the password/initial credential field and accessible show/hide control.
- Do not include public signup or an unnecessary "remember me" feature unless explicitly approved in the PRD.
- Do not expose a public password-reset flow if accounts are admin-provisioned; provide the approved recovery process instead.
- Keep the form high contrast and easy to use on mobile. The reference image's low-contrast labels and large decorative orbs must not be copied if they harm usability.

## Shared design language
- Palette: midnight navy/charcoal, antique gold, warm amber, saffron, subtle marigold orange, ivory text.
- Lighting: warm bloom, soft bokeh, small sparks, controlled reflections.
- Ornament: rangoli/mandala geometry, diya motifs, marigold garlands and foliage.
- Typography: expressive display face for festival titles, highly legible sans-serif for forms and body copy.
- Composition: one clear focal point per screen, generous negative space, restrained decoration.
- Motion: slow ambient drift, flame flicker, fairy-light twinkle, small particle movement; respect reduced-motion settings.

## Where these references belong
| Product area | Primary visual reference |
|---|---|
| Landing / ENTER screen | 01 — Diya and mandala |
| Personalized welcome cinematic | 02 — Floral entrance arch, combined with rocket/fireworks |
| Student/admin login | 03 — Golden glass panel |
| Dashboard atmosphere | Blend of 01 and 02, with activity cards kept readable |
| Grand finale | Blend of 01 and 02; do not reuse login visuals |

## Asset and implementation rules
1. Treat the uploaded images as inspiration and optional preview assets, not as production-ready page backgrounds by default.
2. Do not bake headings, buttons, form fields, or student names into background images.
3. Build text and controls as real HTML for accessibility, responsiveness and localization.
4. Optimize any image used in production (appropriate dimensions, modern formats, lazy loading).
5. Preserve user-provided references in the repository; do not overwrite or modify the originals.
6. Create original compatible assets or CSS/SVG recreations where possible; check licenses for any additional downloaded assets.
7. Keep the particle portrait feature visually distinct; these references guide the Diwali shell, not the portrait's color/recognition algorithm.

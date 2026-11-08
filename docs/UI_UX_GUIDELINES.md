# UI/UX and Visual Direction

## Creative direction
Create a premium, cinematic Diwali night: deep midnight blue/near-black foundations, warm gold, amber, saffron, jewel-tone accents, glowing diyas, subtle bokeh, fine rangoli geometry, elegant fireworks, and atmospheric depth. The interface should feel crafted and celebratory—not like a generic dashboard template.

## Visual hierarchy
- One dominant focal point per screen.
- Use generous spacing and clear typography.
- Use restrained glow and shadows; avoid glow on every element.
- Use contrast that keeps text readable over animated backgrounds.
- Keep controls discoverable and touch targets comfortable.
- Make the signature portrait interaction visually dominant on the dashboard.

## Design system
Create tokens for:
- Color palette: background, surface, surface-raised, text, muted text, gold, saffron, accent, success, warning, danger.
- Typography: display, heading, body, label, mono/data.
- Spacing, radius, elevation, borders, focus rings.
- Motion duration/easing and reduced-motion equivalents.
- Z-index layers for background, ambient effects, content, modal, toast, and controls.

Do not scatter arbitrary hex values, durations, or z-index values across components.

## Landing page
- Full-screen Diwali atmosphere with layered parallax used sparingly.
- Clear DEEPAVALI identity and one primary ENTER action.
- Keep initial load fast; defer heavy 3D assets until needed.
- Avoid making text unreadable over fireworks.

## Cinematic welcome
- Smooth transition into a darkened scene.
- Rocket launches from bottom toward a focal region.
- Rocket explosion triggers layered firework particles and a readable “HAPPY DIWALI” reveal.
- Display the configured display name, not roll number.
- Continue action is obvious and keyboard accessible.
- Provide skip/reduced-motion path.

## Dashboard
- Personalized greeting and subtle ambient motion.
- A prominent Firecracker/portrait feature card.
- Other activities arranged in a visually balanced responsive layout.
- Do not make every tile equally loud.
- Show clear loading and disabled states.

## Interaction and accessibility
- Support keyboard, mouse, touch and screen readers.
- Visible focus indicators.
- Text alternatives for meaningful visuals.
- No color-only status communication.
- Respect `prefers-reduced-motion`.
- Sound must be opt-in or have a clear mute control; never autoplay loud audio.
- Ensure animation never blocks navigation or essential controls.
- Test on narrow mobile screens and landscape orientation.

## Quality bar
Before accepting a screen, inspect it at mobile, tablet and desktop widths. Check alignment, typography, empty states, loading states, overlays, focus, contrast, motion timing, and visual consistency.


## User-provided visual references
Follow `VISUAL_REFERENCE_GUIDE.md` and inspect the three reference images in `reference-images/`. Use the diya/mandala direction for landing, floral entrance arch for the personalized cinematic welcome, and dark golden glassmorphism for login. Treat these as visual inspiration, not fixed screenshots. Rebuild as responsive accessible UI, keeping controls/text live and readable.

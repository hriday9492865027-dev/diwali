# Quality Assurance and Acceptance Criteria

## Functional
- Landing ENTER navigates to login.
- No public registration path exists.
- Valid student credentials authenticate; inactive accounts do not.
- Greeting uses display name, never roll number.
- Welcome cinematic sequence can continue or be skipped appropriately.
- Admin can create/edit/deactivate/delete accounts and manage greetings.
- Admin can upload, order, replace, and delete photos.
- Student sees only authorized photos and messages.
- Portrait click advances to next configured photo and loops.
- Rapid clicks do not create concurrent animation loops or buffer corruption.
- All visible activity controls perform their advertised action.

## Portrait visual quality
- Face and body silhouette are recognizable.
- Source colors are preserved.
- Original photo is not shown as a conventional image during reconstruction.
- Particles have depth and controlled shimmer; no chaotic jitter.
- Reconstructed portrait is stable enough to view.
- Burst and transition feel connected to the Diwali celebration.

## Security
- Password hashes only; no plaintext credentials.
- Rate limits active.
- Server-side role and ownership checks.
- Private media cannot be fetched by guessing a URL/path.
- Upload validation and size limits enforced.
- No secrets in client bundles or logs.
- Admin mutations are auditable.

## Performance and resilience
- No duplicate render loops after repeated navigation.
- GPU resources and listeners are disposed.
- WebGL failure handled gracefully.
- Reduced-motion mode works.
- Mobile particle count/effects adapt to device.
- Layout works at narrow widths and landscape orientation.
- Loading, empty, failure and offline-ish states are understandable.

## Test matrix
Test current stable Chrome, Edge, Firefox and Safari where available; Android Chrome and iOS Safari where available. Include low/mid-tier phones, tablet, laptop, and large desktop. Record actual device/browser and measured results rather than assuming compatibility.

## Release blockers
Do not ship with:
- Broken authentication/authorization.
- Publicly exposed student photos.
- Unusable mobile portrait experience.
- Critical data loss or destructive migration risk.
- Fake/inert core controls.
- Unresolved third-party license obligations.

# Project Overview

## Product
DEEPAVALI is a personalized, interactive Diwali celebration website. A visitor enters through a festive landing page, signs in using an admin-created student account, experiences a cinematic personalized welcome, and explores interactive celebration activities.

## Product principles
1. Emotional impact: the welcome and portrait reveal should feel magical and personal.
2. Signature first: the fireworks-to-particle-portrait experience must receive the strongest engineering and visual attention.
3. Cohesion: every activity belongs to one visual world and navigation system.
4. Privacy by design: student accounts and identifiable photographs are protected.
5. Reliability: the experience must work on touch devices and gracefully degrade on weaker hardware.
6. Maintainability: one architecture, one design system, one particle engine.

## Roles
### Student
- Sign in with assigned college roll number and credential.
- See personalized display name, never the roll number as the greeting name.
- Experience the welcome animation.
- Use the available celebration activities.
- Access only content authorized for that student.

### Admin
- Sign in through a protected admin path/role.
- Create, edit, deactivate, and delete student accounts.
- Set a display name independently from roll number.
- Configure greeting and secret message.
- Upload, replace, reorder, and delete portrait images.
- Preview the experience as a selected student.
- Review audit events and operational status.

## Main visitor journey
1. Landing page: immersive Diwali scene and clear ENTER action.
2. Login: roll number + credential; no public registration.
3. Server validates account, password, status, and rate limit.
4. Cinematic welcome: darken scene → rocket launch → explosion → “HAPPY DIWALI” → display name.
5. Continue action enters the dashboard.
6. Student explores activities.
7. Firecracker interaction launches the signature particle portrait sequence, cycling through configured photos.
8. User can return to dashboard or replay.

## Activity modules
- Signature Firecracker / Particle Portrait.
- Light a Diya.
- Virtual Sky Lanterns.
- Surprise Gift Box.
- Memory Wall.
- Rangoli Creator.
- Personalized Secret Message.
- Grand Finale.

Build each activity as a focused module with shared design tokens, navigation, audio controls, and accessibility conventions. Prioritize the signature portrait before optional modules.

## Out of scope unless approved
- Public self-registration.
- Publicly accessible student photo gallery.
- Storing raw passwords or DOBs.
- Public APIs for private image paths.
- Separate unrelated animation engines for every module.
- Introducing a different hosting/database platform.

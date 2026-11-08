# diwali

## DEEPAVALI — Personalized Interactive Diwali Celebration Platform

DEEPAVALI is a personalized, interactive Diwali celebration website featuring cinematic visuals, a personalized welcome sequence, interactive festival activities, and a signature multicolor particle fireworks portrait effect that reconstructs photographs of invited visitors entirely from glowing particles.

### Architecture & Tech Stack
- **Framework**: Next.js (App Router) + React + TypeScript
- **Hosting**: Vercel
- **Database**: Neon Serverless PostgreSQL (provisioned via Vercel Marketplace)
- **ORM & Migrations**: Drizzle ORM + drizzle-kit
- **Media Storage**: Vercel Blob (Private Storage)
- **Graphics & 3D**: Three.js / WebGL2 / GLSL shaders + Canvas API
- **Timeline & Motion**: GSAP + Framer Motion
- **Authentication**: Custom Argon2id hashed credentials with secure HTTP-only cookies

### Documentation
Comprehensive architectural and product specifications are located in `/docs`:
- [DEEPAVALI PRD](docs/DEEPAVALI_PRD.pdf)
- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [UI/UX Guidelines](docs/UI_UX_GUIDELINES.md)
- [Particle Portrait & Fireworks Engine](docs/PARTICLE_PORTRAIT_FIREWORKS.md)
- [Repository Integration Guide](docs/REPOSITORY_INTEGRATION_GUIDE.md)
- [Security & Privacy](docs/SECURITY_PRIVACY.md)
- [Implementation Roadmap](docs/IMPLEMENTATION_ROADMAP.md)
- [Quality Assurance](docs/QUALITY_ASSURANCE.md)
- [Visual Reference Guide](docs/VISUAL_REFERENCE_GUIDE.md)


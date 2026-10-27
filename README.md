# FiveM CRM Frontend

Next.js 15 CRM with role-based access, lead/call management, and dashboards.

## Prerequisites

- Node.js 18+
- Backend API running

## Quick Start

```bash
npm install
cp .env.example .env.local   # then edit
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment (.env.local)

See `.env.example`. `NEXTAUTH_URL` must be a single URL. The `NEXT_PUBLIC_*` branding vars (site name, company, user email domain, contact email) are baked in at build time, so redeploy after changing them.

## Scripts

| Command         | Description        |
| --------------- | ------------------ |
| `npm run dev`   | Development server |
| `npm run build` | Production build   |
| `npm run start` | Production server  |
| `npm run lint`  | ESLint             |

## Tech Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI, NextAuth.js, Recharts.

## Roles

- **Admin** – Full access, user management
- **Manager** – Leads, reports, stages
- **Advisor / Telecaller / Processing** – Role-specific dashboards and leads

## Public Website

Visitors land on a public marketing site; **Sign in** goes to `/login` and **Sign up** to `/signup`.

| Route | Page |
| ----- | ---- |
| `/` | Home |
| `/about` | About us |
| `/services` | Services |
| `/how-it-works` | Lead journey, stages and role access |
| `/user-guide` | Step-by-step guide with screenshots (`public/guide/`) |
| `/signup` | How to get an account |
| `/privacy-policy`, `/terms-and-conditions` | Legal pages |

Pages live in `app/(site)/`, shared parts in `components/site/`, and the contact email, nav and public route list in `lib/site.ts`.

## Project Layout

- `app/` – Routes (dashboard, leads, calls, documents, etc.)
- `components/` – UI and feature components
- `contexts/` – Auth, reminders
- `lib/` – Server actions, types, utils

## License

MIT

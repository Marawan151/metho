# Project Structure — Event Registration Platform

A tech event registration website built on **React (TanStack Start) + TypeScript + Tailwind CSS v4** with **Lovable Cloud** (Supabase: Postgres, Auth, Storage, Edge Functions) as the backend.

> Note: The original request specified Django + MongoDB. Lovable's runtime supports only the stack below. All listed features (event listing, registration, data persistence, validation) are implemented on this stack.

---

## Tech Stack

| Layer        | Technology                                              |
|--------------|---------------------------------------------------------|
| Frontend     | React 19, TypeScript, TanStack Start v1, TanStack Router|
| Styling      | Tailwind CSS v4, custom OKLCH design tokens             |
| Forms / Validation | React Hook Form + Zod                             |
| Backend      | Lovable Cloud (Supabase Postgres + RLS)                 |
| Build / Dev  | Vite 7, Bun                                             |
| Deployment   | Cloudflare Workers (Edge SSR)                           |

---

## Directory Tree

```
.
├── public/                          # Static assets served as-is
├── src/
│   ├── components/
│   │   ├── EventCard.tsx            # Event preview card (homepage grid)
│   │   ├── RegistrationForm.tsx     # Zod-validated registration form
│   │   ├── SiteHeader.tsx           # Top navigation
│   │   ├── SiteFooter.tsx           # Footer
│   │   └── ui/                      # shadcn/ui primitives (button, input, ...)
│   │
│   ├── routes/                      # File-based routing (TanStack Router)
│   │   ├── __root.tsx               # Root layout, providers, SEO meta, toaster
│   │   ├── index.tsx                # / — Hero + featured event grid
│   │   ├── about.tsx                # /about
│   │   └── events.$slug.tsx         # /events/:slug — Event detail + registration
│   │
│   ├── lib/
│   │   ├── format.ts                # Date / time formatting utilities
│   │   ├── utils.ts                 # cn() Tailwind class merger
│   │   ├── error-capture.ts         # Runtime error reporting
│   │   └── error-page.ts            # Error boundary helper
│   │
│   ├── integrations/supabase/
│   │   ├── client.ts                # Browser Supabase client (auto-generated)
│   │   ├── client.server.ts         # Server admin client (service role)
│   │   ├── auth-middleware.ts       # requireSupabaseAuth middleware
│   │   └── types.ts                 # Generated DB types (auto-generated)
│   │
│   ├── hooks/
│   │   └── use-mobile.tsx           # Responsive breakpoint hook
│   │
│   ├── routeTree.gen.ts             # Auto-generated route tree (do not edit)
│   ├── router.tsx                   # Router instance + QueryClient
│   ├── server.ts                    # SSR server entry
│   ├── start.ts                     # Client entry
│   └── styles.css                   # Tailwind + design tokens (Midnight Indigo)
│
├── supabase/
│   ├── config.toml                  # Supabase project config
│   └── migrations/
│       ├── 2026...01_*.sql          # Create events + registrations tables
│       └── 2026...15_*.sql          # Seed event data
│
├── .env                             # Auto-managed (Supabase URL/keys)
├── components.json                  # shadcn/ui config
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.jsonc                   # Cloudflare Workers deploy config
```

---

## Database Schema (Lovable Cloud / Postgres)

### `events`
| Column       | Type        | Notes                       |
|--------------|-------------|-----------------------------|
| id           | uuid (PK)   | `gen_random_uuid()`         |
| slug         | text        | URL identifier              |
| title        | text        |                             |
| tagline      | text        |                             |
| description  | text        |                             |
| starts_at    | timestamptz |                             |
| ends_at      | timestamptz |                             |
| location     | text        |                             |
| format       | text        | `in-person` / `virtual`     |
| capacity     | integer     | default 100                 |
| cover_emoji  | text        | default `🎤`                |
| featured     | boolean     | default false               |
| created_at   | timestamptz | default `now()`             |

**RLS:** Public `SELECT` only. No public writes.

### `registrations`
| Column       | Type        | Notes                                  |
|--------------|-------------|----------------------------------------|
| id           | uuid (PK)   |                                        |
| event_id     | uuid (FK)   | references `events.id`                 |
| full_name    | text        | 1–120 chars                            |
| email        | text        | regex-validated, 5–255 chars           |
| company      | text?       | optional, ≤160 chars                   |
| role         | text?       | optional, ≤120 chars                   |
| ticket_type  | text        | `standard` \| `student` \| `vip`       |
| dietary      | text?       | optional, ≤240 chars                   |
| notes        | text?       | optional, ≤1000 chars                  |
| created_at   | timestamptz |                                        |

**RLS:** Public `INSERT` only with check constraints. No public read/update/delete (attendee privacy).

---

## Routing Map

| Route             | File                       | Purpose                          |
|-------------------|----------------------------|----------------------------------|
| `/`               | `routes/index.tsx`         | Landing page + event grid        |
| `/about`          | `routes/about.tsx`         | About the platform               |
| `/events/:slug`   | `routes/events.$slug.tsx`  | Event detail + registration form |

---

## Design System

- **Theme:** Midnight Indigo (deep navy + electric indigo)
- **Display font:** Syne
- **Body font:** Plus Jakarta Sans
- **Tokens:** Defined in `src/styles.css` using OKLCH (`--background`, `--primary`, `--gradient-primary`, `--shadow-glow`, etc.)
- **Components:** shadcn/ui primitives styled via semantic tokens (no hardcoded colors)

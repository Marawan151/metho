
-- EVENTS
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null,
  description text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null,
  format text not null default 'in-person' check (format in ('in-person','virtual','hybrid')),
  capacity int not null default 100,
  cover_emoji text not null default '🎤',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events_public_read" on public.events
  for select using (true);

-- REGISTRATIONS
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text not null,
  company text,
  role text,
  ticket_type text not null default 'standard' check (ticket_type in ('standard','student','vip')),
  dietary text,
  notes text,
  created_at timestamptz not null default now(),
  unique (event_id, email)
);

alter table public.registrations enable row level security;

-- Anyone can submit a registration (public form, no auth).
create policy "registrations_public_insert" on public.registrations
  for insert with check (true);

-- No public select / update / delete policies → reads are blocked by RLS.

create index registrations_event_id_idx on public.registrations(event_id);

-- SEED
insert into public.events (slug, title, tagline, description, starts_at, ends_at, location, format, capacity, cover_emoji, featured) values
('devsummit-2026', 'DevSummit 2026', 'The frontier of full-stack engineering',
 'Three days of deep technical talks, hands-on workshops, and after-hours hacking with engineers from the world''s most ambitious product teams. Tracks cover AI tooling, edge runtimes, distributed systems, and developer experience.',
 '2026-09-14 09:00:00+00', '2026-09-16 18:00:00+00', 'Lisbon, Portugal', 'hybrid', 1200, '⚡', true),
('ai-engineering-day', 'AI Engineering Day', 'Ship production-grade AI, not demos',
 'A focused single-day intensive on building, evaluating, and deploying LLM-powered systems. Bring a laptop. Leave with a working RAG pipeline, an evals harness, and a network of practitioners.',
 '2026-06-22 09:30:00+00', '2026-06-22 19:00:00+00', 'Berlin, Germany', 'in-person', 350, '🧠', true),
('edge-runtime-conf', 'Edge Runtime Conf', 'Latency is a feature',
 'Two days dedicated to the edge: Workers, Durable Objects, KV, R2, and the next generation of globally distributed runtimes. Featuring core engineers from Cloudflare, Vercel, and Deno.',
 '2026-04-08 09:00:00+00', '2026-04-09 18:00:00+00', 'Online', 'virtual', 5000, '🛰️', false),
('open-source-fest', 'Open Source Fest', 'Maintainers, contributors, and the people who fund them',
 'A weekend celebrating the people behind the libraries you depend on every day. Lightning talks, sponsor matchmaking, a live PR review track, and a maintainer''s lounge.',
 '2026-11-07 10:00:00+00', '2026-11-08 17:00:00+00', 'Amsterdam, Netherlands', 'in-person', 600, '🌱', false);

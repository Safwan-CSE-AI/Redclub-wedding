-- Red Club Wedding — Supabase PostgreSQL schema
-- Run in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  body text,
  image_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_image_url text,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  collection_id uuid references public.collections(id) on delete set null,
  location text,
  event_date date,
  summary text,
  story text,
  cover_image_url text,
  featured boolean not null default false,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt text,
  aspect text not null default 'portrait' check (aspect in ('portrait','landscape','square')),
  wedding_id uuid references public.weddings(id) on delete cascade,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  wedding_date date,
  event_type text,
  location text,
  guest_count int,
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','closed')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists weddings_collection_idx on public.weddings(collection_id);
create index if not exists gallery_wedding_idx on public.gallery_images(wedding_id);
create index if not exists enquiries_status_idx on public.enquiries(status, created_at desc);

-- Row level security -------------------------------------------------------
-- The backend uses the service role key (bypasses RLS). RLS here protects the
-- tables if the anon key is ever used directly against the REST API:
-- anonymous visitors may only READ published content; enquiries and
-- admin_users have NO policies, so they are unreachable with the anon key.
alter table public.site_content enable row level security;
alter table public.services enable row level security;
alter table public.collections enable row level security;
alter table public.weddings enable row level security;
alter table public.gallery_images enable row level security;
alter table public.enquiries enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "public read content" on public.site_content;
create policy "public read content" on public.site_content for select using (true);
drop policy if exists "public read services" on public.services;
create policy "public read services" on public.services for select using (published);
drop policy if exists "public read collections" on public.collections;
create policy "public read collections" on public.collections for select using (published);
drop policy if exists "public read weddings" on public.weddings;
create policy "public read weddings" on public.weddings for select using (published);
drop policy if exists "public read gallery" on public.gallery_images;
create policy "public read gallery" on public.gallery_images for select using (published);

-- Storage ----------------------------------------------------------------
-- Public-read bucket; writes only via the backend (service role).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

-- Making an admin:
--   1. Supabase Dashboard → Authentication → Users → Add user (email + password)
--   2. insert into public.admin_users (user_id) select id from auth.users where email = 'you@example.com';

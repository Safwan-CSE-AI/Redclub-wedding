# Red Club Wedding

An editorial, ZARA-inspired wedding website: campaign homepage, collections, wedding project pages, gallery with lightbox, enquiry form and a protected admin dashboard.

**Stack** — React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · React Router · React Hook Form · Zod · Node/Express (TypeScript) · Supabase (PostgreSQL + Storage + Auth).

> **Content status:** the real site (redclubwedding.com) could not be read during research, so all business copy and imagery are **placeholders** to be filled from `/admin`. See `docs/research.md`. No testimonials or business details were invented.

## Structure

```
redclub-wedding/
  frontend/   React app (public site + /admin UI)
  backend/    Express API (validation, auth, uploads, rate limiting)
  database/   schema.sql (tables, RLS, storage bucket) and seed.sql (placeholders)
  public/     robots.txt, favicon (served by Vite)
  docs/       research.md, page-inventory.md, deployment.md
  .env.example
```

## Quick start

1. **Supabase**: create a project, then run `database/schema.sql` and (optionally) `database/seed.sql` in the SQL editor.
2. **Create the admin**: Supabase → Authentication → Users → *Add user* (email + password), then run:
   ```sql
   insert into public.admin_users (user_id) select id from auth.users where email = 'you@example.com';
   ```
3. **Environment**: `cp .env.example .env` and fill in the Supabase URL, anon key and service-role key.
4. **Install & run** (two terminals):
   ```bash
   cd backend  && npm install && npm run dev      # http://localhost:4000
   cd frontend && npm install && npm run dev      # http://localhost:5173
   ```
   Vite proxies `/api` and `/sitemap.xml` to the backend.
5. Open `http://localhost:5173/admin/login`, sign in, fill in **Content**, **Collections**, **Weddings**, **Services**, **Gallery**.

## Security summary
- Service-role key lives only in backend env; the browser never sees it.
- Admin auth = Supabase Auth JWT **and** membership in `admin_users`, checked server-side on every `/api/admin/*` request.
- RLS enabled on all tables: anonymous access is read-only for published content; `enquiries` and `admin_users` have no public policies.
- Server-side Zod validation for every write; field whitelists on content keys.
- Rate limits: global, enquiries (5/hour/IP), admin login (10/15 min/IP).
- Spam: honeypot field + minimum-fill-time check + rate limit.
- Uploads: JPEG/PNG/WebP/AVIF only, 5 MB max, MIME **and** magic-byte check, random file names, public-read bucket with server-only writes.
- Helmet headers, CORS restricted to `CORS_ORIGIN`, JSON body limit 100 kB.

## Notes
- The admin token is kept in `sessionStorage` (cleared when the tab closes).
- Venues page is built from wedding locations plus the editable "Venues page text", since no verified venue list exists yet.
- Image optimisation: images are lazy-loaded with async decoding and fixed aspect ratios (no layout shift). For automatic resizing, upload web-sized images or enable Supabase image transformations (paid plans) and adapt `Media.tsx`.

See `docs/deployment.md` for hosting.

# Deployment

## 1. Supabase
1. Create a project. Run `database/schema.sql`, optionally `database/seed.sql`.
2. Confirm the `media` storage bucket exists and is public (the schema creates it).
3. Add the admin user and insert into `admin_users` (see README).
4. Authentication → Providers: keep Email enabled, **disable public sign-ups** (Auth → Settings) so only you can create users.

## 2. Backend (Render, Railway, Fly.io, any Node 20+ host)
- Root directory: `backend`
- Build: `npm install && npm run build`
- Start: `npm start`
- Environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET=media`, `CORS_ORIGIN=https://your-domain`, `SITE_URL=https://your-domain`, `NODE_ENV=production`
- Health check: `GET /health`

## 3. Frontend (Netlify, Vercel, Cloudflare Pages)
- Root directory: `frontend`; build: `npm run build`; output: `dist`
- Set `VITE_API_URL` to `https://your-api-host/api` (or proxy `/api` to the backend on the same domain and leave it unset).
- **SPA fallback is required** so deep links work: Netlify `_redirects` → `/* /index.html 200`; Vercel `rewrites` → `/(.*)` to `/index.html`.
- Route `/sitemap.xml` to the backend (proxy/redirect) so the dynamic sitemap is served; update `public/robots.txt` with your real domain.

## 4. Same-domain option (simplest CORS)
Serve the frontend and proxy `/api/*` and `/sitemap.xml` to the backend from one domain (Nginx, Caddy, Vercel rewrites). Then no `VITE_API_URL` is needed.

## 5. Post-deploy checklist
- [ ] Sign in at `/admin/login`
- [ ] Fill in Content (hero, about, contact details)
- [ ] Add collections, weddings, services, gallery images
- [ ] Submit a test enquiry and see it in Admin → Enquiries
- [ ] Visit `/sitemap.xml` and `/robots.txt`
- [ ] Check on a phone: menu overlay, gallery lightbox swipe, enquiry form

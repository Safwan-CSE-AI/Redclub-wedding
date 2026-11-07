import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';
import { db } from './supabase.js';
import { errorHandler } from './http.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';

const app = express();
app.set('trust proxy', 1); // behind one reverse proxy (Render, Railway, Nginx…)
app.disable('x-powered-by');

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/admin', adminRouter);
app.use('/api', publicRouter);

/** Dynamic sitemap: route /sitemap.xml to this server in production (see docs/deployment.md). */
app.get('/sitemap.xml', async (_req, res) => {
  const base = env.SITE_URL.replace(/\/$/, '');
  const urls = ['/', '/weddings', '/collections', '/services', '/venues', '/gallery', '/about', '/contact'];
  const [c, w, s] = await Promise.all([
    db.from('collections').select('slug').eq('published', true),
    db.from('weddings').select('slug').eq('published', true),
    db.from('services').select('slug').eq('published', true),
  ]);
  (c.data ?? []).forEach((r) => urls.push(`/collections/${r.slug}`));
  (w.data ?? []).forEach((r) => urls.push(`/weddings/${r.slug}`));
  (s.data ?? []).forEach((r) => urls.push(`/services/${r.slug}`));
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n') +
    `\n</urlset>\n`;
  res.type('application/xml').send(xml);
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

app.listen(env.PORT, () => console.log(`API listening on :${env.PORT}`));

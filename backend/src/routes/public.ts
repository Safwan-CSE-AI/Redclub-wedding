import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { db } from '../supabase.js';
import { HttpError, check, wrap } from '../http.js';
import { enquirySchema } from '../schemas.js';

export const publicRouter = Router();

const bySort = { column: 'sort_order', opts: { ascending: true } } as const;

publicRouter.get('/content', wrap(async (_req, res) => {
  const rows = check(await db.from('site_content').select('key,value'));
  res.set('Cache-Control', 'public, max-age=60');
  res.json(Object.fromEntries((rows ?? []).map((r) => [r.key, r.value])));
}));

publicRouter.get('/services', wrap(async (_req, res) => {
  const rows = check(await db.from('services').select('*').eq('published', true).order(bySort.column, bySort.opts));
  res.set('Cache-Control', 'public, max-age=60');
  res.json(rows);
}));

publicRouter.get('/services/:slug', wrap(async (req, res) => {
  const row = check(await db.from('services').select('*').eq('slug', req.params.slug).eq('published', true).maybeSingle());
  if (!row) throw new HttpError(404, 'Not found');
  res.json(row);
}));

publicRouter.get('/collections', wrap(async (_req, res) => {
  const rows = check(await db.from('collections').select('*').eq('published', true).order(bySort.column, bySort.opts));
  res.set('Cache-Control', 'public, max-age=60');
  res.json(rows);
}));

publicRouter.get('/collections/:slug', wrap(async (req, res) => {
  const collection = check(await db.from('collections').select('*').eq('slug', req.params.slug).eq('published', true).maybeSingle());
  if (!collection) throw new HttpError(404, 'Not found');
  const weddings = check(
    await db.from('weddings').select('*').eq('collection_id', collection.id).eq('published', true).order(bySort.column, bySort.opts),
  );
  res.json({ collection, weddings });
}));

publicRouter.get('/weddings', wrap(async (_req, res) => {
  const rows = check(await db.from('weddings').select('*').eq('published', true).order(bySort.column, bySort.opts));
  res.set('Cache-Control', 'public, max-age=60');
  res.json(rows);
}));

publicRouter.get('/weddings/:slug', wrap(async (req, res) => {
  const wedding = check(await db.from('weddings').select('*').eq('slug', req.params.slug).eq('published', true).maybeSingle());
  if (!wedding) throw new HttpError(404, 'Not found');
  const images = check(
    await db.from('gallery_images').select('*').eq('wedding_id', wedding.id).eq('published', true).order(bySort.column, bySort.opts),
  );
  let related = check(
    await db.from('weddings').select('*').eq('published', true).neq('id', wedding.id)
      .eq('collection_id', wedding.collection_id ?? '00000000-0000-0000-0000-000000000000').limit(3),
  );
  if (!related || related.length === 0) {
    related = check(await db.from('weddings').select('*').eq('published', true).neq('id', wedding.id).limit(3));
  }
  res.json({ wedding, images, related });
}));

publicRouter.get('/gallery', wrap(async (_req, res) => {
  const rows = check(await db.from('gallery_images').select('*').eq('published', true).order(bySort.column, bySort.opts));
  res.set('Cache-Control', 'public, max-age=60');
  res.json(rows);
}));

/* ---------- enquiries ---------- */
const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many enquiries from this connection. Please try again later.' },
});

publicRouter.post('/enquiries', enquiryLimiter, wrap(async (req, res) => {
  const parsed = enquirySchema.parse(req.body);

  // Spam protection: honeypot filled (schema already rejects) or form submitted impossibly fast.
  const tooFast = typeof parsed.startedAt === 'number' && Date.now() - parsed.startedAt < 2500;
  if (tooFast) {
    // Pretend success so bots learn nothing; store nothing.
    return res.status(201).json({ ok: true });
  }

  const { website: _w, startedAt: _s, ...data } = parsed;
  check(await db.from('enquiries').insert({ ...data, status: 'new' }));
  res.status(201).json({ ok: true });
}));

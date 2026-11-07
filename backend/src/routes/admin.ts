import { randomUUID } from 'node:crypto';
import { Router, type Request } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';
import { anonClient, db } from '../supabase.js';
import { requireAdmin } from '../auth.js';
import { HttpError, check, wrap } from '../http.js';
import { env } from '../env.js';
import {
  CONTENT_KEYS, collectionSchema, contentSchema, enquiryUpdateSchema, gallerySchema,
  loginSchema, serviceSchema, weddingSchema,
} from '../schemas.js';

export const adminRouter = Router();

/* ---------- login (public, strictly rate limited) ---------- */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in a few minutes.' },
});

adminRouter.post('/login', loginLimiter, wrap(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const client = anonClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) throw new HttpError(401, 'Invalid email or password');

  const row = check(await db.from('admin_users').select('user_id').eq('user_id', data.user.id).maybeSingle());
  if (!row) throw new HttpError(403, 'This account is not an administrator');

  res.json({
    accessToken: data.session.access_token,
    expiresAt: data.session.expires_at,
    email: data.user.email,
  });
}));

/* Everything below requires an authenticated administrator. */
adminRouter.use(requireAdmin);

adminRouter.get('/me', (_req, res) => res.json({ ok: true }));

adminRouter.get('/stats', wrap(async (_req, res) => {
  const count = async (table: string, filter?: (q: any) => any) => {
    let q: any = db.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = filter(q);
    const { count: c, error } = await q;
    if (error) throw new HttpError(500, 'Database error');
    return c ?? 0;
  };
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const [total, fresh, inProgress, closed, last7, services, collections, weddings, gallery] = await Promise.all([
    count('enquiries'),
    count('enquiries', (q) => q.eq('status', 'new')),
    count('enquiries', (q) => q.eq('status', 'in_progress')),
    count('enquiries', (q) => q.eq('status', 'closed')),
    count('enquiries', (q) => q.gte('created_at', weekAgo)),
    count('services'), count('collections'), count('weddings'), count('gallery_images'),
  ]);
  res.json({ enquiries: { total, new: fresh, in_progress: inProgress, closed, last7 }, services, collections, weddings, gallery });
}));

/* ---------- enquiries ---------- */
adminRouter.get('/enquiries', wrap(async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  let q = db.from('enquiries').select('*').order('created_at', { ascending: false }).limit(500);
  if (['new', 'in_progress', 'closed'].includes(status)) q = q.eq('status', status);
  res.json(check(await q));
}));

adminRouter.patch('/enquiries/:id', wrap(async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const patch = enquiryUpdateSchema.parse(req.body);
  res.json(check(await db.from('enquiries').update(patch).eq('id', id).select().single()));
}));

adminRouter.delete('/enquiries/:id', wrap(async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  check(await db.from('enquiries').delete().eq('id', id));
  res.json({ ok: true });
}));

/* ---------- generic CRUD for content tables ---------- */
function crud(path: string, table: string, schema: ZodTypeAny, order: { column: string; ascending: boolean }) {
  adminRouter.get(`/${path}`, wrap(async (_req, res) => {
    res.json(check(await db.from(table).select('*').order(order.column, { ascending: order.ascending })));
  }));
  adminRouter.post(`/${path}`, wrap(async (req, res) => {
    const body = schema.parse(req.body);
    res.status(201).json(check(await db.from(table).insert(body).select().single()));
  }));
  adminRouter.put(`/${path}/:id`, wrap(async (req, res) => {
    const id = z.string().uuid().parse(req.params.id);
    const body = (schema as any).partial().parse(req.body);
    res.json(check(await db.from(table).update(body).eq('id', id).select().single()));
  }));
  adminRouter.delete(`/${path}/:id`, wrap(async (req, res) => {
    const id = z.string().uuid().parse(req.params.id);
    check(await db.from(table).delete().eq('id', id));
    res.json({ ok: true });
  }));
}
crud('services', 'services', serviceSchema, { column: 'sort_order', ascending: true });
crud('collections', 'collections', collectionSchema, { column: 'sort_order', ascending: true });
crud('weddings', 'weddings', weddingSchema, { column: 'sort_order', ascending: true });
crud('gallery', 'gallery_images', gallerySchema, { column: 'created_at', ascending: false });

/* ---------- site content ---------- */
adminRouter.get('/content', wrap(async (_req, res) => {
  const rows = check(await db.from('site_content').select('key,value'));
  const map = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]));
  res.json(Object.fromEntries(CONTENT_KEYS.map((k) => [k, map[k] ?? ''])));
}));

adminRouter.put('/content', wrap(async (req, res) => {
  const { key, value } = contentSchema.parse(req.body);
  check(await db.from('site_content').upsert({ key, value, updated_at: new Date().toISOString() }));
  res.json({ ok: true });
}));

/* ---------- safe image upload ---------- */
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

const SIGNATURES: Record<string, (b: Buffer) => boolean> = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP',
  'image/avif': (b) => b.subarray(4, 8).toString() === 'ftyp' && /avif|avis/.test(b.subarray(8, 16).toString()),
};
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };

adminRouter.post('/upload', upload.single('file'), wrap(async (req: Request, res) => {
  const file = req.file;
  if (!file) throw new HttpError(400, 'No file uploaded');
  const check_ = SIGNATURES[file.mimetype];
  // Verify the declared type AND the real file signature; never trust the client's filename.
  if (!check_ || !check_(file.buffer)) throw new HttpError(400, 'Only JPEG, PNG, WebP or AVIF images up to 5 MB are allowed');

  const objectPath = `uploads/${new Date().getFullYear()}/${randomUUID()}.${EXT[file.mimetype]}`;
  const { error } = await db.storage.from(env.SUPABASE_STORAGE_BUCKET).upload(objectPath, file.buffer, {
    contentType: file.mimetype,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) {
    console.error('Upload failed:', error.message);
    throw new HttpError(500, 'Upload failed');
  }
  const { data } = db.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(objectPath);
  res.status(201).json({ url: data.publicUrl, path: objectPath });
}));

// Multer errors (file too large etc.) → friendly 400
adminRouter.use((err: any, _req: any, res: any, next: any) => {
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Image is larger than 5 MB' });
  if (err instanceof multer.MulterError) return res.status(400).json({ error: 'Invalid upload' });
  next(err);
});

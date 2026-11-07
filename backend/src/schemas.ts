import { z } from 'zod';

export const EVENT_TYPES = ['Wedding', 'Engagement', 'Reception', 'Destination wedding', 'Other'] as const;

const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v);

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.string().trim().email('Please enter a valid email').max(200),
  phone: z.preprocess(emptyToNull, z.string().trim().max(40).regex(/^[0-9+()\-\s.]{6,40}$/, 'Invalid phone number').nullable().optional()),
  wedding_date: z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date').nullable().optional()),
  event_type: z.preprocess(emptyToNull, z.enum(EVENT_TYPES).nullable().optional()),
  location: z.preprocess(emptyToNull, z.string().trim().max(200).nullable().optional()),
  guest_count: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? null : Number(v)),
    z.number().int().min(1).max(5000).nullable().optional(),
  ),
  message: z.string().trim().min(10, 'Please tell us a little more').max(4000),
  // spam protection
  website: z.string().max(0).optional(), // honeypot: real users leave it empty
  startedAt: z.number().optional(), // ms timestamp when the form was shown
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

/* ---------- admin resources ---------- */
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes').max(120);
const req = (max: number) => z.string().trim().min(1).max(max);
const opt = (max: number) =>
  z.string().trim().max(max).nullable().optional().transform((v) => (v === undefined ? undefined : v || null));
const optUuid = z.preprocess(emptyToNull, z.string().uuid().nullable().optional());
const optDate = z.preprocess(emptyToNull, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional());
const imageUrl = opt(1000);
const base = { sort_order: z.coerce.number().int().min(-9999).max(9999).default(0), published: z.boolean().default(true) };

export const serviceSchema = z.object({
  slug, title: req(200), summary: opt(600), body: opt(20000), image_url: imageUrl, ...base,
});
export const collectionSchema = z.object({
  slug, title: req(200), description: opt(5000), cover_image_url: imageUrl, ...base,
});
export const weddingSchema = z.object({
  slug, title: req(200), collection_id: optUuid, location: opt(200), event_date: optDate,
  summary: opt(600), story: opt(30000), cover_image_url: imageUrl, featured: z.boolean().default(false), ...base,
});
export const gallerySchema = z.object({
  image_url: req(1000), alt: opt(300), aspect: z.enum(['portrait', 'landscape', 'square']).default('portrait'),
  wedding_id: optUuid, ...base,
});

export const enquiryUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'closed']).optional(),
  notes: opt(4000),
});

export const CONTENT_KEYS = [
  'hero_title', 'hero_intro', 'hero_image',
  'about_title', 'about_intro', 'about_body', 'about_image',
  'venues_intro', 'enquiry_cta_title', 'enquiry_cta_text',
  'contact_email', 'contact_phone', 'contact_address', 'instagram_url', 'footer_note',
] as const;
export const contentSchema = z.object({
  key: z.enum(CONTENT_KEYS),
  value: z.string().max(30000),
});

export const loginSchema = z.object({ email: z.string().trim().email().max(200), password: z.string().min(1).max(200) });

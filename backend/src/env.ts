import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load ../.env (repo root) first, then backend/.env if present.
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.string().default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  SUPABASE_STORAGE_BUCKET: z.string().default('media'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SITE_URL: z.string().url().default('http://localhost:5173'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;

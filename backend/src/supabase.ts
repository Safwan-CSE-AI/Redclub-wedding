import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const opts = { auth: { persistSession: false, autoRefreshToken: false } } as const;

/** Service-role client: bypasses RLS. Server only, never sent to the browser. */
export const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, opts);

/** Fresh anon client per sign-in so sessions never leak between requests. */
export const anonClient = () => createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, opts);

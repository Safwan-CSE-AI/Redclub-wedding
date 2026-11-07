import type { NextFunction, Request, Response } from 'express';
import { db } from './supabase.js';

/**
 * Authentication: the browser holds a Supabase access token (JWT).
 * Authorization: the user must also exist in public.admin_users.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired session' });

    const { data: row, error: adminErr } = await db
      .from('admin_users')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();
    if (adminErr) throw adminErr;
    if (!row) return res.status(403).json({ error: 'Not authorised' });

    res.locals.adminUserId = data.user.id;
    next();
  } catch (e) {
    console.error('Auth check failed:', e);
    res.status(500).json({ error: 'Authentication check failed' });
  }
}

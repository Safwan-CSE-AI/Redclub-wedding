export const fmtDate = (d?: string | null) =>
  d ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');

/** Split long text into paragraphs on blank lines. */
export const paragraphs = (s?: string | null) => (s ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

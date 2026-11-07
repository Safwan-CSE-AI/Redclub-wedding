import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import type { Enquiry } from '../lib/types';
import { fmtDate } from '../lib/format';

const STATUSES = ['new', 'in_progress', 'closed'] as const;

export default function Enquiries() {
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminApi<Enquiry[]>(`/enquiries${filter ? `?status=${filter}` : ''}`)
      .then((r) => { setRows(r); setErr(''); })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [filter]);
  useEffect(load, [load]);

  const patch = async (id: string, body: Partial<Enquiry>) => {
    try {
      const updated = await adminApi<Enquiry>(`/enquiries/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setRows((r) => r.map((x) => (x.id === id ? updated : x)));
    } catch (e) { setErr((e as Error).message); }
  };
  const remove = async (id: string) => {
    if (!confirm('Delete this enquiry permanently?')) return;
    try { await adminApi(`/enquiries/${id}`, { method: 'DELETE' }); setRows((r) => r.filter((x) => x.id !== id)); }
    catch (e) { setErr((e as Error).message); }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Enquiries</h1>
        <label className="label">Status{' '}
          <select className="ml-2 border border-black bg-white px-2 py-1" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </label>
      </div>
      {err && <p role="alert" className="mt-4 text-red-700">{err}</p>}
      {loading ? <p className="label mt-8 text-neutral-500">Loading…</p> : rows.length === 0 ? <p className="label mt-8 text-neutral-500">No enquiries.</p> : (
        <ul className="mt-8 divide-y divide-neutral-300 border-y border-neutral-300">
          {rows.map((e) => (
            <li key={e.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button className="text-left" onClick={() => setOpen(open === e.id ? null : e.id)} aria-expanded={open === e.id}>
                  <span className="font-medium">{e.name}</span>
                  <span className="ml-3 text-xs text-neutral-500">{new Date(e.created_at).toLocaleString('en-GB')}</span>
                </button>
                <select aria-label={`Status for ${e.name}`} className="border border-black bg-white px-2 py-1 text-xs uppercase" value={e.status} onChange={(ev) => patch(e.id, { status: ev.target.value as Enquiry['status'] })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              {open === e.id && (
                <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                  <dl className="space-y-1">
                    <div><dt className="inline label text-neutral-500">Email </dt><dd className="inline"><a className="underline" href={`mailto:${e.email}`}>{e.email}</a></dd></div>
                    {e.phone && <div><dt className="inline label text-neutral-500">Phone </dt><dd className="inline">{e.phone}</dd></div>}
                    {e.wedding_date && <div><dt className="inline label text-neutral-500">Wedding date </dt><dd className="inline">{fmtDate(e.wedding_date)}</dd></div>}
                    {e.event_type && <div><dt className="inline label text-neutral-500">Event </dt><dd className="inline">{e.event_type}</dd></div>}
                    {e.location && <div><dt className="inline label text-neutral-500">Location </dt><dd className="inline">{e.location}</dd></div>}
                    {e.guest_count && <div><dt className="inline label text-neutral-500">Guests </dt><dd className="inline">{e.guest_count}</dd></div>}
                    <p className="whitespace-pre-wrap pt-3">{e.message}</p>
                  </dl>
                  <div>
                    <label className="label" htmlFor={`n-${e.id}`}>Internal notes</label>
                    <textarea id={`n-${e.id}`} rows={4} className="field resize-none border border-black p-2" defaultValue={e.notes ?? ''} onBlur={(ev) => ev.target.value !== (e.notes ?? '') && patch(e.id, { notes: ev.target.value })} />
                    <button className="link-u mt-4 text-red-700" onClick={() => remove(e.id)}>Delete enquiry</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

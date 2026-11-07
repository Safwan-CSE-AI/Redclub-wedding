import { useCallback, useEffect, useState } from 'react';
import { adminApi, ApiError } from '../lib/api';
import { slugify } from '../lib/format';
import ImageField from './ImageField';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'image' | 'select' | 'date';
  options?: { value: string; label: string }[];
  /** Load select options from another admin endpoint */
  relation?: { endpoint: string; labelKey: string; optional?: boolean };
}
type Row = Record<string, any> & { id: string };

interface Props {
  title: string;
  endpoint: string;
  fields: FieldDef[];
  /** column used for the list label */
  titleKey: string;
  /** auto-fill slug from this field */
  slugFrom?: string;
  defaults?: Record<string, any>;
}

export default function ResourceManager({ title, endpoint, fields, titleKey, slugFrom, defaults = {} }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | 'new' | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [relations, setRelations] = useState<Record<string, { value: string; label: string }[]>>({});
  const [err, setErr] = useState('');
  const [fieldErrs, setFieldErrs] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    adminApi<Row[]>(`/${endpoint}`).then(setRows).catch((e) => setErr(e.message));
  }, [endpoint]);
  useEffect(load, [load]);

  useEffect(() => {
    fields.filter((f) => f.relation).forEach((f) => {
      adminApi<Row[]>(`/${f.relation!.endpoint}`)
        .then((r) => setRelations((x) => ({ ...x, [f.name]: r.map((o) => ({ value: o.id, label: o[f.relation!.labelKey] })) })))
        .catch(() => undefined);
    });
  }, [fields]);

  const startNew = () => {
    setForm({ published: true, sort_order: 0, ...defaults });
    setFieldErrs({}); setErr(''); setEditing('new');
  };
  const startEdit = (r: Row) => { setForm({ ...r }); setFieldErrs({}); setErr(''); setEditing(r); };
  const set = (name: string, value: any) => setForm((f) => {
    const next = { ...f, [name]: value };
    if (slugFrom && name === slugFrom && (editing === 'new' || !f.slug)) next.slug = slugify(String(value));
    return next;
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(''); setFieldErrs({});
    const payload: Record<string, any> = {};
    [...fields.map((f) => f.name), 'published', 'sort_order'].forEach((k) => {
      if (k in form || k === 'published' || k === 'sort_order') payload[k] = form[k];
    });
    if (slugFrom) payload.slug = form.slug;
    payload.sort_order = Number(payload.sort_order || 0);
    payload.published = !!payload.published;
    fields.forEach((f) => {
      if (f.type === 'checkbox') payload[f.name] = !!form[f.name];
      if (f.type === 'number') payload[f.name] = form[f.name] === '' || form[f.name] == null ? null : Number(form[f.name]);
      if (f.type === 'select' && payload[f.name] === '') payload[f.name] = null;
    });
    try {
      if (editing === 'new') await adminApi(`/${endpoint}`, { method: 'POST', body: JSON.stringify(payload) });
      else await adminApi(`/${endpoint}/${(editing as Row).id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setEditing(null);
      load();
    } catch (e2) {
      if (e2 instanceof ApiError) { setErr(e2.message); setFieldErrs(e2.fields ?? {}); } else setErr('Save failed');
    } finally { setSaving(false); }
  };

  const remove = async (r: Row) => {
    if (!confirm(`Delete "${r[titleKey] ?? 'this item'}" permanently?`)) return;
    try { await adminApi(`/${endpoint}/${r.id}`, { method: 'DELETE' }); load(); } catch (e) { setErr((e as Error).message); }
  };

  const togglePublished = async (r: Row) => {
    try { await adminApi(`/${endpoint}/${r.id}`, { method: 'PUT', body: JSON.stringify({ published: !r.published }) }); load(); }
    catch (e) { setErr((e as Error).message); }
  };

  if (editing) {
    return (
      <form onSubmit={save} className="max-w-2xl space-y-6" aria-label={`Edit ${title}`}>
        <h1 className="font-serif text-4xl">{editing === 'new' ? `New ${title}` : `Edit ${title}`}</h1>
        {fields.map((f) => (
          <div key={f.name}>
            {f.type === 'image' ? (
              <ImageField label={f.label} value={form[f.name] ?? ''} onChange={(v) => set(f.name, v)} />
            ) : f.type === 'checkbox' ? (
              <label className="label flex items-center gap-3"><input type="checkbox" checked={!!form[f.name]} onChange={(e) => set(f.name, e.target.checked)} />{f.label}</label>
            ) : (
              <>
                <label className="label" htmlFor={`f-${f.name}`}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea id={`f-${f.name}`} rows={6} className="field border border-black p-2" value={form[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)} />
                ) : f.type === 'select' ? (
                  <select id={`f-${f.name}`} className="field" value={form[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)}>
                    {(f.relation?.optional || f.options) && <option value="">— none —</option>}
                    {(f.options ?? relations[f.name] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input id={`f-${f.name}`} type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} className="field" value={form[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)} />
                )}
              </>
            )}
            {fieldErrs[f.name] && <p role="alert" className="mt-1 text-xs text-red-700">{fieldErrs[f.name].join(', ')}</p>}
          </div>
        ))}
        {slugFrom && (
          <div>
            <label className="label" htmlFor="f-slug">URL slug</label>
            <input id="f-slug" className="field" value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} />
            {fieldErrs.slug && <p role="alert" className="mt-1 text-xs text-red-700">{fieldErrs.slug.join(', ')}</p>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="label" htmlFor="f-sort">Sort order</label>
            <input id="f-sort" type="number" className="field" value={form.sort_order ?? 0} onChange={(e) => set('sort_order', e.target.value)} />
          </div>
          <label className="label flex items-end gap-3 pb-3"><input type="checkbox" checked={!!form.published} onChange={(e) => set('published', e.target.checked)} />Published</label>
        </div>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <div className="flex gap-4">
          <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" className="link-u self-center" onClick={() => setEditing(null)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">{title}s</h1>
        <button className="btn" onClick={startNew}>Add new</button>
      </div>
      {err && <p role="alert" className="mt-4 text-red-700">{err}</p>}
      {rows.length === 0 ? <p className="label mt-8 text-neutral-500">Nothing here yet.</p> : (
        <ul className="mt-8 divide-y divide-neutral-300 border-y border-neutral-300">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-4 py-3">
              {(r.image_url || r.cover_image_url) && <img src={r.image_url || r.cover_image_url} alt="" className="h-14 w-11 object-cover" loading="lazy" />}
              <span className="min-w-0 flex-1 truncate">{r[titleKey] || r.alt || r.image_url}</span>
              <button className="label" onClick={() => togglePublished(r)} aria-label={r.published ? 'Unpublish' : 'Publish'}>{r.published ? 'Published' : 'Draft'}</button>
              <button className="link-u" onClick={() => startEdit(r)}>Edit</button>
              <button className="link-u text-red-700" onClick={() => remove(r)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

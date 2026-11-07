import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import ImageField from './ImageField';

const FIELDS: { key: string; label: string; type: 'text' | 'textarea' | 'image' }[] = [
  { key: 'hero_title', label: 'Homepage headline', type: 'text' },
  { key: 'hero_intro', label: 'Homepage intro text', type: 'textarea' },
  { key: 'hero_image', label: 'Homepage hero image', type: 'image' },
  { key: 'about_title', label: 'About title', type: 'text' },
  { key: 'about_intro', label: 'About introduction', type: 'textarea' },
  { key: 'about_body', label: 'About body (blank line = new paragraph)', type: 'textarea' },
  { key: 'about_image', label: 'About image', type: 'image' },
  { key: 'venues_intro', label: 'Venues page text', type: 'textarea' },
  { key: 'enquiry_cta_title', label: 'Enquiry section title', type: 'text' },
  { key: 'enquiry_cta_text', label: 'Enquiry section text', type: 'textarea' },
  { key: 'contact_email', label: 'Contact email', type: 'text' },
  { key: 'contact_phone', label: 'Contact phone', type: 'text' },
  { key: 'contact_address', label: 'Contact address', type: 'textarea' },
  { key: 'instagram_url', label: 'Instagram URL', type: 'text' },
  { key: 'footer_note', label: 'Footer note', type: 'text' },
];

export default function ContentAdmin() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { adminApi<Record<string, string>>('/content').then((c) => { setValues(c); setSaved(c); }).catch((e) => setErr(e.message)); }, []);

  const saveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(''); setErr('');
    try {
      for (const f of FIELDS) {
        if ((values[f.key] ?? '') !== (saved[f.key] ?? '')) {
          await adminApi('/content', { method: 'PUT', body: JSON.stringify({ key: f.key, value: values[f.key] ?? '' }) });
        }
      }
      setSaved(values);
      setMsg('Saved.');
    } catch (e2) { setErr((e2 as Error).message); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={saveAll} className="max-w-2xl space-y-6" aria-label="Site content">
      <h1 className="font-serif text-4xl">Website content</h1>
      {FIELDS.map((f) => f.type === 'image' ? (
        <ImageField key={f.key} label={f.label} value={values[f.key] ?? ''} onChange={(v) => setValues((x) => ({ ...x, [f.key]: v }))} />
      ) : (
        <div key={f.key}>
          <label className="label" htmlFor={f.key}>{f.label}</label>
          {f.type === 'textarea'
            ? <textarea id={f.key} rows={4} className="field border border-black p-2" value={values[f.key] ?? ''} onChange={(e) => setValues((x) => ({ ...x, [f.key]: e.target.value }))} />
            : <input id={f.key} className="field" value={values[f.key] ?? ''} onChange={(e) => setValues((x) => ({ ...x, [f.key]: e.target.value }))} />}
        </div>
      ))}
      {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}

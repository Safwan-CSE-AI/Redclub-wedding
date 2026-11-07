import { useRef, useState } from 'react';
import { adminApi, ApiError } from '../lib/api';

export default function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async (file?: File) => {
    if (!file) return;
    setErr('');
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return setErr('Use a JPEG, PNG, WebP or AVIF image');
    if (file.size > 5 * 1024 * 1024) return setErr('Image must be under 5 MB');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await adminApi<{ url: string }>('/upload', { method: 'POST', body: fd });
      onChange(r.url);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div className="mt-2 flex items-start gap-4">
        {value ? <img src={value} alt="" className="h-24 w-20 border border-neutral-300 object-cover" /> : <div className="flex h-24 w-20 items-center justify-center border border-dashed border-neutral-400 text-[10px] text-neutral-500">None</div>}
        <div className="space-y-2">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => pick(e.target.files?.[0])} aria-label={`Upload ${label}`} />
          <button type="button" className="link-u" onClick={() => input.current?.click()} disabled={busy}>{busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}</button>
          {value && <div><button type="button" className="link-u text-red-700" onClick={() => onChange('')}>Remove</button></div>}
          {err && <p role="alert" className="text-xs text-red-700">{err}</p>}
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { Content } from '../lib/types';
import { NAV } from './nav';

export default function Footer() {
  const { data: c } = useApi<Content>('/content');
  return (
    <footer className="border-t border-black px-5 py-12 md:px-10">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl uppercase tracking-[0.3em]">Red Club Wedding</p>
          {c?.footer_note && <p className="mt-4 max-w-xs text-sm text-neutral-600">{c.footer_note}</p>}
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-y-2">
            {NAV.map((n) => (
              <li key={n.to}><Link to={n.to} className="label hover:opacity-50">{n.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="space-y-2 text-sm">
          {c?.contact_email && <p><a className="link-u" href={`mailto:${c.contact_email}`}>{c.contact_email}</a></p>}
          {c?.contact_phone && <p><a className="link-u" href={`tel:${c.contact_phone.replace(/\s/g, '')}`}>{c.contact_phone}</a></p>}
          {c?.instagram_url && <p><a className="link-u" href={c.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</a></p>}
          <p><Link to="/contact" className="link-u">Enquire</Link></p>
        </div>
      </div>
      <p className="label mt-12 text-neutral-500">© {new Date().getFullYear()} Red Club Wedding</p>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { Content, Wedding } from '../lib/types';
import Seo from '../components/Seo';
import { paragraphs } from '../lib/format';

/**
 * Venues are not a separate database entity because the real venue list is not yet verified.
 * This page shows editor-written text (admin → Content → venues_intro) and the locations of published weddings.
 */
export default function Venues() {
  const { data: c } = useApi<Content>('/content');
  const { data: weddings } = useApi<Wedding[]>('/weddings');

  const byLocation = new Map<string, Wedding[]>();
  (weddings ?? []).forEach((w) => {
    const loc = w.location?.trim();
    if (loc) byLocation.set(loc, [...(byLocation.get(loc) ?? []), w]);
  });

  return (
    <main className="page-pad pb-24 pt-32 md:pt-40">
      <Seo title="Venues" description="Venues and locations of Red Club Wedding projects." />
      <h1 className="mb-8 font-serif text-5xl md:text-7xl">Venues</h1>
      <div className="max-w-2xl space-y-5 text-sm leading-relaxed text-neutral-700">
        {paragraphs(c?.venues_intro).map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <ul className="mt-16 border-t border-black">
        {[...byLocation.entries()].map(([loc, list]) => (
          <li key={loc} className="grid gap-3 border-b border-neutral-300 py-6 md:grid-cols-12">
            <h2 className="font-serif text-2xl md:col-span-5 md:text-3xl">{loc}</h2>
            <ul className="md:col-span-7">
              {list.map((w) => (
                <li key={w.id}><Link to={`/weddings/${w.slug}`} className="link-u my-1">{w.title}</Link></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {byLocation.size === 0 && <p className="label mt-12 text-neutral-500">Venues will appear here as wedding projects are added.</p>}
    </main>
  );
}

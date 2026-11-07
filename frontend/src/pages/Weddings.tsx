import { Link } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { Wedding } from '../lib/types';
import Media from '../components/Media';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { Empty, ErrorMsg, Loading } from '../components/State';

export function WeddingGrid({ weddings }: { weddings: Wedding[] }) {
  return (
    <div className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {weddings.map((w, i) => (
        <Reveal key={w.id} delay={(i % 3) * 0.08} className={i % 3 === 1 ? 'lg:mt-16' : ''}>
          <Link to={`/weddings/${w.slug}`} className="group block">
            <Media src={w.cover_image_url} alt={w.title} ratio={i % 3 === 1 ? 'aspect-[3/4]' : 'aspect-[4/5]'} />
            <p className="label mt-3 group-hover:opacity-60">{w.title}</p>
            {w.location && <p className="mt-1 text-xs text-neutral-500">{w.location}</p>}
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

export default function Weddings() {
  const { data, error, loading } = useApi<Wedding[]>('/weddings');
  return (
    <main className="page-pad pb-24 pt-32 md:pt-40">
      <Seo title="Weddings" description="Wedding projects by Red Club Wedding." />
      <h1 className="mb-12 font-serif text-5xl md:text-7xl">Weddings</h1>
      {loading ? <Loading /> : error ? <ErrorMsg message={error} /> : data && data.length ? <WeddingGrid weddings={data} /> : <Empty>Wedding projects will appear here.</Empty>}
    </main>
  );
}

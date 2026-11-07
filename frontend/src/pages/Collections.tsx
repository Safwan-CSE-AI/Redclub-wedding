import { Link } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { Collection } from '../lib/types';
import Media from '../components/Media';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { Empty, ErrorMsg, Loading } from '../components/State';

export default function Collections() {
  const { data, error, loading } = useApi<Collection[]>('/collections');
  return (
    <main className="page-pad pb-24 pt-32 md:pt-40">
      <Seo title="Collections" description="Wedding collections by Red Club Wedding." />
      <h1 className="mb-12 font-serif text-5xl md:text-7xl">Collections</h1>
      {loading ? <Loading /> : error ? <ErrorMsg message={error} /> : !data?.length ? <Empty>Collections will appear here.</Empty> : (
        <div className="space-y-16 md:space-y-28">
          {data.map((c, i) => (
            <Reveal key={c.id}>
              <Link to={`/collections/${c.slug}`} className="group grid items-end gap-6 md:grid-cols-12">
                <div className={i % 2 ? 'md:order-2 md:col-span-8' : 'md:col-span-8'}>
                  <Media src={c.cover_image_url} alt={c.title} ratio="aspect-[4/5] md:aspect-[16/10]" />
                </div>
                <div className="md:col-span-4">
                  <h2 className="font-serif text-3xl md:text-5xl">{c.title}</h2>
                  {c.description && <p className="mt-3 max-w-sm text-sm text-neutral-600">{c.description.slice(0, 200)}</p>}
                  <span className="link-u mt-5">Discover more</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}

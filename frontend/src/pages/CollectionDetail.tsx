import { Link, useParams } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { Collection, Wedding } from '../lib/types';
import { paragraphs } from '../lib/format';
import Media from '../components/Media';
import Seo from '../components/Seo';
import { Empty, ErrorMsg, Loading } from '../components/State';
import { WeddingGrid } from './Weddings';

export default function CollectionDetail() {
  const { slug } = useParams();
  const { data, error, loading } = useApi<{ collection: Collection; weddings: Wedding[] }>(`/collections/${slug}`);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorMsg message={error === 'Not found' ? 'This collection could not be found.' : error ?? 'Unknown error'} />;
  const { collection: c, weddings } = data;
  return (
    <main>
      <Seo title={c.title} description={c.description?.slice(0, 160) ?? undefined} />
      <section className="on-dark relative flex h-[80svh] min-h-[480px] items-end text-white">
        <div className="absolute inset-0">
          <Media src={c.cover_image_url} alt={c.title} ratio="h-full w-full" eager dark />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <h1 className="page-pad relative z-10 pb-12 font-serif text-5xl md:text-8xl">{c.title}</h1>
      </section>
      {c.description && (
        <section className="page-pad mx-auto max-w-3xl space-y-5 py-16 text-sm leading-relaxed text-neutral-700 md:py-24">
          {paragraphs(c.description).map((p, i) => <p key={i}>{p}</p>)}
        </section>
      )}
      <section className="page-pad pb-24">
        <h2 className="label mb-8">Weddings in this collection</h2>
        {weddings.length ? <WeddingGrid weddings={weddings} /> : <Empty>No weddings in this collection yet.</Empty>}
        <p className="mt-12"><Link to="/collections" className="link-u">← All collections</Link></p>
      </section>
    </main>
  );
}

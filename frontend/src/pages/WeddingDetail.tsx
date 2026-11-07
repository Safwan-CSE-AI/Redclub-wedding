import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { GalleryImage, Wedding } from '../lib/types';
import { fmtDate, paragraphs } from '../lib/format';
import Media from '../components/Media';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import Lightbox from '../components/Lightbox';
import { ErrorMsg, Loading } from '../components/State';
import { WeddingGrid } from './Weddings';

export default function WeddingDetail() {
  const { slug } = useParams();
  const { data, error, loading } = useApi<{ wedding: Wedding; images: GalleryImage[]; related: Wedding[] }>(`/weddings/${slug}`);
  const [lb, setLb] = useState<number | null>(null);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorMsg message={error === 'Not found' ? 'This wedding could not be found.' : error ?? 'Unknown error'} />;
  const { wedding: w, images, related } = data;
  const details = [
    w.location && ['Location', w.location],
    w.event_date && ['Date', fmtDate(w.event_date)],
  ].filter(Boolean) as [string, string][];

  return (
    <main>
      <Seo title={w.title} description={w.summary ?? undefined} />
      <section className="on-dark relative flex h-[90svh] min-h-[520px] items-end text-white">
        <div className="absolute inset-0">
          <Media src={w.cover_image_url} alt={w.title} ratio="h-full w-full" eager dark />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <h1 className="page-pad relative z-10 pb-12 font-serif text-5xl md:text-8xl">{w.title}</h1>
      </section>

      <section className="page-pad grid gap-10 py-16 md:grid-cols-12 md:py-24">
        <dl className="md:col-span-3">
          {details.map(([k, v]) => (
            <div key={k} className="mb-4">
              <dt className="label text-neutral-500">{k}</dt>
              <dd className="mt-1 text-sm">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="md:col-span-7 md:col-start-5">
          {w.summary && <p className="font-serif text-2xl leading-snug md:text-3xl">{w.summary}</p>}
          <div className="mt-8 space-y-5 text-sm leading-relaxed text-neutral-700">
            {paragraphs(w.story).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {images.length > 0 && (
        <section className="page-pad space-y-2 pb-16 md:pb-24" aria-label="Photographs">
          {images.map((img, i) => (
            <Reveal key={img.id}>
              <button onClick={() => setLb(i)} aria-label={`Open image ${i + 1}`} className="block w-full">
                <Media src={img.image_url} alt={img.alt} ratio={img.aspect === 'landscape' ? 'aspect-[16/9]' : img.aspect === 'square' ? 'aspect-square' : 'aspect-[3/4] md:aspect-[4/5]'} />
              </button>
            </Reveal>
          ))}
          <Lightbox images={images} index={lb} onClose={() => setLb(null)} onChange={setLb} />
        </section>
      )}

      {related.length > 0 && (
        <section className="page-pad border-t border-black py-16 md:py-24">
          <h2 className="label mb-8">Related weddings</h2>
          <WeddingGrid weddings={related} />
        </section>
      )}
      <div className="page-pad pb-24"><Link to="/weddings" className="link-u">← All weddings</Link></div>
    </main>
  );
}

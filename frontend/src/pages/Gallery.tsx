import { useState } from 'react';
import { useApi } from '../lib/api';
import type { GalleryImage } from '../lib/types';
import Media from '../components/Media';
import Seo from '../components/Seo';
import Lightbox from '../components/Lightbox';
import { Empty, ErrorMsg, Loading } from '../components/State';

const RATIO = { portrait: 'aspect-[3/4]', landscape: 'aspect-[4/3]', square: 'aspect-square' } as const;

export default function Gallery() {
  const { data, error, loading } = useApi<GalleryImage[]>('/gallery');
  const [lb, setLb] = useState<number | null>(null);
  return (
    <main className="page-pad pb-24 pt-32 md:pt-40">
      <Seo title="Gallery" description="Wedding photography by Red Club Wedding." />
      <h1 className="mb-12 font-serif text-5xl md:text-7xl">Gallery</h1>
      {loading ? <Loading /> : error ? <ErrorMsg message={error} /> : !data?.length ? <Empty>Photographs will appear here.</Empty> : (
        <>
          {/* CSS columns give a masonry-style grid with mixed proportions */}
          <div className="columns-2 gap-2 md:columns-3 lg:columns-4 [&>*]:mb-2">
            {data.map((g, i) => (
              <button key={g.id} onClick={() => setLb(i)} aria-label={`Open image ${i + 1}`} className="block w-full break-inside-avoid text-left">
                <Media src={g.image_url} alt={g.alt} ratio={RATIO[g.aspect]} />
              </button>
            ))}
          </div>
          <Lightbox images={data} index={lb} onClose={() => setLb(null)} onChange={setLb} />
        </>
      )}
    </main>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { Collection, Content, GalleryImage, Service, Wedding } from '../lib/types';
import Media from '../components/Media';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import Lightbox from '../components/Lightbox';

export default function Home() {
  const { data: c } = useApi<Content>('/content');
  const { data: collections } = useApi<Collection[]>('/collections');
  const { data: weddings } = useApi<Wedding[]>('/weddings');
  const { data: services } = useApi<Service[]>('/services');
  const { data: gallery } = useApi<GalleryImage[]>('/gallery');
  const [lb, setLb] = useState<number | null>(null);

  const featured = (weddings ?? []).filter((w) => w.featured);
  const featuredList = (featured.length ? featured : weddings ?? []).slice(0, 4);
  const preview = (gallery ?? []).slice(0, 6);

  return (
    <>
      <Seo description={c?.hero_intro || undefined} />

      {/* A. Hero */}
      <section className="on-dark relative flex h-[100svh] min-h-[560px] items-end text-white">
        <div className="absolute inset-0">
          <Media src={c?.hero_image} alt="" ratio="h-full w-full" eager dark />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
        </div>
        <div className="page-pad relative z-10 w-full pb-12 md:pb-16">
          <h1 className="max-w-3xl font-serif text-5xl leading-[1.02] md:text-8xl">{c?.hero_title || 'Red Club Wedding'}</h1>
          {c?.hero_intro && <p className="mt-5 max-w-md text-sm leading-relaxed text-white/85">{c.hero_intro}</p>}
          <Link to="/collections" className="btn-light mt-8">Discover</Link>
        </div>
      </section>

      {/* B. Editorial campaign sections (collections, alternating) */}
      {(collections ?? []).map((col, i) => (
        <section key={col.id} className="page-pad py-16 md:py-28">
          <div className={`grid items-end gap-8 md:grid-cols-12 ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
            <Reveal className={i % 2 ? 'md:col-span-7' : 'md:col-span-8'}>
              <Link to={`/collections/${col.slug}`} aria-label={col.title} className="block">
                <Media src={col.cover_image_url} alt={col.title} ratio="aspect-[4/5] md:aspect-[16/11]" />
              </Link>
            </Reveal>
            <Reveal className={`${i % 2 ? 'md:col-span-5 md:pr-10' : 'md:col-span-4 md:pl-6'}`} delay={0.1}>
              <p className="label text-neutral-500">Collection {String(i + 1).padStart(2, '0')}</p>
              <h2 className="mt-3 font-serif text-3xl md:text-5xl">{col.title}</h2>
              {col.description && <p className="mt-4 max-w-sm text-sm text-neutral-600">{col.description.slice(0, 220)}</p>}
              <Link to={`/collections/${col.slug}`} className="link-u mt-6">Discover more</Link>
            </Reveal>
          </div>
        </section>
      ))}

      {/* C. Featured weddings */}
      {featuredList.length > 0 && (
        <section className="page-pad py-16 md:py-24">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="label">Featured weddings</h2>
            <Link to="/weddings" className="link-u">View all</Link>
          </div>
          <div className="grid gap-x-4 gap-y-10 md:grid-cols-12">
            {featuredList.map((w, i) => (
              <Reveal key={w.id} className={['md:col-span-7', 'md:col-span-5 md:mt-24', 'md:col-span-5', 'md:col-span-7 md:mt-24'][i % 4]}>
                <Link to={`/weddings/${w.slug}`} className="group block">
                  <Media src={w.cover_image_url} alt={w.title} ratio={i % 4 === 0 || i % 4 === 3 ? 'aspect-[4/3]' : 'aspect-[3/4]'} />
                  <p className="label mt-3 group-hover:opacity-60">{w.title}</p>
                  {w.location && <p className="mt-1 text-xs text-neutral-500">{w.location}</p>}
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* D. Services */}
      {(services ?? []).length > 0 && (
        <section className="border-t border-black page-pad py-16 md:py-24">
          <h2 className="label mb-8">Services</h2>
          <ul className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {services!.map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 0.08}>
                <li>
                  <Link to={`/services/${s.slug}`} className="group block">
                    <Media src={s.image_url} alt={s.title} ratio="aspect-[4/5]" />
                    <h3 className="mt-4 font-serif text-2xl">{s.title}</h3>
                    {s.summary && <p className="mt-2 text-sm text-neutral-600">{s.summary}</p>}
                    <span className="link-u mt-4">Discover more</span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* E. Brand introduction */}
      <section className="page-pad py-24 md:py-40">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="label text-neutral-500">{c?.about_title || 'About'}</p>
          <p className="mt-6 font-serif text-2xl leading-snug md:text-4xl">{c?.about_intro || 'Red Club Wedding.'}</p>
          <Link to="/about" className="link-u mt-8">Discover more</Link>
        </Reveal>
      </section>

      {/* F. Gallery preview */}
      {preview.length > 0 && (
        <section className="page-pad pb-16 md:pb-24">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="label">Gallery</h2>
            <Link to="/gallery" className="link-u">View all gallery</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {preview.map((g, i) => (
              <button key={g.id} onClick={() => setLb(i)} aria-label={`Open image ${i + 1}`} className="block text-left">
                <Media src={g.image_url} alt={g.alt} ratio={i % 3 === 1 ? 'aspect-[3/4]' : 'aspect-square'} />
              </button>
            ))}
          </div>
          <Lightbox images={preview} index={lb} onClose={() => setLb(null)} onChange={setLb} />
        </section>
      )}

      {/* G. Enquiry */}
      <section className="on-dark bg-black px-5 py-24 text-center text-white md:px-10 md:py-40">
        <Reveal>
          <h2 className="font-serif text-4xl md:text-7xl">{c?.enquiry_cta_title || 'Enquire'}</h2>
          {c?.enquiry_cta_text && <p className="mx-auto mt-5 max-w-md text-sm text-white/80">{c.enquiry_cta_text}</p>}
          <Link to="/contact" className="btn-light mt-10">Start an enquiry</Link>
        </Reveal>
      </section>
    </>
  );
}

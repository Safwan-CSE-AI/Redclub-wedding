import { Link } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { Service } from '../lib/types';
import Media from '../components/Media';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { Empty, ErrorMsg, Loading } from '../components/State';

export default function Services() {
  const { data, error, loading } = useApi<Service[]>('/services');
  return (
    <main className="page-pad pb-24 pt-32 md:pt-40">
      <Seo title="Services" description="Wedding services by Red Club Wedding." />
      <h1 className="mb-12 font-serif text-5xl md:text-7xl">Services</h1>
      {loading ? <Loading /> : error ? <ErrorMsg message={error} /> : !data?.length ? <Empty>Services will appear here.</Empty> : (
        <ul className="space-y-16 md:space-y-24">
          {data.map((s, i) => (
            <Reveal key={s.id}>
              <li>
                <Link to={`/services/${s.slug}`} className="group grid items-center gap-6 md:grid-cols-12">
                  <div className={`md:col-span-7 ${i % 2 ? 'md:order-2' : ''}`}>
                    <Media src={s.image_url} alt={s.title} ratio="aspect-[4/3]" />
                  </div>
                  <div className={`md:col-span-5 ${i % 2 ? 'md:pr-10' : 'md:pl-10'}`}>
                    <h2 className="font-serif text-3xl md:text-5xl">{s.title}</h2>
                    {s.summary && <p className="mt-4 text-sm text-neutral-600">{s.summary}</p>}
                    <span className="link-u mt-6">Discover more</span>
                  </div>
                </Link>
              </li>
            </Reveal>
          ))}
        </ul>
      )}
    </main>
  );
}

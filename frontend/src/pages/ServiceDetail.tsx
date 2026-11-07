import { Link, useParams } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { Service } from '../lib/types';
import { paragraphs } from '../lib/format';
import Media from '../components/Media';
import Seo from '../components/Seo';
import { ErrorMsg, Loading } from '../components/State';

export default function ServiceDetail() {
  const { slug } = useParams();
  const { data: s, error, loading } = useApi<Service>(`/services/${slug}`);
  if (loading) return <Loading />;
  if (error || !s) return <ErrorMsg message={error === 'Not found' ? 'This service could not be found.' : error ?? 'Unknown error'} />;
  return (
    <main className="page-pad pb-24 pt-32 md:pt-40">
      <Seo title={s.title} description={s.summary ?? undefined} />
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <h1 className="font-serif text-5xl md:text-7xl">{s.title}</h1>
          {s.summary && <p className="mt-6 text-lg text-neutral-700">{s.summary}</p>}
          <div className="mt-8 space-y-5 text-sm leading-relaxed text-neutral-700">
            {paragraphs(s.body).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <Link to="/contact" className="btn mt-10">Enquire</Link>
        </div>
        <div className="md:col-span-7"><Media src={s.image_url} alt={s.title} ratio="aspect-[4/5]" eager /></div>
      </div>
      <p className="mt-16"><Link to="/services" className="link-u">← All services</Link></p>
    </main>
  );
}

import { Link } from 'react-router-dom';
import { useApi } from '../lib/api';
import type { Content } from '../lib/types';
import { paragraphs } from '../lib/format';
import Media from '../components/Media';
import Seo from '../components/Seo';

export default function About() {
  const { data: c } = useApi<Content>('/content');
  return (
    <main className="page-pad pb-24 pt-32 md:pt-40">
      <Seo title="About" description={c?.about_intro || undefined} />
      <h1 className="mb-12 font-serif text-5xl md:text-7xl">{c?.about_title || 'About'}</h1>
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          {c?.about_intro && <p className="font-serif text-2xl leading-snug md:text-3xl">{c.about_intro}</p>}
          <div className="mt-8 space-y-5 text-sm leading-relaxed text-neutral-700">
            {paragraphs(c?.about_body).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <Link to="/contact" className="btn mt-10">Enquire</Link>
        </div>
        <div className="md:col-span-7"><Media src={c?.about_image} alt="" ratio="aspect-[4/5]" eager /></div>
      </div>
    </main>
  );
}

import { useApi } from '../lib/api';
import type { Content } from '../lib/types';
import EnquiryForm from '../components/EnquiryForm';
import Seo from '../components/Seo';

export default function Contact() {
  const { data: c } = useApi<Content>('/content');
  return (
    <main className="page-pad pb-24 pt-32 md:pt-40">
      <Seo title="Contact & Enquiries" description="Contact Red Club Wedding or send an enquiry about your wedding." />
      <h1 className="mb-12 font-serif text-5xl md:text-7xl">Enquire</h1>
      <div className="grid gap-12 md:grid-cols-12">
        <aside className="space-y-3 text-sm md:col-span-4">
          {c?.enquiry_cta_text && <p className="mb-6 text-neutral-600">{c.enquiry_cta_text}</p>}
          {c?.contact_email && <p><a className="link-u" href={`mailto:${c.contact_email}`}>{c.contact_email}</a></p>}
          {c?.contact_phone && <p><a className="link-u" href={`tel:${c.contact_phone.replace(/\s/g, '')}`}>{c.contact_phone}</a></p>}
          {c?.contact_address && <p className="whitespace-pre-line text-neutral-600">{c.contact_address}</p>}
        </aside>
        <div className="md:col-span-8"><EnquiryForm /></div>
      </div>
    </main>
  );
}

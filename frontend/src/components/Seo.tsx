import { useEffect } from 'react';

const SITE = 'Red Club Wedding';

export default function Seo({ title, description, noindex = false }: { title?: string; description?: string; noindex?: boolean }) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE}` : SITE;
    const set = (selector: string, create: () => HTMLMetaElement, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(selector);
      if (!el) { el = create(); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    const mk = (attr: 'name' | 'property', val: string) => () => {
      const m = document.createElement('meta');
      m.setAttribute(attr, val);
      return m;
    };
    const desc = description ?? 'Red Club Wedding — wedding collections, projects, photography and services.';
    set('meta[name="description"]', mk('name', 'description'), desc);
    set('meta[property="og:title"]', mk('property', 'og:title'), document.title);
    set('meta[property="og:description"]', mk('property', 'og:description'), desc);
    set('meta[name="robots"]', mk('name', 'robots'), noindex ? 'noindex,nofollow' : 'index,follow');
  }, [title, description, noindex]);
  return null;
}

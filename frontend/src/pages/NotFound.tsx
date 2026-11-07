import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <main className="page-pad flex min-h-[80vh] flex-col justify-center">
      <Seo title="Page not found" noindex />
      <p className="label text-neutral-500">404</p>
      <h1 className="mt-4 font-serif text-5xl md:text-7xl">Page not found</h1>
      <Link to="/" className="link-u mt-8">Return home</Link>
    </main>
  );
}

import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { adminToken } from '../lib/api';
import Seo from '../components/Seo';

const LINKS = [
  ['/admin', 'Dashboard', true],
  ['/admin/enquiries', 'Enquiries', false],
  ['/admin/services', 'Services', false],
  ['/admin/collections', 'Collections', false],
  ['/admin/weddings', 'Weddings', false],
  ['/admin/gallery', 'Gallery', false],
  ['/admin/content', 'Content', false],
] as const;

/** Route guard + shell. The server re-checks the token on every request; this only avoids showing UI to signed-out visitors. */
export default function AdminLayout() {
  const nav = useNavigate();
  if (!adminToken.get()) return <Navigate to="/admin/login" replace />;
  return (
    <div className="min-h-screen bg-white text-black md:flex">
      <Seo title="Admin" noindex />
      <aside className="border-b border-black p-5 md:min-h-screen md:w-56 md:border-b-0 md:border-r">
        <p className="font-serif text-lg uppercase tracking-[0.25em]">RCW Admin</p>
        <nav aria-label="Admin" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 md:flex-col">
          {LINKS.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `label ${isActive ? 'underline underline-offset-4' : 'text-neutral-500 hover:text-black'}`}>{label}</NavLink>
          ))}
          <a href="/" className="label text-neutral-500 hover:text-black">View site</a>
          <button className="label text-left text-neutral-500 hover:text-black" onClick={() => { adminToken.clear(); nav('/admin/login'); }}>Sign out</button>
        </nav>
      </aside>
      <main className="flex-1 p-5 md:p-10"><Outlet /></main>
    </div>
  );
}

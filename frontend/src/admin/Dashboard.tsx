import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { useEffect, useState } from 'react';

interface Stats {
  enquiries: { total: number; new: number; in_progress: number; closed: number; last7: number };
  services: number; collections: number; weddings: number; gallery: number;
}

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { adminApi<Stats>('/stats').then(setS).catch((e) => setErr(e.message)); }, []);
  if (err) return <p role="alert" className="text-red-700">{err}</p>;
  if (!s) return <p className="label text-neutral-500">Loading…</p>;

  const cards: [string, number, string][] = [
    ['New enquiries', s.enquiries.new, '/admin/enquiries'],
    ['In progress', s.enquiries.in_progress, '/admin/enquiries'],
    ['Closed', s.enquiries.closed, '/admin/enquiries'],
    ['Last 7 days', s.enquiries.last7, '/admin/enquiries'],
    ['Total enquiries', s.enquiries.total, '/admin/enquiries'],
    ['Services', s.services, '/admin/services'],
    ['Collections', s.collections, '/admin/collections'],
    ['Weddings', s.weddings, '/admin/weddings'],
    ['Gallery images', s.gallery, '/admin/gallery'],
  ];
  return (
    <>
      <h1 className="font-serif text-4xl">Dashboard</h1>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map(([label, n, to]) => (
          <Link key={label} to={to} className="border border-black p-5 transition hover:bg-black hover:text-white">
            <p className="font-serif text-4xl">{n}</p>
            <p className="label mt-2">{label}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

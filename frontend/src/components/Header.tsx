import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MenuOverlay from './MenuOverlay';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* mix-blend-difference keeps the header legible over both photographs and white pages */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 text-white mix-blend-difference md:px-10">
        <button
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label="Open menu"
          className="flex items-center gap-3"
        >
          <span aria-hidden className="flex flex-col gap-[5px]">
            <span className="block h-px w-6 bg-current" />
            <span className="block h-px w-6 bg-current" />
            <span className="block h-px w-6 bg-current" />
          </span>
          <span className="label hidden sm:inline">Menu</span>
        </button>
        <Link to="/" aria-label="Red Club Wedding — home" className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-base uppercase tracking-[0.3em] sm:text-xl">
          Red Club Wedding
        </Link>
        <Link to="/contact" className="label">Enquire</Link>
      </header>
      <MenuOverlay open={open} onClose={close} />
    </>
  );
}

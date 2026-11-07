import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { NAV } from './nav';

export default function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className="fixed inset-0 z-[60] flex flex-col bg-white text-black"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex items-center justify-between px-5 py-5 md:px-10">
            <button ref={closeRef} onClick={onClose} className="label" aria-label="Close menu">Close</button>
            <Link to="/" onClick={onClose} className="font-serif text-lg uppercase tracking-[0.3em]">Red Club Wedding</Link>
            <Link to="/contact" onClick={onClose} className="label">Enquire</Link>
          </div>

          <nav aria-label="Primary" className="flex flex-1 flex-col justify-center px-5 md:px-10">
            <ul>
              {NAV.map((item, i) => (
                <motion.li
                  key={item.to}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.05, duration: 0.6 } }}
                  exit={{ opacity: 0 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block py-1 font-serif text-4xl leading-tight transition-opacity hover:opacity-50 md:text-6xl ${isActive ? 'underline decoration-1 underline-offset-8' : ''}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="flex justify-between px-5 py-6 md:px-10">
            <Link to="/contact" onClick={onClose} className="link-u">Enquire now</Link>
            <span className="label text-neutral-500">Red Club Wedding</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

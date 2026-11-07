import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { GalleryImage } from '../lib/types';

interface Props {
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onChange: (i: number) => void;
}

export default function Lightbox({ images, index, onClose, onChange }: Props) {
  const open = index !== null && images.length > 0;
  const touchX = useRef<number | null>(null);
  const prev = () => onChange(((index ?? 0) - 1 + images.length) % images.length);
  const next = () => onChange(((index ?? 0) + 1) % images.length);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prevOverflow; window.removeEventListener('keydown', onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, images.length]);

  const img = open ? images[index!] : null;

  return (
    <AnimatePresence>
      {open && img && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="on-dark fixed inset-0 z-[70] flex items-center justify-center bg-black/95 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
            touchX.current = null;
          }}
        >
          <button onClick={onClose} className="label absolute right-5 top-5 z-10 p-2 md:right-10" aria-label="Close image viewer">Close</button>
          <span className="label absolute left-5 top-5 p-2 md:left-10">{index! + 1} / {images.length}</span>
          {images.length > 1 && (
            <>
              <button onClick={prev} className="label absolute left-3 top-1/2 z-10 -translate-y-1/2 p-3 md:left-8" aria-label="Previous image">←</button>
              <button onClick={next} className="label absolute right-3 top-1/2 z-10 -translate-y-1/2 p-3 md:right-8" aria-label="Next image">→</button>
            </>
          )}
          <AnimatePresence mode="wait">
            <motion.img
              key={img.id}
              src={img.image_url}
              alt={img.alt ?? ''}
              className="max-h-[86vh] max-w-[92vw] object-contain"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

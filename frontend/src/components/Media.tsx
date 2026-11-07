import { useState } from 'react';

interface Props {
  src?: string | null;
  alt?: string | null;
  ratio?: string; // tailwind aspect class, e.g. "aspect-[3/4]"
  className?: string;
  eager?: boolean;
  dark?: boolean;
}

/** Lazy-loaded image with fade-in. Renders a neutral placeholder when no image has been supplied yet. */
export default function Media({ src, alt, ratio = 'aspect-[3/4]', className = '', eager = false, dark = false }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || 'Image to be added'}
        className={`${ratio} ${className} flex items-end p-4 ${dark ? 'bg-neutral-900 text-neutral-500' : 'bg-neutral-200 text-neutral-500'}`}
      >
        <span className="label">Image to be added</span>
      </div>
    );
  }
  return (
    <div className={`${ratio} ${className} overflow-hidden bg-neutral-100`}>
      <img
        src={src}
        alt={alt ?? ''}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}

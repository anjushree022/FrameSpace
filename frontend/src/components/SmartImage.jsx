import { useEffect, useRef, useState } from 'react';

import { optimizeUrl } from '../utils/image';

// Fades images in once loaded and falls back to a placeholder photograph
// if a sample image cannot be fetched.
function fallbackFor(src) {
  const m = /photo-([\w-]+)/.exec(src || '');
  return m ? `https://picsum.photos/seed/${m[1]}/900/1100` : null;
}

export default function SmartImage({ src, width, alt = '', className = '', ...rest }) {
  const resolved = optimizeUrl(src, width);
  const [current, setCurrent] = useState(resolved);
  const [loaded, setLoaded] = useState(false);
  const triedFallback = useRef(false);

  useEffect(() => {
    setCurrent(resolved);
    setLoaded(false);
    triedFallback.current = false;
  }, [resolved]);

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => {
        const fb = fallbackFor(src);
        if (!triedFallback.current && fb) {
          triedFallback.current = true;
          setCurrent(fb);
        }
      }}
      className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      {...rest}
    />
  );
}

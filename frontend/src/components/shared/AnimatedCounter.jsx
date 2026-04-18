import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export default function AnimatedCounter({ value = 0, duration = 1200, className = '', prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const startRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!isInView) return;
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, isInView, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}
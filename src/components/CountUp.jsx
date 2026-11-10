import { useEffect, useRef, useState } from 'react';
export default function CountUp({ to, suffix = '' }) {
  const ref = useRef(null); const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (calm || !('IntersectionObserver' in window)) { setN(to); return; }
    let raf; const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect(); const t0 = performance.now();
      const step = (t) => { const p = Math.min(1, (t - t0) / 1200); setN(Math.round(to * (1 - (1 - p) ** 3))); if (p < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el); return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

import { useEffect, useRef } from 'react';

const DEG = Math.PI / 180;
const MAX = 8 * DEG;

/**
 * Smooth mouse parallax (max ±8°) for camera / product / light.
 * Returns a ref: { x, y, glow } updated with easeInOut lerp — no shaking.
 */
export default function useMouseParallax(enabled = true, ease = 0.06) {
  const parallax = useRef({ x: 0, y: 0, glow: 0.5, _tx: 0, _ty: 0, _tg: 0.5 });

  useEffect(() => {
    if (!enabled) {
      parallax.current = { x: 0, y: 0, glow: 0.5, _tx: 0, _ty: 0, _tg: 0.5 };
      return undefined;
    }

    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      parallax.current._tx = nx * MAX;
      parallax.current._ty = ny * MAX;
      parallax.current._tg = 0.35 + ((nx + 1) * 0.5) * 0.45;
    };

    let raf = 0;
    const tick = () => {
      const p = parallax.current;
      p.x += (p._tx - p.x) * ease;
      p.y += (p._ty - p.y) * ease;
      p.glow += (p._tg - p.glow) * ease;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled, ease]);

  return parallax;
}

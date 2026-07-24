import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import styles from './CustomCursor.module.css';

const TRAIL = 8;
const MAGNETIC = 'a.btn, button.btn, .btn, [data-magnetic]';

/**
 * Soft glowing cursor + trail + magnetic buttons + click ripple.
 * Disabled on touch / reduced motion.
 */
export default function CustomCursor() {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [ripples, setRipples] = useState([]);
  const pos = useRef({ x: -100, y: -100, tx: -100, ty: -100 });
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRefs = useRef([]);
  const trailPos = useRef(Array.from({ length: TRAIL }, () => ({ x: -100, y: -100 })));

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    setEnabled(fine && !reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    if (!enabled) return undefined;

    document.documentElement.classList.add('cursor-fx');

    const onMove = (e) => {
      pos.current.tx = e.clientX;
      pos.current.ty = e.clientY;

      // Magnetic pull toward nearby interactive targets
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = el?.closest?.(MAGNETIC);
      if (target) {
        const rect = target.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        const radius = Math.max(rect.width, rect.height) * 0.7;
        if (dist < radius) {
          const pull = (1 - dist / radius) * 10;
          pos.current.tx = e.clientX - dx * 0.12 * (pull / 10);
          pos.current.ty = e.clientY - dy * 0.12 * (pull / 10);
          target.style.transform = `translate(${dx * -0.08}px, ${dy * -0.08}px)`;
          target.dataset.magnetActive = '1';
          setHovering(true);
        } else {
          setHovering(false);
        }
      } else {
        setHovering(false);
      }

      document.querySelectorAll(`${MAGNETIC}[data-magnet-active="1"]`).forEach((node) => {
        if (node !== target) {
          node.style.transform = '';
          delete node.dataset.magnetActive;
        }
      });
    };

    const onDown = (e) => {
      const id = Date.now();
      setRipples((r) => [...r.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      window.setTimeout(() => {
        setRipples((r) => r.filter((item) => item.id !== id));
      }, 600);
    };

    let raf = 0;
    const tick = () => {
      const p = pos.current;
      p.x += (p.tx - p.x) * 0.28;
      p.y += (p.ty - p.y) * 0.28;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        const rx = p.x + (p.tx - p.x) * 0.35;
        const ry = p.y + (p.ty - p.y) * 0.35;
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      }

      const trail = trailPos.current;
      trail[0].x += (p.x - trail[0].x) * 0.45;
      trail[0].y += (p.y - trail[0].y) * 0.45;
      for (let i = 1; i < TRAIL; i += 1) {
        trail[i].x += (trail[i - 1].x - trail[i].x) * 0.35;
        trail[i].y += (trail[i - 1].y - trail[i].y) * 0.35;
        const node = trailRefs.current[i];
        if (node) {
          const s = 1 - i / TRAIL;
          node.style.transform = `translate(${trail[i].x}px, ${trail[i].y}px) translate(-50%, -50%) scale(${s})`;
          node.style.opacity = String(0.55 * s);
        }
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove('cursor-fx');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      cancelAnimationFrame(raf);
      document.querySelectorAll(`${MAGNETIC}[data-magnet-active="1"]`).forEach((node) => {
        node.style.transform = '';
        delete node.dataset.magnetActive;
      });
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className={styles.dot} />
      <div ref={ringRef} className={`${styles.ring} ${hovering ? styles.ringHover : ''}`} />
      {Array.from({ length: TRAIL }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          className={styles.trail}
        />
      ))}
      {ripples.map((r) => (
        <span
          key={r.id}
          className={styles.ripple}
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </>
  );
}

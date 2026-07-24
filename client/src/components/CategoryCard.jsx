import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSpring, animated, to } from '@react-spring/web';
import styles from '../pages/Home.module.css';

/**
 * Floating glass category card — preserves existing catCard markup/classes.
 */
export default function CategoryCard({ name, icon, color, onClick, id }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  const [{ rx, ry, y }, api] = useSpring(() => ({
    rx: 0,
    ry: 0,
    y: 0,
    config: { mass: 1, tension: 280, friction: 28 },
  }));

  const onMove = (e) => {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    api.start({ rx: py * -10, ry: px * 12, y: -8 });
  };

  const onLeave = () => {
    setHovered(false);
    api.start({ rx: 0, ry: 0, y: 0 });
  };

  return (
    <animated.button
      ref={ref}
      id={id}
      type="button"
      className={`${styles.catCard} ${hovered ? styles.catCardGlow : ''}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-magnetic
      style={
        reduceMotion
          ? undefined
          : {
              transform: to(
                [rx, ry, y],
                (rxV, ryV, yV) =>
                  `perspective(800px) rotateX(${rxV}deg) rotateY(${ryV}deg) translateY(${yV}px)`
              ),
            }
      }
    >
      <motion.span
        className={styles.catIcon}
        style={{ background: `${color}20`, color }}
        animate={hovered && !reduceMotion ? { rotate: [0, -8, 8, 0], scale: 1.08 } : { rotate: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.45, 0, 0.55, 1] }}
      >
        {icon}
      </motion.span>
      <span className={styles.catName}>{name}</span>
    </animated.button>
  );
}

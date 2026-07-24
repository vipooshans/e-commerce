import { motion, useReducedMotion } from 'framer-motion';
import styles from '../pages/Home.module.css';

const ease = [0.45, 0, 0.55, 1];

/**
 * Existing hero floating cards — same markup/classes, premium entrance + idle motion.
 */
export default function FloatingCards({ scrollProgress = 0 }) {
  const reduceMotion = useReducedMotion();
  const orbit = scrollProgress > 0.35 && scrollProgress < 0.7
    ? (scrollProgress - 0.35) / 0.35
    : 0;
  const ox = Math.sin(orbit * Math.PI * 2) * 18;
  const oy = Math.cos(orbit * Math.PI * 2) * 12;
  const ox2 = Math.sin(orbit * Math.PI * 2 + 1.2) * -16;
  const oy2 = Math.cos(orbit * Math.PI * 2 + 0.6) * 14;

  if (reduceMotion) {
    return (
      <>
        <div className={`${styles.floatingCard} ${styles.cardTop}`}>
          <span>⚡</span> New drop
        </div>
        <div className={`${styles.floatingCard} ${styles.cardBottom}`}>
          <span>★</span> 4.9 rating
        </div>
      </>
    );
  }

  return (
    <>
      <motion.div
        className={`${styles.floatingCard} ${styles.cardTop}`}
        initial={{ opacity: 0, x: -48, y: -12, rotate: -6 }}
        animate={{
          opacity: 1,
          x: ox,
          y: oy - 4,
          rotate: -2 + orbit * 4,
        }}
        transition={{
          opacity: { duration: 0.9, ease, delay: 0.55 },
          x: { duration: 0.55, ease },
          y: { duration: 0.55, ease },
          rotate: { duration: 0.55, ease },
        }}
      >
        <span>⚡</span> New drop
      </motion.div>

      <motion.div
        className={`${styles.floatingCard} ${styles.cardBottom}`}
        initial={{ opacity: 0, x: 48, y: 16, rotate: 5 }}
        animate={{
          opacity: 1,
          x: ox2,
          y: oy2,
          rotate: 1.5 - orbit * 3,
        }}
        transition={{
          opacity: { duration: 0.95, ease, delay: 0.75 },
          x: { duration: 0.55, ease },
          y: { duration: 0.55, ease },
          rotate: { duration: 0.55, ease },
        }}
      >
        <span>★</span> 4.9 rating
      </motion.div>
    </>
  );
}

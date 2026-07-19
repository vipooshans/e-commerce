import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CART_ANIMATION_EVENT } from '../utils/cartAnimation';
import styles from './CartAnimation.module.css';

const PARTICLES = [
  [-34, -30], [-8, -42], [22, -34], [38, -8],
  [32, 24], [4, 38], [-28, 28], [-40, 2],
];

const getVisibleCart = () => (
  [...document.querySelectorAll('[data-cart-target]')]
    .find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    })
);

const CartAnimation = () => {
  const [animation, setAnimation] = useState(null);
  const clearTimer = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const handleAdd = ({ detail }) => {
      const target = getVisibleCart();
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const destination = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      clearTimeout(clearTimer.current);
      setAnimation({
        id: Date.now(),
        imageSrc: detail.imageSrc,
        source: detail.source || destination,
        destination,
      });
      clearTimer.current = setTimeout(() => setAnimation(null), reduceMotion ? 700 : 1400);
    };

    window.addEventListener(CART_ANIMATION_EVENT, handleAdd);
    return () => {
      window.removeEventListener(CART_ANIMATION_EVENT, handleAdd);
      clearTimeout(clearTimer.current);
    };
  }, [reduceMotion]);

  if (!animation) return null;

  const { source, destination, imageSrc } = animation;
  const midpointX = (source.x + destination.x) / 2;
  const arcY = Math.min(source.y, destination.y) - 100;

  return (
    <div className={styles.layer} aria-hidden="true">
      <AnimatePresence>
        {!reduceMotion && (
          imageSrc ? (
            <motion.img
              key={`product-${animation.id}`}
              src={imageSrc}
              alt=""
              className={styles.flyingProduct}
              initial={{ left: source.x, top: source.y, opacity: 0.95, scale: 1 }}
              animate={{
                left: [source.x, midpointX, destination.x],
                top: [source.y, arcY, destination.y],
                opacity: [0.95, 1, 0],
                scale: [1, 0.72, 0.2],
                rotate: [0, 14, 30],
              }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            <motion.span
              key={`product-${animation.id}`}
              className={styles.flyingFallback}
              initial={{ left: source.x, top: source.y, opacity: 1 }}
              animate={{ left: destination.x, top: destination.y, opacity: 0, scale: 0.2 }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
            >
              🛍️
            </motion.span>
          )
        )}

        {PARTICLES.map(([x, y], index) => (
          <motion.span
            key={`${animation.id}-particle-${index}`}
            className={styles.particle}
            style={{ left: destination.x, top: destination.y }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ x, y, scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.58 }}
          />
        ))}

        <motion.span
          key={`check-${animation.id}`}
          className={styles.checkmark}
          style={{ left: destination.x, top: destination.y }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.68 }}
        >
          ✓
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default CartAnimation;

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  AdaptiveDpr,
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import * as THREE from 'three';
import ShoeModel from './ShoeModel';
import BackgroundParticles from './BackgroundParticles';
import FloatingCards from './FloatingCards';
import useScrollAnimation from '../hooks/useScrollAnimation';
import useMouseParallax from '../hooks/useMouseParallax';
import styles from '../pages/Home.module.css';

const EASE = [0.45, 0, 0.55, 1];

function smooth(a, b, x) {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function CameraRig({ progress, parallax, glowRef }) {
  const { camera } = useThree();
  const light = useRef(null);
  const rim = useRef(null);

  useFrame(() => {
    const p = progress.current;
    const m = parallax.current;

    // 0%: far → 20%: closer → 100%: close zoom
    const z = THREE.MathUtils.lerp(5.8, 3.6, smooth(0, 0.2, p));
    const zClose = THREE.MathUtils.lerp(z, 2.65, smooth(0.82, 1, p));
    const y = THREE.MathUtils.lerp(0.45, 0.75, smooth(0.2, 0.4, p));
    const tilt = smooth(0.4, 0.6, p) * 0.12;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0.35 + m.x * 0.55, 0.08);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, y - m.y * 0.35, 0.08);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, zClose, 0.08);
    camera.lookAt(0, 0.05 + tilt * 0.4, 0);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, -tilt * 0.25 + m.x * 0.04, 0.08);

    if (light.current) {
      light.current.position.x = 3 + m.x * 2.2;
      light.current.position.y = 4 + m.y * 1.2;
      light.current.intensity = 1.15 + m.glow * 0.35;
    }
    if (rim.current) {
      rim.current.intensity = 0.55 + m.glow * 0.55;
    }
    if (glowRef?.current) {
      const expand = 1 + smooth(0.15, 0.35, p) * 0.28 + m.glow * 0.08;
      glowRef.current.style.transform = `scale(${expand})`;
      glowRef.current.style.opacity = String(0.7 + m.glow * 0.25);
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        ref={light}
        position={[3.2, 4.5, 2.5]}
        intensity={1.25}
        color="#FFE4C8"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        ref={rim}
        position={[-3.5, 1.5, -2.5]}
        intensity={0.7}
        color="#C4B5FD"
      />
      <pointLight position={[1.5, -0.5, 2]} intensity={0.35} color="#EC4899" />
    </>
  );
}

function HeroScene({ progress, parallax, glowRef, reducedMotion }) {
  return (
    <>
      <CameraRig progress={progress} parallax={parallax} glowRef={glowRef} />
      <BackgroundParticles progress={progress} reducedMotion={reducedMotion} />
      <Suspense fallback={null}>
        <ShoeModel
          progress={progress}
          parallax={parallax}
          reducedMotion={reducedMotion}
        />
        <Environment preset="city" />
      </Suspense>
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.35}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
      </EffectComposer>
      <AdaptiveDpr />
    </>
  );
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  );
}

function CountUp({ value, suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });
  const [display, setDisplay] = useState(0);
  const numeric = typeof value === 'number';

  useEffect(() => {
    if (!inView || !numeric) return undefined;
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = t * t * (3 - 2 * t);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, numeric, value, duration]);

  return (
    <span ref={ref} className={styles.statVal}>
      {numeric ? `${display}${suffix}` : value}
    </span>
  );
}

function HeroButton({ to, className, id, children }) {
  const reduceMotion = useReducedMotion();
  const ripples = useRef(null);

  const onPointerDown = (e) => {
    if (reduceMotion || !ripples.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const span = document.createElement('span');
    span.className = styles.btnRipple;
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    ripples.current.appendChild(span);
    window.setTimeout(() => span.remove(), 650);
  };

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <Link
        to={to}
        className={`${className} ${styles.heroCta}`}
        id={id}
        onPointerDown={onPointerDown}
      >
        <span ref={ripples} className={styles.btnRippleHost} aria-hidden="true" />
        {children}
      </Link>
    </motion.div>
  );
}

/**
 * Premium Apple-style 3D hero — preserves existing layout/colors/cards.
 */
export default function Hero3D() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const glowRef = useRef(null);
  const progress = useRef(0);
  const [scrollUI, setScrollUI] = useState(0);
  const reduceMotion = useReducedMotion();
  const systemReduce = usePrefersReducedMotion();
  const noMotion = !!reduceMotion || systemReduce;
  const parallax = useMouseParallax(!noMotion, 0.055);
  const [visible, setVisible] = useState(true);

  useScrollAnimation(sectionRef, progress, {
    enabled: !noMotion,
    scrub: 1.15,
    end: '+=240%',
  });

  // Drive light UI (cards orbit) without flooding React
  useEffect(() => {
    if (noMotion) return undefined;
    let raf = 0;
    let last = -1;
    const tick = () => {
      const p = progress.current;
      if (Math.abs(p - last) > 0.01) {
        last = p;
        setScrollUI(p);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [noMotion]);

  // Pause WebGL when hero leaves viewport
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stats = useMemo(
    () => [
      { value: 30, suffix: '+', label: 'Products' },
      { value: 6, suffix: '', label: 'Categories' },
      { value: 'FREE', label: 'Shipping over Rs 999' },
    ],
    []
  );

  return (
    <section
      ref={sectionRef}
      className={`${styles.hero} ${styles.heroScroll}`}
      aria-label="Hero"
    >
      <div ref={stickyRef} className={styles.heroSticky}>
        <div className={styles.heroBg} />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <motion.div
              className={styles.pill}
              initial={noMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              ✦ New Season Arrivals
            </motion.div>

            <motion.h1
              initial={noMotion ? false : { opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, ease: EASE, delay: 0.08 }}
            >
              Discover Your <br />
              <span className={`gradient-text ${styles.shineText}`}>Perfect Style</span>
            </motion.h1>

            <motion.p
              initial={noMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.18 }}
            >
              Explore thousands of curated products across electronics, fashion, home, beauty, and more.
              Premium quality. Unbeatable prices.
            </motion.p>

            <motion.div
              className={styles.heroBtns}
              initial={noMotion ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.28 }}
            >
              <HeroButton to="/products" className="btn btn-primary btn-lg" id="hero-shop-btn">
                Shop Now ✦
              </HeroButton>
              <HeroButton to="/products?isFeatured=true" className="btn btn-outline btn-lg">
                View Deals
              </HeroButton>
            </motion.div>

            <div className={styles.heroStats}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.stat}>
                  {typeof stat.value === 'number' ? (
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  ) : (
                    <span className={styles.statVal}>{stat.value}</span>
                  )}
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div ref={glowRef} className={styles.glowOrb} />
            <div className={styles.shoeRing} />

            <div className={styles.shoeStage}>
              <div className={styles.heroCanvas}>
                {visible && (
                  <Canvas
                    dpr={[1, 1.5]}
                    camera={{ position: [0.35, 0.45, 5.8], fov: 40, near: 0.1, far: 40 }}
                    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                    frameloop={visible ? 'always' : 'never'}
                    style={{ background: 'transparent' }}
                  >
                    <HeroScene
                      progress={progress}
                      parallax={parallax}
                      glowRef={glowRef}
                      reducedMotion={noMotion}
                    />
                  </Canvas>
                )}
              </div>
              <div className={styles.shoeShadow} />
            </div>

            <FloatingCards scrollProgress={scrollUI} />
          </div>
        </div>
      </div>
    </section>
  );
}

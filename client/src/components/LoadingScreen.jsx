import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import styles from './LoadingScreen.module.css';

const MIN_VISIBLE_MS = 2400;

function GlassSphere() {
  const ref = useRef(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(s.clock.elapsedTime * 1.2) * 0.12;
    ref.current.rotation.y = s.clock.elapsedTime * 0.4;
  });
  return (
    <mesh ref={ref} position={[0, 0.15, 0]}>
      <sphereGeometry args={[0.55, 32, 32]} />
      <meshPhysicalMaterial
        color="#9D63F7"
        transparent
        opacity={0.35}
        roughness={0.12}
        metalness={0.15}
        transmission={0.75}
        thickness={0.7}
        ior={1.4}
        emissive="#7C3AED"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

function RotatingCube({ position }) {
  const ref = useRef(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.9;
    ref.current.rotation.y += delta * 1.15;
  });
  return (
    <group position={position}>
      <RoundedBox ref={ref} args={[0.4, 0.4, 0.4]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#7C3AED" metalness={0.35} roughness={0.28} emissive="#7C3AED" emissiveIntensity={0.15} />
      </RoundedBox>
    </group>
  );
}

function ShoppingBag({ position }) {
  const ref = useRef(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 1.6) * 0.1;
    ref.current.rotation.y = Math.sin(t * 0.7) * 0.3;
  });
  return (
    <group ref={ref} position={position} scale={0.85}>
      <RoundedBox args={[0.7, 0.8, 0.3]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color="#EC4899" metalness={0.12} roughness={0.4} />
      </RoundedBox>
    </group>
  );
}

function SweepLight() {
  const ref = useRef(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.position.x = Math.sin(s.clock.elapsedTime * 1.4) * 2.5;
  });
  return <spotLight ref={ref} position={[0, 2.5, 2]} intensity={1.4} angle={0.45} penumbra={0.6} color="#E9D5FF" />;
}

function Scene({ reducedMotion }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 5, 4]} intensity={1} />
      <SweepLight />
      <pointLight position={[-2, 1, -1]} intensity={0.55} color="#EC4899" />
      {!reducedMotion && <GlassSphere />}
      <RotatingCube position={[-1.35, 0.2, -0.2]} />
      <ShoppingBag position={[1.25, -0.1, 0]} />
    </>
  );
}

export default function LoadingScreen({ onComplete, ready = true }) {
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [percent, setPercent] = useState(0);
  const reduceMotion = useReducedMotion();
  const startedAt = useRef(typeof performance !== 'undefined' ? performance.now() : Date.now());

  useEffect(() => {
    let raf = 0;
    const duration = reduceMotion ? 400 : MIN_VISIBLE_MS;
    const tick = (now) => {
      const t = Math.min(1, (now - startedAt.current) / duration);
      setPercent(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  useEffect(() => {
    if (!ready) return undefined;

    const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt.current;
    const wait = Math.max(0, (reduceMotion ? 400 : MIN_VISIBLE_MS) - elapsed);

    const exitTimer = window.setTimeout(() => {
      setPercent(100);
      setExiting(true);
    }, wait);
    const unmountTimer = window.setTimeout(
      () => {
        setMounted(false);
        onComplete?.();
      },
      wait + 560
    );

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [ready, reduceMotion, onComplete]);

  if (!mounted) return null;

  return (
    <div
      className={`${styles.overlay} ${exiting ? styles.overlayExit : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading EverBuyGlobal"
    >
      <div className={styles.sweep} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.logoWrap}>
          <img src="/logo.png" alt="EverBuyGlobal" className={styles.logo} />
        </div>

        <div className={styles.canvasWrap}>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0.35, 4.2], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <Scene reducedMotion={!!reduceMotion} />
            </Suspense>
          </Canvas>
        </div>

        <div className={styles.meta}>
          <p className={styles.label}>Loading your store…</p>
          <div className={styles.percent}>{percent}%</div>
          <div className={styles.track} aria-hidden="true">
            <div className={styles.fill} style={{ width: `${percent}%`, animation: 'none', transform: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

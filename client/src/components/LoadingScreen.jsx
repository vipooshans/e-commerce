import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import styles from './LoadingScreen.module.css';

const MIN_VISIBLE_MS = 2200;

function RotatingCube({ position }) {
  const ref = useRef(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.9;
    ref.current.rotation.y += delta * 1.15;
  });

  return (
    <group position={position}>
      <RoundedBox ref={ref} args={[0.55, 0.55, 0.55]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial color="#2563EB" metalness={0.35} roughness={0.28} />
      </RoundedBox>
    </group>
  );
}

function ShoppingBag({ position }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * 1.6) * 0.12;
    ref.current.rotation.y = Math.sin(t * 0.7) * 0.35;
    ref.current.rotation.z = Math.sin(t * 1.1) * 0.06;
  });

  return (
    <group ref={ref} position={position} scale={1.15}>
      {/* Bag body */}
      <RoundedBox args={[0.85, 0.95, 0.35]} radius={0.06} smoothness={4} castShadow>
        <meshStandardMaterial color="#06B6D4" metalness={0.12} roughness={0.4} />
      </RoundedBox>
      {/* Front panel fold */}
      <RoundedBox args={[0.72, 0.78, 0.06]} radius={0.04} position={[0, -0.02, 0.2]} castShadow>
        <meshStandardMaterial color="#38BDF8" metalness={0.08} roughness={0.45} />
      </RoundedBox>
      {/* Handles */}
      <mesh position={[-0.22, 0.62, 0]} rotation={[0, 0, 0.08]}>
        <torusGeometry args={[0.18, 0.035, 10, 24, Math.PI]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.2} roughness={0.35} />
      </mesh>
      <mesh position={[0.22, 0.62, 0]} rotation={[0, 0, -0.08]}>
        <torusGeometry args={[0.18, 0.035, 10, 24, Math.PI]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.2} roughness={0.35} />
      </mesh>
    </group>
  );
}

function SpinningPackage({ position }) {
  const ref = useRef(null);
  const ribbon = useRef(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 1.4;
    ref.current.rotation.x = Math.sin(performance.now() * 0.0012) * 0.15;
    if (ribbon.current) ribbon.current.rotation.z += delta * 0.6;
  });

  return (
    <group ref={ref} position={position} scale={0.85}>
      <RoundedBox args={[0.7, 0.55, 0.7]} radius={0.05} smoothness={4} castShadow>
        <meshStandardMaterial color="#C4A484" metalness={0.05} roughness={0.65} />
      </RoundedBox>
      {/* Vertical ribbon */}
      <mesh ref={ribbon} position={[0, 0, 0]}>
        <boxGeometry args={[0.12, 0.58, 0.72]} />
        <meshStandardMaterial color="#2563EB" metalness={0.2} roughness={0.35} />
      </mesh>
      {/* Horizontal ribbon */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.72, 0.12, 0.72]} />
        <meshStandardMaterial color="#06B6D4" metalness={0.2} roughness={0.35} />
      </mesh>
      {/* Bow knot */}
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color="#3B82F6" metalness={0.25} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Scene({ reducedMotion }) {
  const group = useRef(null);

  useFrame((_, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y += delta * 0.15;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.25} />
      <pointLight position={[-3, 2, -2]} intensity={0.65} color="#06B6D4" />
      <pointLight position={[2, -1, 3]} intensity={0.4} color="#3B82F6" />

      <group ref={group}>
        <ShoppingBag position={[0, -0.05, 0]} />
        <RotatingCube position={[-1.35, 0.35, -0.2]} />
        <SpinningPackage position={[1.35, -0.15, -0.15]} />
      </group>
    </>
  );
}

/**
 * Full-page 3D splash shown while the app boots.
 * Includes: rotating cube, floating logo, animated shopping bag, spinning package.
 */
export default function LoadingScreen({ onComplete, ready = true }) {
  const [exiting, setExiting] = useState(false);
  const [mounted, setMounted] = useState(true);
  const reduceMotion = useReducedMotion();
  const startedAt = useRef(typeof performance !== 'undefined' ? performance.now() : Date.now());

  useEffect(() => {
    if (!ready) return undefined;

    const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt.current;
    const wait = Math.max(0, (reduceMotion ? 400 : MIN_VISIBLE_MS) - elapsed);

    const exitTimer = window.setTimeout(() => setExiting(true), wait);
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
          <div className={styles.track} aria-hidden="true">
            <div className={styles.fill} />
          </div>
        </div>
      </div>
    </div>
  );
}

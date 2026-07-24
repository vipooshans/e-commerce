import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import styles from './GlobalBackground.module.css';

function Spheres() {
  const group = useRef(null);
  const items = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        pos: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          -2 - Math.random() * 4,
        ],
        scale: 0.15 + Math.random() * 0.35,
        speed: 0.2 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        color: i % 2 ? '#7C3AED' : '#EC4899',
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((child, i) => {
      const it = items[i];
      child.position.y = it.pos[1] + Math.sin(t * it.speed + it.phase) * 0.35;
      child.position.x = it.pos[0] + Math.cos(t * it.speed * 0.6 + it.phase) * 0.2;
      child.rotation.y = t * 0.15;
    });
  });

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <mesh key={i} position={it.pos} scale={it.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={it.color}
            emissive={it.color}
            emissiveIntensity={0.35}
            transparent
            opacity={0.35}
            roughness={0.2}
            metalness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function GlassShapes() {
  const ref = useRef(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.08;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.2) * 0.1;
  });
  return (
    <group ref={ref}>
      <mesh position={[-3.2, 1.2, -3]}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshPhysicalMaterial
          color="#9D63F7"
          transparent
          opacity={0.18}
          roughness={0.1}
          metalness={0.2}
          transmission={0.6}
          thickness={0.5}
        />
      </mesh>
      <mesh position={[3.4, -0.8, -2.5]} rotation={[0.4, 0.2, 0.1]}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshPhysicalMaterial
          color="#EC4899"
          transparent
          opacity={0.16}
          roughness={0.15}
          metalness={0.15}
          transmission={0.55}
          thickness={0.4}
        />
      </mesh>
      <mesh position={[0.5, 2.1, -4]} rotation={[0.2, 0.5, 0]}>
        <torusGeometry args={[0.55, 0.08, 12, 48]} />
        <meshStandardMaterial color="#60A5FA" transparent opacity={0.22} emissive="#3B82F6" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function Dust() {
  const ref = useRef(null);
  const { positions, colors } = useMemo(() => {
    const count = 80;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const a = new THREE.Color('#9D63F7');
    const b = new THREE.Color('#F472B6');
    const tmp = new THREE.Color();
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = -1 - Math.random() * 6;
      tmp.copy(a).lerp(b, Math.random());
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.45} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 4, 3]} intensity={0.55} color="#E9D5FF" />
      <pointLight position={[-3, 1, -2]} intensity={0.4} color="#EC4899" />
      <Spheres />
      <GlassShapes />
      <Dust />
    </>
  );
}

/**
 * Fixed ambient 3D/atmosphere layer — pointer-events none, pauses when hidden.
 */
export default function GlobalBackground() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  if (reduceMotion) {
    return (
      <div className={styles.layer} aria-hidden="true">
        <div className={styles.rays} />
      </div>
    );
  }

  return (
    <div className={styles.layer} aria-hidden="true">
      <div className={styles.rays} />
      <div className={styles.smoke} />
      <div className={styles.canvas}>
        {visible && (
          <Canvas
            dpr={[1, 1.25]}
            camera={{ position: [0, 0, 6], fov: 50 }}
            gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
            frameloop="always"
            style={{ background: 'transparent' }}
          >
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        )}
      </div>
    </div>
  );
}

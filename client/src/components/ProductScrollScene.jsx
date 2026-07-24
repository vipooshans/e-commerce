import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, RoundedBox } from '@react-three/drei';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import styles from './ProductScrollScene.module.css';

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
  { id: 'zoom', label: 'Zoom in', from: 0, to: 0.28 },
  { id: 'rotate', label: 'Rotate', from: 0.18, to: 0.55 },
  { id: 'explode', label: 'Explode', from: 0.4, to: 0.78 },
  { id: 'color', label: 'Color shift', from: 0.55, to: 1 },
];

const COLOR_START = new THREE.Color('#7C3AED');
const COLOR_MID = new THREE.Color('#EC4899');
const COLOR_END = new THREE.Color('#3B82F6');
const ACCENT_START = new THREE.Color('#F1EEF9');
const ACCENT_END = new THREE.Color('#FBBF24');

const PARTS = [
  {
    name: 'sole',
    geo: [1.7, 0.18, 0.72],
    pos: [0, -0.42, 0],
    explode: [0, -0.85, 0.15],
    colorKey: 'body',
    radius: 0.08,
  },
  {
    name: 'midsole',
    geo: [1.55, 0.2, 0.66],
    pos: [0, -0.26, 0],
    explode: [0.15, -0.45, -0.35],
    colorKey: 'accent',
    radius: 0.1,
  },
  {
    name: 'upper',
    geo: [1.35, 0.42, 0.58],
    pos: [-0.05, 0.05, 0],
    explode: [-0.55, 0.35, 0.2],
    colorKey: 'body',
    radius: 0.18,
  },
  {
    name: 'toe',
    geo: [0.42, 0.28, 0.56],
    pos: [0.62, -0.08, 0],
    explode: [0.95, -0.1, 0.45],
    colorKey: 'body',
    radius: 0.16,
  },
  {
    name: 'heel',
    geo: [0.38, 0.55, 0.56],
    pos: [-0.62, 0.08, 0],
    explode: [-1.05, 0.55, -0.25],
    colorKey: 'accent',
    radius: 0.12,
  },
  {
    name: 'tongue',
    geo: [0.35, 0.48, 0.18],
    pos: [-0.1, 0.42, 0.12],
    explode: [0.1, 1.05, 0.55],
    colorKey: 'accent',
    radius: 0.08,
  },
  {
    name: 'laceLeft',
    geo: [0.55, 0.06, 0.08],
    pos: [-0.05, 0.28, 0.28],
    explode: [-0.35, 0.7, 0.85],
    colorKey: 'accent',
    radius: 0.03,
  },
  {
    name: 'laceRight',
    geo: [0.55, 0.06, 0.08],
    pos: [-0.05, 0.16, 0.28],
    explode: [0.35, 0.55, 0.9],
    colorKey: 'accent',
    radius: 0.03,
  },
];

function Sneaker({ progress }) {
  const groupRef = useRef(null);
  const partRefs = useRef([]);
  const bodyMats = useRef([]);
  const accentMats = useRef([]);

  const restPose = useMemo(
    () =>
      PARTS.map((part) => ({
        position: new THREE.Vector3(...part.pos),
        explode: new THREE.Vector3(...part.explode),
      })),
    []
  );

  const tmpBody = useMemo(() => new THREE.Color(), []);
  const tmpAccent = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const p = progress.current;
    const group = groupRef.current;
    if (!group) return;

    group.rotation.y = -0.55 + p * Math.PI * 2.15;
    group.rotation.x = 0.22 + Math.sin(p * Math.PI) * 0.18;
    group.rotation.z = Math.sin(p * Math.PI * 2) * 0.08;

    const explodeT = THREE.MathUtils.smoothstep(p, 0.38, 0.82);
    const settle = THREE.MathUtils.smoothstep(p, 0.86, 1);
    const explodeAmount = explodeT * (1 - settle * 0.92);

    partRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const { position, explode } = restPose[i];
      mesh.position.lerpVectors(position, explode, explodeAmount);
      mesh.rotation.x = explodeAmount * (i % 2 === 0 ? 0.35 : -0.28);
      mesh.rotation.z = explodeAmount * (i % 3 === 0 ? -0.22 : 0.18);
    });

    if (p < 0.65) {
      tmpBody.copy(COLOR_START).lerp(COLOR_MID, THREE.MathUtils.smoothstep(p, 0.45, 0.65));
    } else {
      tmpBody.copy(COLOR_MID).lerp(COLOR_END, THREE.MathUtils.smoothstep(p, 0.65, 0.95));
    }
    tmpAccent
      .copy(ACCENT_START)
      .lerp(ACCENT_END, THREE.MathUtils.smoothstep(p, 0.5, 0.95));

    bodyMats.current.forEach((mat) => mat?.color.copy(tmpBody));
    accentMats.current.forEach((mat) => mat?.color.copy(tmpAccent));
  });

  return (
    <group ref={groupRef} position={[0.15, 0.05, 0]} scale={1.15}>
      {PARTS.map((part, i) => {
        const isBody = part.colorKey === 'body';
        return (
          <RoundedBox
            key={part.name}
            ref={(el) => {
              partRefs.current[i] = el;
            }}
            args={part.geo}
            radius={part.radius}
            smoothness={4}
            position={part.pos}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              ref={(el) => {
                if (isBody) bodyMats.current[i] = el;
                else accentMats.current[i] = el;
              }}
              color={isBody ? COLOR_START : ACCENT_START}
              roughness={isBody ? 0.35 : 0.45}
              metalness={isBody ? 0.15 : 0.05}
            />
          </RoundedBox>
        );
      })}
    </group>
  );
}

function CameraRig({ progress }) {
  const { camera } = useThree();

  useFrame(() => {
    const p = progress.current;
    camera.position.z = THREE.MathUtils.lerp(
      5.4,
      2.55,
      THREE.MathUtils.smoothstep(p, 0, 0.55)
    );
    camera.position.y = THREE.MathUtils.lerp(0.55, 0.15, p);
    camera.position.x = THREE.MathUtils.lerp(0.2, -0.15, p);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene({ progress }) {
  return (
    <>
      <color attach="background" args={['#0B0714']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.35} castShadow />
      <pointLight position={[-3, 2, -2]} intensity={0.7} color="#EC4899" />
      <pointLight position={[2, -1, 3]} intensity={0.45} color="#3B82F6" />
      <CameraRig progress={progress} />
      <Sneaker progress={progress} />
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.45}
        scale={8}
        blur={2.4}
        far={4}
      />
      <Environment preset="city" />
    </>
  );
}

function activeStageKey(value) {
  return STAGES.filter((s) => value >= s.from && value <= s.to)
    .map((s) => s.id)
    .join('|');
}

export default function ProductScrollScene() {
  const sectionRef = useRef(null);
  const progressFillRef = useRef(null);
  const progress = useRef(0);
  const [stageKey, setStageKey] = useState(() => activeStageKey(0));
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !sectionRef.current) {
      progress.current = 0.35;
      if (progressFillRef.current) {
        progressFillRef.current.style.height = '35%';
      }
      setStageKey(activeStageKey(0.35));
      return undefined;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.65,
        onUpdate: (self) => {
          progress.current = self.progress;

          if (progressFillRef.current) {
            progressFillRef.current.style.height = `${Math.round(self.progress * 100)}%`;
          }

          const nextKey = activeStageKey(self.progress);
          setStageKey((prev) => (prev === nextKey ? prev : nextKey));
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Interactive product scroll showcase"
    >
      <div className={styles.sticky}>
        <div className={styles.canvasWrap}>
          <Canvas
            dpr={[1, 1.75]}
            camera={{ position: [0.2, 0.55, 5.4], fov: 42, near: 0.1, far: 40 }}
            gl={{ antialias: true, alpha: false }}
          >
            <Suspense fallback={null}>
              <Scene progress={progress} />
            </Suspense>
          </Canvas>
        </div>

        <div className={styles.overlay}>
          <div className={styles.header}>
            <div className={styles.eyebrow}>Scroll experience</div>
            <h2>
              See every detail as you{' '}
              <span className="gradient-text">scroll</span>
            </h2>
            <p>
              Camera zooms in, the sneaker rotates, parts explode apart, then
              colors shift — driven by GSAP ScrollTrigger and React Three Fiber.
            </p>
          </div>

          <div className={styles.stages} aria-hidden="true">
            {STAGES.map((stage) => {
              const active = stageKey.split('|').includes(stage.id);
              return (
                <span
                  key={stage.id}
                  className={`${styles.stage} ${active ? styles.stageActive : ''}`}
                >
                  {stage.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className={styles.progressTrack} aria-hidden="true">
          <div ref={progressFillRef} className={styles.progressFill} />
        </div>
      </div>
    </section>
  );
}

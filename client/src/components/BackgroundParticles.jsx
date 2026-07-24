import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Subtle cyan particle field + floating glass discs for the hero backdrop.
 */
export default function BackgroundParticles({ progress, reducedMotion = false }) {
  const points = useRef(null);
  const discs = useRef([]);

  const { positions, colors } = useMemo(() => {
    const count = 140;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color('#2563EB');
    const c2 = new THREE.Color('#06B6D4');
    const tmp = new THREE.Color();
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      tmp.copy(c1).lerp(c2, Math.random());
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (reducedMotion) return;
    const p = progress?.current ?? 0;
    const t = state.clock.elapsedTime;
    const move = 0.15 + smooth(p, 0.5, 0.7) * 0.55;

    if (points.current) {
      points.current.rotation.y = t * 0.03 * move;
      points.current.rotation.x = Math.sin(t * 0.12) * 0.04;
      const mat = points.current.material;
      if (mat) mat.opacity = 0.28 + p * 0.2;
    }

    discs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.y += Math.sin(t * 0.5 + i) * 0.0008;
      mesh.rotation.z = t * 0.08 * (i % 2 === 0 ? 1 : -1);
      mesh.material.opacity = 0.06 + Math.sin(t * 0.4 + i) * 0.02;
    });
  });

  return (
    <group>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          vertexColors
          transparent
          opacity={0.3}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {[
        [-2.2, 0.8, -2],
        [2.4, -0.6, -2.4],
        [0.2, 1.4, -3],
      ].map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            discs.current[i] = el;
          }}
          position={pos}
          rotation={[0.4, 0.2, 0.1]}
        >
          <circleGeometry args={[0.55 + i * 0.15, 48]} />
          <meshBasicMaterial
            color={i === 1 ? '#06B6D4' : '#2563EB'}
            transparent
            opacity={0.07}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function smooth(x, a, b) {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

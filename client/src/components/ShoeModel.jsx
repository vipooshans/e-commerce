import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const shoeUrl = '/assets/models/shoe.glb';

useGLTF.preload(shoeUrl);

/** Named explode offsets for key parts (easeInOut via scroll progress). */
const EXPLODE = {
  sole: new THREE.Vector3(0, -0.95, 0.2),
  midsole: new THREE.Vector3(0.15, -0.55, -0.4),
  upper: new THREE.Vector3(-0.55, 0.45, 0.15),
  upper_mesh: new THREE.Vector3(0.65, 0.55, 0.35),
  toe: new THREE.Vector3(1.05, -0.15, 0.35),
  heel: new THREE.Vector3(-1.1, 0.55, -0.25),
  tongue: new THREE.Vector3(0.05, 1.05, 0.55),
  laces: new THREE.Vector3(-0.25, 0.85, 0.95),
  lace_2: new THREE.Vector3(0.35, 0.7, 0.9),
  logo: new THREE.Vector3(0.85, 0.35, 0.75),
  swoosh: new THREE.Vector3(0.55, -0.35, 0.8),
};

function smoothstep(edge0, edge1, x) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Lazy-friendly GLB sneaker with scroll-driven float / rotate / explode / reassemble.
 */
export default function ShoeModel({ progress, parallax, reducedMotion = false }) {
  const { scene } = useGLTF(shoeUrl);
  const group = useRef(null);

  const parts = useMemo(() => {
    const cloned = scene.clone(true);
    const list = [];
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        list.push({
          mesh: child,
          name: child.name,
          rest: child.position.clone(),
          restRot: child.rotation.clone(),
          explode: EXPLODE[child.name] || child.position.clone().normalize().multiplyScalar(0.9),
        });
      }
    });
    return { root: cloned, list };
  }, [scene]);

  useFrame((state) => {
    const p = progress?.current ?? 0;
    const mouse = parallax?.current ?? { x: 0, y: 0 };
    const g = group.current;
    if (!g) return;

    const t = state.clock.elapsedTime;

    const idleY = reducedMotion ? 0 : Math.sin(t * 1.1) * 0.08;
    const idleSpin = reducedMotion ? 0 : t * 0.18;

    const camCloser = smoothstep(0, 0.2, p);
    const lift = smoothstep(0.2, 0.4, p);
    const sideProfile = smoothstep(0.4, 0.6, p);
    const explodeIn = smoothstep(0.6, 0.82, p);
    const reassemble = smoothstep(0.82, 1, p);
    const explodeAmt = explodeIn * (1 - reassemble);

    const baseRotY = -0.55 + idleSpin * (1 - camCloser * 0.85);
    const scrollRotY = THREE.MathUtils.degToRad(20) * camCloser
      + THREE.MathUtils.degToRad(70) * sideProfile
      + THREE.MathUtils.degToRad(45) * reassemble
      - THREE.MathUtils.degToRad(70) * sideProfile * reassemble;

    g.rotation.y = baseRotY + scrollRotY + mouse.x * 0.85;
    g.rotation.x = 0.22 + lift * 0.12 + sideProfile * 0.18 + mouse.y * 0.65;
    g.rotation.z = Math.sin(t * 0.4) * 0.03 * (1 - explodeAmt) + mouse.x * 0.15;

    g.position.y = idleY + lift * 0.45 - explodeAmt * 0.05;
    g.position.x = mouse.x * 0.15;
    g.scale.setScalar(THREE.MathUtils.lerp(1, 1.08, camCloser) * THREE.MathUtils.lerp(1, 1.12, reassemble));

    parts.list.forEach((part, i) => {
      part.mesh.position.x = THREE.MathUtils.lerp(
        part.mesh.position.x,
        part.rest.x + part.explode.x * explodeAmt,
        0.12
      );
      part.mesh.position.y = THREE.MathUtils.lerp(
        part.mesh.position.y,
        part.rest.y + part.explode.y * explodeAmt,
        0.12
      );
      part.mesh.position.z = THREE.MathUtils.lerp(
        part.mesh.position.z,
        part.rest.z + part.explode.z * explodeAmt,
        0.12
      );
      part.mesh.rotation.x = part.restRot.x + explodeAmt * (i % 2 === 0 ? 0.4 : -0.3);
      part.mesh.rotation.z = part.restRot.z + explodeAmt * (i % 3 === 0 ? -0.25 : 0.2);
    });
  });

  return (
    <group>
      <group ref={group} rotation={[0.2, -0.55, 0]} scale={1.05}>
        <primitive object={parts.root} />
      </group>
      <ContactShadows
        position={[0, -1.15, 0]}
        opacity={0.45}
        scale={8}
        blur={2.4}
        far={4}
      />
    </group>
  );
}


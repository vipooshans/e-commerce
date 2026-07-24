/**
 * Minimal glTF 2.0 binary (.glb) writer for axis-aligned boxes.
 * Avoids three/GLTFExporter Node FileReader issues.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PARTS = [
  { name: 'sole', size: [1.85, 0.16, 0.72], pos: [0, -0.38, 0], color: [0.96, 0.96, 0.96] },
  { name: 'midsole', size: [1.7, 0.14, 0.66], pos: [0.02, -0.26, 0], color: [0.92, 0.92, 0.92] },
  { name: 'upper', size: [1.25, 0.42, 0.58], pos: [-0.08, 0.02, 0], color: [0.77, 0.12, 0.23] },
  { name: 'upper_mesh', size: [0.85, 0.32, 0.52], pos: [0.22, 0.05, 0], color: [0.88, 0.11, 0.28] },
  { name: 'toe', size: [0.4, 0.26, 0.56], pos: [0.72, -0.12, 0], color: [0.77, 0.12, 0.23] },
  { name: 'heel', size: [0.42, 0.58, 0.56], pos: [-0.68, 0.1, 0], color: [0.55, 0.08, 0.16] },
  { name: 'tongue', size: [0.32, 0.42, 0.16], pos: [-0.12, 0.38, 0.14], color: [0.77, 0.12, 0.23] },
  { name: 'laces', size: [0.55, 0.08, 0.28], pos: [-0.02, 0.22, 0.22], color: [1, 1, 1] },
  { name: 'lace_2', size: [0.5, 0.06, 0.22], pos: [-0.02, 0.12, 0.24], color: [1, 1, 1] },
  { name: 'logo', size: [0.28, 0.12, 0.04], pos: [0.35, 0.02, 0.3], color: [0.07, 0.07, 0.07] },
  { name: 'swoosh', size: [0.45, 0.06, 0.03], pos: [0.15, -0.02, 0.3], color: [0.07, 0.07, 0.07] },
];

function boxGeometry(sx, sy, sz) {
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  // 24 unique verts (4 per face) for correct normals
  const positions = new Float32Array([
    // +Z
    -hx, -hy, hz, hx, -hy, hz, hx, hy, hz, -hx, hy, hz,
    // -Z
    hx, -hy, -hz, -hx, -hy, -hz, -hx, hy, -hz, hx, hy, -hz,
    // +Y
    -hx, hy, hz, hx, hy, hz, hx, hy, -hz, -hx, hy, -hz,
    // -Y
    -hx, -hy, -hz, hx, -hy, -hz, hx, -hy, hz, -hx, -hy, hz,
    // +X
    hx, -hy, hz, hx, -hy, -hz, hx, hy, -hz, hx, hy, hz,
    // -X
    -hx, -hy, -hz, -hx, -hy, hz, -hx, hy, hz, -hx, hy, -hz,
  ]);
  const normals = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
  ]);
  return { positions, normals, indices };
}

const binChunks = [];
let binOffset = 0;
const bufferViews = [];
const accessors = [];
const meshes = [];
const nodes = [];
const materials = [];

function align4(n) {
  return (n + 3) & ~3;
}

function pushBuffer(typedArray, target) {
  const byteOffset = binOffset;
  const bytes = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
  binChunks.push(bytes);
  binOffset += bytes.length;
  const pad = align4(binOffset) - binOffset;
  if (pad) {
    binChunks.push(Buffer.alloc(pad));
    binOffset += pad;
  }
  const viewIndex = bufferViews.length;
  bufferViews.push({
    buffer: 0,
    byteOffset,
    byteLength: bytes.length,
    target,
  });
  return viewIndex;
}

PARTS.forEach((part, i) => {
  const { positions, normals, indices } = boxGeometry(...part.size);

  const posView = pushBuffer(positions, 34962);
  const posMin = [-part.size[0] / 2, -part.size[1] / 2, -part.size[2] / 2];
  const posMax = [part.size[0] / 2, part.size[1] / 2, part.size[2] / 2];
  const posAcc = accessors.length;
  accessors.push({
    bufferView: posView,
    componentType: 5126,
    count: 24,
    type: 'VEC3',
    min: posMin,
    max: posMax,
  });

  const nrmView = pushBuffer(normals, 34962);
  const nrmAcc = accessors.length;
  accessors.push({
    bufferView: nrmView,
    componentType: 5126,
    count: 24,
    type: 'VEC3',
  });

  const idxView = pushBuffer(indices, 34963);
  const idxAcc = accessors.length;
  accessors.push({
    bufferView: idxView,
    componentType: 5123,
    count: 36,
    type: 'SCALAR',
  });

  const matIndex = materials.length;
  materials.push({
    name: `${part.name}_mat`,
    pbrMetallicRoughness: {
      baseColorFactor: [...part.color, 1],
      metallicFactor: 0.08,
      roughnessFactor: 0.45,
    },
  });

  const meshIndex = meshes.length;
  meshes.push({
    name: part.name,
    primitives: [
      {
        attributes: { POSITION: posAcc, NORMAL: nrmAcc },
        indices: idxAcc,
        material: matIndex,
      },
    ],
  });

  nodes.push({
    name: part.name,
    mesh: meshIndex,
    translation: part.pos,
  });
});

const rootNode = nodes.length;
nodes.push({
  name: 'Shoe',
  children: PARTS.map((_, i) => i),
});

const binBuffer = Buffer.concat(binChunks);

const gltf = {
  asset: { version: '2.0', generator: 'everbuy-shoe-glb' },
  scene: 0,
  scenes: [{ name: 'Scene', nodes: [rootNode] }],
  nodes,
  meshes,
  accessors,
  bufferViews,
  buffers: [{ byteLength: binBuffer.length }],
  materials,
};

const json = Buffer.from(JSON.stringify(gltf));
const jsonPad = (4 - (json.length % 4)) % 4;
const jsonChunk = Buffer.concat([json, Buffer.alloc(jsonPad, 0x20)]);

const binPad = (4 - (binBuffer.length % 4)) % 4;
const binChunk = Buffer.concat([binBuffer, Buffer.alloc(binPad)]);

const totalLength = 12 + 8 + jsonChunk.length + 8 + binChunk.length;
const out = Buffer.alloc(totalLength);
let o = 0;
out.writeUInt32LE(0x46546c67, o); o += 4; // magic glTF
out.writeUInt32LE(2, o); o += 4;
out.writeUInt32LE(totalLength, o); o += 4;
out.writeUInt32LE(jsonChunk.length, o); o += 4;
out.writeUInt32LE(0x4e4f534a, o); o += 4; // JSON
jsonChunk.copy(out, o); o += jsonChunk.length;
out.writeUInt32LE(binChunk.length, o); o += 4;
out.writeUInt32LE(0x004e4942, o); o += 4; // BIN
binChunk.copy(out, o);

const destinations = [path.resolve(__dirname, '../src/assets/models/shoe.glb'), path.resolve(__dirname, '../public/assets/models/shoe.glb'), path.resolve(__dirname, '../public/models/shoe.glb')];
for (const dest of destinations) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out);
  console.log('Wrote', dest, out.length, 'bytes');
}

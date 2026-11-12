#!/usr/bin/env node
/**
 * scripts/generate-icons.js
 * Generates valid PNG icons (192x192 and 512x512) with a beautiful heart design
 * using pure Node.js built-ins (zlib). No external npm dependencies required!
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../public/icons');

fs.mkdirSync(OUT_DIR, { recursive: true });

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * Checks whether point (nx, ny) normalized to [-1, 1] is inside a heart shape.
 * Heart implicit curve formula:
 * (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
 */
function isInsideHeart(nx, ny) {
  const x = nx * 1.25;
  const y = -ny * 1.25 + 0.15;
  const x2 = x * x;
  const y2 = y * y;
  const a = x2 + y2 - 1;
  return a * a * a - x2 * y * y2 <= 0;
}

/**
 * Generate RGBA PNG buffer for a given square size.
 */
function createHeartPng(size) {
  const width = size;
  const height = size;

  const rawBytesPerRow = 1 + width * 4;
  const rawBuffer = Buffer.alloc(rawBytesPerRow * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rawBytesPerRow;
    rawBuffer[rowOffset] = 0; // Filter byte: None

    const ny = (y / (height - 1)) * 2 - 1; // -1 to 1

    for (let x = 0; x < width; x++) {
      const nx = (x / (width - 1)) * 2 - 1; // -1 to 1
      const pixelOffset = rowOffset + 1 + x * 4;

      let samplesInside = 0;
      const subOffsets = [-0.25, 0.25];
      for (const dy of subOffsets) {
        for (const dx of subOffsets) {
          const sx = nx + (dx / (width - 1)) * 2;
          const sy = ny + (dy / (height - 1)) * 2;
          if (isInsideHeart(sx, sy)) {
            samplesInside++;
          }
        }
      }

      const heartCoverage = samplesInside / 4;

      const distFromCenter = Math.sqrt(nx * nx + ny * ny);
      const bgR = Math.max(13, Math.round(24 - distFromCenter * 10));
      const bgG = Math.max(10, Math.round(18 - distFromCenter * 8));
      const bgB = Math.max(18, Math.round(30 - distFromCenter * 12));

      const heartR = 196 + Math.round((1 - distFromCenter) * 35);
      const heartG = 85 + Math.round((1 - distFromCenter) * 20);
      const heartB = 106 + Math.round((1 - distFromCenter) * 25);

      const finalR = Math.round(bgR * (1 - heartCoverage) + heartR * heartCoverage);
      const finalG = Math.round(bgG * (1 - heartCoverage) + heartG * heartCoverage);
      const finalB = Math.round(bgB * (1 - heartCoverage) + heartB * heartCoverage);

      rawBuffer[pixelOffset] = finalR;
      rawBuffer[pixelOffset + 1] = finalG;
      rawBuffer[pixelOffset + 2] = finalB;
      rawBuffer[pixelOffset + 3] = 255;
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);

  const compressed = zlib.deflateSync(rawBuffer, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

for (const size of [192, 512]) {
  const buf = createHeartPng(size);
  const outPath = path.resolve(OUT_DIR, `icon-${size}.png`);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated icon-${size}.png (${buf.length} bytes)`);
}

console.log('Done generating PNG icons!');

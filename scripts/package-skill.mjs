// Packs skills/<name>/ into dist-skills/<name>.zip for importing into ChatGPT or Claude.
// No dependencies: writes a standard zip (deflate) with forward-slash paths.
// Usage: npm run skill:zip            (packs every folder in skills/)
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { deflateRawSync, crc32 } from 'node:zlib';

const SKILLS = 'skills';
const OUT = 'dist-skills';

const files = dir => readdirSync(dir).flatMap(f => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? files(p) : [p];
});

function zip(entries) {
  const local = [], central = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8');
    const packed = deflateRawSync(data);
    const crc = crc32(data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);   // local file header
    header.writeUInt16LE(20, 4);           // version needed
    header.writeUInt16LE(0x0800, 6);       // UTF-8 names
    header.writeUInt16LE(8, 8);            // deflate
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(packed.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(nameBuf.length, 26);
    local.push(header, nameBuf, packed);

    const dir = Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50, 0);      // central directory header
    dir.writeUInt16LE(20, 4);
    dir.writeUInt16LE(20, 6);
    dir.writeUInt16LE(0x0800, 8);
    dir.writeUInt16LE(8, 10);
    dir.writeUInt32LE(crc, 16);
    dir.writeUInt32LE(packed.length, 20);
    dir.writeUInt32LE(data.length, 24);
    dir.writeUInt16LE(nameBuf.length, 28);
    dir.writeUInt32LE(offset, 42);
    central.push(dir, nameBuf);
    offset += header.length + nameBuf.length + packed.length;
  }
  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);        // end of central directory
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, centralBuf, end]);
}

mkdirSync(OUT, { recursive: true });
for (const name of readdirSync(SKILLS).filter(f => statSync(join(SKILLS, f)).isDirectory())) {
  const root = join(SKILLS, name);
  if (!readdirSync(root).includes('SKILL.md')) throw new Error(`${root} has no SKILL.md`);
  const entries = files(root).sort().map(p => ({
    name: `${name}/${relative(root, p).split(sep).join('/')}`,
    data: readFileSync(p),
  }));
  const out = join(OUT, `${name}.zip`);
  writeFileSync(out, zip(entries));
  console.log(`${out}: ${entries.length} files`);
}

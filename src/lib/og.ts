import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { OG_HEIGHT, OG_WIDTH } from '../data/og';

// Branded 1200×630 link-preview images (Open Graph), rendered at build time:
// the page photo, darkened, with the logo, a headline and the domain.

// Paths are resolved from the project root: this module is bundled before it runs
const ROOT = process.cwd();
const require = createRequire(join(ROOT, 'package.json'));
const font = (file: string) => readFile(require.resolve(`@fontsource/${file.split('-')[0]}/files/${file}`));

// Same fonts as the site: Onest for the headline, Jost for the small text.
// Separate names per subset: satori uses one file per family+weight, then falls back by glyph.
const fontsPromise = Promise.all([
  font('onest-latin-600-normal.woff'), font('onest-cyrillic-600-normal.woff'),
  font('jost-latin-500-normal.woff'), font('jost-cyrillic-500-normal.woff'),
]).then(([ol, oc, jl, jc]) => [
  { name: 'Onest Latin', data: ol, weight: 600 as const },
  { name: 'Onest Cyrillic', data: oc, weight: 600 as const },
  { name: 'Jost Latin', data: jl, weight: 500 as const },
  { name: 'Jost Cyrillic', data: jc, weight: 500 as const },
]);

const dataUri = (mime: string, buf: Buffer) => `data:${mime};base64,${buf.toString('base64')}`;

type El = { type: string; props: Record<string, unknown> & { style?: Record<string, unknown>; children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, props: Record<string, unknown> = {}): El =>
  ({ type, props: { ...props, style, children } });

export type OgInput = {
  eyebrow: string;
  title: string;
  /** Photo name in src/assets/photos */
  photo: string;
};

export async function renderOg({ eyebrow, title, photo: photoName }: OgInput): Promise<Buffer> {
  const [fonts, photo, logo] = await Promise.all([
    fontsPromise,
    sharp(join(ROOT, 'src/assets/photos', `${photoName}.jpg`)).resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer(),
    readFile(join(ROOT, 'public/assets/celebris-logo-light.svg')),
  ]);

  const tree = h('div', { width: OG_WIDTH, height: OG_HEIGHT, display: 'flex', position: 'relative', fontFamily: 'Jost Latin, Jost Cyrillic', fontWeight: 500, color: '#f2f1ec' }, [
    h('img', { position: 'absolute', inset: 0, width: OG_WIDTH, height: OG_HEIGHT, objectFit: 'cover' }, undefined,
      { src: dataUri('image/jpeg', photo), width: OG_WIDTH, height: OG_HEIGHT }),
    h('div', {
      position: 'absolute', inset: 0, display: 'flex',
      backgroundImage: 'linear-gradient(90deg, rgba(12,12,14,0.94) 0%, rgba(12,12,14,0.82) 50%, rgba(12,12,14,0.35) 100%)',
    }),
    h('div', { position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 72px', width: '100%' }, [
      h('img', { height: 132, width: 110 }, undefined, { src: dataUri('image/svg+xml', logo), height: 132, width: 110 }),
      h('div', { display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 860 }, [
        h('div', { display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, fontWeight: 500, letterSpacing: 4, textTransform: 'uppercase', color: '#c9ad78' }, [
          h('div', { width: 44, height: 2, backgroundColor: '#c9ad78' }),
          eyebrow,
        ]),
        h('div', { display: 'flex', fontFamily: 'Onest Latin, Onest Cyrillic', fontSize: title.length > 40 ? 56 : 68, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1.5 }, title),
      ]),
      h('div', { display: 'flex', fontSize: 26, fontWeight: 500, color: '#c9ad78' }, 'celebrisvibe.com'),
    ]),
  ]);

  const svg = await satori(tree as never, { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
  return sharp(png).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}

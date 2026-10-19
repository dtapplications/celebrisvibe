import type { ImageMetadata } from 'astro';

// Photos live in src/assets/photos so Astro can resize them and convert them to AVIF/WebP.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });

export function photo(name: string): ImageMetadata {
  const file = files[`../assets/photos/${name}.jpg`];
  if (!file) throw new Error(`Unknown photo "${name}" (expected src/assets/photos/${name}.jpg)`);
  return file.default;
}

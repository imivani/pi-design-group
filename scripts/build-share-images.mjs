// Builds the 1200 x 630 JPEG link-preview images in public/media/share.
// Run: node --experimental-strip-types scripts/build-share-images.mjs
// Previews show the page title beside the image, so these stay photograph-only.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { projects, media } from '../src/data/projects.ts';

const out = new URL('../public/media/share/', import.meta.url);
const source = path => new URL('../public' + path, import.meta.url).pathname;
await mkdir(out, { recursive: true });

const pages = [
  { name: 'home', src: media.heroPoster, position: 'centre' },
  { name: 'about', src: '/media/gallery/darcy/usb-img_2484.webp', position: 'centre' },
  { name: 'contact', src: media.featured, position: 'centre' },
  ...projects.map(project => ({ name: project.id, src: project.image, position: 'attention' })),
];

for (const page of pages) {
  await sharp(source(page.src))
    .resize(1200, 630, { fit: 'cover', position: page.position })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(new URL(page.name + '.jpg', out).pathname);
}
console.log(`Wrote ${pages.length} share images to public/media/share/`);

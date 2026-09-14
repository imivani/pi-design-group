import fs from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const audit = JSON.parse(await fs.readFile(path.join(root, 'design/site-audit.json'), 'utf8'));
const source = await fs.readFile(path.join(root, 'src/data/projects.ts'), 'utf8');
const projects = JSON.parse(source.split('export const projects: Project[] = ')[1].split(/;\r?\n/)[0]);
const result = {};
const report = [];
const attribute = (tag, name) => tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1]?.replaceAll('&amp;', '&');
let cursor = 0;
await Promise.all(Array.from({length:3}, async () => {
  while (cursor < projects.length) {
    const project = projects[cursor++];
    const response = await fetch(project.url);
    if (!response.ok) throw new Error(`${project.name}: ${response.status}`);
    const html = await response.text();
    const page = audit.pages.find(page => page.url === project.url);
    const images = [...html.matchAll(/<img\b[\s\S]*?>/g)].map(([tag]) => ({ source:attribute(tag,'data-src') || attribute(tag,'src'), dimensions:attribute(tag,'data-image-dimensions') })).filter(image => image.source?.startsWith('https://images.squarespace-cdn.com/content/'));
    const unique = [...new Map(images.map(image => [image.source.split('?')[0], image])).values()];
    const cover = { source:page.cover.src, dimensions:page.cover.dimensions };
    const selected = [cover, ...unique.filter(image => image.source.split('?')[0] !== cover.source.split('?')[0])].slice(0,8);
    const folder = path.join(root, 'public/media/gallery', project.id);
    await fs.mkdir(folder, {recursive:true});
    const gallery = [];
    for (const [index,image] of selected.entries()) {
      const output = path.join(folder, `${index+1}.webp`);
      let metadata;
      try { metadata = await sharp(output).metadata(); }
      catch {
        const response = await fetch(image.source);
        if (!response.ok) throw new Error(`${project.name} image ${index+1}: ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        await sharp(buffer).rotate().resize({width:1920,withoutEnlargement:true}).webp({quality:86}).toFile(output);
        metadata = await sharp(output).metadata();
      }
      const medium = index === 0 ? project.imageKind : 'image';
      gallery.push({ src:`/media/gallery/${project.id}/${index+1}.webp`, width:metadata.width, height:metadata.height, source:image.source, medium, caption:index===0 ? project.alt : `${project.name}, project view ${index+1}` });
      report.push({project:project.id,index:index+1,path:gallery.at(-1).src,source:image.source,bytes:(await fs.stat(output)).size});
    }
    result[project.id] = gallery;
    console.log(`${project.name}: ${gallery.length} images`);
  }
}));
await fs.writeFile(path.join(root,'src/data/galleries.json'),JSON.stringify(result,null,2)+'\n');
await fs.writeFile(path.join(root,'design/project-media-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Saved ${report.length} real project images.`);

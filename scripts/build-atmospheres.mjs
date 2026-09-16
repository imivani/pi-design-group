import sharp from 'sharp';import fs from 'node:fs';import {projects,media} from '../src/data/projects.ts';
fs.mkdirSync('public/media/atmospheres',{recursive:true});
const sources=[...projects.map(p=>p.image),media.featured,'/media/gallery/darcy/usb-img_2484.webp','/media/gallery/seton-crossing/2.webp'];const mapping={};
for(const src of new Set(sources)){const name=src.replace(/^\/media\//,'').replaceAll('/','-').replace(/\.[^.]+$/,'.webp');const path='/media/atmospheres/'+name;await sharp('public'+src).resize({width:480,withoutEnlargement:true}).blur(6).modulate({brightness:.42,saturation:.65}).webp({quality:72}).toFile('public'+path);mapping[src]=path;}
fs.writeFileSync('src/data/atmospheres.json',JSON.stringify(mapping,null,2));console.log(Object.keys(mapping).length+' lightweight backgrounds generated');

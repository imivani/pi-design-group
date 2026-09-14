import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const galleries = JSON.parse(await fs.readFile('src/data/galleries.json','utf8'));
const browser = await chromium.launch({channel:'chrome'});
const page = await browser.newPage({viewport:{width:1760,height:1600}});
await page.goto('http://127.0.0.1:4321/');
const entries = Object.entries(galleries);
for(let part=0;part<Math.ceil(entries.length/7);part++){
  const subset=entries.slice(part*7,part*7+7);
  await page.setContent(`<html><head><style>body{font:16px Arial;margin:20px}section{margin:0 0 18px}h2{font-size:19px;margin:0 0 8px}div{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}figure{margin:0}img{width:100%;height:138px;object-fit:contain;background:#eee}figcaption{font-size:12px}</style></head><body>${subset.map(([id,images])=>`<section><h2>${id}</h2><div>${images.map((img,i)=>`<figure><img src="http://127.0.0.1:4321${img.src}"><figcaption>${i+1} ${img.medium}</figcaption></figure>`).join('')}</div></section>`).join('')}</body></html>`);
  await page.evaluate(async()=>await Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))));
  await page.screenshot({path:`design/review/gallery-audit-${part+1}.png`,fullPage:true});
}
await browser.close();

import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const browser = await chromium.launch({channel:'chrome'});
const context = await browser.newContext();
await context.addInitScript(()=>localStorage.setItem('pi-motion','off'));
const page = await context.newPage();
const results=[],errors=[];
page.on('pageerror',error=>errors.push(error.message));
for(const route of ['crestmontwest','seton','rona','crimsonridgezen','miscresidential']) {
  for(const width of [320,390,768,1440,1920]) {
    await page.setViewportSize({width,height:width<768?844:1000});
    await page.goto('http://127.0.0.1:4321/'+route);
    const result=await page.evaluate(async()=>{
      document.querySelectorAll('img[src]').forEach(img=>img.loading='eager');
      await Promise.all([...document.images].filter(img=>img.hasAttribute('src')).map(img=>img.decode().catch(()=>{})));
      const image=document.querySelector('.primary-figure .gallery-link').getBoundingClientRect();
      const links=[...document.querySelectorAll('.gallery-link')];
      const ids=links.map(el=>el.dataset.galleryIndex);
      return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,firstImageTop:image.top,firstImageVisible:Math.min(innerHeight,image.bottom)-image.top,uniqueImages:new Set(ids).size===ids.length,broken:links.filter(el=>!el.querySelector('img')?.naturalWidth).length};
    });
    results.push({route,...result});
    if(width===1440||width===390)await page.screenshot({path:`design/review/${width===1440?'desktop':'mobile'}-${route}-opening.png`});
    if(width===1440&&route!=='crestmontwest')await page.screenshot({path:`design/review/desktop-${route}-full.png`,fullPage:true});
  }
}
await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4321/crestmontwest');
await page.locator('.project-drawings').scrollIntoViewIfNeeded();
await page.locator('.project-drawings').evaluate(async element=>{await Promise.all([...element.querySelectorAll('img')].map(img=>img.decode()));});
await page.screenshot({path:'design/review/desktop-project-drawing-story.png'});
await fs.writeFile('design/review/project-layout-review.json',JSON.stringify({date:new Date().toISOString(),results,errors},null,2));
await browser.close();
const failed=results.filter(row=>row.overflow||row.broken||!row.uniqueImages||row.firstImageVisible<180);
console.log(JSON.stringify({reviewed:results.length,errors,failed}));
if(failed.length||errors.length)process.exitCode=1;

import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const out = new URL('../design/review/', import.meta.url);
const shot = name => fileURLToPath(new URL(name, out));
await fs.mkdir(out,{recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('pi-motion','off'));
await page.goto('http://127.0.0.1:4321');
await page.waitForSelector('html[data-enhanced]');
await page.evaluate(async()=>{
  document.querySelectorAll('img').forEach(img=>img.loading='eager');
  await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));
});
await page.screenshot({path:shot('desktop-full.png'),fullPage:true});
await page.screenshot({path:shot('desktop-hero.png')});
await page.locator('[data-menu-trigger="projects"]').click();
await page.screenshot({path:shot('desktop-project-menu.png')});
await page.keyboard.press('Escape');
await page.locator('[data-menu-trigger="services"]').click();
await page.screenshot({path:shot('desktop-service-menu.png')});
await page.keyboard.press('Escape');
await page.mouse.click(12,96);
for (const [name,selector] of [['services','#services'],['featured','#featured'],['details','#why'],['catalogue','#projects'],['contact','#contact']]){
  await page.locator(selector).evaluate(el=>el.scrollIntoView({block:'start'}));
  await page.waitForTimeout(120);
  await page.screenshot({path:shot('desktop-'+name+'.png')});
}
const client=await page.context().newCDPSession(page);
await client.send('DOM.enable');
await client.send('CSS.enable');
const {root}=await client.send('DOM.getDocument');
const {nodeId}=await client.send('DOM.querySelector',{nodeId:root.nodeId,selector:'h1'});
const fonts=await client.send('CSS.getPlatformFontsForNode',{nodeId});
await page.setViewportSize({width:390,height:844});
await page.goto('http://127.0.0.1:4321');
await page.evaluate(async()=>{
  document.querySelectorAll('img').forEach(img=>img.loading='eager');
  await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));
});
await page.screenshot({path:shot('mobile-hero.png')});
await page.screenshot({path:shot('mobile-full.png'),fullPage:true});
await page.locator('.mobile-menu-button').click();
await page.screenshot({path:shot('mobile-menu.png')});
await page.keyboard.press('Escape');
await page.mouse.click(5,96);
for(const [name,selector]of [['services','#services'],['featured','#featured'],['details','#why'],['catalogue','#projects'],['contact','#contact']]){
  await page.locator(selector).evaluate(el=>el.scrollIntoView({block:'start'}));
  await page.waitForTimeout(120);
  await page.screenshot({path:shot('mobile-'+name+'.png')});
}
for(const [name,width,height]of [['desktop',1440,1000],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4321/crestmontwest');
  await page.evaluate(async()=>{document.querySelectorAll('img').forEach(img=>{if(img.src)img.loading='eager';});await Promise.all([...document.images].filter(img=>img.src).map(img=>img.decode().catch(()=>{})));});
  await page.screenshot({path:shot(name+'-project-opening.png')});
  await page.screenshot({path:shot(name+'-project-full.png'),fullPage:true});
  await page.locator('[data-gallery-index="1"]').click();await page.locator('#viewer-image').waitFor({state:'visible'});
  await page.screenshot({path:shot(name+'-project-viewer.png')});await page.keyboard.press('Escape');
}
await fs.writeFile(new URL('browser-review.json',out),JSON.stringify({fonts,errors,date:new Date().toISOString()},null,2));
await browser.close();
console.log(JSON.stringify({captured:true,fonts,errors}));

import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome'});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:'design/review/recordings',size:{width:1440,height:900}}});
const page=await context.newPage();
const errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{
  localStorage.setItem('pi-motion','system');
  window.addEventListener('pagereveal',event=>{
    if(event.viewTransition) requestAnimationFrame(()=>sessionStorage.setItem('pi-review-transition',JSON.stringify({path:location.pathname,photo:document.querySelector('[data-primary-project]')?.style.viewTransitionName,at:Date.now()})));
  });
});
await page.goto('http://127.0.0.1:4321/');await page.waitForTimeout(1000);
await page.locator('[data-menu-trigger="projects"]').click();await page.waitForTimeout(550);
await page.locator('[data-menu-trigger="services"]').click();await page.waitForTimeout(550);await page.keyboard.press('Escape');
await page.mouse.move(20,700);await page.mouse.wheel(0,760);await page.waitForTimeout(650);
await page.mouse.wheel(0,390);await page.waitForTimeout(650);
await page.locator('[data-service-panel="commercial"]').hover();await page.waitForTimeout(750);
await page.locator('[data-service-panel="parks"]').hover();await page.waitForTimeout(750);
await page.mouse.move(15,500);
for(let i=0;i<8;i++){await page.mouse.wheel(0,430);await page.waitForTimeout(500);}
await page.locator('#projects').evaluate(el=>el.scrollIntoView({behavior:'smooth'}));await page.waitForTimeout(700);
await page.locator('[data-filter="commercial"]').click();await page.waitForTimeout(400);
await page.locator('button[data-view="index"]').click();await page.waitForTimeout(500);
await page.locator('button[data-view="grid"]').click();await page.waitForTimeout(500);
await page.locator('[data-project="seton-crossing"] a').click();await page.waitForTimeout(650);
const transition=await page.evaluate(()=>sessionStorage.getItem('pi-review-transition'));
await page.locator('[data-gallery-index="0"]').click();await page.waitForTimeout(650);
await page.keyboard.press('ArrowRight');await page.waitForTimeout(450);await page.keyboard.press('ArrowRight');await page.waitForTimeout(450);
await page.keyboard.press('Escape');await page.waitForTimeout(300);
await page.mouse.wheel(0,720);await page.waitForTimeout(600);
await page.mouse.wheel(0,620);await page.waitForTimeout(600);
await context.close();
await page.video().saveAs('design/review/desktop-motion.webm');
await browser.close();
await fs.writeFile('design/review/motion-review.json',JSON.stringify({date:new Date().toISOString(),errors,transition:JSON.parse(transition||'null')},null,2));
console.log(JSON.stringify({errors,transition}));

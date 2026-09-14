import { chromium } from '@playwright/test';
import { mkdir, writeFile, rename } from 'node:fs/promises';

const dir='design/review';
await mkdir(`${dir}/project-arrival-recording`,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference',recordVideo:{dir:`${dir}/project-arrival-recording`,size:{width:1440,height:1000}}});
await context.addInitScript(()=>{
  localStorage.setItem('pi-motion','system');
  document.addEventListener('pi:project-arrival',event=>{
    const log=JSON.parse(sessionStorage.getItem('arrival-recording')||'[]');
    const animation=event.detail.phase;
    const image=document.querySelector('[data-primary-project]');
    log.push({path:location.pathname,animation,image:image?.getAttribute('src'),photoIdentity:image?.style.viewTransitionName,titleIdentity:document.querySelector('.project-title-row')?.style.viewTransitionName,time:performance.now()});
    sessionStorage.setItem('arrival-recording',JSON.stringify(log));
  });
});
const page=await context.newPage();
await page.goto('http://127.0.0.1:4321/');
await page.waitForTimeout(900);
await page.locator('[data-menu-trigger="projects"]').hover();
await page.waitForTimeout(650);
const link=page.locator('.project-menu-preview[data-project-card="darcy"]');
await link.hover();
await page.waitForTimeout(550);
await page.screenshot({path:`${dir}/project-arrival-menu.png`});
await link.click();
await page.waitForURL('**/darcy');
await page.screenshot({path:`${dir}/project-arrival-during.png`});
await page.waitForTimeout(800);
await page.screenshot({path:`${dir}/project-arrival-complete.png`});
const report={desktop:await page.evaluate(()=>({events:JSON.parse(sessionStorage.getItem('arrival-recording')||'[]'),state:document.documentElement.dataset.projectArrival,remainingNames:document.querySelectorAll('[data-pi-transition]').length,overflow:document.documentElement.scrollWidth>innerWidth}))};
await page.waitForTimeout(500);
const video=page.video();
await context.close();
await rename(await video.path(),`${dir}/project-arrival-motion.webm`);
for(const width of [390,320]){
  const mobile=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
  const phone=await mobile.newPage();
  await phone.goto('http://127.0.0.1:4321/darcy');
  await phone.waitForTimeout(900);
  await phone.screenshot({path:`${dir}/project-arrival-${width}.png`,fullPage:false});
  report[width]=await phone.evaluate(()=>({state:document.documentElement.dataset.projectArrival,overflow:document.documentElement.scrollWidth>innerWidth,title:getComputedStyle(document.querySelector('.project-title-row')).opacity,photograph:getComputedStyle(document.querySelector('.project-hero-gallery')).opacity}));
  await mobile.close();
}
await writeFile(`${dir}/project-arrival-report.json`,JSON.stringify(report,null,2));
await browser.close();
console.log(JSON.stringify(report,null,2));

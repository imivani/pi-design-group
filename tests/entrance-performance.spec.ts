import {test,expect} from '@playwright/test';
for(const path of ['about','contact'])test(`${path} entrance starts before its module and never restarts`,async({page})=>{
 await page.addInitScript(()=>{(window as any).starts=[];document.addEventListener('animationstart',event=>{if(event.animationName==='pi-page-arrive')(window as any).starts.push({tag:(event.target as Element).tagName,at:performance.now(),opacity:getComputedStyle(event.target as Element).opacity});});});
 await page.route(`**/src/scripts/${path==='about'?'about':'contact-page'}.ts*`,async route=>{await new Promise(r=>setTimeout(r,2400));await route.continue();});
 await page.goto('/'+path);
 await expect.poll(()=>page.evaluate(()=>(window as any).starts.length)).toBe(path==='about'?4:2);
 const starts=await page.evaluate(()=>(window as any).starts);
 expect(starts.length).toBe(path==='about'?4:2);
 expect(starts.every((s:any)=>Number(s.opacity)<.1)).toBe(true);
 await expect(page.locator(path==='about'?'#about-title':'.inquiry-content')).toHaveCSS('opacity','1');
 await page.waitForTimeout(2600);expect(await page.evaluate(()=>(window as any).starts.length)).toBe(starts.length);
});
test('icons fit narrow screens and decorative backgrounds avoid live blur',async({page})=>{
 await page.setViewportSize({width:320,height:900});await page.goto('/');
 await expect(page.locator('.project-filters button svg')).toHaveCount(4);
 await expect(page.locator('.service-title svg')).toHaveCount(3);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.locator('.featured-atmosphere')).toHaveCSS('filter','none');
 await expect(page.locator('[data-featured-background]')).toHaveAttribute('src',/\/atmospheres\//);
});


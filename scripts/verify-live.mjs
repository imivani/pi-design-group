import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium, expect as playwrightExpect } from '@playwright/test';

const expect = playwrightExpect.configure({ timeout: 20000 });

const supplied=process.argv[2];
assert(supplied,'Usage: node scripts/verify-live.mjs https://your-deployment.example/');
const target=new URL(supplied);
assert(['https:','http:'].includes(target.protocol),'Use an HTTP(S) website URL.');
assert(!target.username&&!target.password&&!target.search,'Use the public URL without credentials or query tokens.');
target.hash='';
if(!target.pathname.endsWith('/'))target.pathname+='/';
const base=target.pathname;
const normalPath=path=>path.replace(/\/$/,'')||'/';
const output='design/review';
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const errors=[];
const report={url:target.href,checks:{},mobile:[],errors};
let activePage;
const observe=(page,label)=>{
  page.setDefaultTimeout(20000);
  page.on('pageerror',error=>errors.push({page:label,error:error.message}));
  page.on('response',response=>{
    const url=new URL(response.url());
    if(url.origin===target.origin&&response.status()>=400)errors.push({page:label,status:response.status(),path:url.pathname});
  });
};
const readyImage=locator=>expect.poll(()=>locator.evaluate(image=>image.complete&&image.naturalWidth>0),{timeout:20000}).toBe(true);
const noOverflow=page=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
const homeReady=page=>expect(page.locator('html')).toHaveAttribute('data-enhanced','true');
const progress=phase=>console.log(JSON.stringify({phase}));

try{
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
  await context.addInitScript(()=>{
    localStorage.setItem('pi-motion','system');
    window.liveHomeEntrances=[];
    document.addEventListener('pi:home-return',event=>window.liveHomeEntrances.push(event.detail.phase));
  });
  const page=activePage=await context.newPage();
  observe(page,'desktop');
  const response=await page.goto(target.href,{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200,'The public homepage must be accessible without a login.');
  await homeReady(page);
  assert.equal(new URL(page.url()).origin,target.origin,'The URL redirected away from the website.');
  await expect(page.locator('#hero-title')).toBeVisible();
  await readyImage(page.locator('.hero-poster'));
  await expect.poll(()=>page.locator('#hero-video').evaluate(video=>video.readyState>=2&&!video.paused),{timeout:25000}).toBe(true);
  const videoURL=await page.locator('#hero-video').evaluate(video=>video.currentSrc||video.src||video.dataset.src);
  const videoResponse=await page.request.get(videoURL,{headers:{Range:'bytes=0-1023'}});
  assert([200,206].includes(videoResponse.status()),'The hero video asset must be available.');
  assert.match(videoResponse.headers()['content-type']||'',/^video\/mp4/);
  report.checks.homeVideo={playing:true,rangeSupported:videoResponse.status()===206};
  assert(await noOverflow(page),'Desktop homepage overflows horizontally.');
  await page.screenshot({path:`${output}/live-desktop-hero.png`});
  progress('Homepage and video passed');

  const links=await page.locator('#project-collection .project-link').evaluateAll(elements=>elements.map(element=>({href:element.href,id:element.dataset.projectCard})));
  assert.equal(links.length,27);
  assert.equal(new Set(links.map(link=>link.href)).size,27);
  for(let offset=0;offset<links.length;offset+=4){
    await Promise.all(links.slice(offset,offset+4).map(async link=>{
      assert.equal(new URL(link.href).origin,target.origin);
      assert(new URL(link.href).pathname.startsWith(base));
      const result=await page.request.get(link.href);
      assert.equal(result.status(),200,`Project route ${link.id} is unavailable.`);
      assert((await result.text()).includes(`data-project-id="${link.id}"`),`Project route ${link.id} returned the wrong page.`);
    }));
  }
  report.checks.projectRoutes=27;
  progress('All 27 direct project routes passed');

  await page.locator('.featured-media').evaluate(element=>element.scrollIntoView({block:'center',behavior:'instant'}));
  await page.mouse.move(1,1);
  await expect(page.locator('#featured')).toHaveCSS('background-color','rgb(27, 28, 29)');
  await expect(page.locator('#featured')).toHaveAttribute('data-featured-autoplay','running');
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src',base+'media/gallery/crestmont-west/7.webp',{timeout:16000});
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src',base+'media/gallery/crestmont-west/4.webp');
  await readyImage(page.locator('[data-featured-image]'));
  await readyImage(page.locator('[data-featured-detail]'));
  await expect(page.locator('.featured-outgoing')).toHaveCount(0);
  await page.locator('[data-featured-view="planting"]').click();
  await expect(page.locator('[data-featured-image]')).toHaveAttribute('src',base+'media/gallery/crestmont-west/8.webp');
  await expect(page.locator('[data-featured-detail]')).toHaveAttribute('src',base+'media/gallery/crestmont-west/5.webp');
  await readyImage(page.locator('[data-featured-detail]'));
  await page.locator('[data-featured-autoplay-toggle]').click();
  await expect(page.locator('[data-featured-autoplay-toggle]')).toHaveAttribute('aria-label','Resume automatic featured views');
  await page.locator('#featured').screenshot({path:`${output}/live-desktop-featured.png`});
  report.checks.featured={autoplay:true,manualPairedPhotographs:true,pause:true};

  await page.locator('#site-header [data-project-search]').click();
  await expect(page.locator('#site-search-dialog')).toBeVisible();
  await page.locator('#site-search-input').fill('D’Arcy');
  await expect(page.locator('[data-search-project]:visible')).toHaveCount(2);
  await page.locator('[data-search-project="darcy"]').click();
  await expect(page).toHaveURL(url=>normalPath(url.pathname)===normalPath(base+'darcy'));
  await expect(page.locator('#project-title')).toHaveText('D’Arcy');
  await expect(page.locator('html')).toHaveAttribute('data-project-arrival',/^(done|skipped)$/);
  await readyImage(page.locator('#project-opening-image'));
  await expect(page.locator('.project-specification')).toHaveCount(1);
  await expect(page.locator('.next-project')).toHaveCSS('background-color','rgb(27, 28, 29)');
  await page.locator('.next-project').scrollIntoViewIfNeeded();
  await page.locator('.next-project').screenshot({path:`${output}/live-desktop-next-project.png`});
  await page.locator('.next-project [data-back-projects]').click();
  await expect(page).toHaveURL(url=>normalPath(url.pathname)===normalPath(base)&&url.hash==='#projects');
  await homeReady(page);
  await expect(page.locator('#project-collection .project-link')).toHaveCount(27);
  await page.goto(new URL(base+'darcy',target.origin).href,{waitUntil:'domcontentloaded'});
  await page.locator('#site-header .site-wordmark').click();
  await expect(page).toHaveURL(url=>normalPath(url.pathname)===normalPath(base)&&url.hash==='#hero');
  await expect(page.locator('html')).toHaveAttribute('data-home-return','done');
  const entrances=await page.evaluate(()=>window.liveHomeEntrances);
  assert.equal(entrances.length,1);
  assert(['native','fallback'].includes(entrances[0]));
  await expect(page.locator('.hero-copy')).toHaveCSS('opacity','1');
  report.checks.navigation={search:true,projectOpening:true,backToArchive:true,earlyLogoReturn:true,darkNextProject:true};
  await context.close();
  progress('Featured slideshow, search, project and return navigation passed');

  for(const width of [390,320]){
    const mobile=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
    const phone=activePage=await mobile.newPage();
    observe(phone,`mobile-${width}`);
    await phone.goto(target.href,{waitUntil:'domcontentloaded'});
    await homeReady(phone);
    await expect(phone.locator('#hero-title')).toBeVisible();
    await readyImage(phone.locator('.hero-poster'));
    assert(await noOverflow(phone),`Homepage overflows at ${width}px.`);
    await phone.screenshot({path:`${output}/live-mobile-${width}-hero.png`});
    await phone.locator('#featured').scrollIntoViewIfNeeded();
    await readyImage(phone.locator('[data-featured-image]'));
    await phone.locator('#featured').screenshot({path:`${output}/live-mobile-${width}-featured.png`});
    await phone.locator('.mobile-menu-button').click();
    await expect(phone.locator('#mobile-navigation')).toBeVisible();
    await phone.locator('#mobile-navigation [data-project-search]').click();
    await expect(phone.locator('#site-search-dialog')).toBeVisible();
    await phone.locator('#site-search-input').fill('D’Arcy');
    await phone.locator('[data-search-project="darcy"]').click();
    await expect(phone.locator('#project-title')).toHaveText('D’Arcy');
    await expect(phone.locator('html')).toHaveAttribute('data-project-arrival',/^(done|skipped)$/);
    await readyImage(phone.locator('#project-opening-image'));
    assert(await noOverflow(phone),`Project page overflows at ${width}px.`);
    await phone.screenshot({path:`${output}/live-mobile-${width}-project.png`});
    report.mobile.push({width,overflow:false,search:true,project:true});
    await mobile.close();
  }
  assert.deepEqual(errors,[],'The browser reported errors or unavailable site assets.');
  report.passed=true;
  await fs.writeFile(`${output}/live-verification-report.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
}catch(error){
  report.passed=false;
  report.failure=error.message;
  await fs.writeFile(`${output}/live-verification-report.json`,JSON.stringify(report,null,2));
  if(activePage&&!activePage.isClosed())await activePage.screenshot({path:`${output}/live-failure.png`}).catch(()=>{});
  throw error;
}finally{await browser.close();}

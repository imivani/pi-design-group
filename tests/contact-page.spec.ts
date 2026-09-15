import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('contact choices preview real images and reveal a form without losing typed details',async({page})=>{
 await page.goto('/contact');
 await expect(page.locator('#inquiry-fields')).toHaveAttribute('inert','');
 await page.getByText('Commercial Plazas',{exact:true}).last().hover();
 await expect(page.locator('#inquiry-photo-caption')).toContainText('Seton Crossing');
 await expect(page.getByRole('radio',{name:'Commercial Plazas',exact:true})).not.toBeChecked();
 await page.getByRole('radio',{name:'Commercial Plazas',exact:true}).check();
 await expect(page.locator('#inquiry-fields')).toHaveAttribute('data-open','true');
 await expect(page.locator('.inquiry-prompt')).toBeHidden();
 await page.getByRole('textbox',{name:'Name',exact:true}).fill('Test Visitor');
 await page.getByRole('radio',{name:'Public Parks',exact:true}).check();
 await expect(page.getByRole('textbox',{name:'Name',exact:true})).toHaveValue('Test Visitor');
 await expect(page.locator('#inquiry-photo-caption')).toHaveText('Play space detail at Crestmont West');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.getByRole('radio',{name:'Something Else',exact:true}).check();
 await expect(page.locator('#inquiry-photo-caption')).toContainText('D’Arcy');
 await expect(page.locator('.inquiry-outgoing')).toHaveCount(0);
});

test('inquiry validation and email preparation are honest about delivery',async({page})=>{
 await page.goto('/contact');await page.getByRole('radio',{name:'Multifamily Communities',exact:true}).check();
 await page.getByRole('button',{name:'Prepare Email'}).click();await expect(page.locator('#inquiry-prepared')).toBeHidden();
 await page.getByRole('textbox',{name:'Name',exact:true}).fill('Test Visitor');
 await page.getByRole('textbox',{name:'Email',exact:true}).fill('visitor@example.com');
 await page.getByRole('textbox',{name:'Project location',exact:true}).fill('Calgary');
 await page.getByRole('textbox',{name:'Tell us about the project',exact:true}).fill('A shared courtyard with places to sit.');
 // Preparing a mailto draft does not send an email. No email delivery is invoked by this test.
 await page.locator('#inquiry-form').dispatchEvent('submit');
 await expect(page.locator('#inquiry-prepared')).toBeVisible();
 const href=await page.locator('#inquiry-email-link').getAttribute('href');
 expect(href).toMatch(/^mailto:peter@pidesigngroup.ca\?/);
 expect(decodeURIComponent(href!)).toContain('visitor@example.com');expect(decodeURIComponent(href!)).toContain('Multifamily Communities');
 await expect(page.locator('#inquiry-feedback')).not.toContainText('sent');
 await page.getByRole('textbox',{name:'Project location',exact:true}).fill('Okotoks');await expect(page.locator('#inquiry-prepared')).toBeHidden();
});

test('contact is linked from home and project pages with usable navigation and mobile layouts',async({page})=>{
 for(const route of ['/','/darcy']){
  await page.goto(route);await page.locator('.desktop-nav [data-contact-link]').click();await expect(page).toHaveURL(/\/contact$/);await expect(page.locator('h1')).toHaveText('Start aconversation.');
 }
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:1000});await page.goto('/contact');
  await page.getByRole('radio',{name:'Something Else',exact:true}).check();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await expect(page.locator('.inquiry-submit>span')).toHaveCSS('white-space','nowrap');
  const clash=await page.evaluate(()=>{const a=document.querySelector('h1')!.getBoundingClientRect(),b=document.querySelector('.inquiry-photo-frame')!.getBoundingClientRect();return a.right>b.left&&a.left<b.right&&a.top<b.bottom&&a.bottom>b.top;});expect(clash).toBe(false);
 }
});

test('contact keyboard operation, accessibility and no-script fallback remain usable',async({page,browser})=>{
 await page.goto('/contact');await page.getByRole('radio',{name:'Multifamily Communities',exact:true}).focus();await page.keyboard.press('ArrowDown');
 await expect(page.getByRole('radio',{name:'Commercial Plazas',exact:true})).toBeChecked();
 await expect(page.locator('#inquiry-fields')).not.toHaveAttribute('inert');
 const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 const context=await browser.newContext({javaScriptEnabled:false});const plain=await context.newPage();await plain.goto('/contact');await expect(plain.getByRole('textbox',{name:'Name',exact:true})).toBeVisible();await expect(plain.locator('#inquiry-form')).toHaveAttribute('action','mailto:peter@pidesigngroup.ca');await context.close();
});

test('a failed photo preview never blocks the inquiry form and can recover',async({page})=>{
 await page.route('**/media/service-commercial.webp',route=>route.abort());await page.goto('/contact');
 await page.getByRole('radio',{name:'Commercial Plazas',exact:true}).check();
 await expect(page.locator('#inquiry-image-status')).toContainText('preview is unavailable');
 await expect(page.locator('#inquiry-photo-caption')).toContainText('Crestmont West');
 await expect(page.getByRole('textbox',{name:'Name',exact:true})).toBeVisible();
 await page.unroute('**/media/service-commercial.webp');
 await page.getByRole('radio',{name:'Public Parks',exact:true}).check();await page.getByRole('radio',{name:'Commercial Plazas',exact:true}).check();
 await expect(page.locator('#inquiry-photo-caption')).toContainText('Seton Crossing');await expect(page.locator('#inquiry-image-status')).toBeEmpty();
});

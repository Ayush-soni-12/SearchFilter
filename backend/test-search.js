import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/search?q=best+javascript+frameworks', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const title = await page.title();
  console.log('Title:', title);
  
  // Dump a bit of the body text to see what page this is
  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Body Text:', text);
  
  await browser.close();
})();

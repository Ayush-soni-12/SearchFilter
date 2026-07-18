import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.google.com/search?q=best+javascript+frameworks', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000); // give it 3s to load completely
  
  const hasSearch = await page.$('#search');
  if (hasSearch) {
    console.log('#search is present. innerHTML snippet:');
    const html = await page.evaluate(el => el.innerHTML.substring(0, 500), hasSearch);
    console.log(html);
  } else {
    console.log('#search is missing!');
    const bodyHtml = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
    console.log('Body HTML snippet:', bodyHtml);
  }
  
  await browser.close();
})();

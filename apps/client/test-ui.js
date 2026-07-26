const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to tracking page...');
  await page.goto('http://localhost:4001/tracking/123');
  
  console.log('Waiting for map and socket data (5s)...');
  await page.waitForTimeout(5000); // Aguarda o simulador enviar as coordenadas
  
  console.log('Taking screenshot...');
  const path = 'tracking_map_screenshot.png';
  await page.screenshot({ path, fullPage: true });
  
  console.log('Test completed! Screenshot saved at: ' + path);
  await browser.close();
})();

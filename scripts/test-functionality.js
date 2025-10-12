const { chromium } = require('playwright');

async function testWebsite() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];

  // Test 1: Homepage loads successfully
  try {
    await page.goto('http://127.0.0.1:8080/index.html', { waitUntil: 'networkidle' });
    results.push({ test: 'Homepage loads', status: 'PASS' });
  } catch (error) {
    results.push({ test: 'Homepage loads', status: 'FAIL', error: error.message });
  }

  // Test 2: Navigation links work
  try {
    await page.click('a[href*="contact"]');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    results.push({ test: 'Navigation to Contact page', status: 'PASS', info: `Title: ${title}` });
  } catch (error) {
    results.push({ test: 'Navigation to Contact page', status: 'FAIL', error: error.message });
  }

  // Test 3: Language switcher functionality
  try {
    await page.goto('http://127.0.0.1:8080/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check if language links exist
    const enLink = await page.locator('a[href*="/EN/"]').count();
    const nlLink = await page.locator('a[href*="/NL/"]').count();
    const deLink = await page.locator('a[href*="/DE/"]').count();
    
    results.push({ 
      test: 'Language switcher links present', 
      status: (enLink > 0 && nlLink > 0 && deLink > 0) ? 'PASS' : 'FAIL',
      info: `EN: ${enLink}, NL: ${nlLink}, DE: ${deLink}` 
    });
  } catch (error) {
    results.push({ test: 'Language switcher links', status: 'FAIL', error: error.message });
  }

  // Test 4: Forms are present and functional
  try {
    await page.goto('http://127.0.0.1:8080/contact.html');
    await page.waitForLoadState('networkidle');
    
    const formCount = await page.locator('form').count();
    const inputCount = await page.locator('input').count();
    
    results.push({ 
      test: 'Contact form present', 
      status: (formCount > 0) ? 'PASS' : 'FAIL',
      info: `Forms: ${formCount}, Inputs: ${inputCount}` 
    });
  } catch (error) {
    results.push({ test: 'Contact form present', status: 'FAIL', error: error.message });
  }

  // Test 5: Images load properly
  try {
    await page.goto('http://127.0.0.1:8080/index.html');
    await page.waitForLoadState('networkidle');
    
    const images = await page.locator('img').all();
    let brokenImages = 0;
    
    for (const img of images) {
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      if (naturalWidth === 0) brokenImages++;
    }
    
    results.push({ 
      test: 'Image loading', 
      status: (brokenImages === 0) ? 'PASS' : 'WARN',
      info: `Total: ${images.length}, Broken: ${brokenImages}` 
    });
  } catch (error) {
    results.push({ test: 'Image loading', status: 'FAIL', error: error.message });
  }

  // Test 6: Mobile responsive check
  try {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await page.goto('http://127.0.0.1:8080/index.html');
    await page.waitForLoadState('networkidle');
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    results.push({ 
      test: 'Mobile responsiveness', 
      status: (bodyWidth <= 375) ? 'PASS' : 'WARN',
      info: `Body width: ${bodyWidth}px (viewport: 375px)` 
    });
  } catch (error) {
    results.push({ test: 'Mobile responsiveness', status: 'FAIL', error: error.message });
  }

  await browser.close();

  // Print results
  console.log('\n=== FUNCTIONAL TEST RESULTS ===\n');
  results.forEach(result => {
    const statusSymbol = result.status === 'PASS' ? '✓' : result.status === 'WARN' ? '⚠' : '✗';
    console.log(`${statusSymbol} ${result.test}: ${result.status}`);
    if (result.info) console.log(`  ${result.info}`);
    if (result.error) console.log(`  Error: ${result.error}`);
  });
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`\nSummary: ${passed} passed, ${warned} warnings, ${failed} failed`);

  // Save results
  require('fs').writeFileSync(
    './reports/functional-test.json',
    JSON.stringify(results, null, 2)
  );
}

testWebsite().catch(console.error);

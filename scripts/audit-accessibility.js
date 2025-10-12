const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;

async function runAccessibilityAudit() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const pages = [
    { url: 'http://127.0.0.1:8080/index.html', name: 'Homepage (FR)' },
    { url: 'http://127.0.0.1:8080/EN/index.html', name: 'Homepage (EN)' },
    { url: 'http://127.0.0.1:8080/NL/index.html', name: 'Homepage (NL)' },
    { url: 'http://127.0.0.1:8080/DE/index.html', name: 'Homepage (DE)' },
    { url: 'http://127.0.0.1:8080/contact.html', name: 'Contact Page' },
  ];

  const results = [];

  for (const pageInfo of pages) {
    try {
      await page.goto(pageInfo.url);
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        violations: accessibilityScanResults.violations.length,
        passes: accessibilityScanResults.passes.length,
        details: accessibilityScanResults.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length
        }))
      });
    } catch (error) {
      results.push({
        name: pageInfo.name,
        url: pageInfo.url,
        error: error.message
      });
    }
  }

  await browser.close();

  // Print results
  console.log('\n=== ACCESSIBILITY AUDIT RESULTS ===\n');
  results.forEach(result => {
    console.log(`\n${result.name}`);
    console.log(`URL: ${result.url}`);
    if (result.error) {
      console.log(`ERROR: ${result.error}`);
    } else {
      console.log(`Violations: ${result.violations}`);
      console.log(`Passes: ${result.passes}`);
      if (result.violations > 0) {
        console.log('\nTop Issues:');
        result.details.forEach(issue => {
          console.log(`  - [${issue.impact}] ${issue.id}: ${issue.description} (${issue.nodes} elements)`);
        });
      }
    }
    console.log('---');
  });

  // Save detailed results to file
  require('fs').writeFileSync(
    './reports/accessibility-audit.json',
    JSON.stringify(results, null, 2)
  );
}

runAccessibilityAudit().catch(console.error);

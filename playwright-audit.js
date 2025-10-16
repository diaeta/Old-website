const { chromium } = require('playwright');
const fs = require('fs');

async function auditWebsite() {
    console.log('🚀 Starting Ultra-Thorough Website Audit...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const results = {
        pages: [],
        brokenLinks: [],
        accessibility: [],
        performance: []
    };

    const baseUrl = 'https://diaeta.be';
    const pagesToCheck = [
        baseUrl,
        baseUrl + '/EN/home.html',
        baseUrl + '/DE/home.html',
        baseUrl + '/NL/home.html'
    ];

    for (const url of pagesToCheck) {
        console.log(`\n📄 Auditing: ${url}`);
        const page = await context.newPage();
        
        const pageData = {
            url,
            consoleErrors: [],
            links: [],
            status: null,
            loadTime: 0
        };

        // Track console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                pageData.consoleErrors.push(msg.text());
            }
        });

        try {
            const start = Date.now();
            const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            pageData.loadTime = Date.now() - start;
            pageData.status = response.status();

            // Get all links
            const links = await page.$$eval('a[href]', anchors => 
                anchors.map(a => ({ href: a.href, text: a.textContent?.trim() }))
            );
            pageData.links = links;

            // Check accessibility
            const noAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
            const h1Count = await page.$$eval('h1', h1s => h1s.length);
            
            if (noAlt > 0) {
                results.accessibility.push({ url, issue: `${noAlt} images without alt text` });
            }
            if (h1Count !== 1) {
                results.accessibility.push({ url, issue: `${h1Count} H1 tags (should be 1)` });
            }

            console.log(`  ✓ Status: ${pageData.status}`);
            console.log(`  ✓ Load Time: ${pageData.loadTime}ms`);
            console.log(`  ✓ Links: ${links.length}`);
            console.log(`  ✓ Console Errors: ${pageData.consoleErrors.length}`);

        } catch (error) {
            console.log(`  ✗ Error: ${error.message}`);
            pageData.error = error.message;
        }

        results.pages.push(pageData);
        await page.close();
    }

    // Save results
    fs.writeFileSync('playwright-audit-results.json', JSON.stringify(results, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Pages Audited: ${results.pages.length}`);
    console.log(`Accessibility Issues: ${results.accessibility.length}`);
    console.log(`\nReport saved to: playwright-audit-results.json`);
    
    await browser.close();
}

auditWebsite().catch(console.error);

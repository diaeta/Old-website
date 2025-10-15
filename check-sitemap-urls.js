const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { URL } = require('url');

// Read and parse sitemap
async function checkSitemapUrls() {
    const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(sitemap);

    const urls = result.urlset.url.map(u => u.loc[0]);
    console.log(`Found ${urls.length} URLs in sitemap\n`);

    const issues = {
        missing404: [],
        wrongRedirects: [],
        duplicates: [],
        forbidden403: [],
        encodingIssues: []
    };

    // Check each URL's corresponding file
    for (const url of urls) {
        const urlObj = new URL(url);
        let filePath = urlObj.pathname.substring(1); // Remove leading slash

        // URL decode the path
        filePath = decodeURIComponent(filePath);

        // Check for special characters and encoding issues
        if (filePath.includes('%')) {
            issues.encodingIssues.push(url);
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            issues.missing404.push({
                url: url,
                expectedFile: filePath
            });
        }
    }

    // Look for duplicate URLs with different encodings
    const urlPaths = urls.map(u => new URL(u).pathname);
    const pathCounts = {};
    urlPaths.forEach(p => {
        const normalized = decodeURIComponent(p).toLowerCase();
        if (!pathCounts[normalized]) pathCounts[normalized] = [];
        pathCounts[normalized].push(p);
    });

    Object.entries(pathCounts).forEach(([normalized, paths]) => {
        if (paths.length > 1) {
            issues.duplicates.push({
                normalized: normalized,
                variants: paths
            });
        }
    });

    // Output report
    console.log('=== 404 NOT FOUND ISSUES ===');
    console.log(`Found ${issues.missing404.length} missing files:\n`);
    issues.missing404.forEach(item => {
        console.log(`URL: ${item.url}`);
        console.log(`Expected file: ${item.expectedFile}`);
        console.log('---');
    });

    console.log('\n=== DUPLICATE URL ISSUES ===');
    console.log(`Found ${issues.duplicates.length} duplicate URL patterns:\n`);
    issues.duplicates.forEach(item => {
        console.log(`Normalized path: ${item.normalized}`);
        console.log(`Variants: ${item.variants.join(', ')}`);
        console.log('---');
    });

    console.log('\n=== ENCODING ISSUES ===');
    console.log(`Found ${issues.encodingIssues.length} URLs with encoding issues:\n`);
    issues.encodingIssues.forEach(url => {
        console.log(url);
    });

    // Save detailed report
    fs.writeFileSync('sitemap-issues-report.json', JSON.stringify(issues, null, 2));
    console.log('\nDetailed report saved to sitemap-issues-report.json');

    return issues;
}

// Check if xml2js is installed
try {
    require.resolve('xml2js');
    checkSitemapUrls().catch(console.error);
} catch(e) {
    console.log('Installing xml2js...');
    require('child_process').execSync('npm install xml2js', { stdio: 'inherit' });
    checkSitemapUrls().catch(console.error);
}
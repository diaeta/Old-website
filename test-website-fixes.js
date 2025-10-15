const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const cheerio = require('cheerio');

console.log('=== WEBSITE FIXES VERIFICATION ===\n');

const results = {
    passed: [],
    failed: [],
    warnings: []
};

// Test 1: Check 404 page exists
console.log('Test 1: Checking 404 error page...');
if (fs.existsSync('404.html')) {
    results.passed.push('✓ 404.html error page exists');
} else {
    results.failed.push('✗ 404.html error page missing');
}

// Test 2: Check .htaccess configuration
console.log('Test 2: Checking .htaccess configuration...');
if (fs.existsSync('.htaccess')) {
    const htaccess = fs.readFileSync('.htaccess', 'utf8');
    if (htaccess.includes('RewriteEngine On')) {
        results.passed.push('✓ RewriteEngine is enabled');
    } else {
        results.failed.push('✗ RewriteEngine not enabled');
    }

    if (htaccess.includes('ErrorDocument 404')) {
        results.passed.push('✓ 404 error document configured');
    } else {
        results.failed.push('✗ 404 error document not configured');
    }
}

// Test 3: Check robots.txt
console.log('Test 3: Checking robots.txt...');
if (fs.existsSync('robots.txt')) {
    const robots = fs.readFileSync('robots.txt', 'utf8');
    if (robots.includes('Sitemap:')) {
        results.passed.push('✓ Sitemap specified in robots.txt');
    } else {
        results.failed.push('✗ Sitemap not specified in robots.txt');
    }

    // Check if not blocking HTML files
    if (!robots.includes('Disallow: /*.html')) {
        results.passed.push('✓ HTML files not blocked in robots.txt');
    } else {
        results.failed.push('✗ HTML files blocked in robots.txt');
    }
}

// Test 4: Check canonical URLs in HTML files
console.log('Test 4: Checking canonical URLs...');
const htmlFiles = [];
function findHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith('.') &&
            file !== 'node_modules' && file !== 'bat' &&
            file !== 'scripts' && file !== 'coverage-report') {
            findHtmlFiles(filePath);
        } else if (file.endsWith('.html') && !file.includes('.backup')) {
            htmlFiles.push(filePath);
        }
    }
}
findHtmlFiles('.');

let canonicalCount = 0;
let missingCanonical = [];
htmlFiles.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);
    if ($('link[rel="canonical"]').length > 0) {
        canonicalCount++;
    } else {
        missingCanonical.push(file);
    }
});

if (canonicalCount > 0) {
    results.passed.push(`✓ ${canonicalCount}/${htmlFiles.length} HTML files have canonical URLs`);
}
if (missingCanonical.length > 0) {
    results.warnings.push(`⚠ ${missingCanonical.length} files missing canonical URLs`);
}

// Test 5: Check sitemap validity
console.log('Test 5: Checking sitemap...');
if (fs.existsSync('sitemap.xml')) {
    const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
    const parser = new xml2js.Parser();
    parser.parseString(sitemap, (err, result) => {
        if (!err && result.urlset) {
            const urls = result.urlset.url || [];
            results.passed.push(`✓ Sitemap is valid with ${urls.length} URLs`);

            // Check for duplicates
            const urlPaths = urls.map(u => u.loc[0]);
            const uniqueUrls = new Set(urlPaths);
            if (uniqueUrls.size === urlPaths.length) {
                results.passed.push('✓ No duplicate URLs in sitemap');
            } else {
                results.warnings.push(`⚠ ${urlPaths.length - uniqueUrls.size} duplicate URLs in sitemap`);
            }
        } else {
            results.failed.push('✗ Invalid sitemap XML');
        }
    });
}

// Test 6: Check for common SEO issues
console.log('Test 6: Checking SEO elements...');
let titleCount = 0;
let descriptionCount = 0;
let viewportCount = 0;

htmlFiles.forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);

    if ($('title').length > 0) titleCount++;
    if ($('meta[name="description"]').length > 0) descriptionCount++;
    if ($('meta[name="viewport"]').length > 0) viewportCount++;
});

results.passed.push(`✓ ${titleCount}/${htmlFiles.length} files have title tags`);
results.passed.push(`✓ ${viewportCount}/${htmlFiles.length} files have viewport meta tags`);
if (descriptionCount < htmlFiles.length) {
    results.warnings.push(`⚠ Only ${descriptionCount}/${htmlFiles.length} files have meta descriptions`);
}

// Print results
console.log('\n=== TEST RESULTS ===\n');
console.log('PASSED TESTS:');
results.passed.forEach(r => console.log(r));

if (results.warnings.length > 0) {
    console.log('\nWARNINGS:');
    results.warnings.forEach(r => console.log(r));
}

if (results.failed.length > 0) {
    console.log('\nFAILED TESTS:');
    results.failed.forEach(r => console.log(r));
}

// Summary
console.log('\n=== SUMMARY ===');
console.log(`✓ Passed: ${results.passed.length}`);
console.log(`⚠ Warnings: ${results.warnings.length}`);
console.log(`✗ Failed: ${results.failed.length}`);

// Save detailed report
const report = {
    timestamp: new Date().toISOString(),
    results: results,
    stats: {
        totalHtmlFiles: htmlFiles.length,
        filesWithCanonical: canonicalCount,
        filesWithTitle: titleCount,
        filesWithDescription: descriptionCount,
        filesWithViewport: viewportCount
    }
};

fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
console.log('\nDetailed report saved to test-results.json');
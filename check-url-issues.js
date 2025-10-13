const https = require('https');
const http = require('http');
const fs = require('fs');
const { URL } = require('url');

// Check URL status and redirects
function checkUrl(url) {
    return new Promise((resolve) => {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'HEAD',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SEO-Checker/1.0)'
            },
            timeout: 10000
        };

        const req = protocol.request(options, (res) => {
            resolve({
                url: url,
                status: res.statusCode,
                location: res.headers.location,
                contentType: res.headers['content-type']
            });
        });

        req.on('error', (err) => {
            resolve({
                url: url,
                status: 0,
                error: err.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                url: url,
                status: 0,
                error: 'Timeout'
            });
        });

        req.end();
    });
}

async function checkSiteUrls() {
    console.log('=== CHECKING URL STATUS FOR DIAETA.BE ===\n');
    console.log('This will check a sample of URLs from your sitemap...\n');

    // Read sitemap
    const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
    const urlMatches = sitemap.matchAll(/<loc>([^<]+)<\/loc>/g);
    const urls = Array.from(urlMatches).map(match => match[1]);

    console.log(`Found ${urls.length} URLs in sitemap`);
    console.log('Checking first 20 URLs...\n');

    const results = {
        ok: [],
        redirects: [],
        errors: [],
        notFound: [],
        forbidden: []
    };

    // Check first 20 URLs as sample
    for (let i = 0; i < Math.min(20, urls.length); i++) {
        const url = urls[i];
        process.stdout.write(`Checking ${i + 1}/${Math.min(20, urls.length)}: ${url.substring(0, 60)}... `);

        const result = await checkUrl(url);

        if (result.status === 200) {
            console.log('✓ OK');
            results.ok.push(result);
        } else if (result.status === 301 || result.status === 302 || result.status === 307 || result.status === 308) {
            console.log(`→ REDIRECT (${result.status}) to ${result.location}`);
            results.redirects.push(result);
        } else if (result.status === 404) {
            console.log('✗ NOT FOUND (404)');
            results.notFound.push(result);
        } else if (result.status === 403) {
            console.log('✗ FORBIDDEN (403)');
            results.forbidden.push(result);
        } else {
            console.log(`✗ ERROR (${result.status || 'Network Error'})`);
            results.errors.push(result);
        }

        // Small delay to avoid overwhelming server
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n=== SUMMARY ===');
    console.log(`OK (200): ${results.ok.length}`);
    console.log(`Redirects: ${results.redirects.length}`);
    console.log(`Not Found (404): ${results.notFound.length}`);
    console.log(`Forbidden (403): ${results.forbidden.length}`);
    console.log(`Other Errors: ${results.errors.length}`);

    if (results.redirects.length > 0) {
        console.log('\n=== REDIRECT DETAILS ===');
        results.redirects.forEach(r => {
            console.log(`${r.url}`);
            console.log(`  → ${r.location} (${r.status})`);
        });
    }

    if (results.notFound.length > 0) {
        console.log('\n=== 404 NOT FOUND ===');
        results.notFound.forEach(r => {
            console.log(`  ${r.url}`);
        });
    }

    if (results.forbidden.length > 0) {
        console.log('\n=== 403 FORBIDDEN ===');
        results.forbidden.forEach(r => {
            console.log(`  ${r.url}`);
        });
    }

    console.log('\n=== RECOMMENDATIONS ===');
    
    if (results.redirects.length > 0) {
        console.log('\nRedirects found:');
        console.log('1. Update sitemap.xml with final destination URLs');
        console.log('2. Update internal links to point directly to final URL');
        console.log('3. Check if redirect chains exist (A→B→C)');
    }

    if (results.notFound.length > 0) {
        console.log('\n404 errors found:');
        console.log('1. Remove these URLs from sitemap.xml');
        console.log('2. Create 301 redirects to relevant pages');
        console.log('3. Check Google Search Console for more 404s');
    }

    if (results.forbidden.length > 0) {
        console.log('\n403 errors found:');
        console.log('1. Check file permissions (should be 644)');
        console.log('2. Check .htaccess for blocking rules');
        console.log('3. Verify robots.txt is not blocking these URLs');
    }

    // Save detailed results
    fs.writeFileSync('url-check-results.json', JSON.stringify(results, null, 2));
    console.log('\n✓ Detailed results saved to url-check-results.json');
}

checkSiteUrls().catch(console.error);

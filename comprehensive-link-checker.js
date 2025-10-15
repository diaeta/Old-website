const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { URL } = require('url');

// Check if file exists with various encoding attempts
function fileExists(filePath) {
    // Try as-is
    if (fs.existsSync(filePath)) return { exists: true, path: filePath };

    // Try URL decoded
    const decoded = decodeURIComponent(filePath);
    if (fs.existsSync(decoded)) return { exists: true, path: decoded };

    // Try with spaces instead of %20
    const withSpaces = filePath.replace(/%20/g, ' ');
    if (fs.existsSync(withSpaces)) return { exists: true, path: withSpaces };

    return { exists: false, path: null };
}

// Parse .htaccess redirects
function parseHtaccess() {
    const htaccess = fs.readFileSync('.htaccess', 'utf8');
    const redirects = [];

    htaccess.split('\n').forEach(line => {
        const match = line.match(/^Redirect\s+(\d+)\s+(.+)\s+(.+)$/);
        if (match) {
            redirects.push({
                code: match[1],
                from: match[2],
                to: match[3]
            });
        }
    });

    return redirects;
}

// Main check function
async function comprehensiveCheck() {
    // Parse sitemap
    const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(sitemap);
    const sitemapUrls = result.urlset.url.map(u => u.loc[0]);

    // Parse redirects
    const redirects = parseHtaccess();

    console.log('=== COMPREHENSIVE WEBSITE ISSUES REPORT ===\n');
    console.log(`Total URLs in sitemap: ${sitemapUrls.length}`);
    console.log(`Total redirects in .htaccess: ${redirects.length}\n`);

    const issues = {
        missing404: [],
        redirectConflicts: [],
        redirectChains: [],
        duplicateContent: [],
        encodingIssues: []
    };

    // Check each sitemap URL
    console.log('=== CHECKING SITEMAP URLs ===\n');

    for (const url of sitemapUrls) {
        const urlObj = new URL(url);
        let filePath = urlObj.pathname.substring(1); // Remove leading slash

        // Check if file exists
        const fileCheck = fileExists(filePath);
        if (!fileCheck.exists) {
            issues.missing404.push({
                url: url,
                expectedFile: filePath,
                decodedPath: decodeURIComponent(filePath)
            });
        }

        // Check if this URL is a redirect source
        const redirect = redirects.find(r =>
            urlObj.pathname === r.from ||
            urlObj.pathname === r.from + '.html'
        );

        if (redirect) {
            issues.redirectConflicts.push({
                url: url,
                redirectRule: redirect,
                issue: 'URL in sitemap is also a redirect source'
            });
        }
    }

    // Check for redirect chains and loops
    console.log('\n=== CHECKING REDIRECT CHAINS ===\n');

    redirects.forEach(r1 => {
        const chain = [r1.from];
        let current = r1.to;

        // Follow redirect chain
        for (let i = 0; i < 5; i++) {
            const next = redirects.find(r2 => r2.from === current);
            if (next) {
                chain.push(next.from);
                current = next.to;

                if (chain.includes(current)) {
                    issues.redirectChains.push({
                        type: 'loop',
                        chain: chain,
                        final: current
                    });
                    break;
                }
            } else {
                break;
            }
        }

        if (chain.length > 1) {
            issues.redirectChains.push({
                type: 'chain',
                chain: chain,
                final: current
            });
        }
    });

    // Check for duplicate content (same file, different URLs)
    console.log('\n=== CHECKING FOR DUPLICATE CONTENT ===\n');

    const urlsByContent = {};
    sitemapUrls.forEach(url => {
        const urlObj = new URL(url);
        const normalized = decodeURIComponent(urlObj.pathname)
            .toLowerCase()
            .replace(/\\/g, '/')
            .replace(/\/+/g, '/')
            .replace(/\/$/, '');

        if (!urlsByContent[normalized]) {
            urlsByContent[normalized] = [];
        }
        urlsByContent[normalized].push(url);
    });

    Object.entries(urlsByContent).forEach(([content, urls]) => {
        if (urls.length > 1) {
            issues.duplicateContent.push({
                normalizedPath: content,
                urls: urls
            });
        }
    });

    // Generate report
    console.log('\n=== ISSUES SUMMARY ===\n');
    console.log(`404 Not Found: ${issues.missing404.length} pages`);
    console.log(`Redirect Conflicts: ${issues.redirectConflicts.length} URLs`);
    console.log(`Redirect Chains/Loops: ${issues.redirectChains.length} chains`);
    console.log(`Duplicate Content: ${issues.duplicateContent.length} duplicates`);

    // Detailed report
    if (issues.missing404.length > 0) {
        console.log('\n=== 404 NOT FOUND (Files Missing) ===');
        issues.missing404.forEach(item => {
            console.log(`\nURL: ${item.url}`);
            console.log(`Expected: ${item.expectedFile}`);
            console.log(`Decoded: ${item.decodedPath}`);
        });
    }

    if (issues.redirectConflicts.length > 0) {
        console.log('\n=== REDIRECT CONFLICTS (URL in sitemap but also redirected) ===');
        issues.redirectConflicts.forEach(item => {
            console.log(`\nURL: ${item.url}`);
            console.log(`Redirect: ${item.redirectRule.from} -> ${item.redirectRule.to}`);
            console.log(`Issue: ${item.issue}`);
        });
    }

    if (issues.redirectChains.length > 0) {
        console.log('\n=== REDIRECT CHAINS/LOOPS ===');
        issues.redirectChains.forEach(item => {
            console.log(`\nType: ${item.type}`);
            console.log(`Chain: ${item.chain.join(' -> ')} -> ${item.final}`);
        });
    }

    if (issues.duplicateContent.length > 0) {
        console.log('\n=== DUPLICATE CONTENT (Multiple URLs, same content) ===');
        issues.duplicateContent.forEach(item => {
            console.log(`\nNormalized: ${item.normalizedPath}`);
            item.urls.forEach(url => console.log(`  - ${url}`));
        });
    }

    // Save detailed JSON report
    fs.writeFileSync('comprehensive-issues-report.json', JSON.stringify(issues, null, 2));
    console.log('\n\nDetailed report saved to comprehensive-issues-report.json');

    // Create fixes script
    generateFixScript(issues, redirects);

    return issues;
}

// Generate script to fix issues
function generateFixScript(issues, redirects) {
    let fixes = '#!/bin/bash\n';
    fixes += '# Auto-generated fix script for website issues\n\n';

    fixes += '# Fix redirect conflicts in .htaccess\n';
    fixes += 'cp .htaccess .htaccess.backup\n';
    fixes += 'echo "Backup created: .htaccess.backup"\n\n';

    // Remove problematic redirects
    if (issues.redirectConflicts.length > 0) {
        fixes += '# Remove conflicting redirects\n';
        issues.redirectConflicts.forEach(item => {
            fixes += `# Remove: ${item.redirectRule.from} -> ${item.redirectRule.to}\n`;
        });
    }

    fs.writeFileSync('fix-issues.sh', fixes);
    console.log('Fix script saved to fix-issues.sh');
}

// Run the check
comprehensiveCheck().catch(console.error);
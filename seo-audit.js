const fs = require('fs');
const path = require('path');
const { parseString } = require('xml2js');
const { promisify } = require('util');

const parseXML = promisify(parseString);

async function auditSite() {
    console.log('=== SEO AUDIT FOR DIAETA.BE ===\n');

    const issues = {
        brokenLinks: [],
        missingCanonical: [],
        duplicateContent: [],
        missingHreflang: [],
        invalidPaths: [],
        redirectIssues: [],
        missingMetaDescription: [],
        missingTitle: []
    };

    let sitemap;
    try {
        const sitemapContent = fs.readFileSync('sitemap.xml', 'utf8');
        sitemap = await parseXML(sitemapContent);
    } catch (error) {
        console.error('Error reading sitemap:', error.message);
        return;
    }

    const urls = sitemap.urlset.url || [];
    console.log(`Found ${urls.length} URLs in sitemap\n`);

    const htmlFiles = [];

    function scanDirectory(dir, baseDir = dir) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);
            let stat;
            try {
                stat = fs.statSync(fullPath);
            } catch (e) {
                continue;
            }

            if (stat.isDirectory()) {
                if (!file.includes('node_modules') && !file.includes('mcp-servers') && !file.includes('.git')) {
                    scanDirectory(fullPath, baseDir);
                }
            } else if (file.endsWith('.html')) {
                const relPath = path.relative(baseDir, fullPath);
                htmlFiles.push({
                    path: fullPath,
                    relativePath: relPath.split(path.sep).join('/')
                });
            }
        }
    }

    scanDirectory('.');
    console.log(`Found ${htmlFiles.length} HTML files\n`);

    for (const file of htmlFiles) {
        try {
            const content = fs.readFileSync(file.path, 'utf8');

            const canonicalMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
            if (!canonicalMatch) {
                issues.missingCanonical.push(file.relativePath);
            }

            const hreflangMatches = content.match(/<link[^>]+rel=["']alternate["'][^>]+hreflang=/gi);
            if (!hreflangMatches || hreflangMatches.length < 3) {
                issues.missingHreflang.push({
                    file: file.relativePath,
                    count: hreflangMatches ? hreflangMatches.length : 0
                });
            }

            const metaDescMatch = content.match(/<meta[^>]+name=["']description["'][^>]*>/i);
            if (!metaDescMatch) {
                issues.missingMetaDescription.push(file.relativePath);
            }

            const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (!titleMatch || titleMatch[1].trim().length === 0) {
                issues.missingTitle.push(file.relativePath);
            }

        } catch (error) {
            console.error(`Error processing ${file.path}:`, error.message);
        }
    }

    console.log('\n=== ANALYZING SITEMAP VS ACTUAL FILES ===\n');
    const sitemapUrls = urls.map(u => {
        const loc = u.loc[0];
        return decodeURIComponent(loc.replace('https://diaeta.be/', ''));
    });

    const actualFiles = htmlFiles.map(f => f.relativePath);

    const orphanedUrls = sitemapUrls.filter(url => {
        const found = actualFiles.some(file => {
            return file === url;
        });
        return !found;
    });

    const missingFromSitemap = actualFiles.filter(file => {
        const found = sitemapUrls.some(url => {
            return url === file || url === encodeURIComponent(file);
        });
        return !found;
    });

    console.log('\n========== AUDIT REPORT ==========\n');

    console.log(`1. MISSING CANONICAL TAGS: ${issues.missingCanonical.length} pages`);
    if (issues.missingCanonical.length > 0) {
        issues.missingCanonical.slice(0, 10).forEach(page => {
            console.log(`   - ${page}`);
        });
    }

    console.log(`\n2. INCOMPLETE HREFLANG: ${issues.missingHreflang.length} pages`);
    if (issues.missingHreflang.length > 0) {
        issues.missingHreflang.slice(0, 10).forEach(issue => {
            console.log(`   - ${issue.file} (has ${issue.count} hreflang tags)`);
        });
    }

    console.log(`\n3. MISSING META DESCRIPTIONS: ${issues.missingMetaDescription.length} pages`);
    
    console.log(`\n4. ORPHANED URLs (in sitemap, file not found): ${orphanedUrls.length}`);
    if (orphanedUrls.length > 0) {
        console.log('   These URLs in sitemap.xml point to non-existent files:');
        orphanedUrls.slice(0, 50).forEach(url => {
            console.log(`   - ${url}`);
        });
    }

    console.log(`\n5. FILES NOT IN SITEMAP: ${missingFromSitemap.length}`);
    if (missingFromSitemap.length > 0) {
        console.log('   First 20 files not in sitemap:');
        missingFromSitemap.slice(0, 20).forEach(file => {
            console.log(`   - ${file}`);
        });
    }

    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            totalHtmlFiles: htmlFiles.length,
            totalSitemapUrls: urls.length,
            missingCanonical: issues.missingCanonical.length,
            missingHreflang: issues.missingHreflang.length,
            missingMetaDescription: issues.missingMetaDescription.length,
            missingTitle: issues.missingTitle.length,
            orphanedUrls: orphanedUrls.length,
            missingFromSitemap: missingFromSitemap.length
        },
        issues: {
            ...issues,
            orphanedUrls,
            missingFromSitemap
        }
    };

    fs.writeFileSync('seo-audit-report.json', JSON.stringify(report, null, 2));
    console.log('\n✓ Detailed report saved to seo-audit-report.json');
}

auditSite().catch(console.error);

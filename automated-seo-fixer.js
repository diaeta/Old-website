#!/usr/bin/env node

/**
 * Automated SEO Fixer
 * Uses industry-standard tools to fix common SEO issues
 * Based on Screaming Frog audit report
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const cleanHTML = require('clean-html');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

class AutomatedSEOFixer {
    constructor() {
        this.issues = {
            fixed: [],
            errors: []
        };
    }

    /**
     * Fix HTML structure issues (tags outside <head>)
     */
    async fixHTMLStructure(filePath) {
        try {
            const content = await readFile(filePath, 'utf8');
            const $ = cheerio.load(content, {
                xmlMode: false,
                decodeEntities: false,
                _useHtmlParser2: true
            });

            let changes = 0;

            // Fix title outside <head>
            $('title').each((i, elem) => {
                const $elem = $(elem);
                if (!$elem.closest('head').length) {
                    const titleText = $elem.text();
                    $elem.remove();
                    $('head').prepend(`<title>${titleText}</title>`);
                    changes++;
                    console.log(`  ✓ Moved <title> inside <head>`);
                }
            });

            // Fix meta tags outside <head>
            $('meta').each((i, elem) => {
                const $elem = $(elem);
                if (!$elem.closest('head').length) {
                    const metaHtml = $.html($elem);
                    $elem.remove();
                    $('head').append(metaHtml);
                    changes++;
                    console.log(`  ✓ Moved <meta> inside <head>`);
                }
            });

            // Fix canonical outside <head>
            $('link[rel="canonical"]').each((i, elem) => {
                const $elem = $(elem);
                if (!$elem.closest('head').length) {
                    const linkHtml = $.html($elem);
                    $elem.remove();
                    $('head').append(linkHtml);
                    changes++;
                    console.log(`  ✓ Moved <link rel="canonical"> inside <head>`);
                }
            });

            // Fix hreflang outside <head>
            $('link[rel="alternate"][hreflang]').each((i, elem) => {
                const $elem = $(elem);
                if (!$elem.closest('head').length) {
                    const linkHtml = $.html($elem);
                    $elem.remove();
                    $('head').append(linkHtml);
                    changes++;
                    console.log(`  ✓ Moved hreflang <link> inside <head>`);
                }
            });

            // Remove duplicate <body> tags
            const bodies = $('body');
            if (bodies.length > 1) {
                console.log(`  ⚠ Found ${bodies.length} <body> tags, merging...`);
                const firstBody = bodies.first();
                bodies.slice(1).each((i, elem) => {
                    firstBody.append($(elem).children());
                    $(elem).remove();
                    changes++;
                });
                console.log(`  ✓ Merged duplicate <body> tags`);
            }

            if (changes > 0) {
                await writeFile(filePath, $.html());
                this.issues.fixed.push({
                    file: filePath,
                    type: 'HTML Structure',
                    changes
                });
                return changes;
            }

            return 0;
        } catch (error) {
            console.error(`  ✗ Error fixing ${filePath}:`, error.message);
            this.issues.errors.push({
                file: filePath,
                error: error.message
            });
            return 0;
        }
    }

    /**
     * Fix hreflang issues
     */
    async fixHreflangIssues(filePath) {
        try {
            const content = await readFile(filePath, 'utf8');
            const $ = cheerio.load(content, { decodeEntities: false });

            let changes = 0;

            // Valid ISO 639-1 language codes and ISO 3166-1 Alpha-2 region codes
            const validLanguages = ['fr', 'en', 'nl', 'de', 'es', 'it', 'pt', 'ar'];
            const validRegions = ['BE', 'FR', 'NL', 'DE', 'UK', 'US', 'CA'];

            // Fix invalid hreflang codes
            $('link[rel="alternate"][hreflang]').each((i, elem) => {
                const $elem = $(elem);
                const hreflang = $elem.attr('hreflang');

                if (!hreflang || hreflang === 'x-default') return;

                const parts = hreflang.split('-');
                const lang = parts[0];
                const region = parts[1];

                // Check if language code is valid
                if (!validLanguages.includes(lang.toLowerCase())) {
                    console.log(`  ⚠ Invalid language code: ${lang}`);
                    // Try to correct common mistakes
                    if (lang.toLowerCase() === 'fr') $elem.attr('hreflang', 'fr');
                    else $elem.remove();
                    changes++;
                }

                // Check if region code is valid
                if (region && !validRegions.includes(region.toUpperCase())) {
                    console.log(`  ⚠ Invalid region code: ${region}`);
                    changes++;
                }
            });

            // Add self-referencing hreflang if missing
            const canonicalUrl = $('link[rel="canonical"]').attr('href');
            const currentLang = $('html').attr('lang') || 'fr';

            const selfHreflang = $(`link[hreflang="${currentLang}"]`);
            if (selfHreflang.length === 0 && canonicalUrl) {
                $('head').append(`\n    <link rel="alternate" hreflang="${currentLang}" href="${canonicalUrl}">`);
                console.log(`  ✓ Added self-referencing hreflang="${currentLang}"`);
                changes++;
            }

            // Remove duplicate hreflang entries
            const hreflangLinks = {};
            $('link[rel="alternate"][hreflang]').each((i, elem) => {
                const $elem = $(elem);
                const hreflang = $elem.attr('hreflang');

                if (hreflangLinks[hreflang]) {
                    console.log(`  ⚠ Duplicate hreflang="${hreflang}", removing`);
                    $elem.remove();
                    changes++;
                } else {
                    hreflangLinks[hreflang] = true;
                }
            });

            if (changes > 0) {
                await writeFile(filePath, $.html());
                this.issues.fixed.push({
                    file: filePath,
                    type: 'Hreflang',
                    changes
                });
                return changes;
            }

            return 0;
        } catch (error) {
            console.error(`  ✗ Error fixing hreflang in ${filePath}:`, error.message);
            this.issues.errors.push({
                file: filePath,
                error: error.message
            });
            return 0;
        }
    }

    /**
     * Add missing canonical tags
     */
    async addMissingCanonicals(filePath, baseUrl) {
        try {
            const content = await readFile(filePath, 'utf8');
            const $ = cheerio.load(content, { decodeEntities: false });

            if ($('link[rel="canonical"]').length === 0) {
                const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
                const canonicalUrl = `${baseUrl}/${relativePath}`;

                $('head').append(`\n    <link rel="canonical" href="${canonicalUrl}">`);
                console.log(`  ✓ Added canonical tag: ${canonicalUrl}`);

                await writeFile(filePath, $.html());
                this.issues.fixed.push({
                    file: filePath,
                    type: 'Missing Canonical',
                    changes: 1
                });
                return 1;
            }

            return 0;
        } catch (error) {
            console.error(`  ✗ Error adding canonical to ${filePath}:`, error.message);
            return 0;
        }
    }

    /**
     * Fix broken internal links
     */
    async fixBrokenLinks(filePath, brokenLinks) {
        try {
            const content = await readFile(filePath, 'utf8');
            const $ = cheerio.load(content, { decodeEntities: false });

            let changes = 0;

            // Fix links with spaces (URL encode them)
            $('a[href]').each((i, elem) => {
                const $elem = $(elem);
                const href = $elem.attr('href');

                if (href && href.includes(' ')) {
                    const fixedHref = href.replace(/ /g, '%20');
                    $elem.attr('href', fixedHref);
                    console.log(`  ✓ Fixed space in URL: ${href} → ${fixedHref}`);
                    changes++;
                }
            });

            if (changes > 0) {
                await writeFile(filePath, $.html());
                this.issues.fixed.push({
                    file: filePath,
                    type: 'Broken Links (spaces)',
                    changes
                });
                return changes;
            }

            return 0;
        } catch (error) {
            console.error(`  ✗ Error fixing links in ${filePath}:`, error.message);
            return 0;
        }
    }

    /**
     * Process all HTML files recursively
     */
    async processDirectory(dir, options = {}) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Skip node_modules and hidden directories
                if (!file.startsWith('.') && file !== 'node_modules') {
                    await this.processDirectory(filePath, options);
                }
            } else if (file.endsWith('.html')) {
                console.log(`\n📄 Processing: ${path.relative(process.cwd(), filePath)}`);

                let totalChanges = 0;

                if (options.fixStructure) {
                    totalChanges += await this.fixHTMLStructure(filePath);
                }

                if (options.fixHreflang) {
                    totalChanges += await this.fixHreflangIssues(filePath);
                }

                if (options.addCanonicals) {
                    totalChanges += await this.addMissingCanonicals(filePath, options.baseUrl);
                }

                if (options.fixLinks) {
                    totalChanges += await this.fixBrokenLinks(filePath);
                }

                if (totalChanges === 0) {
                    console.log(`  → No issues found`);
                }
            }
        }
    }

    /**
     * Generate summary report
     */
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 SEO FIX SUMMARY REPORT');
        console.log('='.repeat(80));

        const fixedByType = {};
        this.issues.fixed.forEach(issue => {
            if (!fixedByType[issue.type]) {
                fixedByType[issue.type] = 0;
            }
            fixedByType[issue.type] += issue.changes;
        });

        console.log('\n✅ FIXES APPLIED:');
        Object.entries(fixedByType).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} fixes`);
        });

        console.log(`\n📁 Total files processed: ${this.issues.fixed.length}`);

        if (this.issues.errors.length > 0) {
            console.log(`\n❌ ERRORS (${this.issues.errors.length}):`);
            this.issues.errors.forEach(err => {
                console.log(`   ${err.file}: ${err.error}`);
            });
        }

        console.log('\n' + '='.repeat(80));
    }
}

// Main execution
async function main() {
    const fixer = new AutomatedSEOFixer();

    console.log('🔧 AUTOMATED SEO FIXER');
    console.log('Using industry-standard tools: cheerio, clean-html');
    console.log('='.repeat(80));

    const options = {
        fixStructure: true,     // Fix tags outside <head>
        fixHreflang: true,      // Fix hreflang issues
        addCanonicals: true,    // Add missing canonicals
        fixLinks: true,         // Fix broken links
        baseUrl: 'https://diaeta.be'
    };

    await fixer.processDirectory(process.cwd(), options);
    fixer.generateReport();
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = AutomatedSEOFixer;

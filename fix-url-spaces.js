#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

let totalChanges = 0;
let filesFixed = 0;

function getAllHtmlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        if (item.name.startsWith('.') || item.name === 'node_modules') continue;

        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            files.push(...getAllHtmlFiles(fullPath));
        } else if (item.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

function fixFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content, { decodeEntities: false });

    let changes = 0;

    // Fix all href attributes
    $('[href]').each((i, elem) => {
        const $elem = $(elem);
        let href = $elem.attr('href');

        if (!href) return;

        let fixedHref = href;
        let needsFix = false;

        // Trim trailing/leading spaces
        if (href !== href.trim()) {
            fixedHref = fixedHref.trim();
            needsFix = true;
        }

        // URL-encode spaces in URLs (except for tel: which was already encoded)
        if (fixedHref.includes(' ') && !fixedHref.startsWith('tel:+32%20')) {
            // For tel: links, encode the space
            if (fixedHref.startsWith('tel:')) {
                fixedHref = fixedHref.replace(/ /g, '%20');
                needsFix = true;
            }
            // For regular URLs (not mailto, javascript, data, etc.)
            else if (!fixedHref.startsWith('mailto:') && 
                     !fixedHref.startsWith('javascript:') &&
                     !fixedHref.startsWith('data:') &&
                     !fixedHref.startsWith('#')) {
                fixedHref = fixedHref.replace(/ /g, '%20');
                needsFix = true;
            }
        }

        if (needsFix) {
            $elem.attr('href', fixedHref);
            changes++;
        }
    });

    // Fix all src attributes
    $('[src]').each((i, elem) => {
        const $elem = $(elem);
        let src = $elem.attr('src');

        if (!src) return;

        let fixedSrc = src;
        let needsFix = false;

        if (src !== src.trim()) {
            fixedSrc = fixedSrc.trim();
            needsFix = true;
        }

        if (fixedSrc.includes(' ') && !fixedSrc.startsWith('data:')) {
            fixedSrc = fixedSrc.replace(/ /g, '%20');
            needsFix = true;
        }

        if (needsFix) {
            $elem.attr('src', fixedSrc);
            changes++;
        }
    });

    // Fix rel and type attributes
    $('[rel]').each((i, elem) => {
        const $elem = $(elem);
        const rel = $elem.attr('rel');
        if (rel && rel !== rel.trim()) {
            $elem.attr('rel', rel.trim());
            changes++;
        }
    });

    $('[type]').each((i, elem) => {
        const $elem = $(elem);
        const type = $elem.attr('type');
        if (type && type !== type.trim()) {
            $elem.attr('type', type.trim());
            changes++;
        }
    });

    if (changes > 0) {
        fs.writeFileSync(filePath, $.html(), 'utf8');
        filesFixed++;
        totalChanges += changes;
        console.log(`✓ ${path.relative('.', filePath)}: ${changes} fixes`);
        return true;
    }

    return false;
}

console.log('🔧 FIXING URL SPACES\n');

const htmlFiles = getAllHtmlFiles('.');
console.log(`Scanning ${htmlFiles.length} HTML files...\n`);

htmlFiles.forEach(fixFile);

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Files fixed: ${filesFixed}`);
console.log(`Total changes: ${totalChanges}`);
console.log('='.repeat(80) + '\n');


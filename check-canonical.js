const fs = require('fs');
const glob = require('glob');

// Find all HTML files
const files = glob.sync('**/*.html', {
    ignore: ['node_modules/**', 'mcp-servers/**', '**/flaticon.html', 'lighthouse-*.html', 'footer_*.html', '404.html', 'index.html.backup*']
});

const missing = [];
const outsideHead = [];
const invalid = [];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check if canonical exists
        if (!content.includes('rel="canonical"') && !content.includes("rel='canonical'")) {
            missing.push(file);
            return;
        }
        
        // Check if canonical is outside <head>
        const headMatch = content.match(/<head[\s\S]*?<\/head>/i);
        if (headMatch) {
            const headContent = headMatch[0];
            if (!headContent.includes('rel="canonical"') && !headContent.includes("rel='canonical'")) {
                outsideHead.push(file);
            }
        }
        
        // Check for invalid attributes in canonical
        const canonicalMatch = content.match(/<link[^>]*rel="canonical"[^>]*>/gi);
        if (canonicalMatch) {
            canonicalMatch.forEach(tag => {
                if (tag.includes('hreflang=') || tag.includes('lang=') || tag.includes('media=') || tag.includes('type=')) {
                    invalid.push({ file, tag });
                }
            });
        }
    } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
    }
});

console.log('=== Canonical URL Issues ===\n');
console.log(`Missing canonical tags: ${missing.length}`);
if (missing.length > 0) {
    missing.forEach(f => console.log(`  - ${f}`));
}

console.log(`\nCanonical outside <head>: ${outsideHead.length}`);
if (outsideHead.length > 0) {
    outsideHead.forEach(f => console.log(`  - ${f}`));
}

console.log(`\nInvalid attributes: ${invalid.length}`);
if (invalid.length > 0) {
    invalid.forEach(i => console.log(`  - ${i.file}: ${i.tag}`));
}

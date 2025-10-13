const fs = require('fs');
const path = require('path');

// Define language mapping for directories
const langMapping = {
    'DE': 'de',
    'EN': 'en',
    'NL': 'nl',
    '': 'fr'  // root directory is French
};

// Define alternative page mappings across languages
const pageStructure = {
    'home.html': {
        fr: 'home.html',
        de: 'DE/home.html',
        en: 'EN/home.html',
        nl: 'NL/home.html'
    },
    'contact.html': {
        fr: 'contact.html',
        de: 'DE/contact.html',
        en: 'EN/contact.html',
        nl: 'NL/contact.html'
    },
    'cookies.html': {
        fr: 'cookies.html',
        de: 'DE/cookies.html',
        en: 'EN/cookies.html',
        nl: 'NL/cookies.html'
    },
    'legal.html': {
        fr: 'mentions-legales.html',
        de: 'DE/legal.html',
        en: 'EN/legal.html',
        nl: 'NL/legal.html'
    },
    'privacy.html': {
        fr: 'vie-privee.html',
        de: 'DE/privacy.html',
        en: 'EN/privacy.html',
        nl: 'NL/privacy.html'
    },
    'terms.html': {
        fr: 'conditions-generales.html',
        de: 'DE/terms.html',
        en: 'EN/terms.html',
        nl: 'NL/terms.html'
    }
};

async function fixHreflang() {
    console.log('=== FIXING HREFLANG TAGS ===\n');

    const report = JSON.parse(fs.readFileSync('seo-audit-report.json', 'utf8'));
    const filesToFix = report.issues.missingHreflang
        .filter(item => item.count < 3)
        .map(item => item.file);

    console.log(`Found ${filesToFix.length} files with incomplete hreflang tags\n`);

    let fixed = 0;
    let errors = [];

    for (const relPath of filesToFix) {
        try {
            const fullPath = path.join('.', relPath);
            
            if (!fs.existsSync(fullPath)) {
                errors.push({ file: relPath, error: 'File not found' });
                continue;
            }

            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Extract canonical URL to determine page type
            const canonicalMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
            if (!canonicalMatch) {
                console.log(`Skipping ${relPath}: No canonical tag found`);
                continue;
            }

            const canonicalUrl = canonicalMatch[1];
            const fileName = path.basename(relPath);
            
            // Get page category from canonical URL
            const urlPath = canonicalUrl.replace('https://diaeta.be/', '');
            
            // Build hreflang tags based on page type
            let hreflangTags = '';
            
            // For simple pages (contact, cookies, etc.)
            if (pageStructure[fileName]) {
                const pages = pageStructure[fileName];
                for (const [lang, pagePath] of Object.entries(pages)) {
                    const url = `https://diaeta.be/${pagePath}`;
                    hreflangTags += `<link rel="alternate" hreflang="${lang}" href="${url}" />\n`;
                }
                // Add x-default
                hreflangTags += `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />\n`;
            }

            // Only update if we have hreflang tags to add
            if (hreflangTags) {
                // Find the position after the canonical tag
                const insertPos = content.indexOf(canonicalMatch[0]) + canonicalMatch[0].length;
                
                // Remove existing hreflang tags if any
                content = content.replace(/<link[^>]+rel=["']alternate["'][^>]+hreflang=[^>]*>/gi, '');
                
                // Insert new hreflang tags
                content = content.slice(0, insertPos) + '\n' + hreflangTags + content.slice(insertPos);
                
                // Write back
                fs.writeFileSync(fullPath, content, 'utf8');
                fixed++;
                console.log(`✓ Fixed: ${relPath}`);
            }

        } catch (error) {
            errors.push({ file: relPath, error: error.message });
            console.error(`✗ Error fixing ${relPath}: ${error.message}`);
        }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Fixed: ${fixed} files`);
    console.log(`Errors: ${errors.length} files`);

    if (errors.length > 0) {
        console.log('\nErrors:');
        errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
    }
}

fixHreflang().catch(console.error);

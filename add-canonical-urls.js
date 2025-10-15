const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Function to determine canonical URL from file path
function getCanonicalUrl(filePath) {
    // Convert file path to URL
    let url = filePath.replace(/\\/g, '/');

    // Add leading slash if not present
    if (!url.startsWith('/')) {
        url = '/' + url;
    }

    // Special case for index.html (should be root)
    if (url === '/index.html') {
        return 'https://diaeta.be/';
    }

    return 'https://diaeta.be' + url;
}

// Function to add canonical tag to HTML file
function addCanonicalTag(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html, { decodeEntities: false });

        // Check if canonical tag already exists
        const existingCanonical = $('link[rel="canonical"]');
        const canonicalUrl = getCanonicalUrl(filePath);

        if (existingCanonical.length > 0) {
            // Update existing canonical
            existingCanonical.attr('href', canonicalUrl);
            console.log(`Updated canonical in ${filePath}: ${canonicalUrl}`);
        } else {
            // Add new canonical tag
            $('head').append(`    <link rel="canonical" href="${canonicalUrl}">\n`);
            console.log(`Added canonical to ${filePath}: ${canonicalUrl}`);
        }

        // Also ensure proper charset and viewport
        if ($('meta[charset]').length === 0) {
            $('head').prepend('    <meta charset="UTF-8">\n');
        }

        if ($('meta[name="viewport"]').length === 0) {
            $('head').append('    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n');
        }

        // Save the updated HTML
        fs.writeFileSync(filePath, $.html());
        return true;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

// Function to process all HTML files
async function processAllHtmlFiles() {
    const htmlFiles = [];

    // Function to recursively find HTML files
    function findHtmlFiles(dir) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Skip certain directories
                if (!file.startsWith('.') &&
                    file !== 'node_modules' &&
                    file !== 'bat' &&
                    file !== 'scripts' &&
                    file !== 'coverage-report') {
                    findHtmlFiles(filePath);
                }
            } else if (file.endsWith('.html') && !file.includes('.backup')) {
                htmlFiles.push(filePath);
            }
        }
    }

    // Find all HTML files
    findHtmlFiles('.');

    console.log(`Found ${htmlFiles.length} HTML files to process\n`);

    let processed = 0;
    let errors = 0;

    // Process each file
    for (const file of htmlFiles) {
        if (addCanonicalTag(file)) {
            processed++;
        } else {
            errors++;
        }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total files: ${htmlFiles.length}`);
    console.log(`Successfully processed: ${processed}`);
    console.log(`Errors: ${errors}`);
}

// Check if cheerio is installed
try {
    require.resolve('cheerio');
    processAllHtmlFiles().catch(console.error);
} catch(e) {
    console.log('Installing cheerio...');
    require('child_process').execSync('npm install cheerio', { stdio: 'inherit' });
    processAllHtmlFiles().catch(console.error);
}
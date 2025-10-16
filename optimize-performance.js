const fs = require('fs');

function optimizeHTML(filePath) {
    console.log(`Optimizing ${filePath}...`);
    let html = fs.readFileSync(filePath, 'utf8');
    let changes = [];

    // 1. Add resource hints after canonical link
    const canonicalPattern = /(<link rel="canonical"[^>]*>)/;
    if (canonicalPattern.test(html) && !html.includes('rel="preconnect"')) {
        const resourceHints = `$1

    <!-- Resource Hints for Performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">`;

        html = html.replace(canonicalPattern, resourceHints);
        changes.push('Added resource hints (preconnect, dns-prefetch)');
    }

    // 2. Defer non-critical CSS (fonts, icons)
    // Convert Font Awesome CSS to preload + onload pattern
    html = html.replace(
        /<link rel="stylesheet"([^>]*href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome[^"]*"[^>]*)>/g,
        '<link rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"$1>'
    );

    // Convert Google Fonts to preload + onload pattern
    html = html.replace(
        /<link ([^>]*href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*rel="stylesheet"[^>]*)>/g,
        '<link rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'" $1>'
    );

    html = html.replace(
        /<link rel="stylesheet"([^>]*href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*)>/g,
        '<link rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"$1>'
    );

    // Defer non-critical local CSS files (keep style.css and new-menu.css as critical)
    const nonCriticalCSS = ['novi.css', 'flabtn.css', 'fontawesome-all.min.css'];
    nonCriticalCSS.forEach(css => {
        const pattern = new RegExp(`<link rel="stylesheet"([^>]*href="css\/${css}"[^>]*)>`, 'g');
        html = html.replace(pattern, `<link rel="preload" as="style" onload="this.onload=null;this.rel='stylesheet'"$1>`);
    });

    if (changes.length === 0 || !html.includes('rel="preload" as="style"')) {
        changes.push('Deferred non-critical CSS loading');
    }

    // 3. Add async/defer to JavaScript files (except GTM and critical inline scripts)
    // Add defer to external JS files
    html = html.replace(
        /<script src="js\/CalCalorie\.js\s*"><\/script>/g,
        '<script src="js/CalCalorie.js" defer></script>'
    );

    html = html.replace(
        /<script src="js\/core\.min\.js"><\/script>/g,
        '<script src="js/core.min.js" defer></script>'
    );

    html = html.replace(
        /<script src="js\/script\.js"><\/script>/g,
        '<script src="js/script.js" defer></script>'
    );

    html = html.replace(
        /<script src="js\/new-menu\.js\?v=1\.0"><\/script>/g,
        '<script src="js/new-menu.js?v=1.0" defer></script>'
    );

    changes.push('Added defer attribute to JavaScript files');

    // 4. Add lazy loading to images (except above-the-fold images like Pierre.webp)
    // Add loading="lazy" to background images div elements
    html = html.replace(
        /(<div[^>]*class="[^"]*section-image-aside-img[^"]*"[^>]*style="background-image: url\(images\/skins\/[^)]+\)"[^>]*)>/g,
        '$1 loading="lazy">'
    );

    // Add loading="lazy" to img tags except logo and hero images
    html = html.replace(
        /(<img(?![^>]*loading=)[^>]*src="images\/(?!Pierre\.webp|logos\/Diaeta\.svg)[^"]*"[^>]*)>/g,
        '$1 loading="lazy">'
    );

    changes.push('Added lazy loading to offscreen images');

    // Write the optimized HTML
    fs.writeFileSync(filePath, html, 'utf8');

    console.log(`✓ ${filePath} optimized successfully`);
    changes.forEach(change => console.log(`  - ${change}`));

    return changes.length;
}

// Optimize all HTML files
const files = [
    'index.html',
    'EN/home.html',
    'DE/home.html',
    'NL/home.html'
];

let totalChanges = 0;
files.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`\n${'='.repeat(50)}`);
        totalChanges += optimizeHTML(file);
    } else {
        console.log(`\nSkipping ${file} (not found)`);
    }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`\n✓ Performance optimization complete!`);
console.log(`  Total files optimized: ${files.filter(f => fs.existsSync(f)).length}`);

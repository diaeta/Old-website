const fs = require('fs');
const path = require('path');

// Define the standardized hreflang mapping for each page type
const hreflangMappings = {
    'home': {
        'fr': 'https://diaeta.be/index.html',
        'nl': 'https://diaeta.be/NL/home.html',
        'en': 'https://diaeta.be/EN/home.html',
        'de': 'https://diaeta.be/DE/home.html',
        'x-default': 'https://diaeta.be/index.html'
    },
    'contact': {
        'fr': 'https://diaeta.be/contact.html',
        'nl': 'https://diaeta.be/NL/contact.html',
        'en': 'https://diaeta.be/EN/contact.html',
        'de': 'https://diaeta.be/DE/contact.html',
        'x-default': 'https://diaeta.be/contact.html'
    },
    'cookies': {
        'fr': 'https://diaeta.be/cookies.html',
        'nl': 'https://diaeta.be/NL/cookies.html',
        'en': 'https://diaeta.be/EN/cookies.html',
        'de': 'https://diaeta.be/DE/cookies.html',
        'x-default': 'https://diaeta.be/cookies.html'
    },
    'privacy': {
        'fr': 'https://diaeta.be/privacy.html',
        'nl': 'https://diaeta.be/NL/privacy.html',
        'en': 'https://diaeta.be/EN/privacy.html',
        'de': 'https://diaeta.be/DE/privacy.html',
        'x-default': 'https://diaeta.be/privacy.html'
    },
    'legal': {
        'fr': 'https://diaeta.be/legal.html',
        'nl': 'https://diaeta.be/NL/legal.html',
        'en': 'https://diaeta.be/EN/legal.html',
        'de': 'https://diaeta.be/DE/legal.html',
        'x-default': 'https://diaeta.be/legal.html'
    },
    'terms': {
        'fr': 'https://diaeta.be/terms.html',
        'nl': 'https://diaeta.be/NL/terms.html',
        'en': 'https://diaeta.be/EN/terms.html',
        'de': 'https://diaeta.be/DE/terms.html',
        'x-default': 'https://diaeta.be/terms.html'
    }
};

function generateHreflangTags(pageType) {
    const mapping = hreflangMappings[pageType];
    if (!mapping) return null;

    let tags = '    <!-- hreflang tags for multilingual SEO -->\n';
    for (const [lang, url] of Object.entries(mapping)) {
        tags += `    <link rel="alternate" hreflang="${lang}" href="${url}">\n`;
    }
    return tags;
}

function fixHreflangInFile(filePath, pageType) {
    let content = fs.readFileSync(filePath, 'utf8');

    const newTags = generateHreflangTags(pageType);
    if (!newTags) {
        console.log(`No mapping for page type: ${pageType}`);
        return false;
    }

    // Remove all existing hreflang tags (both with and without comments)
    content = content.replace(/\s*<!--\s*hreflang.*?-->\s*/g, '');
    content = content.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+"\s*>\s*/g, '');

    // Find the position to insert (before </head>)
    const headCloseMatch = content.match(/\s*<\/head>/);
    if (!headCloseMatch) {
        console.log(`No </head> tag found in ${filePath}`);
        return false;
    }

    // Insert new hreflang tags before </head>
    content = content.replace(/<\/head>/, `\n${newTags}\n</head>`);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed hreflang in: ${filePath}`);
    return true;
}

// Process files
const filesToFix = [
    { path: 'index.html', type: 'home' },
    { path: 'EN/home.html', type: 'home' },
    { path: 'NL/home.html', type: 'home' },
    { path: 'DE/home.html', type: 'home' },
    { path: 'contact.html', type: 'contact' },
    { path: 'EN/contact.html', type: 'contact' },
    { path: 'NL/contact.html', type: 'contact' },
    { path: 'DE/contact.html', type: 'contact' },
    { path: 'cookies.html', type: 'cookies' },
    { path: 'EN/cookies.html', type: 'cookies' },
    { path: 'NL/cookies.html', type: 'cookies' },
    { path: 'DE/cookies.html', type: 'cookies' },
    { path: 'privacy.html', type: 'privacy' },
    { path: 'EN/privacy.html', type: 'privacy' },
    { path: 'NL/privacy.html', type: 'privacy' },
    { path: 'DE/privacy.html', type: 'privacy' },
    { path: 'legal.html', type: 'legal' },
    { path: 'EN/legal.html', type: 'legal' },
    { path: 'NL/legal.html', type: 'legal' },
    { path: 'DE/legal.html', type: 'legal' },
    { path: 'terms.html', type: 'terms' },
    { path: 'EN/terms.html', type: 'terms' },
    { path: 'NL/terms.html', type: 'terms' },
    { path: 'DE/terms.html', type: 'terms' }
];

let fixed = 0;
let errors = 0;

filesToFix.forEach(file => {
    try {
        if (fs.existsSync(file.path)) {
            if (fixHreflangInFile(file.path, file.type)) {
                fixed++;
            }
        } else {
            console.log(`File not found: ${file.path}`);
        }
    } catch (error) {
        console.error(`Error processing ${file.path}:`, error.message);
        errors++;
    }
});

console.log(`\n=== Summary ===`);
console.log(`Files fixed: ${fixed}`);
console.log(`Errors: ${errors}`);

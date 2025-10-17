const fs = require('fs');

// Fix malformed canonical in conditions-generales.html
function fixConditionsGenerales() {
    const file = 'conditions-generales.html';
    if (!fs.existsSync(file)) {
        console.log(`File not found: ${file}`);
        return;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix the malformed canonical tag
    content = content.replace(
        /<link rel="canonical" href="https:\/\/diaeta\.be\/conditions-generales\.html" <link="" hreflang="fr">/g,
        '<link rel="canonical" href="https://diaeta.be/conditions-generales.html">'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed malformed canonical in: ${file}`);
}

// Move canonical tags inside <head> for files where they're outside
function moveCanonicalInsideHead(file) {
    if (!fs.existsSync(file)) {
        console.log(`File not found: ${file}`);
        return false;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Extract canonical tag
    const canonicalMatch = content.match(/<link[^>]*rel="canonical"[^>]*>/i);
    if (!canonicalMatch) {
        console.log(`No canonical tag found in: ${file}`);
        return false;
    }
    
    const canonicalTag = canonicalMatch[0];
    
    // Check if it's already in head
    const headMatch = content.match(/<head[\s\S]*?<\/head>/i);
    if (headMatch && headMatch[0].includes(canonicalTag)) {
        console.log(`Canonical already in <head> for: ${file}`);
        return false;
    }
    
    // Remove canonical from wherever it is
    content = content.replace(canonicalTag + '\n', '');
    content = content.replace(canonicalTag, '');
    
    // Add it before </head>
    content = content.replace(/<\/head>/i, `    ${canonicalTag}\n</head>`);
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Moved canonical inside <head> for: ${file}`);
    return true;
}

// Run fixes
console.log('=== Fixing Canonical Issues ===\n');
fixConditionsGenerales();
moveCanonicalInsideHead('cookies.html');
moveCanonicalInsideHead('privacy.html');
moveCanonicalInsideHead('NL/nutrigenomica-nutrigenetica/genetische-test.html');

console.log('\nDone!');

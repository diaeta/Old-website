const fs = require('fs');
const path = require('path');

let missingSelfRef = [];

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');

    if (relPath.includes('lighthouse-report') || relPath.includes('footer_en_') ||
        relPath.includes('footer_snippet') || relPath.includes('.bak')) {
      return;
    }

    // Extract all hreflang tags
    const hreflangTags = [...content.matchAll(/<link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
    
    if (hreflangTags.length === 0) return; // No hreflang tags at all
    
    // Determine the expected URL for this page
    const expectedUrl = 'https://diaeta.be/' + relPath;
    
    // Determine the language code for this page
    let pageLang = 'fr'; // default
    if (relPath.startsWith('NL/')) pageLang = 'nl';
    else if (relPath.startsWith('EN/')) pageLang = 'en';
    else if (relPath.startsWith('DE/')) pageLang = 'de';
    
    // Check if there's a self-reference (hreflang matching page language pointing to this exact URL)
    const hasSelfRef = hreflangTags.some(match => {
      const lang = match[1];
      const href = match[2];
      // Normalize URLs for comparison (handle URL encoding)
      const normalizedExpected = expectedUrl.replace(/%20/g, ' ');
      const normalizedHref = href.replace(/%20/g, ' ').replace(/%C3%A9/gi, 'é').replace(/%C3%A8/gi, 'è');
      
      return lang === pageLang && (href === expectedUrl || decodeURIComponent(href) === expectedUrl);
    });
    
    if (!hasSelfRef) {
      missingSelfRef.push({
        file: relPath,
        expectedLang: pageLang,
        expectedUrl: expectedUrl,
        hreflangCount: hreflangTags.length
      });
    }
  } catch (err) {
    // Ignore
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      scanFile(fullPath);
    }
  }
}

scanDirectory('.');

console.log('=== PAGES MISSING HREFLANG SELF-REFERENCE ===\n');
missingSelfRef.forEach((item, i) => {
  console.log((i + 1) + '. ' + item.file);
  console.log('   Expected: hreflang="' + item.expectedLang + '" href="' + item.expectedUrl + '"');
  console.log('   Has ' + item.hreflangCount + ' hreflang tags total');
  console.log('');
});

console.log('Total: ' + missingSelfRef.length + ' pages');

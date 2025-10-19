const fs = require('fs');
const path = require('path');

let mismatches = [];

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');

    if (relPath.includes('lighthouse-report') || relPath.includes('footer_en_') ||
        relPath.includes('footer_snippet') || relPath.includes('.bak')) {
      return;
    }

    // Extract canonical URL
    const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
                          content.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
    
    if (!canonicalMatch) return;
    
    const canonicalUrl = canonicalMatch[1];
    
    // Determine the language code for this page
    let pageLang = 'fr';
    if (relPath.startsWith('NL/')) pageLang = 'nl';
    else if (relPath.startsWith('EN/')) pageLang = 'en';
    else if (relPath.startsWith('DE/')) pageLang = 'de';
    
    // Extract all hreflang tags
    const hreflangTags = [...content.matchAll(/<link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
    const hreflangTags2 = [...content.matchAll(/<link[^>]*href=["']([^"']+)["'][^>]*hreflang=["']([^"']+)["'][^>]*>/gi)];
    
    // Combine both patterns (href first or hreflang first)
    let allHreflang = hreflangTags.map(m => ({ lang: m[1], href: m[2] }));
    allHreflang.push(...hreflangTags2.map(m => ({ lang: m[2], href: m[1] })));
    
    // Find self-reference (matching page language)
    const selfRef = allHreflang.find(h => h.lang === pageLang);
    
    if (selfRef && selfRef.href !== canonicalUrl) {
      mismatches.push({
        file: relPath,
        lang: pageLang,
        canonical: canonicalUrl,
        hreflangSelf: selfRef.href,
        issue: selfRef.href === canonicalUrl ? 'MATCH' : 'MISMATCH'
      });
    } else if (!selfRef) {
      mismatches.push({
        file: relPath,
        lang: pageLang,
        canonical: canonicalUrl,
        hreflangSelf: 'MISSING',
        issue: 'NO_SELF_REF'
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

console.log('=== HREFLANG SELF-REFERENCE ISSUES ===\n');
mismatches.forEach((item, i) => {
  console.log((i + 1) + '. ' + item.file);
  console.log('   Issue: ' + item.issue);
  console.log('   Page lang: ' + item.lang);
  console.log('   Canonical: ' + item.canonical);
  console.log('   Hreflang self-ref: ' + item.hreflangSelf);
  console.log('');
});

console.log('Total: ' + mismatches.length + ' pages with issues');

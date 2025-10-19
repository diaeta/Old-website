const fs = require('fs');
const path = require('path');

let fixed = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');
    const originalContent = content;

    if (relPath.includes('lighthouse-report') || relPath.includes('footer_en_') ||
        relPath.includes('footer_snippet') || relPath.includes('.bak')) {
      return false;
    }

    // Extract canonical URL
    const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
                          content.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
    
    if (!canonicalMatch) return false;
    
    const canonicalUrl = canonicalMatch[1];
    
    // Determine the language code for this page
    let pageLang = 'fr';
    if (relPath.startsWith('NL/')) pageLang = 'nl';
    else if (relPath.startsWith('EN/')) pageLang = 'en';
    else if (relPath.startsWith('DE/')) pageLang = 'de';
    
    // Find and replace hreflang self-reference
    // Pattern 1: hreflang first, then href
    const pattern1 = new RegExp(
      `<link([^>]*)hreflang=["']${pageLang}["']([^>]*)href=["'][^"']*["']([^>]*)>`,
      'gi'
    );
    
    content = content.replace(pattern1, (match) => {
      // Reconstruct with correct canonical URL
      return `<link$1hreflang="${pageLang}"$2href="${canonicalUrl}"$3>`;
    });
    
    // Pattern 2: href first, then hreflang
    const pattern2 = new RegExp(
      `<link([^>]*)href=["'][^"']*["']([^>]*)hreflang=["']${pageLang}["']([^>]*)>`,
      'gi'
    );
    
    content = content.replace(pattern2, (match) => {
      // Reconstruct with correct canonical URL
      return `<link$1href="${canonicalUrl}"$2hreflang="${pageLang}"$3>`;
    });
    
    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('FIXED: ' + relPath);
      console.log('  Lang: ' + pageLang + ', Canonical: ' + canonicalUrl);
      return true;
    }
    
    return false;
  } catch (err) {
    console.log('ERROR: ' + filePath + ' - ' + err.message);
    return false;
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
      if (fixFile(fullPath)) fixed++;
    }
  }
}

console.log('=== FIXING HREFLANG SELF-REFERENCES ===\n');
scanDirectory('.');
console.log('\n=== SUMMARY ===');
console.log('Fixed: ' + fixed + ' files');

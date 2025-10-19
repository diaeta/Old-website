const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all HTML files
const files = execSync('find . -name "*.html" -not -path "*/node_modules/*" -not -path "*/.git/*"', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(f => f && !f.includes('lighthouse-report') && !f.includes('footer_en_') && !f.includes('.bak'));

let multipleHreflang = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const hreflangTags = [...content.matchAll(/<link[^>]*hreflang=["']([^"']+)["'][^>]*>/gi)];
  
  const langCodes = {};
  hreflangTags.forEach(match => {
    const code = match[1];
    langCodes[code] = (langCodes[code] || 0) + 1;
  });
  
  Object.keys(langCodes).forEach(code => {
    if (langCodes[code] > 1) {
      console.log('ISSUE: ' + file + ' has ' + langCodes[code] + ' entries for hreflang="' + code + '"');
      multipleHreflang++;
    }
  });
});

console.log('\n=== SUMMARY ===');
console.log('Pages with multiple hreflang entries: ' + multipleHreflang);
if (multipleHreflang === 0) {
  console.log('✓ No hreflang multiple entries issues!');
}

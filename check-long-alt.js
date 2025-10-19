const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const files = execSync('find . -name "*.html" -not -path "*/node_modules/*"', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(f => f);

let longAlt = [];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const imgTags = [...content.matchAll(/<img[^>]*alt=["']([^"']+)["'][^>]*>/gi)];
    
    imgTags.forEach(match => {
      const alt = match[1];
      if (alt.length > 100) {
        longAlt.push({ file, alt, length: alt.length });
      }
    });
  } catch (err) {
    // Ignore
  }
});

console.log('=== IMAGE ALT TEXT > 100 CHARS ===\n');
longAlt.forEach((item, i) => {
  console.log((i + 1) + '. ' + item.file);
  console.log('   Length: ' + item.length);
  console.log('   Alt: ' + item.alt.substring(0, 80) + '...');
  console.log('');
});

console.log('Total: ' + longAlt.length);
if (longAlt.length === 0) {
  console.log('✓ All image alt texts are 100 characters or less!');
}

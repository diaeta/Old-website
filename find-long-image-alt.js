const fs = require('fs');
const path = require('path');

const longAlts = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');
    if (relPath.includes('lighthouse') || relPath.includes('footer') || relPath.includes('.bak')) return;
    
    const imgMatches = [...content.matchAll(/<img[^>]*>/gi)];
    imgMatches.forEach(m => {
      const img = m[0];
      const altMatch = img.match(/alt=["']([^"']+)["']/i);
      if (altMatch && altMatch[1].length > 100) {
        longAlts.push({ file: relPath, alt: altMatch[1], length: altMatch[1].length, fullTag: img.substring(0, 150) });
      }
    });
  } catch (err) {}
}

function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) scanFile(fullPath);
      }
  } catch (err) {}
}

scanDirectory('.');
console.log('=== IMAGE ALT TEXT > 100 CHARS ===\n');
longAlts.forEach((item, i) => {
  console.log((i + 1) + '. ' + item.file + ' (' + item.length + ' chars)');
  console.log('   Alt: "' + item.alt.substring(0, 100) + '..."');
  console.log('   Tag: ' + item.fullTag + '...');
  console.log('');
});
console.log('Total: ' + longAlts.length);

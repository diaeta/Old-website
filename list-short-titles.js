const fs = require('fs');
const path = require('path');

const shortTitles = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');
    
    if (relPath.includes('lighthouse') || relPath.includes('footer') || relPath.includes('.bak')) return;
    
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/is);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      if (title.length < 30) {
        shortTitles.push({ file: relPath, title, length: title.length });
      }
    }
  } catch (err) {}
}

function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        scanFile(fullPath);
      }
    }
  } catch (err) {}
}

scanDirectory('.');

shortTitles.sort((a, b) => a.length - b.length);

console.log('=== TITLES UNDER 30 CHARACTERS ===\n');
shortTitles.forEach((item, i) => {
  console.log((i + 1) + '. ' + item.file + ' (' + item.length + ' chars)');
  console.log('   "' + item.title + '"');
});
console.log('\nTotal: ' + shortTitles.length + ' pages');

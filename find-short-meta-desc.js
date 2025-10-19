const fs = require('fs');
const path = require('path');

const shortMetaDesc = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');
    if (relPath.includes('lighthouse') || relPath.includes('footer') || relPath.includes('.bak')) return;
    
    const metaMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaMatch && metaMatch[1].length < 70) {
      shortMetaDesc.push({ file: relPath, desc: metaMatch[1], length: metaMatch[1].length });
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
      } else if (entry.isFile() && entry.name.endsWith('.html')) scanFile(fullPath);
      }
  } catch (err) {}
}

scanDirectory('.');
shortMetaDesc.sort((a, b) => a.length - b.length);
console.log('=== META DESCRIPTIONS < 70 CHARS ===\n');
shortMetaDesc.forEach((item, i) => {
  console.log((i + 1) + '. ' + item.file + ' (' + item.length + ' chars)');
  console.log('   "' + item.desc + '"');
});
console.log('\nTotal: ' + shortMetaDesc.length);

const fs = require('fs');
const path = require('path');

let fixedMetaDesc = 0;
let fixedHreflang = 0;

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');
    const originalContent = content;

    // 1. Remove standalone old-format meta description tags (not part of hreflang line)
    const lines = content.split('\n');
    const fixedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip lines that have old format meta description (content before name) and NOT on hreflang line
      if (line.match(/<meta\s+content=["'][^"']*["']\s+name=["']description["']/i) &&
          !line.includes('hreflang')) {
        console.log('[META DESC REMOVED] ' + relPath + ' line ' + (i + 1));
        fixedMetaDesc++;
        continue;  // Skip this line
      }

      // Remove old concatenated hreflang lines (multiple hreflang on one line)
      if (line.match(/<link[^>]*hreflang[^>]*><link[^>]*hreflang/i)) {
        console.log('[HREFLANG REMOVED] ' + relPath + ' line ' + (i + 1) + ' (concatenated)');
        fixedHreflang++;
        continue;  // Skip concatenated hreflang line
      }

      fixedLines.push(line);
    }

    content = fixedLines.join('\n');

    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }

    return false;
  } catch (err) {
    console.log('[ERROR] ' + filePath + ': ' + err.message);
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
      fixFile(fullPath);
    }
  }
}

console.log('=== FIXING ALL DUPLICATES ===\n');
scanDirectory('.');

console.log('\n=== SUMMARY ===');
console.log('Old meta descriptions removed: ' + fixedMetaDesc);
console.log('Concatenated hreflang lines removed: ' + fixedHreflang);

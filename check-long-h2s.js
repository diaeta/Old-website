const fs = require('fs');
const path = require('path');

const longH2s = [];

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');

    // Skip utility files
    if (relPath.includes('lighthouse-report') || relPath.includes('footer_en_') || relPath.includes('footer_snippet')) {
      return;
    }

    // Remove HTML comments first
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // Check H2 tags
    const h2Matches = content.matchAll(/<h2[^>]*>(.*?)<\/h2>/gis);
    for (const h2Match of h2Matches) {
      const h2Text = h2Match[1].trim().replace(/<[^>]*>/g, '').trim();

      // Skip empty H2s (accordion headers, etc.)
      if (h2Text.length === 0) continue;

      if (h2Text.length > 70) {
        longH2s.push({
          file: relPath,
          text: h2Text,
          length: h2Text.length
        });
      }
    }
  } catch (err) {
    console.log('Error reading ' + filePath + ': ' + err.message);
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

console.log('=== H2 TAGS OVER 70 CHARACTERS ===\n');
console.log('Found ' + longH2s.length + ' H2 tags over 70 chars:\n');

longH2s.forEach((item, idx) => {
  console.log((idx + 1) + '. ' + item.file);
  console.log('   Length: ' + item.length + ' chars');
  const displayText = item.text.substring(0, 100) + (item.text.length > 100 ? '...' : '');
  console.log('   Text: "' + displayText + '"');
  console.log('');
});

if (longH2s.length > 0) {
  fs.writeFileSync('long_h2s.json', JSON.stringify(longH2s, null, 2), 'utf8');
  console.log('Full list saved to long_h2s.json');
}

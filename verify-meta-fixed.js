const fs = require('fs');
const path = require('path');

let shortMeta = [];

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');

    if (relPath.includes('lighthouse-report') || relPath.includes('footer_en_') ||
        relPath.includes('footer_snippet') || relPath.includes('.bak')) {
      return;
    }

    const metaDescMatches = [...content.matchAll(/<meta[^>]*name=["']description["'][^>]*>/gi)];
    
    if (metaDescMatches.length === 1) {
      const descMatch = metaDescMatches[0][0].match(/content="([^"]*)"/i) || metaDescMatches[0][0].match(/content='([^']*)'/i);
      if (descMatch && descMatch[1].length < 70) {
        shortMeta.push({ file: relPath, length: descMatch[1].length, content: descMatch[1] });
      }
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

console.log('=== META DESCRIPTIONS < 70 CHARS ===\n');
shortMeta.forEach((item, i) => {
  console.log((i + 1) + '. ' + item.file);
  console.log('   Length: ' + item.length);
  console.log('   Content: ' + item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''));
  console.log('');
});

console.log('Total: ' + shortMeta.length);

if (shortMeta.length === 0) {
  console.log('✓ All meta descriptions are 70+ characters!');
}

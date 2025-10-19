const fs = require('fs');
const path = require('path');

let missingH1 = [];
let duplicateH1 = [];
let longH1 = [];

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');

    if (relPath.includes('lighthouse-report') || relPath.includes('footer_en_') || relPath.includes('footer_snippet')) {
      return;
    }

    content = content.replace(/<!--[\s\S]*?-->/g, '');

    const h1Matches = [...content.matchAll(/<h1[^>]*>(.*?)<\/h1>/gis)];
    
    if (h1Matches.length === 0) {
      missingH1.push(relPath);
    } else if (h1Matches.length > 1) {
      const h1Texts = h1Matches.map(m => m[1].trim().replace(/<[^>]*>/g, '').trim());
      duplicateH1.push({ file: relPath, count: h1Matches.length, texts: h1Texts });
    }

    for (const h1Match of h1Matches) {
      const h1Text = h1Match[1].trim().replace(/<[^>]*>/g, '').trim();
      if (h1Text.length > 70) {
        longH1.push({ file: relPath, text: h1Text, length: h1Text.length });
      }
    }
  } catch (err) {
    console.log('Error: ' + filePath + ': ' + err.message);
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

console.log('=== H1 VERIFICATION ===\n');
console.log('Missing H1: ' + missingH1.length);
if (missingH1.length > 0) {
  missingH1.forEach(f => console.log('  - ' + f));
}

console.log('\nDuplicate H1: ' + duplicateH1.length);
if (duplicateH1.length > 0) {
  duplicateH1.forEach(item => {
    console.log('  - ' + item.file + ' (' + item.count + ' H1 tags)');
    item.texts.forEach((t, i) => console.log('    H1 #' + (i+1) + ': ' + t.substring(0, 60)));
  });
}

console.log('\nH1 over 70 chars: ' + longH1.length);
if (longH1.length > 0) {
  longH1.forEach(item => {
    console.log('  - ' + item.file + ' (' + item.length + ' chars): ' + item.text.substring(0, 60) + '...');
  });
}

const totalIssues = missingH1.length + duplicateH1.length + longH1.length;
console.log('\n=== TOTAL H1 ISSUES: ' + totalIssues + ' ===');
if (totalIssues === 0) {
  console.log('✓ ALL H1 ISSUES FIXED');
} else {
  console.log('✗ STILL HAVE H1 ISSUES TO FIX');
}

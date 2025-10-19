const fs = require('fs');
const path = require('path');

let multipleHreflang = [];

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');

    if (relPath.includes('lighthouse-report') || relPath.includes('footer_en_') || 
        relPath.includes('footer_snippet') || relPath.includes('.bak')) {
      return;
    }

    const hreflangMatches = [...content.matchAll(/<link[^>]*hreflang=["']([^"']+)["'][^>]*>/gi)];
    
    if (hreflangMatches.length > 0) {
      const hreflangCodes = {};
      hreflangMatches.forEach(match => {
        const fullTag = match[0];
        const codeMatch = fullTag.match(/hreflang=["']([^"']+)["']/i);
        if (codeMatch) {
          const code = codeMatch[1];
          if (!hreflangCodes[code]) {
            hreflangCodes[code] = [];
          }
          hreflangCodes[code].push(fullTag);
        }
      });
      
      Object.keys(hreflangCodes).forEach(code => {
        if (hreflangCodes[code].length > 1) {
          multipleHreflang.push({
            file: relPath,
            code: code,
            count: hreflangCodes[code].length,
            tags: hreflangCodes[code]
          });
        }
      });
    }
  } catch (err) {
    // Ignore
  }
}

function scanDirectory(dir) {
  const entries = fs.readFileSync(dir, { withFileTypes: true });
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

console.log('=== HREFLANG MULTIPLE ENTRIES CHECK ===');
console.log('');

if (multipleHreflang.length === 0) {
  console.log('No pages with multiple hreflang entries for same code');
} else {
  multipleHreflang.forEach((issue, i) => {
    console.log((i + 1) + '. ' + issue.file);
    console.log('   Language/Region: ' + issue.code + ' (' + issue.count + ' entries)');
    issue.tags.forEach((tag, j) => {
      const urlMatch = tag.match(/href=["']([^"']+)["']/i);
      const url = urlMatch ? urlMatch[1] : 'N/A';
      console.log('   Entry ' + (j + 1) + ': ' + url);
    });
    console.log('');
  });
}

console.log('Total: ' + multipleHreflang.length + ' pages');

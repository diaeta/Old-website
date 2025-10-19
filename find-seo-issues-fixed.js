const fs = require('fs');
const path = require('path');

let missingCanonical = [];
let duplicateTitles = {};
let duplicateMetaDesc = {};

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');

    if (relPath.includes('lighthouse-report') || relPath.includes('footer_en_') || 
        relPath.includes('footer_snippet') || relPath.includes('.bak')) {
      return;
    }

    // Check for canonical tag (any attribute order)
    const hasCanonical = content.match(/<link[^>]*rel=["']canonical["'][^>]*>/i) || 
                        content.match(/<link[^>]*href=[^>]*rel=["']canonical["']/i);
    if (!hasCanonical) {
      missingCanonical.push(relPath);
    }

    // Extract title
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/is);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      if (!duplicateTitles[title]) {
        duplicateTitles[title] = [];
      }
      duplicateTitles[title].push(relPath);
    }

    // Extract meta description
    const metaDescMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (metaDescMatch) {
      const metaDesc = metaDescMatch[1].trim();
      if (!duplicateMetaDesc[metaDesc]) {
        duplicateMetaDesc[metaDesc] = [];
      }
      duplicateMetaDesc[metaDesc].push(relPath);
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

console.log('=== SEO ISSUES ===\n');

console.log('Missing Canonical Tags: ' + missingCanonical.length);
if (missingCanonical.length > 0 && missingCanonical.length <= 10) {
  missingCanonical.forEach(f => console.log('  - ' + f));
} else if (missingCanonical.length > 10) {
  missingCanonical.slice(0, 10).forEach(f => console.log('  - ' + f));
  console.log('  ... and ' + (missingCanonical.length - 10) + ' more');
}

console.log('\nDuplicate Title Tags:');
let dupTitleCount = 0;
Object.keys(duplicateTitles).forEach(title => {
  if (duplicateTitles[title].length > 1) {
    dupTitleCount += duplicateTitles[title].length;
    console.log('  "' + title.substring(0, 60) + '" (' + duplicateTitles[title].length + ' pages)');
    duplicateTitles[title].forEach(f => console.log('    - ' + f));
  }
});
console.log('  Total pages with duplicate titles: ' + dupTitleCount);

console.log('\nDuplicate Meta Descriptions:');
let dupMetaCount = 0;
Object.keys(duplicateMetaDesc).forEach(desc => {
  if (duplicateMetaDesc[desc].length > 1) {
    dupMetaCount += duplicateMetaDesc[desc].length;
    console.log('  "' + desc.substring(0, 60) + '..." (' + duplicateMetaDesc[desc].length + ' pages)');
    duplicateMetaDesc[desc].forEach(f => console.log('    - ' + f));
  }
});
console.log('  Total pages with duplicate meta descriptions: ' + dupMetaCount);

const totalIssues = missingCanonical.length + dupTitleCount + dupMetaCount;
console.log('\n=== TOTAL ISSUES: ' + totalIssues + ' ===');
if (totalIssues === 0) {
  console.log('✓ ALL ISSUES FIXED');
} else {
  console.log('✗ STILL HAVE ISSUES TO FIX');
}

const fs = require('fs');
const path = require('path');

// Issues to check based on audit report
let issues = {
  metaDescMultiple: [],
  h1Missing: [],
  h1Duplicate: [],
  h1Over70: [],
  canonicalMissing: [],
  titleDuplicate: {},
  metaDescDuplicate: {}
};

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');

    if (relPath.includes('lighthouse-report') || relPath.includes('footer_en_') || 
        relPath.includes('footer_snippet') || relPath.includes('.bak')) {
      return;
    }

    // Remove HTML comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');

    // Check 1: Multiple meta descriptions on same page
    const metaDescMatches = [...content.matchAll(/<meta[^>]*name=["']description["'][^>]*>/gi)];
    if (metaDescMatches.length > 1) {
      issues.metaDescMultiple.push({ file: relPath, count: metaDescMatches.length });
    }

    // Check 2-4: H1 issues
    const h1Matches = [...content.matchAll(/<h1[^>]*>(.*?)<\/h1>/gis)];
    
    if (h1Matches.length === 0) {
      issues.h1Missing.push(relPath);
    } else if (h1Matches.length > 1) {
      const h1Texts = h1Matches.map(m => m[1].replace(/<[^>]*>/g, '').trim());
      issues.h1Duplicate.push({ file: relPath, count: h1Matches.length, texts: h1Texts });
    }

    h1Matches.forEach(h1Match => {
      const h1Text = h1Match[1].replace(/<[^>]*>/g, '').trim();
      if (h1Text.length > 70) {
        issues.h1Over70.push({ file: relPath, text: h1Text, length: h1Text.length });
      }
    });

    // Check 5: Missing canonical
    const hasCanonical = content.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
    if (!hasCanonical) {
      issues.canonicalMissing.push(relPath);
    }

    // Check 6: Duplicate titles
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/is);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      if (!issues.titleDuplicate[title]) {
        issues.titleDuplicate[title] = [];
      }
      issues.titleDuplicate[title].push(relPath);
    }

    // Check 7: Duplicate meta descriptions
    if (metaDescMatches.length === 1) {
      const descMatch = metaDescMatches[0][0].match(/content=["']([^"']+)["']/i);
      if (descMatch) {
        const desc = descMatch[1].trim();
        if (!issues.metaDescDuplicate[desc]) {
          issues.metaDescDuplicate[desc] = [];
        }
        issues.metaDescDuplicate[desc].push(relPath);
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

console.log('=== FINAL AUDIT VERIFICATION ===\n');

// Count duplicate titles
let dupTitleCount = 0;
Object.keys(issues.titleDuplicate).forEach(title => {
  if (issues.titleDuplicate[title].length > 1) {
    dupTitleCount += issues.titleDuplicate[title].length;
  }
});

// Count duplicate meta descriptions
let dupMetaCount = 0;
Object.keys(issues.metaDescDuplicate).forEach(desc => {
  if (issues.metaDescDuplicate[desc].length > 1) {
    dupMetaCount += issues.metaDescDuplicate[desc].length;
  }
});

console.log('HIGH PRIORITY (ÉLEVÉE) Issues:');
console.log('  Multiple meta descriptions (same page): ' + issues.metaDescMultiple.length + ' pages');
console.log('  ' + (issues.metaDescMultiple.length === 0 ? '✓ FIXED' : '✗ NEEDS FIX'));

console.log('\nMEDIUM PRIORITY (MOYENNE) Issues:');
console.log('  Missing H1 tags: ' + issues.h1Missing.length + ' pages');
console.log('  ' + (issues.h1Missing.length === 0 ? '✓ FIXED' : '✗ NEEDS FIX'));
console.log('  Missing canonical tags: ' + issues.canonicalMissing.length + ' pages');
console.log('  ' + (issues.canonicalMissing.length === 0 ? '✓ FIXED' : '✗ NEEDS FIX'));
console.log('  Duplicate title tags: ' + dupTitleCount + ' pages');
console.log('  ' + (dupTitleCount === 0 ? '✓ FIXED' : '✗ NEEDS FIX'));

console.log('\nLOW PRIORITY (FAIBLE) Issues:');
console.log('  Duplicate H1 tags: ' + issues.h1Duplicate.length + ' pages');
console.log('  ' + (issues.h1Duplicate.length === 0 ? '✓ FIXED' : '✗ NEEDS FIX'));
console.log('  H1 over 70 chars: ' + issues.h1Over70.length + ' pages');
console.log('  ' + (issues.h1Over70.length === 0 ? '✓ FIXED' : '✗ NEEDS FIX'));
console.log('  Duplicate meta descriptions: ' + dupMetaCount + ' pages');
console.log('  ' + (dupMetaCount === 0 ? '✓ FIXED' : '✗ NEEDS FIX (Low priority)'));

const totalHighMedium = issues.metaDescMultiple.length + issues.h1Missing.length + 
                        issues.canonicalMissing.length + dupTitleCount;

console.log('\n=== SUMMARY ===');
console.log('High + Medium priority issues: ' + totalHighMedium);
console.log('Low priority issues: ' + (issues.h1Duplicate.length + issues.h1Over70.length + dupMetaCount));

if (totalHighMedium === 0) {
  console.log('\n✓✓✓ ALL HIGH & MEDIUM PRIORITY ISSUES FIXED ✓✓✓');
} else {
  console.log('\n✗ STILL HAVE HIGH/MEDIUM PRIORITY ISSUES');
}

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all HTML files excluding node_modules
const htmlFiles = glob.sync('**/*.html', {
  ignore: ['**/node_modules/**', '**/mcp-servers/**']
});

console.log(`Checking ${htmlFiles.length} HTML files for SEO issues...\n`);

const issues = {
  titleOutsideHead: [],
  canonicalOutsideHead: [],
  hreflangOutsideHead: [],
  multipleTitle: [],
  multipleMetaDescription: []
};

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  // Find the closing </head> tag position
  const headCloseMatch = content.match(/<\/head>/i);
  if (!headCloseMatch) {
    console.log(`Warning: No closing </head> tag found in ${file}`);
    return;
  }

  const headClosePos = headCloseMatch.index;
  const afterHead = content.substring(headClosePos);

  // Check for title outside head
  if (afterHead.match(/<title[^>]*>/i)) {
    issues.titleOutsideHead.push(file);
  }

  // Check for canonical outside head
  if (afterHead.match(/<link[^>]*rel=["']canonical["'][^>]*>/i)) {
    issues.canonicalOutsideHead.push(file);
  }

  // Check for hreflang outside head
  if (afterHead.match(/<link[^>]*rel=["']alternate["'][^>]*hreflang/i)) {
    issues.hreflangOutsideHead.push(file);
  }

  // Check for multiple titles
  const titleMatches = content.match(/<title[^>]*>/gi);
  if (titleMatches && titleMatches.length > 1) {
    issues.multipleTitle.push({ file, count: titleMatches.length });
  }

  // Check for multiple meta descriptions
  const metaDescMatches = content.match(/<meta[^>]*name=["']description["'][^>]*>/gi);
  if (metaDescMatches && metaDescMatches.length > 1) {
    issues.multipleMetaDescription.push({ file, count: metaDescMatches.length });
  }
});

// Print results
console.log('=== TITLE OUTSIDE <head> ===');
console.log(`Found ${issues.titleOutsideHead.length} files with title outside <head>:`);
issues.titleOutsideHead.forEach(file => console.log(`  - ${file}`));

console.log('\n=== CANONICAL OUTSIDE <head> ===');
console.log(`Found ${issues.canonicalOutsideHead.length} files with canonical outside <head>:`);
issues.canonicalOutsideHead.forEach(file => console.log(`  - ${file}`));

console.log('\n=== HREFLANG OUTSIDE <head> ===');
console.log(`Found ${issues.hreflangOutsideHead.length} files with hreflang outside <head>:`);
issues.hreflangOutsideHead.forEach(file => console.log(`  - ${file}`));

console.log('\n=== MULTIPLE TITLE TAGS ===');
console.log(`Found ${issues.multipleTitle.length} files with multiple titles:`);
issues.multipleTitle.forEach(item => console.log(`  - ${item.file} (${item.count} titles)`));

console.log('\n=== MULTIPLE META DESCRIPTIONS ===');
console.log(`Found ${issues.multipleMetaDescription.length} files with multiple meta descriptions:`);
issues.multipleMetaDescription.forEach(item => console.log(`  - ${item.file} (${item.count} descriptions)`));

// Save results to JSON
fs.writeFileSync('head-issues-report.json', JSON.stringify(issues, null, 2));
console.log('\n✓ Report saved to head-issues-report.json');

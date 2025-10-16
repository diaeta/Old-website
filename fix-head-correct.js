const fs = require('fs');
const issuesData = JSON.parse(fs.readFileSync('head-issues-report.json', 'utf8'));

const filesToFix = [...new Set([
  ...issuesData.titleOutsideHead,
  ...issuesData.canonicalOutsideHead,
  ...issuesData.hreflangOutsideHead
])];

console.log(`Fixing ${filesToFix.length} files...\n`);

let fixedCount = 0;

filesToFix.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    // Pattern: <head>...</head><body>
    const headBodyPattern = /(<head[^>]*>)\s*(<\/head><body[^>]*>)/i;
    const match = content.match(headBodyPattern);
    
    if (!match) {
      console.log(`Skipping ${file} - no empty <head></head><body> pattern`);
      return;
    }

    console.log(`Fixing: ${file}`);

    const headOpen = match[1];  // <head>
    const headBodyClose = match[2];  // </head><body>
    const headBodyEnd = match.index + match[0].length;

    // Find where actual body content starts
    const afterHeadBody = content.substring(headBodyEnd);
    const bodyContentMatch = afterHeadBody.match(/\n*(<div class=["'](?!$)[^"']*["'][^>]*>)/i);

    if (!bodyContentMatch) {
      console.log(`  ⚠ No body content found`);
      return;
    }

    // Extract head elements (between </head><body> and first div)
    const headElements = afterHeadBody.substring(0, bodyContentMatch.index).trim();
    
    // Extract body content (from first div onwards)
    const bodyContent = afterHeadBody.substring(bodyContentMatch.index);

    // Reconstruct
    const before = content.substring(0, match.index);
    const fixed = before + headOpen + '\n' + headElements + '\n' + headBodyClose + bodyContent;

    // Backup
    fs.writeFileSync(file + '.backup', content);

    // Write
    fs.writeFileSync(file, fixed);

    console.log(`  ✓ Fixed`);
    fixedCount++;

  } catch (err) {
    console.error(`  ✗ ${file}: ${err.message}`);
  }
});

console.log(`\n✓ Fixed ${fixedCount}/${filesToFix.length} files`);

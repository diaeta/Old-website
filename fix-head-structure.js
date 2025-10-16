const fs = require('fs');
const issuesData = JSON.parse(fs.readFileSync('head-issues-report.json', 'utf8'));

// Files with elements outside head
const filesToFix = [...new Set([
  ...issuesData.titleOutsideHead,
  ...issuesData.canonicalOutsideHead,
  ...issuesData.hreflangOutsideHead
])];

console.log(`Fixing ${filesToFix.length} files...\n`);

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check if this file has the empty <head></head> pattern
    if (content.match(/<head>\s*<\/head>/i)) {
      console.log(`Fixing: ${file}`);
      
      // Find where </head> is
      const headCloseMatch = content.match(/<\/head>/i);
      const headClosePos = headCloseMatch.index;
      
      // Find where <body> tag starts  
      const bodyMatch = content.match(/<body[^>]*>/i);
      const bodyStartPos = bodyMatch ? bodyMatch.index + bodyMatch[0].length : -1;
      
      if (bodyStartPos === -1) {
        console.log(`  ⚠ Warning: No <body> tag found in ${file}`);
        return;
      }
      
      // Extract everything between </head> and first actual body content
      // We need to find where the head elements end
      let afterHead = content.substring(headClosePos + 7); // after </head>
      
      // Find all head elements that should be moved
      let headElements = '';
      let remainingContent = afterHead;
      
      // Extract elements until we hit actual body content (not meta/link/title/script in head)
      const headTagsRegex = /<(?:title|meta|link|script type="application\/ld\+json"|style)[^>]*>[\s\S]*?(?:<\/(?:title|script|style)>|>)/gi;
      let match;
      let lastIndex = 0;
      
      while ((match = headTagsRegex.exec(afterHead)) !== null) {
        // Check if this is right after previous match or just whitespace
        const between = afterHead.substring(lastIndex, match.index);
        if (between.trim() === '' || between.match(/^[\s\n]*$/)) {
          headElements += match[0] + '\n';
          lastIndex = headTagsRegex.lastIndex;
        } else {
          break; // Stop when we hit non-head content
        }
      }
      
      // Build the fixed content
      const beforeHead = content.substring(0, headClosePos);
      const afterHeadElements = content.substring(headClosePos + 7 + headElements.length);
      
      const fixed = beforeHead + '\n' + headElements + '</head>' + afterHeadElements;
      
      // Write backup
      fs.writeFileSync(file + '.backup', content);
      
      // Write fixed file
      fs.writeFileSync(file, fixed);
      
      console.log(`  ✓ Fixed`);
      fixedCount++;
    } else {
      console.log(`  ℹ ${file} doesn't have empty <head> pattern, skipping...`);
    }
  } catch (err) {
    console.error(`  ✗ Error fixing ${file}: ${err.message}`);
    errorCount++;
  }
});

console.log(`\n✓ Fixed ${fixedCount} files`);
if (errorCount > 0) {
  console.log(`✗ ${errorCount} errors`);
}
console.log('\nBackups created with .backup extension');

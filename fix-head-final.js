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
    let content = fs.readFileSync(file, 'utf8');

    // Check for empty <head></head> or <head>\n</head>
    const emptyHeadPattern = /<head>\s*<\/head>/i;

    if (!emptyHeadPattern.test(content)) {
      console.log(`Skipping ${file} - no empty <head> pattern`);
      return;
    }

    console.log(`Fixing: ${file}`);

    // Find <head> opening tag
    const headOpenMatch = content.match(/<head[^>]*>/i);
    if (!headOpenMatch) {
      console.log(`  ⚠ No <head> tag found`);
      return;
    }

    const headOpenEnd = headOpenMatch.index + headOpenMatch[0].length;

    // Find </head> closing tag
    const headCloseMatch = content.match(/<\/head>/i);
    if (!headCloseMatch) {
      console.log(`  ⚠ No </head> tag found`);
      return;
    }

    const headCloseStart = headCloseMatch.index;
    const headCloseEnd = headCloseStart + 7;

    // Find <body> tag
    const bodyMatch = content.match(/<body[^>]*>/i);
    if (!bodyMatch) {
      console.log(`  ⚠ No <body> tag found`);
      return;
    }

    const bodyEnd = bodyMatch.index + bodyMatch[0].length;

    // Extract content after <body> tag
    const afterBody = content.substring(bodyEnd);

    // Find where actual body content starts (first <div that's not in a conditional comment)
    // We'll look for common body elements
    const bodyContentMatch = afterBody.match(/\n*(<div class=["'](?!$)[^"']*["'][^>]*>)/i);

    if (!bodyContentMatch) {
      console.log(`  ⚠ Could not find body content start`);
      return;
    }

    const bodyContentStart = bodyEnd + bodyContentMatch.index;

    // Extract the head elements between </head> and body content
    const headElements = content.substring(headCloseEnd, bodyContentStart).trim();

    if (!headElements) {
      console.log(`  ⚠ No elements to move`);
      return;
    }

    // Build the fixed content
    const before = content.substring(0, headOpenEnd);
    const after = content.substring(bodyContentStart);

    const fixed = before + '\n' + headElements + '\n</head><body>\n' + after;

    // Backup
    fs.writeFileSync(file + '.backup', content);

    // Write fixed
    fs.writeFileSync(file, fixed);

    const linesMoved = headElements.split('\n').length;
    console.log(`  ✓ Fixed - moved ${linesMoved} lines`);
    fixedCount++;

  } catch (err) {
    console.error(`  ✗ Error in ${file}: ${err.message}`);
  }
});

console.log(`\n✓ Fixed ${fixedCount} files`);
console.log('Backups: *.backup');

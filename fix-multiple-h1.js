const fs = require('fs');

const report = JSON.parse(fs.readFileSync('multiple-h1-report.json', 'utf8'));

console.log('Fixing multiple H1 tags...\n');

let fixedCount = 0;

report.forEach(item => {
  const file = item.file;
  let content = fs.readFileSync(file, 'utf8');
  
  // Find all H1 tags
  const h1Pattern = /<h1([^>]*)>(.*?)<\/h1>/gi;
  let count = 0;
  
  // Replace: keep first H1, convert rest to H2
  content = content.replace(h1Pattern, (match, attrs, innerText) => {
    count++;
    if (count === 1) {
      // Keep first H1
      return match;
    } else {
      // Convert to H2
      return '<h2' + attrs + '>' + innerText + '</h2>';
    }
  });
  
  // Write file
  fs.writeFileSync(file, content);
  console.log('✓ Fixed: ' + file + ' (converted ' + (item.count - 1) + ' H1s to H2)');
  fixedCount++;
});

console.log('\n✓ Fixed ' + fixedCount + ' files');
console.log('  Strategy: Kept first H1, converted additional H1s to H2');

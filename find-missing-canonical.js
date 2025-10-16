const fs = require('fs');
const glob = require('glob');

const htmlFiles = glob.sync('**/*.html', {
  ignore: ['**/node_modules/**', '**/mcp-servers/**', '**/footer*.html']
});

const missingCanonical = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check if file has canonical link
  if (!content.match(/<link[^>]*rel=["']canonical["'][^>]*>/i)) {
    missingCanonical.push(file);
  }
});

console.log('=== PAGES MISSING CANONICAL URLs ===\n');
console.log('Found ' + missingCanonical.length + ' pages without canonical URLs:\n');

missingCanonical.forEach(file => console.log('  - ' + file));

fs.writeFileSync('missing-canonical.json', JSON.stringify(missingCanonical, null, 2));
console.log('\n✓ List saved to missing-canonical.json');

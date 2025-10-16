const fs = require('fs');
const glob = require('glob');

const htmlFiles = glob.sync('**/*.html', {
  ignore: ['**/node_modules/**', '**/mcp-servers/**', '**/footer*.html']
});

const multipleH1Files = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Find all H1 tags
  const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi);
  
  if (h1Matches && h1Matches.length > 1) {
    multipleH1Files.push({
      file: file,
      count: h1Matches.length,
      h1s: h1Matches.map(h1 => h1.replace(/<[^>]+>/g, '').trim().substring(0, 80))
    });
  }
});

console.log('=== PAGES WITH MULTIPLE H1 TAGS ===\n');
console.log('Found ' + multipleH1Files.length + ' pages with multiple H1 tags:\n');

multipleH1Files.forEach(item => {
  console.log('📄 ' + item.file + ' (' + item.count + ' H1s)');
  item.h1s.forEach((h1, i) => console.log('   ' + (i+1) + '. ' + h1));
  console.log('');
});

fs.writeFileSync('multiple-h1-report.json', JSON.stringify(multipleH1Files, null, 2));
console.log('✓ Report saved to multiple-h1-report.json');

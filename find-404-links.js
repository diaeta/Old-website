const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Finding all internal 404 links...\n');

const htmlFiles = glob.sync('**/*.html', {
  ignore: ['**/node_modules/**', '**/mcp-servers/**']
});

const broken404Links = [];
const linkPattern = /(?:href|src)=["']([^"']+)["']/gi;

htmlFiles.forEach(sourceFile => {
  const content = fs.readFileSync(sourceFile, 'utf8');
  let match;

  while ((match = linkPattern.exec(content)) !== null) {
    const link = match[1];

    // Skip external links, anchors, mailto, tel, javascript
    if (link.startsWith('http') || link.startsWith('//') ||
        link.startsWith('#') || link.startsWith('mailto:') ||
        link.startsWith('tel:') || link.startsWith('javascript:')) {
      continue;
    }

    // Resolve relative path
    const sourceDir = path.dirname(sourceFile);
    const targetPath = path.normalize(path.join(sourceDir, link.split('?')[0].split('#')[0]));

    // Check if file exists
    if (!fs.existsSync(targetPath)) {
      broken404Links.push({
        source: sourceFile,
        link: link,
        target: targetPath
      });
    }
  }
});

// Group by target
const groupedBy404 = {};
broken404Links.forEach(item => {
  if (!groupedBy404[item.target]) {
    groupedBy404[item.target] = [];
  }
  groupedBy404[item.target].push(item.source);
});

console.log('=== 404 BROKEN LINKS REPORT ===\n');
console.log('Found ' + broken404Links.length + ' broken links to ' + Object.keys(groupedBy404).length + ' missing files\n');

Object.keys(groupedBy404).sort().forEach(target => {
  const sources = [...new Set(groupedBy404[target])];
  console.log('\n❌ ' + target);
  console.log('   Linked from ' + sources.length + ' file(s):');
  sources.slice(0, 5).forEach(src => console.log('   - ' + src));
  if (sources.length > 5) {
    console.log('   ... and ' + (sources.length - 5) + ' more');
  }
});

// Save to JSON
fs.writeFileSync('404-links-report.json', JSON.stringify({ broken404Links, groupedBy404 }, null, 2));
console.log('\n✓ Full report saved to 404-links-report.json');

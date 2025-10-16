const fs = require('fs');

const file = 'NL/dietist-voedingsdeskundige-en-dietetiek/werkwijze.html';
const content = fs.readFileSync(file, 'utf8');

// Find <head></head><body>BOM + whitespace + <title>... until <h1>
const match = content.match(/(<head[^>]*>)\s*(<\/head><body[^>]*>[^\n]*\n+)(.*?)(\s*<h1[^>]*>)/is);

if (match) {
  const before = content.substring(0, match.index);
  const headOpen = match[1];
  const headElements = match[3].trim();
  const h1AndAfter = content.substring(match.index + match[0].length - match[4].length);
  
  const fixed = before + headOpen + '\n' + headElements + '\n</head><body>\n' + h1AndAfter;
  
  fs.writeFileSync(file + '.backup', content);
  fs.writeFileSync(file, fixed);
  
  const lineCount = headElements.split('\n').length;
  console.log('OK Fixed: ' + file);
  console.log('  Moved ' + lineCount + ' lines into head');
} else {
  console.log('FAIL No match found');
}

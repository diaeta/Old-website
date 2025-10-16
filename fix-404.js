const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Fixing 404 path issues...');

const htmlFiles = glob.sync('**/*.html', {
  ignore: ['**/node_modules/**', '**/mcp-servers/**']
});

let fixCount = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Replace backslashes with forward slashes
  const original = content;
  content = content.replace(/((?:href|src)=["'])([^"']*)(

["'])/gi, (match, prefix, pathStr, suffix) => {
    if (pathStr.startsWith('http') || pathStr.startsWith('//') || 
        pathStr.startsWith('#') || pathStr.startsWith('mailto:') || 
        pathStr.startsWith('tel:') || pathStr.startsWith('javascript:')) {
      return match;
    }
    const fixed = pathStr.split('92').join('/');
    if (fixed \!== pathStr) modified = true;
    const trimmed = fixed.trimEnd();
    if (trimmed \!== fixed) modified = true;
    return prefix + trimmed + suffix;
  });
  
  if (modified) {
    fs.writeFileSync(file, content);
    fixCount++;
    console.log('Fixed: ' + file);
  }
});

console.log('Fixed ' + fixCount + ' files');
node
fix-404.js

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Fixing 404 path issues...\n');

const htmlFiles = glob.sync('**/*.html', {
  ignore: ['**/node_modules/**', '**/mcp-servers/**']
});

let fixCount = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Fix 1: Replace backslashes with forward slashes in relative paths
  const backslashPattern = /((?:href|src)=["'])([^"']*)(["'])/gi;
  content = content.replace(backslashPattern, (match, prefix, pathStr, suffix) => {
    // Skip external URLs, anchors, mailto, tel
    if (pathStr.startsWith('http') || pathStr.startsWith('//') || 
        pathStr.startsWith('#') || pathStr.startsWith('mailto:') || 
        pathStr.startsWith('tel:') || pathStr.startsWith('javascript:')) {
      return match;
    }
    
    // Convert backslashes to forward slashes
    if (pathStr.includes('\')) {
      const fixed = pathStr.split('\').join('/');
      modified = true;
      return prefix + fixed + suffix;
    }
    
    // Remove trailing spaces
    if (pathStr.match(/\s+$/)) {
      modified = true;
      return prefix + pathStr.trimEnd() + suffix;
    }
    
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(file, content);
    fixCount++;
    console.log('✓ Fixed: ' + file);
  }
});

console.log('\n✓ Fixed ' + fixCount + ' files');

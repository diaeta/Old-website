const fs = require('fs');

// Issue 1: Fix NL files with empty head
const nlFiles = [
  'NL/legal.html',
  'NL/terms.html',
  'NL/dietist-voedingsdeskundige-en-dietetiek/werkwijze.html'
];

console.log('=== Fixing NL files with empty <head> ===\n');

nlFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }
  
  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/(<head[^>]*>)\s*(<\/head><body[^>]*>)([\s\S]*?)(<\/body>)/i);
  
  if (!match) {
    console.log(`Skipping ${file} - pattern not found`);
    return;
  }
  
  const before = content.substring(0, match.index);
  const headOpen = match[1];
  const bodyContent = match[3];
  
  // Extract head elements (everything until we hit actual HTML body content)
  const headMatch = bodyContent.match(/([\s\S]*?)(<[^!][^>]*>)/);
  if (!headMatch) {
    console.log(`Skipping ${file} - no head content found`);
    return;
  }
  
  const headElements = headMatch[1].trim();
  const remainingBody = bodyContent.substring(headMatch[1].length);
  
  const fixed = before + headOpen + '\n' + headElements + '\n</head><body>' + remainingBody + '</body>\n</html>';
  
  fs.writeFileSync(file + '.backup', content);
  fs.writeFileSync(file, fixed);
  console.log(`✓ Fixed: ${file}`);
});

// Issue 2: Remove duplicate canonical/hreflang from body
console.log('\n=== Removing duplicate canonical/hreflang from body ===\n');

const deFile = 'DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Gewichtsverlust/Abnehmen-und-Gewichtsverlust.html';

if (fs.existsSync(deFile)) {
  let content = fs.readFileSync(deFile, 'utf8');
  const lines = content.split('\n');
  
  let inHead = false;
  let afterHead = false;
  const filtered = [];
  
  lines.forEach((line, i) => {
    if (line.match(/<head[^>]*>/i)) inHead = true;
    if (line.match(/<\/head>/i)) { afterHead = true; inHead = false; }
    
    // Remove canonical and hreflang if they appear after </head>
    if (afterHead && line.match(/rel=["'](canonical|alternate)["']/i)) {
      console.log(`  Removing line ${i + 1}: ${line.trim().substring(0, 80)}...`);
      return; // Skip this line
    }
    
    filtered.push(line);
  });
  
  fs.writeFileSync(deFile + '.backup', content);
  fs.writeFileSync(deFile, filtered.join('\n'));
  console.log(`✓ Fixed: ${deFile}`);
}

// Issue 3 & 4: Remove duplicate titles and meta descriptions
console.log('\n=== Removing duplicate titles and meta descriptions ===\n');

const duplicateFiles = {
  title: [
    'cookies.html',
    'DE/cookies.html',
    'DE/privacy.html',
    'EN/cookies.html',
    'EN/legal.html',
    'EN/privacy.html',
    'EN/terms.html',
    'privacy.html'
  ],
  metaDesc: [
    'contact.html',
    'DE/contact.html',
    'DE/Diabetes.html',
    'EN/contact.html',
    'EN/diabetes.html',
    'NL/contact.html',
    'NL/diabetes.html'
  ]
};

[...new Set([...duplicateFiles.title, ...duplicateFiles.metaDesc])].forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Remove duplicate titles (keep first one)
  const titleMatches = [...content.matchAll(/<title[^>]*>.*?<\/title>/gi)];
  if (titleMatches.length > 1) {
    console.log(`  ${file}: Removing ${titleMatches.length - 1} duplicate title(s)`);
    for (let i = titleMatches.length - 1; i >= 1; i--) {
      content = content.substring(0, titleMatches[i].index) + 
                content.substring(titleMatches[i].index + titleMatches[i][0].length);
      modified = true;
    }
  }
  
  // Remove duplicate meta descriptions (keep first one)
  const metaMatches = [...content.matchAll(/<meta[^>]*name=["']description["'][^>]*>/gi)];
  if (metaMatches.length > 1) {
    console.log(`  ${file}: Removing ${metaMatches.length - 1} duplicate meta description(s)`);
    for (let i = metaMatches.length - 1; i >= 1; i--) {
      content = content.substring(0, metaMatches[i].index) + 
                content.substring(metaMatches[i].index + metaMatches[i][0].length);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(file + '.backup', fs.readFileSync(file, 'utf8'));
    fs.writeFileSync(file, content);
    console.log(`  ✓ Fixed: ${file}`);
  }
});

console.log('\n✓ All fixes complete!');

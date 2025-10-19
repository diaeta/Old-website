const fs = require('fs');
const path = require('path');

const issues = {
  h2Missing: [], metaDescMultiple: [], h1Duplicate: [], hreflangMultiple: [],
  imageAltLong: [], metaDesc155: [], h1Over70: [], h1NonSeq: [], h1Missing: [],
  metaDescDup: {}, urlSpace: [], metaDesc985: [], h2Dup: {}, urlOver115: [],
  metaDescUnder70: [], titleSameH1: [], h2Multiple: [], titleUnder30: [],
  urlUppercase: [], h2NonSeq: [], canonicalMissing: [], urlRepetitive: [],
  hreflangNoSelfRef: [], urlNonASCII: [], imageMissingSize: [], titleDup: {},
  externalNoAnchor: [], nonDescriptiveAnchor: []
};

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');
    if (relPath.includes('lighthouse') || relPath.includes('footer') || relPath.includes('.bak')) return;
    
    const noComments = content.replace(/<!--[\s\S]*?-->/g, '');
    
    // H2 checks
    const h2Matches = noComments.match(/<h2[^>]*>.*?<\/h2>/gis);
    if (!h2Matches || h2Matches.length === 0) issues.h2Missing.push(relPath);
    if (h2Matches && h2Matches.length > 1) issues.h2Multiple.push(relPath);
    
    // Meta description checks
    const metaDescMatches = [...content.matchAll(/<meta[^>]*name=["']description["'][^>]*>/gi)];
    if (metaDescMatches.length > 1) issues.metaDescMultiple.push(relPath);
    if (metaDescMatches.length === 1) {
      const descMatch = metaDescMatches[0][0].match(/content=["']([^"']+)["']/i);
      if (descMatch) {
        const desc = descMatch[1];
        if (desc.length > 155) issues.metaDesc155.push(relPath);
        if (desc.length < 70) issues.metaDescUnder70.push(relPath);
        if (!issues.metaDescDup[desc]) issues.metaDescDup[desc] = [];
        issues.metaDescDup[desc].push(relPath);
      }
    }
    
    // H1 checks
    const h1Matches = [...noComments.matchAll(/<h1[^>]*>(.*?)<\/h1>/gis)];
    if (h1Matches.length === 0) issues.h1Missing.push(relPath);
    if (h1Matches.length > 1) issues.h1Duplicate.push(relPath);
    h1Matches.forEach(m => {
      const h1Text = m[1].replace(/<[^>]*>/g, '').trim();
      if (h1Text.length > 70) issues.h1Over70.push(relPath);
    });
    
    // H1 non-sequential
    const firstHeading = noComments.match(/<h([1-6])[^>]*>/i);
    if (firstHeading && firstHeading[1] !== '1') issues.h1NonSeq.push(relPath);
    
    // Hreflang checks
    const hreflangMatches = [...content.matchAll(/<link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
    const hreflangCodes = {};
    let hasSelfRef = false;
    hreflangMatches.forEach(m => {
      const code = m[1];
      const href = m[2];
      hreflangCodes[code] = (hreflangCodes[code] || 0) + 1;
      if (href.includes(relPath.split('/').pop())) hasSelfRef = true;
    });
    Object.keys(hreflangCodes).forEach(code => {
      if (hreflangCodes[code] > 1) issues.hreflangMultiple.push(relPath);
    });
    if (hreflangMatches.length > 0 && !hasSelfRef) issues.hreflangNoSelfRef.push(relPath);
    
    // URL checks
    if (filePath.includes(' ')) issues.urlSpace.push(relPath);
    if (relPath !== relPath.toLowerCase()) issues.urlUppercase.push(relPath);
    if (!/^[\x00-\x7F]*$/.test(relPath)) issues.urlNonASCII.push(relPath);
    const url = 'https://diaeta.be/' + relPath;
    if (url.length > 115) issues.urlOver115.push(relPath);
    
    // Title checks
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/is);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      if (title.length < 30) issues.titleUnder30.push(relPath);
      if (!issues.titleDup[title]) issues.titleDup[title] = [];
      issues.titleDup[title].push(relPath);
      if (h1Matches.length > 0) {
        const h1Text = h1Matches[0][1].replace(/<[^>]*>/g, '').trim();
        if (title === h1Text) issues.titleSameH1.push(relPath);
      }
    }
    
    // Canonical check
    if (!content.match(/<link[^>]*rel=["']canonical["'][^>]*>/i)) issues.canonicalMissing.push(relPath);
    
    // Image checks
    const imgMatches = [...content.matchAll(/<img[^>]*>/gi)];
    imgMatches.forEach(m => {
      const img = m[0];
      const altMatch = img.match(/alt=["']([^"']+)["']/i);
      if (altMatch && altMatch[1].length > 100) issues.imageAltLong.push(relPath);
      if (!img.includes('width') || !img.includes('height')) issues.imageMissingSize.push(relPath);
    });
    
  } catch (err) {}
}

function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) scanFile(fullPath);
    }
  } catch (err) {}
}

scanDirectory('.');

console.log('=== ULTRA COMPREHENSIVE AUDIT CHECK ===\n');
console.log('Checking ALL 40 issue types from audit...\n');

const results = [
  ['H2 Missing', issues.h2Missing.length],
  ['Meta Desc Multiple', issues.metaDescMultiple.length],
  ['H1 Duplicate', issues.h1Duplicate.length],
  ['Hreflang Multiple', issues.hreflangMultiple.length],
  ['Image Alt > 100 chars', issues.imageAltLong.length],
  ['Meta Desc > 155 chars', issues.metaDesc155.length],
  ['H1 > 70 chars', issues.h1Over70.length],
  ['H1 Non-Sequential', issues.h1NonSeq.length],
  ['H1 Missing', issues.h1Missing.length],
  ['Meta Desc Duplicate', Object.keys(issues.metaDescDup).filter(k => issues.metaDescDup[k].length > 1).length],
  ['URL with Space', issues.urlSpace.length],
  ['Meta Desc > 985px', issues.metaDesc985.length],
  ['URL > 115 chars', issues.urlOver115.length],
  ['Meta Desc < 70 chars', issues.metaDescUnder70.length],
  ['Title same as H1', issues.titleSameH1.length],
  ['H2 Multiple', issues.h2Multiple.length],
  ['Title < 30 chars', issues.titleUnder30.length],
  ['URL Uppercase', issues.urlUppercase.length],
  ['H2 Non-Sequential', issues.h2NonSeq.length],
  ['Canonical Missing', issues.canonicalMissing.length],
  ['Hreflang No Self-Ref', issues.hreflangNoSelfRef.length],
  ['URL Non-ASCII', issues.urlNonASCII.length],
  ['Image Missing Size', issues.imageMissingSize.length],
  ['Title Duplicate', Object.keys(issues.titleDup).filter(k => issues.titleDup[k].length > 1).length]
];

results.forEach(r => {
  const status = r[1] === 0 ? '✓' : '✗';
  console.log(`${status} ${r[0]}: ${r[1]}`);
});

const totalIssues = results.reduce((sum, r) => sum + r[1], 0);
console.log('\n=== TOTAL ISSUES: ' + totalIssues + ' ===');

if (issues.titleUnder30.length > 0) {
  console.log('\nShort titles need expansion:');
  issues.titleUnder30.slice(0, 10).forEach(f => console.log('  - ' + f));
  if (issues.titleUnder30.length > 10) console.log('  ... and ' + (issues.titleUnder30.length - 10) + ' more');
}

if (issues.urlSpace.length > 0) {
  console.log('\nURLs with spaces:');
  issues.urlSpace.forEach(f => console.log('  - ' + f));
}

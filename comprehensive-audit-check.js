const fs = require('fs');
const path = require('path');

const results = { h2Missing: [], metaDescMultiple: [], h1Duplicate: [], hreflangMultiple: [], metaDesc155: [], h1Over70: [], h1NonSequential: [], h1Missing: [], metaDescDuplicate: {}, urlWithSpace: [], urlOver115: [], metaDescUnder70: [], titleSameAsH1: [], h2Multiple: [], titleUnder30: [], urlUppercase: [], canonicalMissing: [], urlNonASCII: [], titleDuplicate: {} };

function scanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relPath = filePath.split(path.sep).join('/');
    if (relPath.includes('lighthouse-report') || relPath.includes('footer_en_') || relPath.includes('footer_snippet') || relPath.includes('.bak')) return;
    const contentNoComments = content.replace(/<!--[\s\S]*?-->/g, '');
    const h2Matches = contentNoComments.match(/<h2[^>]*>.*?<\/h2>/gis);
    if (!h2Matches || h2Matches.length === 0) results.h2Missing.push(relPath);
    const metaDescMatches = [...content.matchAll(/<meta[^>]*name=["']description["'][^>]*>/gi)];
    if (metaDescMatches.length > 1) results.metaDescMultiple.push(relPath);
    const h1Matches = [...contentNoComments.matchAll(/<h1[^>]*>(.*?)<\/h1>/gis)];
    if (h1Matches.length > 1) results.h1Duplicate.push(relPath);
    const hreflangTags = [...content.matchAll(/<link[^>]*hreflang=["']([^"']+)["'][^>]*>/gi)];
    const langCodes = {};
    hreflangTags.forEach(match => { const code = match[1]; langCodes[code] = (langCodes[code] || 0) + 1; });
    Object.keys(langCodes).forEach(code => { if (langCodes[code] > 1) results.hreflangMultiple.push({ file: relPath, code, count: langCodes[code] }); });
    if (metaDescMatches.length === 1) {
      const descMatch = metaDescMatches[0][0].match(/content="([^"]*)"/i) || metaDescMatches[0][0].match(/content='([^']*)'/i);
      if (descMatch && descMatch[1].length > 155) results.metaDesc155.push({ file: relPath, length: descMatch[1].length });
      if (descMatch && descMatch[1].length < 70) results.metaDescUnder70.push({ file: relPath, length: descMatch[1].length });
      const desc = descMatch[1].trim();
      if (!results.metaDescDuplicate[desc]) results.metaDescDuplicate[desc] = [];
      results.metaDescDuplicate[desc].push(relPath);
    }
    h1Matches.forEach(match => { const h1Text = match[1].replace(/<[^>]*>/g, '').trim(); if (h1Text.length > 70) results.h1Over70.push({ file: relPath, text: h1Text, length: h1Text.length }); });
    const firstHeadingMatch = contentNoComments.match(/<h([1-6])[^>]*>/i);
    if (firstHeadingMatch && firstHeadingMatch[1] !== '1') results.h1NonSequential.push(relPath);
    if (h1Matches.length === 0) results.h1Missing.push(relPath);
    if (filePath.includes(' ')) results.urlWithSpace.push(relPath);
    const urlPath = 'https://diaeta.be/' + relPath;
    if (urlPath.length > 115) results.urlOver115.push({ file: relPath, length: urlPath.length });
    const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/is);
    if (titleMatch && h1Matches.length > 0) {
      const title = titleMatch[1].trim();
      const h1Text = h1Matches[0][1].replace(/<[^>]*>/g, '').trim();
      if (title === h1Text) results.titleSameAsH1.push(relPath);
      if (title.length < 30) results.titleUnder30.push({ file: relPath, length: title.length });
      if (!results.titleDuplicate[title]) results.titleDuplicate[title] = [];
      results.titleDuplicate[title].push(relPath);
    }
    if (h2Matches && h2Matches.length > 1) results.h2Multiple.push({ file: relPath, count: h2Matches.length });
    if (relPath !== relPath.toLowerCase()) results.urlUppercase.push(relPath);
    const hasCanonical = content.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
    if (!hasCanonical) results.canonicalMissing.push(relPath);
    if (!/^[\x00-\x7F]*$/.test(relPath)) results.urlNonASCII.push(relPath);
  } catch (err) {}
}

function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) { if (!entry.name.startsWith('.') && entry.name !== 'node_modules') scanDirectory(fullPath); }
      else if (entry.isFile() && entry.name.endsWith('.html')) scanFile(fullPath);
    }
  } catch (err) {}
}

scanDirectory('.');

console.log('=== COMPREHENSIVE AUDIT CHECK ===\n');
const issues = [
  { name: 'Hreflang Multiple Entries', priority: 'HIGH', count: results.hreflangMultiple.length },
  { name: 'Meta Description Multiple (same page)', priority: 'MEDIUM', count: results.metaDescMultiple.length },
  { name: 'H1 Missing', priority: 'MEDIUM', count: results.h1Missing.length },
  { name: 'Canonical Missing', priority: 'MEDIUM', count: results.canonicalMissing.length },
  { name: 'Title < 30 chars', priority: 'MEDIUM', count: results.titleUnder30.length },
  { name: 'Title Duplicate', priority: 'MEDIUM', count: Object.keys(results.titleDuplicate).filter(k => results.titleDuplicate[k].length > 1).length },
  { name: 'H2 Missing', priority: 'LOW', count: results.h2Missing.length },
  { name: 'H1 Duplicate', priority: 'LOW', count: results.h1Duplicate.length },
  { name: 'Meta Description > 155 chars', priority: 'LOW', count: results.metaDesc155.length },
  { name: 'H1 > 70 chars', priority: 'LOW', count: results.h1Over70.length },
  { name: 'H1 Non-Sequential', priority: 'LOW', count: results.h1NonSequential.length },
  { name: 'Meta Description Duplicate', priority: 'LOW', count: Object.keys(results.metaDescDuplicate).filter(k => results.metaDescDuplicate[k].length > 1).length },
  { name: 'URL Contains Space', priority: 'LOW', count: results.urlWithSpace.length },
  { name: 'URL > 115 chars', priority: 'LOW', count: results.urlOver115.length },
  { name: 'Meta Description < 70 chars', priority: 'LOW', count: results.metaDescUnder70.length },
  { name: 'Title Same as H1', priority: 'LOW', count: results.titleSameAsH1.length },
  { name: 'H2 Multiple', priority: 'LOW', count: results.h2Multiple.length },
  { name: 'URL Uppercase', priority: 'LOW', count: results.urlUppercase.length },
  { name: 'URL Non-ASCII', priority: 'LOW', count: results.urlNonASCII.length }
];
console.log('HIGH PRIORITY:');
issues.filter(i => i.priority === 'HIGH').forEach(i => console.log(`  ${i.name}: ${i.count} ${i.count === 0 ? '✓' : '✗'}`));
console.log('\nMEDIUM PRIORITY:');
issues.filter(i => i.priority === 'MEDIUM').forEach(i => console.log(`  ${i.name}: ${i.count} ${i.count === 0 ? '✓' : '✗'}`));
console.log('\nLOW PRIORITY (showing only non-zero):');
issues.filter(i => i.priority === 'LOW' && i.count > 0).forEach(i => console.log(`  ${i.name}: ${i.count}`));
const highCount = issues.filter(i => i.priority === 'HIGH' && i.count > 0).length;
const mediumCount = issues.filter(i => i.priority === 'MEDIUM' && i.count > 0).length;
console.log('\n=== SUMMARY ===');
console.log(`HIGH priority issues remaining: ${highCount}`);
console.log(`MEDIUM priority issues remaining: ${mediumCount}`);
if (highCount === 0 && mediumCount === 0) console.log('\n✓✓✓ ALL HIGH & MEDIUM PRIORITY ISSUES FIXED ✓✓✓');

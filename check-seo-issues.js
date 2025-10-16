const fs = require('fs');
const glob = require('glob');

const results = {
  duplicateTitles: {},
  duplicateH1s: {},
  longTitles: [],
  shortTitles: [],
  missingH1: [],
  emptyTitles: []
};

const htmlFiles = glob.sync('**/*.html', {
  ignore: ['**/node_modules/**', '**/mcp-servers/**', 'lighthouse-report*.html']
});

console.log('Analyzing ' + htmlFiles.length + ' HTML files...\n');

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');

  const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';

  if (!title) {
    results.emptyTitles.push(file);
  } else {
    if (!results.duplicateTitles[title]) {
      results.duplicateTitles[title] = [];
    }
    results.duplicateTitles[title].push(file);

    if (title.length > 70) {
      results.longTitles.push({ file, title, length: title.length });
    } else if (title.length < 30) {
      results.shortTitles.push({ file, title, length: title.length });
    }
  }

  if (!h1) {
    results.missingH1.push(file);
  } else {
    if (!results.duplicateH1s[h1]) {
      results.duplicateH1s[h1] = [];
    }
    results.duplicateH1s[h1].push(file);
  }
});

const duplicateTitles = Object.entries(results.duplicateTitles)
  .filter(([_, files]) => files.length > 1)
  .map(([title, files]) => ({ title, count: files.length, files }));

const duplicateH1s = Object.entries(results.duplicateH1s)
  .filter(([_, files]) => files.length > 1)
  .map(([h1, files]) => ({ h1, count: files.length, files }));

console.log('=== SEO ISSUES FOUND ===\n');

console.log('1. DUPLICATE TITLES (' + duplicateTitles.length + ' unique titles appearing on multiple pages):');
duplicateTitles.slice(0, 10).forEach(({ title, count, files }) => {
  console.log('\n   "' + title + '" (' + count + ' pages):');
  files.forEach(f => console.log('     - ' + f));
});
if (duplicateTitles.length > 10) {
  console.log('\n   ... and ' + (duplicateTitles.length - 10) + ' more');
}

console.log('\n2. DUPLICATE H1s (' + duplicateH1s.length + ' unique H1s appearing on multiple pages):');
duplicateH1s.slice(0, 10).forEach(({ h1, count, files }) => {
  console.log('\n   "' + h1 + '" (' + count + ' pages):');
  files.forEach(f => console.log('     - ' + f));
});
if (duplicateH1s.length > 10) {
  console.log('\n   ... and ' + (duplicateH1s.length - 10) + ' more');
}

console.log('\n3. LONG TITLES (' + results.longTitles.length + ' titles over 70 characters):');
results.longTitles.slice(0, 10).forEach(({ file, title, length }) => {
  console.log('   [' + length + ' chars] ' + file);
  console.log('      "' + title + '"');
});

console.log('\n4. SHORT TITLES (' + results.shortTitles.length + ' titles under 30 characters):');
results.shortTitles.slice(0, 10).forEach(({ file, title, length }) => {
  console.log('   [' + length + ' chars] ' + file + ': "' + title + '"');
});

console.log('\n5. MISSING H1 (' + results.missingH1.length + ' pages without H1 tag):');
results.missingH1.forEach(file => console.log('   - ' + file));

console.log('\n6. EMPTY TITLES (' + results.emptyTitles.length + ' pages without title tag):');
results.emptyTitles.forEach(file => console.log('   - ' + file));

fs.writeFileSync('seo-issues-report.json', JSON.stringify({
  summary: {
    duplicateTitles: duplicateTitles.length,
    duplicateH1s: duplicateH1s.length,
    longTitles: results.longTitles.length,
    shortTitles: results.shortTitles.length,
    missingH1: results.missingH1.length,
    emptyTitles: results.emptyTitles.length
  },
  duplicateTitles,
  duplicateH1s,
  longTitles: results.longTitles,
  shortTitles: results.shortTitles,
  missingH1: results.missingH1,
  emptyTitles: results.emptyTitles
}, null, 2));

console.log('\n✓ Detailed report saved to seo-issues-report.json');

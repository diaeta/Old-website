const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://diaeta.be';
const OUTPUT_FILE = 'sitemap.xml';

const EXCLUDE_PATTERNS = [
  'node_modules', 'mcp-servers', '.git', 'scripts',
  '.byterover', '.claude', '.cursor', '.roo',
  '.vscode', '.github', '.tmp', 'test'
];

const PRIORITY_MAP = {
  'index.html': 1.0,
  'home.html': 1.0,
  'contact.html': 0.9,
  'rendez-vous.html': 0.9,
  'default': 0.8
};

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getFileModTime(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString().split('T')[0];
  } catch (err) {
    return new Date().toISOString().split('T')[0];
  }
}

function getPriority(fileName) {
  const basename = path.basename(fileName).toLowerCase();
  return PRIORITY_MAP[basename] || PRIORITY_MAP.default;
}

function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (shouldExclude(filePath)) return;

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function normalizePath(filePath) {
  return filePath
    .replace(/^\.[\/]/, '')
    .split(path.sep).join('/')
    .replace(/ /g, '%20');
}

function getLanguage(filePath) {
  if (filePath.startsWith('EN/') || filePath.startsWith('EN\')) return 'en';
  if (filePath.startsWith('NL/') || filePath.startsWith('NL\')) return 'nl';
  if (filePath.startsWith('DE/') || filePath.startsWith('DE\')) return 'de';
  return 'fr';
}

function getPageId(filePath) {
  return filePath.replace(/^(EN|NL|DE)[/\]/, '');
}

function groupByPage(htmlFiles) {
  const pages = new Map();

  htmlFiles.forEach(file => {
    const normalized = normalizePath(file);
    const lang = getLanguage(normalized);
    const pageId = getPageId(normalized);

    if (!pages.has(pageId)) {
      pages.set(pageId, {});
    }
    pages.get(pageId)[lang] = normalized;
  });

  return pages;
}

function generateSitemap() {
  console.log('🔍 Scanning for HTML files...\n');

  const htmlFiles = findHtmlFiles('.');
  console.log(`✅ Found ${htmlFiles.length} HTML files\n`);

  const pages = groupByPage(htmlFiles);
  console.log(`📄 Grouped into ${pages.size} unique pages\n`);

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
  sitemap += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  htmlFiles.forEach(file => {
    const url = normalizePath(file);
    const fullUrl = `${BASE_URL}/${url}`;
    const lastMod = getFileModTime(file);
    const priority = getPriority(file);
    const lang = getLanguage(url);
    const pageId = getPageId(url);
    const alternates = pages.get(pageId);

    sitemap += '  <url>\n';
    sitemap += `    <loc>${fullUrl}</loc>\n`;
    sitemap += `    <lastmod>${lastMod}</lastmod>\n`;
    sitemap += `    <priority>${priority}</priority>\n`;

    if (alternates && Object.keys(alternates).length > 1) {
      Object.entries(alternates).forEach(([altLang, altUrl]) => {
        sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${BASE_URL}/${altUrl}" />\n`;
      });
    }

    sitemap += '  </url>\n';

    console.log(`✅ ${url} [${lang}]`);
  });

  sitemap += '</urlset>';

  fs.writeFileSync(OUTPUT_FILE, sitemap, 'utf-8');
  console.log(`\n📝 Sitemap generated: ${OUTPUT_FILE}`);
  console.log(`📊 Total URLs: ${htmlFiles.length}`);
  console.log(`🌐 With hreflang support for ${pages.size} page groups`);
}

try {
  generateSitemap();
  console.log('\n✅ Sitemap generation complete!');
} catch (error) {
  console.error('❌ Error generating sitemap:', error.message);
  process.exit(1);
}

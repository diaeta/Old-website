const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://diaeta.be';
const OUTPUT_FILE = 'sitemap.xml';

// Files and folders to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  'mcp-servers',
  '.git',
  'scripts',
  '.byterover',
  '.claude',
  '.cursor',
  '.roo',
  '.vscode',
  '.github',
  '.tmp',
  'test'
];

// Priority mapping
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

    if (shouldExclude(filePath)) {
      return;
    }

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function generateSitemap() {
  console.log('🔍 Scanning for HTML files...\n');

  const htmlFiles = findHtmlFiles('.');
  console.log(`✅ Found ${htmlFiles.length} HTML files\n`);

  // Generate sitemap
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  htmlFiles.forEach(file => {
    // Convert file path to URL
    let url = file
      .replace(/^\.[\\/]/, '') // Remove leading ./
      .replace(/\/g, '/') // Convert backslashes to forward slashes
      .replace(/ /g, '%20'); // Encode spaces

    const fullUrl = `${BASE_URL}/${url}`;
    const lastMod = getFileModTime(file);
    const priority = getPriority(file);

    sitemap += '  <url>\n';
    sitemap += `    <loc>${fullUrl}</loc>\n`;
    sitemap += `    <lastmod>${lastMod}</lastmod>\n`;
    sitemap += `    <priority>${priority}</priority>\n`;
    sitemap += '  </url>\n';

    console.log(`✅ ${url}`);
  });

  sitemap += '</urlset>';

  // Write sitemap
  fs.writeFileSync(OUTPUT_FILE, sitemap, 'utf-8');
  console.log(`\n📝 Sitemap generated: ${OUTPUT_FILE}`);
  console.log(`📊 Total URLs: ${htmlFiles.length}`);
}

// Run
try {
  generateSitemap();
  console.log('\n✅ Sitemap generation complete!');
} catch (error) {
  console.error('❌ Error generating sitemap:', error.message);
  process.exit(1);
}

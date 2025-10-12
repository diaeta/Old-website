const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = 'https://diaeta.be';
const MAX_CONCURRENT = 10;
const TIMEOUT = 10000;

// Storage
const checkedUrls = new Set();
const brokenLinks = [];
const redirects = [];
const warnings = [];
let urlQueue = [];
let activeChecks = 0;
let completed = 0;

// Parse sitemap
async function fetchSitemap() {
  return new Promise((resolve, reject) => {
    https.get(`${BASE_URL}/sitemap.xml`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const urls = data.match(/<loc>(.*?)<\/loc>/g)
          ?.map(url => url.replace(/<\/?loc>/g, '')) || [];
        resolve(urls);
      });
    }).on('error', reject);
  });
}

// Check a single URL
async function checkUrl(url, referrer = null) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        method: 'HEAD',
        timeout: TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 Link-Checker'
        }
      };

      const req = client.request(url, options, (res) => {
        const status = res.statusCode;
        
        if (status >= 200 && status < 300) {
          resolve({ url, status, ok: true, referrer });
        } else if (status >= 300 && status < 400) {
          resolve({ url, status, ok: true, redirect: res.headers.location, referrer });
        } else {
          resolve({ url, status, ok: false, referrer });
        }
      });

      req.on('error', (err) => {
        resolve({ url, status: 0, ok: false, error: err.message, referrer });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ url, status: 0, ok: false, error: 'Timeout', referrer });
      });

      req.end();
    } catch (err) {
      resolve({ url, status: 0, ok: false, error: err.message, referrer });
    }
  });
}

// Process queue
async function processQueue() {
  while (urlQueue.length > 0 || activeChecks > 0) {
    while (activeChecks < MAX_CONCURRENT && urlQueue.length > 0) {
      const item = urlQueue.shift();
      if (checkedUrls.has(item.url)) continue;
      
      checkedUrls.add(item.url);
      activeChecks++;
      
      checkUrl(item.url, item.referrer).then(result => {
        completed++;
        activeChecks--;
        
        if (!result.ok) {
          brokenLinks.push(result);
          console.log(`❌ [${result.status}] ${result.url}`);
          if (result.referrer) console.log(`   Found on: ${result.referrer}`);
        } else if (result.redirect) {
          redirects.push(result);
          console.log(`↪️  [${result.status}] ${result.url} → ${result.redirect}`);
        } else {
          console.log(`✅ [${result.status}] ${result.url}`);
        }
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Main function
(async () => {
  console.log('🔍 Starting comprehensive link check for diaeta.be\n');
  console.log('📥 Fetching sitemap...');
  
  try {
    const sitemapUrls = await fetchSitemap();
    console.log(`✅ Found ${sitemapUrls.length} URLs in sitemap\n`);
    
    // Add all sitemap URLs to queue
    urlQueue = sitemapUrls.map(url => ({ url, referrer: 'sitemap.xml' }));
    
    console.log('🔗 Checking all URLs...\n');
    await processQueue();
    
    // Generate report
    console.log('\n' + '='.repeat(80));
    console.log('📊 LINK CHECK REPORT');
    console.log('='.repeat(80));
    console.log(`\n📈 Statistics:`);
    console.log(`   Total URLs checked: ${checkedUrls.size}`);
    console.log(`   ✅ Working links: ${checkedUrls.size - brokenLinks.length}`);
    console.log(`   ❌ Broken links: ${brokenLinks.length}`);
    console.log(`   ↪️  Redirects: ${redirects.length}`);
    
    if (brokenLinks.length > 0) {
      console.log(`\n❌ BROKEN LINKS (${brokenLinks.length}):`);
      brokenLinks.forEach(link => {
        console.log(`\n   URL: ${link.url}`);
        console.log(`   Status: ${link.status || 'Error'}`);
        if (link.error) console.log(`   Error: ${link.error}`);
        if (link.referrer) console.log(`   Found on: ${link.referrer}`);
      });
    }
    
    if (redirects.length > 0) {
      console.log(`\n↪️  REDIRECTS (${redirects.length}):`);
      redirects.forEach(link => {
        console.log(`\n   From: ${link.url}`);
        console.log(`   To: ${link.redirect}`);
        console.log(`   Status: ${link.status}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (brokenLinks.length === 0) {
      console.log('\n🎉 All links are working! No broken links found.');
    } else {
      console.log(`\n⚠️  Found ${brokenLinks.length} broken link(s). Please fix them.`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();

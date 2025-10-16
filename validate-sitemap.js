const https = require('https');
const fs = require('fs');

class SitemapValidator {
    constructor() {
        this.urls = [];
        this.results = {total: 0, ok: 0, notFound: 0, redirect: 0, error: 0, removed: [], fixed: []};
    }

    parseSitemap() {
        console.log('Reading sitemap.xml...');
        const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
        const urlMatches = sitemap.matchAll(/<loc>(.*?)<\/loc>/g);
        for (const match of urlMatches) this.urls.push(match[1]);
        this.results.total = this.urls.length;
        console.log('Found ' + this.results.total + ' URLs in sitemap');
    }

    checkUrl(url) {
        return new Promise((resolve) => {
            try {
                const req = https.request(url, {method: 'HEAD', timeout: 10000}, (res) => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        this.results.ok++; process.stdout.write('.');
                        resolve({url, status: res.statusCode, type: 'ok'});
                    } else if (res.statusCode >= 300 && res.statusCode < 400) {
                        this.results.redirect++; process.stdout.write('R');
                        resolve({url, status: res.statusCode, type: 'redirect', finalUrl: res.headers.location});
                    } else if (res.statusCode === 404) {
                        this.results.notFound++; process.stdout.write('X');
                        resolve({url, status: res.statusCode, type: '404'});
                    } else {
                        this.results.error++; process.stdout.write('E');
                        resolve({url, status: res.statusCode, type: 'error'});
                    }
                });
                req.on('error', () => { this.results.error++; process.stdout.write('E'); resolve({url, type: 'network_error'}); });
                req.on('timeout', () => { req.destroy(); this.results.error++; process.stdout.write('T'); resolve({url, type: 'timeout'}); });
                req.end();
            } catch (err) {
                this.results.error++; process.stdout.write('I');
                resolve({url, type: 'invalid'});
            }
        });
    }

    async validateAllUrls() {
        console.log('Validating URLs (. = OK, R = Redirect, X = 404)\n');
        const checkedUrls = [];
        for (let i = 0; i < this.urls.length; i++) {
            const result = await this.checkUrl(this.urls[i]);
            checkedUrls.push(result);
            if ((i + 1) % 20 === 0) console.log(' [' + (i + 1) + '/' + this.urls.length + ']');
        }
        console.log('\n');
        return checkedUrls;
    }

    generateCleanedSitemap(checkedUrls) {
        const validUrls = [];
        for (const result of checkedUrls) {
            if (result.type === 'ok') {
                validUrls.push(result.url);
            } else if (result.type === 'redirect' && result.finalUrl) {
                const finalUrl = result.finalUrl.startsWith('http') ? result.finalUrl : 'https://diaeta.be' + result.finalUrl;
                validUrls.push(finalUrl);
                this.results.fixed.push({original: result.url, final: finalUrl});
            } else {
                this.results.removed.push({url: result.url, reason: result.type});
            }
        }
        const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
        const header = sitemap.substring(0, sitemap.indexOf('<url>'));
        let xml = header;
        for (const url of validUrls) {
            xml += '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n';
        }
        xml += '</urlset>';
        fs.writeFileSync('sitemap-cleaned.xml', xml, 'utf8');
        console.log('Created sitemap-cleaned.xml with ' + validUrls.length + ' URLs');
    }

    generateReport() {
        console.log('\n=== SITEMAP VALIDATION REPORT ===');
        console.log('Total: ' + this.results.total);
        console.log('Valid: ' + this.results.ok);
        console.log('Redirects fixed: ' + this.results.redirect);
        console.log('404s removed: ' + this.results.notFound);
        console.log('Errors: ' + this.results.error);
        console.log('\nRemoved ' + this.results.removed.length + ' URLs');
        console.log('Fixed ' + this.results.fixed.length + ' redirects');
        const report = {timestamp: new Date().toISOString(), summary: {total: this.results.total, valid: this.results.ok, redirects: this.results.redirect, notFound: this.results.notFound, errors: this.results.error}, removed: this.results.removed, fixed: this.results.fixed};
        fs.writeFileSync('sitemap-validation-report.json', JSON.stringify(report, null, 2));
        console.log('\nReport: sitemap-validation-report.json');
    }

    async run() {
        console.log('SITEMAP VALIDATOR\n');
        this.parseSitemap();
        const checkedUrls = await this.validateAllUrls();
        this.generateCleanedSitemap(checkedUrls);
        this.generateReport();
    }
}

new SitemapValidator().run().catch(console.error);
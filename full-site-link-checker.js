const https = require('https');
const { URL } = require('url');
const fs = require('fs');

const checker = {
    baseUrl: 'https://diaeta.be',
    visitedPages: new Set(),
    checkedLinks: new Map(),
    brokenLinks: [],
    results: {pagesChecked: 0, linksChecked: 0, working: 0, broken: 0, redirects: 0},
    
    checkUrl(url, sourceUrl) {
        if (this.checkedLinks.has(url)) {
            return Promise.resolve(this.checkedLinks.get(url).status);
        }
        return new Promise((resolve) => {
            try {
                const req = https.request(url, {method: 'HEAD', timeout: 10000}, (res) => {
                    this.results.linksChecked++;
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        this.results.working++;
                        this.checkedLinks.set(url, {status: res.statusCode});
                        process.stdout.write('.');
                    } else if (res.statusCode >= 300 && res.statusCode < 400) {
                        this.results.redirects++;
                        this.brokenLinks.push({url, sourceUrl, status: res.statusCode, type: 'redirect'});
                        process.stdout.write('R');
                    } else {
                        this.results.broken++;
                        this.brokenLinks.push({url, sourceUrl, status: res.statusCode, type: 'error'});
                        process.stdout.write('X');
                    }
                    resolve(res.statusCode);
                });
                req.on('error', (err) => {
                    this.results.broken++; this.results.linksChecked++;
                    this.brokenLinks.push({url, sourceUrl, error: err.message, type: 'network_error'});
                    process.stdout.write('E');
                    resolve(0);
                });
                req.on('timeout', () => {
                    req.destroy();
                    this.results.broken++; this.results.linksChecked++;
                    this.brokenLinks.push({url, sourceUrl, error: 'Timeout', type: 'timeout'});
                    process.stdout.write('T');
                    resolve(0);
                });
                req.end();
            } catch (err) {
                this.results.broken++; this.results.linksChecked++;
                this.brokenLinks.push({url, sourceUrl, error: err.message, type: 'invalid'});
                process.stdout.write('I');
                resolve(0);
            }
        });
    },
    
    fetchPage(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });
    },
    
    extractLinks(html, pageUrl) {
        const links = new Set();
        const hrefRegex = /href=["']([^"'#]+)["']/gi;
        let match;
        while ((match = hrefRegex.exec(html)) !== null) {
            try {
                const link = match[1];
                if (!link.startsWith('mailto:') && !link.startsWith('tel:')) {
                    links.add(new URL(link, pageUrl).href);
                }
            } catch (e) {}
        }
        return Array.from(links);
    },
    
    async crawlPage(url, depth = 0) {
        if (this.visitedPages.has(url) || depth > 2) return;
        console.log('\n[' + (this.visitedPages.size + 1) + '] ' + url);
        this.visitedPages.add(url);
        this.results.pagesChecked++;
        try {
            const html = await this.fetchPage(url);
            const links = this.extractLinks(html, url);
            console.log('  Checking ' + links.length + ' links: ');
            for (const link of links) {
                await this.checkUrl(link, url);
                if (link.startsWith(this.baseUrl) && !this.visitedPages.has(link) && this.visitedPages.size < 20) {
                    await this.crawlPage(link, depth + 1);
                }
            }
            console.log('');
        } catch (err) {
            console.log('  ERROR: ' + err.message);
        }
    },
    
    async checkLangSwitcher() {
        console.log('\n=== LANGUAGE SWITCHER CHECK ===\n');
        const pages = [
            {lang: 'FR', url: 'https://diaeta.be/'},
            {lang: 'EN', url: 'https://diaeta.be/EN/home.html'},
            {lang: 'DE', url: 'https://diaeta.be/DE/home.html'},
            {lang: 'NL', url: 'https://diaeta.be/NL/home.html'}
        ];
        for (const page of pages) {
            process.stdout.write(page.lang + ' homepage: ');
            const status = await this.checkUrl(page.url, 'lang-switcher');
            console.log((status >= 200 && status < 300) ? ' OK' : ' FAILED');
        }
    },
    
    generateReport() {
        console.log('\n\n=== SUMMARY ===');
        console.log('Pages: ' + this.results.pagesChecked);
        console.log('Links: ' + this.results.linksChecked);
        console.log('Working: ' + this.results.working);
        console.log('Redirects: ' + this.results.redirects);
        console.log('Broken: ' + this.results.broken);
        if (this.brokenLinks.length > 0) {
            console.log('\n=== BROKEN LINKS ===');
            this.brokenLinks.slice(0, 20).forEach(link => {
                console.log('\nURL: ' + link.url);
                if (link.sourceUrl) console.log('  On: ' + link.sourceUrl);
                if (link.status) console.log('  Status: ' + link.status);
                if (link.error) console.log('  Error: ' + link.error);
            });
            if (this.brokenLinks.length > 20) {
                console.log('\n... and ' + (this.brokenLinks.length - 20) + ' more');
            }
        }
        fs.writeFileSync('link-check-report.json', JSON.stringify({timestamp: new Date().toISOString(), summary: this.results, brokenLinks: this.brokenLinks}, null, 2));
        console.log('\nReport: link-check-report.json');
    }
};

(async () => {
    console.log('COMPREHENSIVE LINK CHECK');
    console.log('Legend: . = OK, R = Redirect, X = Error\n');
    await checker.checkLangSwitcher();
    console.log('\n=== CRAWLING SITE ===');
    await checker.crawlPage('https://diaeta.be/');
    await checker.crawlPage('https://diaeta.be/EN/home.html');
    await checker.crawlPage('https://diaeta.be/DE/home.html');
    await checker.crawlPage('https://diaeta.be/NL/home.html');
    checker.generateReport();
})().catch(console.error);

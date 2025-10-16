const fs = require('fs');
const path = require('path');

class CanonicalFinder {
    constructor() {
        this.results = {withCanonical: [], withoutCanonical: []};
    }

    getAllHtmlFiles(dir = '.') {
        const files = [];
        const items = fs.readdirSync(dir, {withFileTypes: true});
        for (const item of items) {
            if (item.name.startsWith('.') || item.name === 'node_modules') continue;
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                files.push(...this.getAllHtmlFiles(fullPath));
            } else if (item.name.endsWith('.html')) {
                files.push(fullPath);
            }
        }
        return files;
    }

    checkFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const hasCanonical = /<link\s+rel=["']canonical["']/i.test(content);
            
            if (hasCanonical) {
                const match = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
                this.results.withCanonical.push({file: filePath, canonical: match ? match[1] : 'unknown'});
            } else {
                this.results.withoutCanonical.push(filePath);
            }
        } catch (err) {
            console.error('Error reading ' + filePath + ': ' + err.message);
        }
    }

    generateReport() {
        console.log('=== CANONICAL TAG REPORT ===\n');
        console.log('Pages WITH canonical tags: ' + this.results.withCanonical.length);
        console.log('Pages WITHOUT canonical tags: ' + this.results.withoutCanonical.length);
        
        console.log('\n=== PAGES MISSING CANONICAL TAGS ===');
        this.results.withoutCanonical.forEach(file => console.log(file));
        
        const report = {timestamp: new Date().toISOString(), withCanonical: this.results.withCanonical.length, withoutCanonical: this.results.withoutCanonical.length, missingCanonical: this.results.withoutCanonical};
        fs.writeFileSync('missing-canonical.json', JSON.stringify(report, null, 2));
        console.log('\nDetailed report: missing-canonical.json');
    }

    run() {
        console.log('CANONICAL TAG FINDER\n');
        const htmlFiles = this.getAllHtmlFiles();
        console.log('Found ' + htmlFiles.length + ' HTML files\n');
        
        for (const file of htmlFiles) {
            this.checkFile(file);
        }
        
        this.generateReport();
    }
}

new CanonicalFinder().run();
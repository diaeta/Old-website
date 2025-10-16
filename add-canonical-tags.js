const fs = require('fs');
const path = require('path');

class CanonicalAdder {
    constructor() {
        this.stats = {added: 0, skipped: 0, errors: []};
        this.skipPatterns = ['lighthouse-report', 'footer_', '404.html'];
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

    shouldSkip(filePath) {
        const fileName = path.basename(filePath);
        return this.skipPatterns.some(pattern => fileName.includes(pattern));
    }

    getCanonicalUrl(filePath) {
        const normalized = filePath.replace(/\/g, '/');
        let urlPath = normalized;
        
        if (urlPath === 'index.html') {
            return 'https://diaeta.be/';
        }
        
        return 'https://diaeta.be/' + urlPath;
    }

    addCanonical(filePath) {
        if (this.shouldSkip(filePath)) {
            this.stats.skipped++;
            return false;
        }

        try {
            let content = fs.readFileSync(filePath, 'utf8');
            
            if (/<link\s+rel=["']canonical["']/i.test(content)) {
                this.stats.skipped++;
                return false;
            }
            
            const canonicalUrl = this.getCanonicalUrl(filePath);
            const canonicalTag = '    <link rel="canonical" href="' + canonicalUrl + '">';
            
            if (content.includes('</head>')) {
                content = content.replace('</head>', canonicalTag + '\n    </head>');
            } else if (content.includes('<head>')) {
                content = content.replace('<head>', '<head>\n' + canonicalTag);
            } else {
                this.stats.errors.push({file: filePath, error: 'No head tag found'});
                return false;
            }
            
            fs.writeFileSync(filePath, content, 'utf8');
            this.stats.added++;
            console.log('Added canonical to: ' + filePath);
            return true;
        } catch (err) {
            this.stats.errors.push({file: filePath, error: err.message});
            return false;
        }
    }

    generateReport() {
        console.log('\n========================================');
        console.log('CANONICAL TAG ADDITION REPORT');
        console.log('========================================\n');
        console.log('Canonical tags added: ' + this.stats.added);
        console.log('Files skipped: ' + this.stats.skipped);
        console.log('Errors: ' + this.stats.errors.length);
        
        if (this.stats.errors.length > 0) {
            console.log('\n--- ERRORS ---');
            this.stats.errors.forEach(err => {
                console.log(err.file + ': ' + err.error);
            });
        }
    }

    run() {
        console.log('CANONICAL TAG ADDER\n');
        const htmlFiles = this.getAllHtmlFiles();
        console.log('Found ' + htmlFiles.length + ' HTML files\n');
        
        for (const file of htmlFiles) {
            this.addCanonical(file);
        }
        
        this.generateReport();
    }
}

new CanonicalAdder().run();
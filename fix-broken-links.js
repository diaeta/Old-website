const fs = require('fs');
const path = require('path');

class LinkFixer {
    constructor() {
        this.fixes = {urlEncoding: 0, duplicatePaths: 0, cookiesLinks: 0, caseIssues: 0, indexHtml: 0};
        this.errors = [];
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

    fixFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            const doubleEncodedPatterns = [
                {from: /Ern%C3%83%C2%A4hrungsberater/g, to: 'Ernaehrungsberater', desc: 'double-encoded a'},
                {from: /Di%C3%83%C2%A4tassistent/g, to: 'Diaetassistent', desc: 'double-encoded a'},
                {from: /di%C3%83%C2%A4tetisch/g, to: 'diaetetisch', desc: 'double-encoded a'},
                {from: /di%C3%ABtist/g, to: 'dietist', desc: 'e in URL'},
                {from: /di%C3%A9t%C3%A9ticien/g, to: 'dieteticien', desc: 'e in URL'},
                {from: /di%C3%A9t%C3%A9tique/g, to: 'dietetique', desc: 'e in URL'},
                {from: /Di%C3%A9t%C3%A9tcien/g, to: 'Dieteticien', desc: 'e in URL'}
            ];

            for (const pattern of doubleEncodedPatterns) {
                if (content.match(pattern.from)) {
                    content = content.replace(pattern.from, pattern.to);
                    this.fixes.urlEncoding++;
                    modified = true;
                    console.log('  Fixed ' + pattern.desc + ' in ' + path.basename(filePath));
                }
            }

            if (content.includes('NL/NL/')) {
                content = content.replace(/href=["']([^"']*?)\/NL\/NL\//g, 'href="$1/NL/');
                this.fixes.duplicatePaths++;
                modified = true;
                console.log('  Fixed NL/NL/ in ' + path.basename(filePath));
            }

            if (content.includes('diaeta.be/index.html')) {
                content = content.replace(/https:\/\/diaeta\.be\/index\.html/g, 'https://diaeta.be/');
                this.fixes.indexHtml++;
                modified = true;
                console.log('  Fixed index.html in ' + path.basename(filePath));
            }

            if (content.includes('cookies.html')) {
                content = content.replace(/<a\s+[^>]*href=["'][^"']*cookies\.html["'][^>]*>(.*?)<\/a>/gi, '$1');
                this.fixes.cookiesLinks++;
                modified = true;
                console.log('  Removed cookies.html in ' + path.basename(filePath));
            }

            if (content.includes('Consultation.html')) {
                content = content.replace(/Consultation\.html/g, 'consultatie.html');
                this.fixes.caseIssues++;
                modified = true;
                console.log('  Fixed Consultation case in ' + path.basename(filePath));
            }

            if (content.includes('windows.microsoft.com')) {
                content = content.replace(/<a\s+[^>]*href=["']https?:\/\/windows\.microsoft\.com[^"']*["'][^>]*>(.*?)<\/a>/gi, '$1');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                return true;
            }
            return false;
        } catch (err) {
            this.errors.push({file: filePath, error: err.message});
            return false;
        }
    }

    generateReport() {
        console.log('\n========================================');
        console.log('LINK FIX SUMMARY');
        console.log('========================================');
        console.log('URL encoding fixes:     ' + this.fixes.urlEncoding);
        console.log('Duplicate path fixes:   ' + this.fixes.duplicatePaths);
        console.log('Cookies link removed:   ' + this.fixes.cookiesLinks);
        console.log('Case sensitivity fixes: ' + this.fixes.caseIssues);
        console.log('Index.html fixes:       ' + this.fixes.indexHtml);
        
        console.log('\n=== MANUAL ACTIONS NEEDED ===');
        console.log('\n1. Missing PDF file:');
        console.log('   NL/nutrigenomica-nutrigenetica/Rapport genetische test NL.pdf');
        console.log('   Action: Upload PDF or remove link\n');
        
        if (this.errors.length > 0) {
            console.log('=== ERRORS ===');
            this.errors.forEach(err => console.log('  ' + err.file + ': ' + err.error));
        }
    }

    run() {
        console.log('BROKEN LINK FIXER\n');
        const htmlFiles = this.getAllHtmlFiles();
        console.log('Found ' + htmlFiles.length + ' HTML files\n');
        console.log('Fixing links...\n');
        
        let modifiedCount = 0;
        for (const file of htmlFiles) {
            if (this.fixFile(file)) modifiedCount++;
        }

        console.log('\nModified ' + modifiedCount + ' files');
        this.generateReport();
        console.log('\nDone! Run link checker again to verify.');
    }
}

new LinkFixer().run();

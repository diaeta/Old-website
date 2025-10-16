const fs = require('fs');
const path = require('path');

class ComprehensiveLinkFixer {
    constructor() {
        this.stats = {fixed: 0, errors: []};
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
            const original = content;

            // Fix 1: Double-encoded German characters in hreflang
            const germanFixes = [
                {from: /Ern%C3%83%C2%A4hrungsberater-Di%C3%83%C2%A4tassistentin-di%C3%83%C2%A4tetisch/g, to: 'Ernährungsberater-Diätassistent-Ernährungswissenschaftler'},
                {from: /Ern%C3%83%C2%A4hrungsberater/g, to: 'Ernährungsberater'},
                {from: /Di%C3%83%C2%A4tassistent/g, to: 'Diätassistent'}
            ];
            germanFixes.forEach(fix => {
                if (content.includes(fix.from)) {
                    content = content.replace(fix.from, fix.to);
                    modified = true;
                }
            });

            // Fix 2: Double-encoded Dutch ë character
            if (content.includes('di%C3%ABtist')) {
                content = content.replace(/di%C3%ABtist/g, 'dietist');
                modified = true;
            }

            // Fix 3: Double-encoded French é characters
            const frenchFixes = [
                {from: /di%C3%A9t%C3%A9tique\/rendez-vous\.html/g, to: 'rendez-vous.html'},
                {from: /di%C3%A9t%C3%A9tique\/Consultation\/consultatie\.html/g, to: 'diététique/Consultation/Consultation.html'},
                {from: /di%C3%A9t%C3%A9ticien-di%C3%A9t%C3%A9ticienne-nutritionniste\/perdre-du-poids-et-Maigrir\/Di%C3%A9t%C3%A9tcien%20Di%C3%A9t%C3%A9ticienne%20Nutritionniste%20Perte%20de%20poids\.html/g, to: 'diététicien-diététicienne-nutritionniste/perdre du poids et Maigrir/Diététcien Diététicienne Nutritionniste Perte de poids.html'}
            ];
            frenchFixes.forEach(fix => {
                if (content.match(fix.from)) {
                    content = content.replace(fix.from, fix.to);
                    modified = true;
                }
            });

            // Fix 4: Duplicate NL/NL/ paths
            if (content.includes('NL/NL/')) {
                content = content.replace(/\/NL\/NL\//g, '/NL/');
                content = content.replace(/href="NL\/NL\//g, 'href="NL/');
                modified = true;
            }

            // Fix 5: index.html redirects - replace with root
            if (content.includes('diaeta.be/index.html')) {
                content = content.replace(/https:\/\/diaeta\.be\/index\.html/g, 'https://diaeta.be/');
                modified = true;
            }

            // Fix 6: Wrong language file references (consultatie in EN folder)
            if (content.includes('EN/Dietitian dietician nutritionist and dietetics/consultatie.html')) {
                content = content.replace(/EN\/Dietitian dietician nutritionist and dietetics\/consultatie\.html/g, 'EN/Dietitian dietician nutritionist and dietetics/Consultation.html');
                modified = true;
            }

            // Fix 7: Remove broken PDF link or replace with placeholder
            if (content.includes('Rapport%20genetische%20test%20NL.pdf') || content.includes('Rapport genetische test NL.pdf')) {
                // Just remove the link but keep the text
                content = content.replace(/<a[^>]*href="[^"]*Rapport[^"]*genetische[^"]*test[^"]*NL\.pdf"[^>]*>(.*?)<\/a>/gi, '');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                this.stats.fixed++;
                console.log('Fixed: ' + filePath);
            }

            return modified;
        } catch (err) {
            this.stats.errors.push({file: filePath, error: err.message});
            return false;
        }
    }

    generateReport() {
        console.log('\n=== COMPREHENSIVE LINK FIX REPORT ===');
        console.log('Files fixed: ' + this.stats.fixed);
        console.log('Errors: ' + this.stats.errors.length);
        if (this.stats.errors.length > 0) {
            console.log('\nErrors:');
            this.stats.errors.forEach(e => console.log('  ' + e.file + ': ' + e.error));
        }
    }

    run() {
        console.log('COMPREHENSIVE LINK FIXER\n');
        const htmlFiles = this.getAllHtmlFiles();
        console.log('Processing ' + htmlFiles.length + ' files...\n');
        
        for (const file of htmlFiles) {
            this.fixFile(file);
        }
        
        this.generateReport();
    }
}

new ComprehensiveLinkFixer().run();
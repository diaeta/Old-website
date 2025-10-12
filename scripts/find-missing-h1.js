const fs = require('fs');
const glob = require('glob');
const path = require('path');

const stats = {
    filesChecked: 0,
    missingH1: [],
    missingMetaDescription: [],
    duplicateTitles: {}
};

function checkHTMLFile(filepath) {
    try {
        const content = fs.readFileSync(filepath, 'utf8');
        stats.filesChecked++;

        const relativePath = filepath.split(String.fromCharCode(92)).join('/');

        // Check for H1 tag
        const h1Match = content.match(/<h1[^>]*>.*?<\/h1>/i);
        if (!h1Match) {
            stats.missingH1.push(relativePath);
        }

        // Check for meta description
        const metaDescMatch = content.match(/<meta\s+name=["']description["'][^>]*>/i);
        if (!metaDescMatch) {
            stats.missingMetaDescription.push(relativePath);
        }

        // Extract title for duplicate checking
        const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) {
            const title = titleMatch[1].trim();
            if (!stats.duplicateTitles[title]) {
                stats.duplicateTitles[title] = [];
            }
            stats.duplicateTitles[title].push(relativePath);
        }

    } catch (err) {
        console.error('Error reading ' + filepath + ': ' + err.message);
    }
}

// Find all HTML files
const htmlFiles = glob.sync('**/*.html', {
    ignore: ['node_modules/**', 'reports/**']
});

console.log('Scanning ' + htmlFiles.length + ' HTML files...');
console.log('');

htmlFiles.forEach(file => checkHTMLFile(file));

console.log('=== SCAN RESULTS ===');
console.log('');
console.log('Files checked: ' + stats.filesChecked);
console.log('');
console.log('--- Missing H1 Tags (' + stats.missingH1.length + ' files) ---');
stats.missingH1.forEach(file => console.log('  ' + file));

console.log('');
console.log('--- Missing Meta Descriptions (' + stats.missingMetaDescription.length + ' files) ---');
stats.missingMetaDescription.forEach(file => console.log('  ' + file));

console.log('');
console.log('--- Duplicate Titles ---');
const duplicates = Object.entries(stats.duplicateTitles).filter(([title, files]) => files.length > 1);
console.log('Found ' + duplicates.length + ' duplicate titles:');
console.log('');
duplicates.forEach(([title, files]) => {
    console.log('Title: "' + title + '" (' + files.length + ' pages)');
    files.forEach(file => console.log('  - ' + file));
    console.log('');
});

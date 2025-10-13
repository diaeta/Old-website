const fs = require("fs");
const path = require("path");

function getLanguage(filePath) {
    if (filePath.startsWith("DE/")) return "de";
    if (filePath.startsWith("EN/")) return "en";
    if (filePath.startsWith("NL/")) return "nl";
    return "fr";
}

async function addSelfHreflang() {
    console.log("Adding self-referential hreflang tags...\n");
    const report = JSON.parse(fs.readFileSync("seo-audit-report.json", "utf8"));
    const filesToFix = report.issues.missingHreflang.map(item => item.file);
    console.log(`Processing ${filesToFix.length} files\n`);
    let fixed = 0;
    for (const relPath of filesToFix) {
        try {
            const fullPath = path.join(".", relPath);
            if (!fs.existsSync(fullPath)) continue;
            let content = fs.readFileSync(fullPath, "utf8");
            const canonicalMatch = content.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
                                   content.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
            if (!canonicalMatch) continue;
            const canonicalUrl = canonicalMatch[0].match(/href=["']([^"']+)["']/)[1];
            const lang = getLanguage(relPath);
            const hreflangTag = `    <link rel="alternate" hreflang="${lang}" href="${canonicalUrl}" />\n    <link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />\n`;
            content = content.replace(/<link[^>]+rel=["']alternate["'][^>]+hreflang=[^>]*\/?\>/gi, "");
            const insertPos = content.indexOf(canonicalMatch[0]) + canonicalMatch[0].length;
            content = content.slice(0, insertPos) + "\n" + hreflangTag + content.slice(insertPos);
            fs.writeFileSync(fullPath, content, "utf8");
            console.log(`✓ ${relPath}`);
            fixed++;
        } catch (error) {
            console.log(`✗ ${relPath}: ${error.message}`);
        }
    }
    console.log(`\nFixed: ${fixed} files`);
}

addSelfHreflang().catch(console.error);

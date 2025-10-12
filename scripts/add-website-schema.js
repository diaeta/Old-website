const fs = require('fs');
const path = require('path');

// Define the files to update and their corresponding WebSite schemas
const files = [
    {
        path: 'EN/home.html',
        websiteSchema: {
            "@type": "WebSite",
            "@id": "https://diaeta.be/EN/#website",
            "name": "Diaeta - Dietitian Nutritionist",
            "url": "https://diaeta.be/EN/",
            "description": "Dietetics and nutrition practice in Brussels. Dietary consultations for weight loss, diabetes, cholesterol and irritable bowel syndrome.",
            "inLanguage": "en-BE",
            "publisher": {
                "@type": "Organization",
                "@id": "https://diaeta.be/#MedicalBusiness"
            }
        }
    },
    {
        path: 'EN/index.html',
        websiteSchema: {
            "@type": "WebSite",
            "@id": "https://diaeta.be/EN/#website",
            "name": "Diaeta - Dietitian Nutritionist",
            "url": "https://diaeta.be/EN/",
            "description": "Dietetics and nutrition practice in Brussels. Dietary consultations for weight loss, diabetes, cholesterol and irritable bowel syndrome.",
            "inLanguage": "en-BE",
            "publisher": {
                "@type": "Organization",
                "@id": "https://diaeta.be/#MedicalBusiness"
            }
        }
    },
    {
        path: 'NL/home.html',
        websiteSchema: {
            "@type": "WebSite",
            "@id": "https://diaeta.be/NL/#website",
            "name": "Diaeta - Diëtist Voedingsdeskundige",
            "url": "https://diaeta.be/NL/",
            "description": "Diëtetiek en voedingspraktijk in Brussel. Dieetadviezen voor gewichtsverlies, diabetes, cholesterol en prikkelbare darm syndroom.",
            "inLanguage": "nl-BE",
            "publisher": {
                "@type": "Organization",
                "@id": "https://diaeta.be/#MedicalBusiness"
            }
        }
    },
    {
        path: 'NL/index.html',
        websiteSchema: {
            "@type": "WebSite",
            "@id": "https://diaeta.be/NL/#website",
            "name": "Diaeta - Diëtist Voedingsdeskundige",
            "url": "https://diaeta.be/NL/",
            "description": "Diëtetiek en voedingspraktijk in Brussel. Dieetadviezen voor gewichtsverlies, diabetes, cholesterol en prikkelbare darm syndroom.",
            "inLanguage": "nl-BE",
            "publisher": {
                "@type": "Organization",
                "@id": "https://diaeta.be/#MedicalBusiness"
            }
        }
    },
    {
        path: 'DE/home.html',
        websiteSchema: {
            "@type": "WebSite",
            "@id": "https://diaeta.be/DE/#website",
            "name": "Diaeta - Diätassistent Ernährungsberater",
            "url": "https://diaeta.be/DE/",
            "description": "Diätetik und Ernährungspraxis in Brüssel. Ernährungsberatung für Gewichtsverlust, Diabetes, Cholesterin und Reizdarmsyndrom.",
            "inLanguage": "de-BE",
            "publisher": {
                "@type": "Organization",
                "@id": "https://diaeta.be/#MedicalBusiness"
            }
        }
    },
    {
        path: 'DE/index.html',
        websiteSchema: {
            "@type": "WebSite",
            "@id": "https://diaeta.be/DE/#website",
            "name": "Diaeta - Diätassistent Ernährungsberater",
            "url": "https://diaeta.be/DE/",
            "description": "Diätetik und Ernährungspraxis in Brüssel. Ernährungsberatung für Gewichtsverlust, Diabetes, Cholesterin und Reizdarmsyndrom.",
            "inLanguage": "de-BE",
            "publisher": {
                "@type": "Organization",
                "@id": "https://diaeta.be/#MedicalBusiness"
            }
        }
    }
];

function processFile(fileConfig) {
    const filePath = path.join(__dirname, '..', fileConfig.path);

    try {
        // Read the file
        let content = fs.readFileSync(filePath, 'utf8');

        // Find the JSON-LD script section
        const pattern = /(<script type="application\/ld\+json">)\s*(\{[\s\S]*?\})\s*(<\/script>)/;
        const match = content.match(pattern);

        if (!match) {
            console.error('Could not find JSON-LD script in ' + fileConfig.path);
            return false;
        }

        const scriptOpen = match[1];
        const jsonContent = match[2];
        const scriptClose = match[3];

        // Parse the existing JSON
        let existingSchema;
        try {
            existingSchema = JSON.parse(jsonContent);
        } catch (e) {
            console.error('Error parsing JSON in ' + fileConfig.path + ': ' + e.message);
            return false;
        }

        // Create new schema with @graph
        const newSchema = {
            "@context": existingSchema["@context"],
            "@graph": [
                fileConfig.websiteSchema,
                existingSchema
            ]
        };

        // Remove @context from the existing schema since it's now at the root
        if (newSchema["@graph"][1]["@context"]) {
            delete newSchema["@graph"][1]["@context"];
        }

        // Convert to JSON string with proper formatting
        const jsonStr = JSON.stringify(newSchema, null, 4);

        // Replace in content
        const newJsonSection = scriptOpen + '\n' + jsonStr + '\n' + scriptClose;
        const newContent = content.substring(0, match.index) + newJsonSection + content.substring(match.index + match[0].length);

        // Write back
        fs.writeFileSync(filePath, newContent, 'utf8');

        console.log('✓ Successfully updated ' + fileConfig.path);
        return true;
    } catch (error) {
        console.error('Error processing ' + fileConfig.path + ': ' + error.message);
        return false;
    }
}

// Process all files
console.log('Adding WebSite schema to homepage files...\n');
let successCount = 0;
let failCount = 0;

for (const fileConfig of files) {
    if (processFile(fileConfig)) {
        successCount++;
    } else {
        failCount++;
    }
}

console.log('\nSummary: ' + successCount + ' files updated successfully, ' + failCount + ' files failed.');

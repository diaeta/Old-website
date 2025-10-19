const fs = require('fs');

// Define unique meta descriptions for duplicate pages
const metaDescUpdates = {
  // German Laken - keep first as is, update second to mention Niveole specifically
  'DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Laken/niveole-medical-center.html':
    'Niveole Medizinisches Zentrum in Laken. Ernährungsberater für Gewichtsverlust, Diabetes und Ernährungsberatung.',
  
  // German Uccle - differentiate the 3 pages
  'DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Uccle/care-happy-medical-center.html':
    'Care Happy Medizinisches Zentrum in Uccle. Ernährungsberater für personalisierte Beratungen und Ernährungspläne.',
  'DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Uccle/espacepluridys.html':
    'Espacepluridys in Uccle. Ernährungsberater für Kinder und Erwachsene, spezialisiert auf Essstörungen.',
  
  // French Uccle
  'diététicien-diététicienne-nutritionniste-uccle/espacepluridys.html':
    'Espacepluridys à Uccle. Diététicien nutritionniste spécialisé en troubles alimentaires et nutrition pédiatrique.',
  
  // French dietetics page - needs different description than nutrigenomics
  'nutrigenomics.html':
    'Nutrigénomique et nutrigénétique: tests génétiques pour une nutrition personnalisée basée sur votre ADN.',
  
  // English Uccle
  'EN/dietitian dietician nutritionist Uccle/espacepluridys.html':
    'Espacepluridys in Uccle. Registered dietitian nutritionist specialized in eating disorders and pediatric nutrition.',
  
  // Dutch Elsene
  'NL/dietist-voedingsdeskundige-elsene/tenbosch-chatelain-medisch-centrum.html':
    'Tenbosch-Châtelain medisch centrum in Elsene. Diëtist voedingsdeskundige voor voedingsadvies en begeleiding.',
  
  // Dutch Koekelberg
  'NL/dietist-voedingsdeskundige-koekelberg/chrysalide-centrum.html':
    'Chrysalide centrum in Koekelberg. Diëtist voedingsdeskundige voor gepersonaliseerde voedingsplannen.',
  
  // Dutch Laken
  'NL/dietist-voedingsdeskundige-laken/niveole-medisch-centrum.html':
    'Niveole medisch centrum in Laken. Diëtist voedingsdeskundige voor gewichtsverlies en diabeteszorg.',
  
  // Dutch Sint-Agatha-Berchem
  'NL/dietist-voedingsdeskundige-sint-agatha-berchem/revago-centrum.html':
    'Revago centrum in Sint-Agatha-Berchem. Diëtist voedingsdeskundige voor voedingsadvies en begeleiding.',
  
  // Dutch Sint-Lambrechts-Woluwe
  'NL/dietist-voedingsdeskundige-sint-lambrechts-woluwe/wolu20-medisch-centrum.html':
    'Wolu20 medisch centrum in Sint-Lambrechts-Woluwe. Diëtist voedingsdeskundige voor alle leeftijden.',
  
  // Dutch Ukkel
  'NL/dietist-voedingsdeskundige-ukkel/care-happy-medisch-centrum.html':
    'Care Happy medisch centrum in Ukkel. Diëtist voedingsdeskundige voor gepersonaliseerde consulten.',
  'NL/dietist-voedingsdeskundige-ukkel/espacepluridys.html':
    'Espacepluridys in Ukkel. Diëtist voedingsdeskundige gespecialiseerd in eetstoornissen en kindervoeding.'
};

let updated = 0;

Object.keys(metaDescUpdates).forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const newDesc = metaDescUpdates[filePath];
    
    // Find and replace meta description
    const replaced = content.replace(
      /<meta\s+name=["']description["']\s+content=["'][^"']+["']/i,
      '<meta name="description" content="' + newDesc + '"'
    );
    
    if (replaced !== content) {
      fs.writeFileSync(filePath, replaced, 'utf8');
      console.log('✓ Updated: ' + filePath);
      updated++;
    } else {
      console.log('✗ No change: ' + filePath);
    }
  } catch (err) {
    console.log('✗ Error: ' + filePath + ': ' + err.message);
  }
});

console.log('\nUpdated ' + updated + ' meta descriptions');

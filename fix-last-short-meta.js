const fs = require('fs');

const metaExpansions = {
  'DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Uccle/Ernährungsberater-Uccle.html': 'Ernährungsberater in Uccle. Persönliche Ernährungsberatung für Gewichtsverlust, Diabetes und gesunde Ernährung in Brüssel.',
  'NL/dietist-voedingsdeskundige-sint-lambrechts-woluwe/dietist-voedingsdeskundige-sint-lambrechts-woluwe.html': 'Diëtist in Sint-Lambrechts-Woluwe. Gepersonaliseerd voedingsadvies voor gewichtsverlies en gezonde voeding.',
  'NL/dietist-voedingsdeskundige-sint-agatha-berchem/dietist-voedingsdeskundige-sint-agatha-berchem.html': 'Diëtist in Sint-Agatha-Berchem. Gepersonaliseerd voedingsadvies voor gewichtsverlies en gezonde voeding.',
  'NL/dietist-voedingsdeskundige-sint-pieters-woluwe/mediwoluwe.html': 'Mediwoluwe in Sint-Pieters-Woluwe. Diëtist voedingsdeskundige voor gepersonaliseerde voedingsplannen.',
  'EN/dietitian dietician nutritionist Woluwe Saint Lambert/Dietitian Woluwe Saint Lambert.html': 'Dietitian in Woluwe-Saint-Lambert. Personalized nutrition counseling for weight loss and healthy eating.'
};

let updated = 0;
Object.keys(metaExpansions).forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const newDesc = metaExpansions[file];
    const replaced = content.replace(
      /<meta\s+name=["']description["']\s+content=["'][^"']*["']/i,
      '<meta name="description" content="' + newDesc + '"'
    );
    if (replaced !== content) {
      fs.writeFileSync(file, replaced, 'utf8');
      console.log('✓ ' + file);
      updated++;
    }
  } catch (err) {
    console.log('✗ ' + file + ': ' + err.message);
  }
});
console.log('\nUpdated ' + updated + ' meta descriptions');

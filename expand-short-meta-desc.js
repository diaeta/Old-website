const fs = require('fs');

const metaExpansions = {
  'privacy.html': 'Politique de confidentialité de Diaeta. Protection de vos données personnelles et respect de votre vie privée lors de vos consultations diététiques.',
  'DE/privacy.html': 'Datenschutzrichtlinie von Diaeta. Schutz Ihrer persönlichen Daten und Privatsphäre während Ihrer Ernährungsberatung.',
  'NL/privacy.html': 'Privacybeleid van Diaeta. Bescherming van uw persoonlijke gegevens en privacy tijdens uw diëtistconsulten.',
  'EN/privacy.html': 'Privacy policy of Diaeta. Protection of your personal data and privacy during your dietitian consultations.',
  'politique-de-confidentialite.html': 'Politique de confidentialité complète de Diaeta. Comment nous protégeons vos données personnelles et respectons votre vie privée.',
  'DE/Diabetes.html': 'Ernährungsberatung bei Diabetes Typ 1 und Typ 2. Personalisierte Diabetesberatung durch anerkannten Ernährungsberater in Brüssel.',
  'EN/diabetes.html': 'Diabetes nutrition counseling for Type 1 and Type 2. Personalized diabetes management with registered dietitian in Brussels.',
  'NL/diabetes.html': 'Diëtistbegeleiding bij diabetes type 1 en 2. Gepersonaliseerd diabetesadvies door erkende diëtist in Brussel.'
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

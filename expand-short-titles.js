const fs = require('fs');

// Expanded titles for pages under 30 chars
const titleExpansions = {
  'NL/contact.html': 'Stel uw vraag aan Diëtist Pierre Abou-Zeid',
  'DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html': 'Termin buchen - Ernährungsberater Diaeta',
  'EN/contact.html': 'Ask your question - Dietitian Brussels',
  'NL/diabetes.html': 'Diabetes begeleiding en advies | Diaeta',
  'NL/dietist-voedingsdeskundige/afspraak.html': 'Afspraak maken met diëtist | Diaeta',
  'contact.html': 'Posez votre question au diététicien',
  'EN/dietitian-dietician-nutritionist/appointment.html': 'Book an appointment with dietitian',
  'rendez-vous.html': 'Rendez-vous diététicien Bruxelles',
  'DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Reizdarmsyndrom/FODMAP-arme-Diät.html': 'Reizdarmsyndrom IBS - FODMAP-arme Diät',
  'EN/legal.html': 'Legal Notice - Diaeta Brussels',
  'NL/cookies.html': 'Cookiebeleid - Diëtist Brussel',
  'DE/contact.html': 'Stellen Sie Ihre Frage an Ernährungsberater',
  'EN/cookies.html': 'Cookie Policy - Dietitian Brussels',
  'NL/dietist-voedingsdeskundige-laken/dietist-voedingsdeskundige-laken.html': 'Diëtist in Laken - Voedingsadvies',
  'NL/dietist-voedingsdeskundige-ukkel/dietist-voedingsdeskundige-ukkel.html': 'Diëtist in Ukkel - Voedingsadvies',
  'NL/privacy.html': 'Privacybeleid - Diëtist Brussel',
  'EN/privacy.html': 'Privacy Policy - Dietitian Brussels',
  'NL/dietist-voedingsdeskundige-elsene/dietist-voedingsdeskundige-elsene.html': 'Diëtist in Elsene - Voedingsadvies',
  'EN/terms.html': 'Terms of Service - Dietitian Brussels',
  'mentions-legales.html': 'Mentions Légales - Diététicien Bruxelles',
  'DE/cookies.html': 'Cookie-Richtlinie - Ernährungsberater',
  'NL/dietist-voedingsdeskundige-en-dietetiek/de-dietist-en-dietetiek.html': 'De diëtist en de diëtetiek - Wat doet een diëtist',
  'EN/Dietitian dietician nutritionist and dietetics/The dietitian and dietetics.html': 'The dietitian and dietetics - What is a dietitian',
  'NL/dietist-voedingsdeskundige-koekelberg/dietist-voedingsdeskundige-koekelberg.html': 'Diëtist Koekelberg - Voedingsadvies Brussel',
  'DE/legal.html': 'Rechtliche Hinweise - Ernährungsberater Brüssel',
  'DE/terms.html': 'Nutzungsbedingungen - Ernährungsberater Diaeta',
  'NL/algemene-voorwaarden.html': 'Algemene voorwaarden - Diëtist Diaeta',
  'NL/terms.html': 'Algemene Voorwaarden - Diëtist Brussel',
  'politique-cookies.html': 'Politique de Cookies - Diététicien Bruxelles'
};

let updated = 0;
Object.keys(titleExpansions).forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const newTitle = titleExpansions[file];
    const replaced = content.replace(/<title[^>]*>.*?<\/title>/is, '<title>' + newTitle + '</title>');
    if (replaced !== content) {
      fs.writeFileSync(file, replaced, 'utf8');
      console.log('✓ ' + file);
      updated++;
    }
  } catch (err) {
    console.log('✗ ' + file + ': ' + err.message);
  }
});
console.log('\nUpdated ' + updated + ' titles');

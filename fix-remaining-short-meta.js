const fs = require('fs');

const metaExpansions = {
  'diététique/diététicien-nutritionniste-diététique.html': 'Qu\'est-ce qu\'un diététicien nutritionniste? Découvrez le rôle de la diététique dans votre santé et bien-être. Consultations personnalisées à Bruxelles.',
  'conditions-generales.html': 'Conditions générales d\'utilisation du site Diaeta.be et des services de consultation diététique. Modalités et conditions de rendez-vous.',
  'mentions-legales.html': 'Mentions légales de Diaeta - Informations sur l\'éditeur du site et responsabilité légale du diététicien nutritionniste Pierre Abou-Zeid.',
  '404.html': 'Page non trouvée - Erreur 404. Retournez à la page d\'accueil de Diaeta pour trouver les informations sur nos consultations diététiques.',
  'cookies.html': 'Politique de cookies du site Diaeta.be. Information sur l\'utilisation des cookies et gestion de vos préférences de confidentialité.',
  'diabète.html': 'Une prise en charge personnalisée des patients diabétiques par un diététicien spécialisé. Gestion du diabète type 1 et 2 à Bruxelles.',
  'DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Woluwe-Saint-Lambert/Ernährungsberater-Woluwe-Saint-Lambert.html': 'Ernährungsberater in Woluwe-Saint-Lambert. Persönliche Beratungen für Gewichtsverlust, Diabetes und Ernährungsmanagement.',
  'DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler-Berchem-Sainte-Agathe/Ernährungsberater-Berchem-Sainte-Agathe.html': 'Ernährungsberater in Berchem-Sainte-Agathe. Persönliche Beratungen für gesunde Ernährung und Gewichtsmanagement in Brüssel.'
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
    } else {
      console.log('- No change: ' + file);
    }
  } catch (err) {
    console.log('✗ ' + file + ': ' + err.message);
  }
});
console.log('\nUpdated ' + updated + ' meta descriptions');

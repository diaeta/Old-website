const fs = require('fs');

// Meta description templates by page type and language
const META_DESCRIPTIONS = {
  contact: {
    fr: "Contactez le cabinet de diététique Diaeta à Bruxelles. Prenez rendez-vous pour une consultation personnalisée.",
    en: "Contact Diaeta dietetics practice in Brussels. Book an appointment for personalized nutritional consultation.",
    de: "Kontaktieren Sie die Ernährungsberatungspraxis Diaeta in Brüssel. Vereinbaren Sie einen Termin für eine persönliche Beratung.",
    nl: "Neem contact op met diëtistenpraktijk Diaeta in Brussel. Maak een afspraak voor gepersonaliseerd dieetadvies."
  },
  cookies: {
    fr: "Politique de cookies du site Diaeta.be. Information sur l'utilisation des cookies et vos droits.",
    en: "Cookie policy of Diaeta.be website. Information about cookie usage and your rights.",
    de: "Cookie-Richtlinie der Website Diaeta.be. Informationen zur Verwendung von Cookies und Ihren Rechten.",
    nl: "Cookiebeleid van de website Diaeta.be. Informatie over het gebruik van cookies en uw rechten."
  },
  diabetes: {
    fr: "Prise en charge diététique du diabète à Bruxelles. Consultation spécialisée en nutrition pour diabétiques.",
    en: "Dietary management of diabetes in Brussels. Specialized nutrition consultation for diabetics.",
    de: "Ernährungsberatung bei Diabetes in Brüssel. Spezialisierte Ernährungsberatung für Diabetiker.",
    nl: "Dieetbegeleiding voor diabetes in Brussel. Gespecialiseerd dieetadvies voor diabetici."
  },
  legal: {
    fr: "Mentions légales du site Diaeta.be. Informations juridiques et responsabilités.",
    en: "Legal notice of Diaeta.be website. Legal information and responsibilities.",
    de: "Rechtliche Hinweise zur Website Diaeta.be. Rechtsinformationen und Verantwortlichkeiten.",
    nl: "Juridische kennisgeving van de website Diaeta.be. Juridische informatie en verantwoordelijkheden."
  },
  privacy: {
    fr: "Politique de confidentialité Diaeta.be. Protection de vos données personnelles et respect de la vie privée.",
    en: "Privacy policy of Diaeta.be. Protection of your personal data and privacy rights.",
    de: "Datenschutzrichtlinie von Diaeta.be. Schutz Ihrer persönlichen Daten und Ihrer Privatsphäre.",
    nl: "Privacybeleid van Diaeta.be. Bescherming van uw persoonlijke gegevens en privacy."
  },
  terms: {
    fr: "Conditions générales d'utilisation du site Diaeta.be et des services de consultation.",
    en: "Terms and conditions of use of Diaeta.be website and consultation services.",
    de: "Allgemeine Nutzungsbedingungen der Website Diaeta.be und der Beratungsdienste.",
    nl: "Algemene voorwaarden voor het gebruik van de website Diaeta.be en adviesdiensten."
  },
  home: {
    fr: "Diététicien nutritionniste agréé à Bruxelles. Consultations personnalisées pour une alimentation saine et équilibrée.",
    en: "Registered dietitian nutritionist in Brussels. Personalized consultations for healthy and balanced nutrition.",
    de: "Staatlich geprüfter Ernährungsberater in Brüssel. Persönliche Beratung für gesunde und ausgewogene Ernährung.",
    nl: "Erkend diëtist voedingsdeskundige in Brussel. Persoonlijk advies voor gezonde en evenwichtige voeding."
  },
  appointment: {
    fr: "Prenez rendez-vous en ligne avec votre diététicien à Bruxelles. Consultation en cabinet ou en vidéo.",
    en: "Book an appointment online with your dietitian in Brussels. In-person or video consultation.",
    de: "Vereinbaren Sie online einen Termin mit Ihrem Ernährungsberater in Brüssel. Beratung vor Ort oder per Video.",
    nl: "Maak online een afspraak met uw diëtist in Brussel. Consultatie op locatie of via video."
  },
  nutrigenomics: {
    fr: "Test génétique nutrigenomique personnalisé. Découvrez vos prédispositions nutritionnelles par analyse ADN.",
    en: "Personalized nutrigenomic genetic test. Discover your nutritional predispositions through DNA analysis.",
    de: "Personalisierter nutrigenomischer Gentest. Entdecken Sie Ihre ernährungsbedingten Veranlagungen durch DNA-Analyse.",
    nl: "Gepersonaliseerde nutrigenomische genetische test. Ontdek uw voedingsaanleg via DNA-analyse."
  },
  consultation: {
    fr: "Consultation diététique personnalisée à Bruxelles. Analyse complète de vos besoins nutritionnels.",
    en: "Personalized dietetic consultation in Brussels. Complete analysis of your nutritional needs.",
    de: "Persönliche Ernährungsberatung in Brüssel. Vollständige Analyse Ihrer Ernährungsbedürfnisse.",
    nl: "Gepersonaliseerde dieetconsultatie in Brussel. Volledige analyse van uw voedingsbehoeften."
  },
  working_method: {
    fr: "Méthode de travail personnalisée en diététique. Approche individualisée pour atteindre vos objectifs nutritionnels.",
    en: "Personalized working method in dietetics. Individualized approach to achieve your nutritional goals.",
    de: "Personalisierte Arbeitsmethode in der Diätetik. Individueller Ansatz zur Erreichung Ihrer Ernährungsziele.",
    nl: "Gepersonaliseerde werkmethode in diëtetiek. Individuele aanpak om uw voedingsdoelen te bereiken."
  },
  weight_loss: {
    fr: "Programme de perte de poids avec diététicien à Bruxelles. Accompagnement personnalisé pour maigrir durablement.",
    en: "Weight loss program with dietitian in Brussels. Personalized support for sustainable weight loss.",
    de: "Gewichtsabnahme-Programm mit Ernährungsberater in Brüssel. Persönliche Unterstützung für nachhaltigen Gewichtsverlust.",
    nl: "Gewichtsverlies programma met diëtist in Brussel. Persoonlijke begeleiding voor duurzaam afvallen."
  },
  fodmap: {
    fr: "Régime pauvre en FODMAP pour syndrome du côlon irritable. Consultation spécialisée à Bruxelles.",
    en: "Low FODMAP diet for irritable bowel syndrome. Specialized consultation in Brussels.",
    de: "FODMAP-arme Diät bei Reizdarmsyndrom. Spezialisierte Beratung in Brüssel.",
    nl: "Low FODMAP dieet voor prikkelbare darm syndroom. Gespecialiseerde consultatie in Brussel."
  },
  location_ixelles: {
    fr: "Diététicien nutritionniste à Ixelles. Cabinet médical Tenbosch-Châtelain, consultations personnalisées.",
    en: "Dietitian nutritionist in Ixelles. Tenbosch-Châtelain medical center, personalized consultations.",
    de: "Ernährungsberater in Ixelles. Medizinisches Zentrum Tenbosch-Châtelain, persönliche Beratungen.",
    nl: "Diëtist voedingsdeskundige in Elsene. Medisch centrum Tenbosch-Châtelain, gepersonaliseerde consultaties."
  },
  location_koekelberg: {
    fr: "Diététicien nutritionniste à Koekelberg. Centre Chrysalide, consultations personnalisées.",
    en: "Dietitian nutritionist in Koekelberg. Chrysalide Center, personalized consultations.",
    de: "Ernährungsberater in Koekelberg. Chrysalide-Zentrum, persönliche Beratungen.",
    nl: "Diëtist voedingsdeskundige in Koekelberg. Chrysalide centrum, gepersonaliseerde consultaties."
  },
  location_laken: {
    fr: "Diététicien nutritionniste à Laken. Centre médical Niveole, consultations personnalisées.",
    en: "Dietitian nutritionist in Laken. Niveole medical center, personalized consultations.",
    de: "Ernährungsberater in Laken. Medizinisches Zentrum Niveole, persönliche Beratungen.",
    nl: "Diëtist voedingsdeskundige in Laken. Niveole medisch centrum, gepersonaliseerde consultaties."
  },
  location_uccle: {
    fr: "Diététicien nutritionniste à Uccle. Consultations personnalisées dans plusieurs centres médicaux.",
    en: "Dietitian nutritionist in Uccle. Personalized consultations in multiple medical centers.",
    de: "Ernährungsberater in Uccle. Persönliche Beratungen in mehreren medizinischen Zentren.",
    nl: "Diëtist voedingsdeskundige in Ukkel. Gepersonaliseerde consultaties in meerdere medische centra."
  },
  location_woluwe_sl: {
    fr: "Diététicien nutritionniste à Woluwe-Saint-Lambert. Consultations personnalisées.",
    en: "Dietitian nutritionist in Woluwe Saint Lambert. Personalized consultations.",
    de: "Ernährungsberater in Woluwe-Saint-Lambert. Persönliche Beratungen.",
    nl: "Diëtist voedingsdeskundige in Sint-Lambrechts-Woluwe. Gepersonaliseerde consultaties."
  },
  location_woluwe_sp: {
    fr: "Diététicien nutritionniste à Woluwe-Saint-Pierre. Centre Mediwoluwe, consultations personnalisées.",
    en: "Dietitian nutritionist in Woluwe Saint Pierre. Mediwoluwe center, personalized consultations.",
    de: "Ernährungsberater in Woluwe-Saint-Pierre. Mediwoluwe-Zentrum, persönliche Beratungen.",
    nl: "Diëtist voedingsdeskundige in Sint-Pieters-Woluwe. Mediwoluwe centrum, gepersonaliseerde consultaties."
  },
  location_berchem: {
    fr: "Diététicien nutritionniste à Berchem-Sainte-Agathe. Consultations personnalisées.",
    en: "Dietitian nutritionist in Berchem-Sainte-Agathe. Personalized consultations.",
    de: "Ernährungsberater in Berchem-Sainte-Agathe. Persönliche Beratungen.",
    nl: "Diëtist voedingsdeskundige in Sint-Agatha-Berchem. Gepersonaliseerde consultaties."
  },
  ibs: {
    fr: "Traitement diététique du syndrome du côlon irritable. Consultation spécialisée en régime FODMAP à Bruxelles.",
    en: "Dietary treatment of irritable bowel syndrome. Specialized FODMAP diet consultation in Brussels.",
    de: "Diätetische Behandlung des Reizdarmsyndroms. Spezialisierte FODMAP-Diät-Beratung in Brüssel.",
    nl: "Dieetbehandeling van prikkelbare darm syndroom. Gespecialiseerde FODMAP dieet consultatie in Brussel."
  },
  footer: {
    en: "Footer navigation snippet - not for indexing."
  },
  error_404: {
    fr: "Page non trouvée - Erreur 404. Retournez à la page d'accueil de Diaeta.be."
  },
  dietitian_main: {
    en: "Dietitian and dietetics services in Brussels. Professional nutrition counseling and dietary management."
  }
};

function detectPageType(filePath) {
  const lowerPath = filePath.toLowerCase();

  // Detect language
  let lang = 'fr';
  if (lowerPath.startsWith('en/')) lang = 'en';
  else if (lowerPath.startsWith('de/')) lang = 'de';
  else if (lowerPath.startsWith('nl/')) lang = 'nl';

  // Detect page type
  if (lowerPath.includes('contact')) return { type: 'contact', lang };
  if (lowerPath.includes('cookie')) return { type: 'cookies', lang };
  if (lowerPath.includes('diabetes') || lowerPath.includes('diabète')) return { type: 'diabetes', lang };
  if (lowerPath.includes('legal') || lowerPath.includes('mentions-legales') || lowerPath.includes('juridische')) return { type: 'legal', lang };
  if (lowerPath.includes('privacy') || lowerPath.includes('confidentialite')) return { type: 'privacy', lang };
  if (lowerPath.includes('terms') || lowerPath.includes('conditions') || lowerPath.includes('voorwaarden')) return { type: 'terms', lang };
  if (lowerPath.includes('/home.html')) return { type: 'home', lang };
  if (lowerPath.includes('rendez-vous') || lowerPath.includes('appointment') || lowerPath.includes('termin') || lowerPath.includes('afspraak')) return { type: 'appointment', lang };
  if (lowerPath.includes('nutrigen') || lowerPath.includes('genetic')) return { type: 'nutrigenomics', lang };
  if (lowerPath.includes('consultation') || lowerPath.includes('beratung') || lowerPath.includes('consultatie')) return { type: 'consultation', lang };
  if (lowerPath.includes('working method') || lowerPath.includes('arbeitsmethode') || lowerPath.includes('werkwijze') || lowerPath.includes('méthode')) return { type: 'working_method', lang };
  if (lowerPath.includes('weight loss') || lowerPath.includes('gewichtsverlust') || lowerPath.includes('gewichtsverlies') || lowerPath.includes('perte de poids') || lowerPath.includes('maigrir')) return { type: 'weight_loss', lang };
  if (lowerPath.includes('fodmap') || lowerPath.includes('irritable') || lowerPath.includes('reizdarm') || lowerPath.includes('prikkelbare')) return { type: 'fodmap', lang };

  // Location-based pages
  if (lowerPath.includes('ixelles') || lowerPath.includes('elsene')) return { type: 'location_ixelles', lang };
  if (lowerPath.includes('koekelberg')) return { type: 'location_koekelberg', lang };
  if (lowerPath.includes('laken')) return { type: 'location_laken', lang };
  if (lowerPath.includes('uccle') || lowerPath.includes('ukkel')) return { type: 'location_uccle', lang };
  if (lowerPath.includes('woluwe-saint-lambert') || lowerPath.includes('sint-lambrechts-woluwe')) return { type: 'location_woluwe_sl', lang };
  if (lowerPath.includes('woluwe-saint-pierre') || lowerPath.includes('sint-pieters-woluwe')) return { type: 'location_woluwe_sp', lang };
  if (lowerPath.includes('berchem') || lowerPath.includes('agatha')) return { type: 'location_berchem', lang };

  if (lowerPath.includes('404')) return { type: 'error_404', lang: 'fr' };
  if (lowerPath.includes('footer_snippet')) return { type: 'footer', lang };
  if (lowerPath.includes('the dietitian and dietetics')) return { type: 'dietitian_main', lang };

  return null;
}

function addMetaDescription(filePath, description) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if meta description already exists
    if (content.match(/<meta\s+name=["']description["']/i)) {
      console.log('[SKIP] ' + filePath + ' - already has meta description');
      return false;
    }

    // Find </head> and insert before it
    const headEndMatch = content.match(/(\s*)<\/head>/i);
    if (!headEndMatch) {
      console.log('[ERROR] ' + filePath + ' - no </head> tag found');
      return false;
    }

    const insertPos = content.indexOf(headEndMatch[0]);
    const metaTag = `    <meta name="description" content="${description}">\n`;
    content = content.slice(0, insertPos) + metaTag + content.slice(insertPos);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[OK] ' + filePath);
    return true;
  } catch (err) {
    console.log('[ERROR] ' + filePath + ': ' + err.message);
    return false;
  }
}

// Read the list of files needing meta descriptions
const issues = JSON.parse(fs.readFileSync('seo_issues_detailed.txt', 'utf8'));
let fixed = 0;
let skipped = 0;

console.log('Adding meta descriptions to ' + issues.noMetaDesc.length + ' files...\n');

issues.noMetaDesc.forEach(filePath => {
  // Skip lighthouse reports and footer snippets (already handled)
  if (filePath.includes('lighthouse-report') || filePath.includes('footer_en_')) {
    console.log('[SKIP] ' + filePath + ' - utility file');
    skipped++;
    return;
  }

  const pageInfo = detectPageType(filePath);

  if (!pageInfo) {
    console.log('[SKIP] ' + filePath + ' - could not detect page type');
    skipped++;
    return;
  }

  const description = META_DESCRIPTIONS[pageInfo.type]?.[pageInfo.lang];

  if (!description) {
    console.log('[SKIP] ' + filePath + ' - no description template for ' + pageInfo.type + '/' + pageInfo.lang);
    skipped++;
    return;
  }

  if (addMetaDescription(filePath, description)) {
    fixed++;
  } else {
    skipped++;
  }
});

console.log('\n=== SUMMARY ===');
console.log('Meta descriptions added: ' + fixed);
console.log('Files skipped: ' + skipped);

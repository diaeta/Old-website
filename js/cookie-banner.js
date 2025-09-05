(function(){
  if (window.__diaetaCookieBannerInitialized) return;
  window.__diaetaCookieBannerInitialized = true;

  function getLang(){
    try {
      const htmlLang = (document.documentElement.getAttribute('lang')||'').toLowerCase();
      if (htmlLang) return htmlLang.substring(0,2);
      const path = (location.pathname||'').toLowerCase();
      if (path.startsWith('/en/')) return 'en';
      if (path.startsWith('/de/')) return 'de';
      if (path.startsWith('/nl/')) return 'nl';
      return 'fr';
    } catch(e){ return 'fr'; }
  }

  const I18N = {
    en: {
      bannerText: 'We use cookies to enhance your experience on our website. These cookies help us analyze traffic and personalize content. By continuing to browse, you accept our use of cookies.',
      learnMore: 'Learn more',
      customize: 'Customize',
      acceptAll: 'Accept all',
      settingsTitle: 'Cookie Settings',
      essential: 'Essential Cookies',
      essentialDesc: 'These cookies are necessary for the website to function and cannot be disabled. They do not store any personally identifiable information.',
      analytics: 'Analytics Cookies',
      analyticsDesc: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      marketing: 'Marketing Cookies',
      marketingDesc: 'These cookies are used to track visitors across websites in order to display relevant and engaging advertisements.',
      cancel: 'Cancel',
      save: 'Save'
    },
    fr: {
      bannerText: "Nous utilisons des cookies pour améliorer votre expérience sur notre site. Ces cookies nous aident à analyser le trafic et à personnaliser le contenu. En poursuivant votre navigation, vous acceptez notre utilisation des cookies.",
      learnMore: 'En savoir plus',
      customize: 'Personnaliser',
      acceptAll: 'Tout accepter',
      settingsTitle: 'Paramètres des cookies',
      essential: 'Cookies essentiels',
      essentialDesc: "Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés. Ils ne stockent aucune information personnelle.",
      analytics: 'Cookies analytiques',
      analyticsDesc: "Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site en collectant et en rapportant des informations de manière anonyme.",
      marketing: 'Cookies marketing',
      marketingDesc: "Ces cookies sont utilisés pour suivre les visiteurs à travers les sites web afin d'afficher des publicités pertinentes et attrayantes.",
      cancel: 'Annuler',
      save: 'Enregistrer'
    },
    nl: {
      bannerText: 'We gebruiken cookies om uw ervaring op onze website te verbeteren. Deze cookies helpen ons verkeer te analyseren en inhoud te personaliseren. Door verder te surfen, gaat u akkoord met ons gebruik van cookies.',
      learnMore: 'Meer weten',
      customize: 'Aanpassen',
      acceptAll: 'Alles accepteren',
      settingsTitle: 'Cookie-instellingen',
      essential: 'Essentiële cookies',
      essentialDesc: 'Deze cookies zijn nodig voor de werking van de website en kunnen niet worden uitgeschakeld. Ze slaan geen persoonlijk identificeerbare informatie op.',
      analytics: 'Analysecookies',
      analyticsDesc: 'Deze cookies helpen ons te begrijpen hoe bezoekers met onze website omgaan door anoniem informatie te verzamelen en te rapporteren.',
      marketing: 'Marketingcookies',
      marketingDesc: 'Deze cookies worden gebruikt om bezoekers over websites heen te volgen om relevante en boeiende advertenties te tonen.',
      cancel: 'Annuleren',
      save: 'Opslaan'
    },
    de: {
      bannerText: 'Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern. Diese Cookies helfen uns, den Verkehr zu analysieren und Inhalte zu personalisieren. Indem Sie weiter surfen, akzeptieren Sie unsere Verwendung von Cookies.',
      learnMore: 'Erfahren Sie mehr',
      customize: 'Anpassen',
      acceptAll: 'Alle akzeptieren',
      settingsTitle: 'Cookie-Einstellungen',
      essential: 'Essentielle Cookies',
      essentialDesc: 'Diese Cookies sind für das Funktionieren der Website notwendig und können nicht deaktiviert werden. Sie speichern keine personenbezogenen Daten.',
      analytics: 'Analyse-Cookies',
      analyticsDesc: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie Informationen anonym sammeln und melden.',
      marketing: 'Marketing-Cookies',
      marketingDesc: 'Diese Cookies werden verwendet, um Besucher über Websites hinweg zu verfolgen, um relevante und ansprechende Werbung anzuzeigen.',
      cancel: 'Abbrechen',
      save: 'Speichern'
    }
  };

  function setCookie(name, value, days) {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + ";expires=" + expires.toUTCString() + ";path=/;SameSite=Lax";
    } catch (e) {}
  }

  function getCookie(name) {
    try {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          const raw = decodeURIComponent(c.substring(nameEQ.length, c.length));
          try { return JSON.parse(raw); } catch (_) { return null; }
        }
      }
    } catch (e) {}
    return null;
  }

  function injectStyles() {
    if (document.getElementById('diaeta-cookie-styles')) return;
    const css = `
.cookie-banner{position:fixed;bottom:0;left:0;right:0;background:linear-gradient(135deg,#005773 0%,#007a9e 100%);color:#fff;padding:20px 0;box-shadow:0 -4px 20px rgba(0,0,0,.15);z-index:9999;transform:translateY(100%);transition:transform .4s ease-in-out;backdrop-filter:blur(10px);border-top:2px solid #bfe095}
.cookie-banner.show{transform:translateY(0)}
.cookie-banner-content{max-width:1200px;margin:0 auto;padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:20px}
.cookie-banner-text{flex:1;font-size:14px;line-height:1.6}
.cookie-banner-text a{color:#bfe095;text-decoration:underline;font-weight:500}
.cookie-banner-text a:hover{color:#d6ebba}
.cookie-banner-buttons{display:flex;gap:12px;flex-shrink:0}
.cookie-btn{padding:10px 20px;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;transition:all .3s ease;text-decoration:none;display:inline-block;text-align:center}
.cookie-btn-primary{background:#bfe095;color:#005773}
.cookie-btn-primary:hover{background:#d6ebba;transform:translateY(-1px)}
.cookie-btn-secondary{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.3)}
.cookie-btn-secondary:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.5)}
.cookie-btn-small{padding:8px 16px;font-size:12px}
@media (max-width:768px){.cookie-banner-content{flex-direction:column;text-align:center;gap:15px}.cookie-banner-buttons{width:100%;justify-content:center}.cookie-btn{flex:1;max-width:150px}}
.cookie-settings-modal{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);z-index:10000;display:none;align-items:center;justify-content:center;padding:20px}
.cookie-settings-modal.show{display:flex}
.cookie-settings-content{background:#fff;border-radius:12px;padding:30px;max-width:500px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 40px rgba(0,0,0,.2)}
.cookie-settings-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid #f0f0f0}
.cookie-settings-title{font-size:20px;font-weight:600;color:#005773;margin:0}
.cookie-settings-close{background:none;border:none;font-size:24px;cursor:pointer;color:#666;padding:0;width:30px;height:30px;display:flex;align-items:center;justify-content:center}
.cookie-settings-close:hover{color:#005773}
.cookie-category{margin-bottom:20px;padding:15px;border:1px solid #e0e0e0;border-radius:8px}
.cookie-category-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.cookie-category-title{font-weight:600;color:#333;margin:0}
.cookie-toggle{position:relative;width:50px;height:24px;background:#ccc;border-radius:12px;cursor:pointer;transition:background .3s}
.cookie-toggle.active{background:#bfe095}
.cookie-toggle::after{content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .3s}
.cookie-toggle.active::after{transform:translateX(26px)}
.cookie-category-description{font-size:14px;color:#666;line-height:1.5;margin:0}
.cookie-settings-footer{margin-top:25px;padding-top:20px;border-top:2px solid #f0f0f0;display:flex;gap:12px;justify-content:flex-end}
`;
    const style = document.createElement('style');
    style.id = 'diaeta-cookie-styles';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function injectMarkup() {
    if (document.getElementById('cookieBanner')) return;
    const lang = getLang();
    const t = I18N[lang] || I18N.en;
    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.className = 'cookie-banner';
    let policyHref = '/cookies.html';
    try {
      const path = (location.pathname||'').toLowerCase();
      if (lang === 'en') policyHref = '/EN/cookies.html';
      else if (lang === 'de') policyHref = '/DE/cookies.html';
      else if (lang === 'nl') policyHref = '/NL/cookies.html';
      else policyHref = '/cookies.html';
      // If current page is within a language subfolder, prefer relative link one level up
      if (/^\/(en|de|nl)\//i.test(location.pathname)) {
        policyHref = '../cookies.html';
      }
    } catch(_) {}
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-banner-text">
          <p>${t.bannerText} <a href="${policyHref}">${t.learnMore}</a></p>
        </div>
        <div class="cookie-banner-buttons">
          <button class="cookie-btn cookie-btn-secondary cookie-btn-small" onclick="openCookieSettings()">${t.customize}</button>
          <button class="cookie-btn cookie-btn-primary" onclick="acceptAllCookies()">${t.acceptAll}</button>
        </div>
      </div>`;

    const modal = document.createElement('div');
    modal.id = 'cookieSettingsModal';
    modal.className = 'cookie-settings-modal';
    modal.innerHTML = `
      <div class="cookie-settings-content">
        <div class="cookie-settings-header">
          <h3 class="cookie-settings-title">${t.settingsTitle}</h3>
          <button class="cookie-settings-close" onclick="closeCookieSettings()">×</button>
        </div>
        <div class="cookie-category">
          <div class="cookie-category-header">
            <h4 class="cookie-category-title">${t.essential}</h4>
            <div class="cookie-toggle active" style="pointer-events: none;"></div>
          </div>
          <p class="cookie-category-description">${t.essentialDesc}</p>
        </div>
        <div class="cookie-category">
          <div class="cookie-category-header">
            <h4 class="cookie-category-title">${t.analytics}</h4>
            <div class="cookie-toggle" id="analyticsToggle" onclick="toggleCookieCategory('analytics')"></div>
          </div>
          <p class="cookie-category-description">${t.analyticsDesc}</p>
        </div>
        <div class="cookie-category">
          <div class="cookie-category-header">
            <h4 class="cookie-category-title">${t.marketing}</h4>
            <div class="cookie-toggle" id="marketingToggle" onclick="toggleCookieCategory('marketing')"></div>
          </div>
          <p class="cookie-category-description">${t.marketingDesc}</p>
        </div>
        <div class="cookie-settings-footer">
          <button class="cookie-btn cookie-btn-secondary" onclick="closeCookieSettings()">${t.cancel}</button>
          <button class="cookie-btn cookie-btn-primary" onclick="saveCookiePreferences()">${t.save}</button>
        </div>
      </div>`;

    document.body.appendChild(banner);
    document.body.appendChild(modal);

    modal.addEventListener('click', function(e){ if (e.target === modal) closeCookieSettings(); });
  }

  window.showCookieBanner = function(){ const el = document.getElementById('cookieBanner'); if (el) el.classList.add('show'); };
  window.hideCookieBanner = function(){ const el = document.getElementById('cookieBanner'); if (el) el.classList.remove('show'); };
  window.openCookieSettings = function(){ const modal = document.getElementById('cookieSettingsModal'); if (modal) { modal.classList.add('show'); hideCookieBanner(); } };
  window.closeCookieSettings = function(){ const modal = document.getElementById('cookieSettingsModal'); if (!modal) return; modal.classList.remove('show'); };
  window.toggleCookieCategory = function(category){ const toggle = document.getElementById(category + 'Toggle'); if (toggle) toggle.classList.toggle('active'); };
  window.acceptAllCookies = function(){
    const preferences = { necessary: true, analytics: true, marketing: true, timestamp: new Date().toISOString() };
    try { setCookie('diaeta_cookie_preferences', preferences, 365); } catch(_){}
    hideCookieBanner();
    if (typeof gtag !== 'undefined') { try { gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' }); } catch(_){} }
  };
  window.saveCookiePreferences = function(){
    const analyticsEnabled = !!document.getElementById('analyticsToggle')?.classList.contains('active');
    const marketingEnabled = !!document.getElementById('marketingToggle')?.classList.contains('active');
    const preferences = { necessary: true, analytics: analyticsEnabled, marketing: marketingEnabled, timestamp: new Date().toISOString() };
    try { setCookie('diaeta_cookie_preferences', preferences, 365); } catch(_){}
    closeCookieSettings();
    if (typeof gtag !== 'undefined') { try { gtag('consent', 'update', { analytics_storage: analyticsEnabled ? 'granted' : 'denied', ad_storage: marketingEnabled ? 'granted' : 'denied' }); } catch(_){} }
  };
  window.manageCookieConsent = function(){ openCookieSettings(); };

  function loadAnalyticsIfConsented(){
    const prefs = getCookie('diaeta_cookie_preferences');
    if (prefs && prefs.analytics && typeof gtag !== 'undefined') {
      try { gtag('consent', 'update', { analytics_storage: 'granted' }); } catch(_){}
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    injectStyles();
    injectMarkup();
    const prefs = getCookie('diaeta_cookie_preferences');
    // Treat the mere presence of the cookie key as consent already given (for cross-page consistency),
    // even if parsing fails due to legacy values or formatting.
    let hasRawCookie = false;
    try {
      hasRawCookie = (document.cookie || '')
        .split(';')
        .some(function(c){ return c.trim().indexOf('diaeta_cookie_preferences=') === 0; });
    } catch(_) {}

    if (!prefs) {
      if (hasRawCookie) {
        // Respect previously given consent across pages
        loadAnalyticsIfConsented();
      } else {
        setTimeout(showCookieBanner, 1000);
      }
    } else {
      loadAnalyticsIfConsented();
    }
  });
})();



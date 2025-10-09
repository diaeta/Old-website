from __future__ import annotations

from pathlib import Path
from typing import Dict, List
import json

from bs4 import BeautifulSoup, NavigableString, Comment
from deep_translator import GoogleTranslator

ROOT = Path('.')
SOURCE = ROOT / 'EN' / 'contact.html'

TARGETS: List[Dict] = [
    {
        'lang_code': 'fr',
        'lang_tag': 'fr',
        'dest': ROOT / 'contact.html',
        'canonical': 'https://diaeta.be/contact.html',
        'strip_prefix': '../',
        'website_id': 'https://diaeta.be/#website',
        'href_map': {
            'home.html': 'index.html',
            'Dietitian dietician nutritionist and dietetics/The dietitian and dietetics.html': 'diététique/diététicien-nutritionniste-diététique.html',
            'Dietitian dietician nutritionist and dietetics/Consultation.html': 'diététique/Consultation/Consultation.html',
            'Dietitian dietician nutritionist and dietetics/working method.html': 'diététique/méthode-de-travail.html',
            '#cabinet': '#cabinet',
            '#tarifs': '#tarifs',
            'diabetes.html': 'diabète.html',
            'nutrigenomics nutrigenetics/genetic test.html': 'nutrigenomics.html',
            'dietitian-dietician-nutritionist/irritable bowel syndrome/low FODMAP diet.html': 'diététicien-diététicienne-nutritionniste/syndrome du colon irritable/régime pauvre en FODMAP.html',
            'dietitian-dietician-nutritionist/weight loss/losing weight and weight loss.html': 'diététicien-diététicienne-nutritionniste/perdre du poids et Maigrir/Diététcien Diététicienne Nutritionniste Perte de poids.html',
            'contact.html': 'contact.html',
            'dietitian-dietician-nutritionist/appointment.html': 'rendez-vous.html',
            '#Calculette': '#Calculette',
            '../index.html': 'index.html',
            '../NL/home.html': 'NL/home.html',
            '../DE/home.html': 'DE/home.html',
            '../EN/home.html': 'EN/home.html'
        },
        'hreflang': {
            'fr': 'https://diaeta.be/contact.html',
            'en': 'https://diaeta.be/EN/contact.html',
            'de': 'https://diaeta.be/DE/contact.html',
            'nl': 'https://diaeta.be/NL/contact.html',
            'x-default': 'https://diaeta.be/contact.html'
        }
    },
    {
        'lang_code': 'de',
        'lang_tag': 'de',
        'dest': ROOT / 'DE' / 'contact.html',
        'canonical': 'https://diaeta.be/DE/contact.html',
        'strip_prefix': None,
        'website_id': 'https://diaeta.be/DE/#website',
        'href_map': {
            'home.html': 'home.html',
            'Dietitian dietician nutritionist and dietetics/The dietitian and dietetics.html': 'Ernährungsberater-Diätassistent-Ernährungswissenschaftler-und-Diätetik/Der-Ernährungsberater-und-Diätetik.html',
            'Dietitian dietician nutritionist and dietetics/Consultation.html': 'Ernährungsberater-Diätassistent-Ernährungswissenschaftler-und-Diätetik/beratung.html',
            'Dietitian dietician nutritionist and dietetics/working method.html': 'Ernährungsberater-Diätassistent-Ernährungswissenschaftler-und-Diätetik/Arbeitsmethode.html',
            '#cabinet': '#cabinet',
            '#tarifs': '#tarifs',
            'diabetes.html': 'Diabetes.html',
            'nutrigenomics nutrigenetics/genetic test.html': 'Nutrigenomik-Nutrigenetik/Gentest.html',
            'dietitian-dietician-nutritionist/irritable bowel syndrome/low FODMAP diet.html': 'Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Reizdarmsyndrom/FODMAP-arme-Diät.html',
            'dietitian-dietician-nutritionist/weight loss/losing weight and weight loss.html': 'Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Gewichtsverlust/Abnehmen-und-Gewichtsverlust.html',
            'contact.html': 'contact.html',
            'dietitian-dietician-nutritionist/appointment.html': 'Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html',
            '#Calculette': '#Calculette',
            '../index.html': '../index.html',
            '../NL/home.html': '../NL/home.html',
            '../DE/home.html': 'home.html',
            '../EN/home.html': '../EN/home.html'
        },
        'hreflang': {
            'fr': 'https://diaeta.be/contact.html',
            'en': 'https://diaeta.be/EN/contact.html',
            'de': 'https://diaeta.be/DE/contact.html',
            'nl': 'https://diaeta.be/NL/contact.html',
            'x-default': 'https://diaeta.be/EN/contact.html'
        }
    },
    {
        'lang_code': 'nl',
        'lang_tag': 'nl',
        'dest': ROOT / 'NL' / 'contact.html',
        'canonical': 'https://diaeta.be/NL/contact.html',
        'strip_prefix': None,
        'website_id': 'https://diaeta.be/NL/#website',
        'href_map': {
            'home.html': 'home.html',
            'Dietitian dietician nutritionist and dietetics/The dietitian and dietetics.html': 'dietist-voedingsdeskundige-en-dietetiek/de-dietist-en-dietetiek.html',
            'Dietitian dietician nutritionist and dietetics/Consultation.html': 'dietist-voedingsdeskundige-en-dietetiek/consultatie.html',
            'Dietitian dietician nutritionist and dietetics/working method.html': 'dietist-voedingsdeskundige-en-dietetiek/werkwijze.html',
            '#cabinet': '#cabinet',
            '#tarifs': '#tarifs',
            'diabetes.html': 'diabetes.html',
            'nutrigenomics nutrigenetics/genetic test.html': 'nutrigenomica-nutrigenetica/genetische-test.html',
            'dietitian-dietician-nutritionist/irritable bowel syndrome/low FODMAP diet.html': 'dietist-voedingsdeskundige/prikkelbare-darm-syndroom/low-fodmap-dieet.html',
            'dietitian-dietician-nutritionist/weight loss/losing weight and weight loss.html': 'dietist-voedingsdeskundige/gewichtsverlies/afvallen-en-gewichtsverlies.html',
            'contact.html': 'contact.html',
            'dietitian-dietician-nutritionist/appointment.html': 'dietist-voedingsdeskundige/afspraak.html',
            '#Calculette': '#Calculette',
            '../index.html': '../index.html',
            '../NL/home.html': 'home.html',
            '../DE/home.html': '../DE/home.html',
            '../EN/home.html': '../EN/home.html'
        },
        'hreflang': {
            'fr': 'https://diaeta.be/contact.html',
            'en': 'https://diaeta.be/EN/contact.html',
            'de': 'https://diaeta.be/DE/contact.html',
            'nl': 'https://diaeta.be/NL/contact.html',
            'x-default': 'https://diaeta.be/NL/contact.html'
        }
    }
]

ATTRS_TO_TRANSLATE = ['aria-label', 'title', 'alt', 'placeholder', 'content']
META_TRANSLATABLE = {'description', 'keywords', 'title'}


def load_source_soup() -> BeautifulSoup:
    html = SOURCE.read_text(encoding='utf-8')
    return BeautifulSoup(html, 'html.parser')


def should_translate_text(text: NavigableString) -> bool:
    if isinstance(text, Comment):
        return False
    parent = text.parent
    if parent and parent.name in {'script', 'style'}:
        return False
    stripped = text.strip()
    if not stripped:
        return False
    if stripped.isdigit():
        return False
    if len(stripped) <= 2 and stripped.upper() == stripped:
        return False
    return True


def translate_soup(soup: BeautifulSoup, lang_code: str) -> BeautifulSoup:
    translator = GoogleTranslator(source='en', target=lang_code)
    cache: Dict[str, str] = {}

    def translate_text(text: str) -> str:
        stripped = text.strip()
        if not stripped:
            return text
        if stripped in cache:
            translated = cache[stripped]
        else:
            translated = translator.translate(stripped)
            cache[stripped] = translated
        prefix_len = len(text) - len(text.lstrip())
        suffix_len = len(text) - len(text.rstrip())
        return text[:prefix_len] + translated + text[len(text) - suffix_len:]

    for node in list(soup.find_all(string=True)):
        if should_translate_text(node):
            node.replace_with(NavigableString(translate_text(str(node))))

    for element in soup.find_all(True):
        for attr in ATTRS_TO_TRANSLATE:
            if attr not in element.attrs:
                continue
            value = element.attrs[attr]
            if isinstance(value, list):
                continue
            stripped = value.strip()
            if not stripped:
                continue
            if element.name == 'meta' and attr == 'content':
                name_attr = element.attrs.get('name', '').lower()
                if name_attr not in META_TRANSLATABLE:
                    continue
            if stripped in cache:
                translated = cache[stripped]
            else:
                translated = translator.translate(stripped)
                cache[stripped] = translated
            element.attrs[attr] = translated

    return soup


def adjust_resources(soup: BeautifulSoup, target: Dict) -> None:
    strip_prefix = target.get('strip_prefix')
    if strip_prefix:
        for el in soup.find_all(['link', 'script', 'img', 'a']):
            for attr in ('href', 'src'):
                value = el.get(attr)
                if not value or isinstance(value, list):
                    continue
                if value.startswith(strip_prefix):
                    el[attr] = value[len(strip_prefix):]


def adjust_hrefs(soup: BeautifulSoup, target: Dict) -> None:
    route_map = target.get('href_map', {})
    for a in soup.find_all('a'):
        href = a.get('href')
        if not href:
            continue
        replacement = route_map.get(href)
        if replacement:
            a['href'] = replacement


def adjust_head_and_ld(soup: BeautifulSoup, target: Dict) -> None:
    html_tag = soup.find('html')
    if html_tag:
        html_tag['lang'] = target['lang_tag']
    head = soup.find('head')
    if not head:
        return

    canonical_link = head.find('link', rel='canonical')
    if not canonical_link:
        canonical_link = soup.new_tag('link', rel='canonical')
        head.append(canonical_link)
    canonical_link['href'] = target['canonical']

    for link in head.find_all('link', rel='alternate'):
        link.decompose()
    for lang, href in target['hreflang'].items():
        link = soup.new_tag('link', rel='alternate')
        link['hreflang'] = lang
        link['href'] = href
        head.append(link)

    ld_script = head.find('script', {'type': 'application/ld+json'})
    if ld_script and ld_script.string:
        try:
            data = json.loads(ld_script.string)
        except json.JSONDecodeError:
            data = None
        if isinstance(data, dict):
            data['@id'] = target['canonical']
            data['url'] = target['canonical']
            data['inLanguage'] = target['lang_tag']
            if isinstance(data.get('isPartOf'), dict):
                data['isPartOf']['@id'] = target.get('website_id', data['isPartOf'].get('@id'))
            ld_script.string = json.dumps(data, ensure_ascii=False, indent=2)


def process_target(target: Dict) -> None:
    soup = load_source_soup()
    soup = translate_soup(soup, target['lang_code'])
    adjust_resources(soup, target)
    adjust_hrefs(soup, target)
    adjust_head_and_ld(soup, target)

    dest_path: Path = target['dest']
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    html_output = '<!DOCTYPE html>\n' + str(soup)
    dest_path.write_text(html_output, encoding='utf-8')
    print(f'Wrote translated contact page: {dest_path}')


def main() -> None:
    for target in TARGETS:
        process_target(target)


if __name__ == '__main__':
    main()

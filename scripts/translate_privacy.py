from pathlib import Path
from bs4 import BeautifulSoup, NavigableString, Comment
from deep_translator import GoogleTranslator

source_path = Path('EN/privacy.html')
output_path = Path('privacy_translated.html')
nav_source_path = Path('index.html')

source_html = source_path.read_text(encoding='utf-8')
soup = BeautifulSoup(source_html, 'html.parser')

if soup.html:
    soup.html['lang'] = 'fr'

def should_translate_text(node: NavigableString) -> bool:
    if isinstance(node, Comment):
        return False
    parent = node.parent
    if parent and parent.name in {'script', 'style'}:
        return False
    stripped = node.strip()
    if not stripped:
        return False
    if stripped.isdigit():
        return False
    if len(stripped) <= 2 and stripped.upper() == stripped:
        return False
    return True

translator = GoogleTranslator(source='en', target='fr')
translation_cache: dict[str, str] = {}

def translate_text(text: str) -> str:
    stripped = text.strip()
    if not stripped:
        return text
    cached = translation_cache.get(stripped)
    if cached is None:
        cached = translator.translate(stripped)
        translation_cache[stripped] = cached
    prefix_len = len(text) - len(text.lstrip())
    suffix_len = len(text) - len(text.rstrip())
    prefix = text[:prefix_len]
    suffix = text[len(text) - suffix_len:]
    return f"{prefix}{cached}{suffix}"

for node in list(soup.find_all(string=True)):
    if not should_translate_text(node):
        continue
    translated = translate_text(str(node))
    node.replace_with(NavigableString(translated))

attributes_to_translate = ['aria-label', 'title', 'alt', 'placeholder', 'content']
for element in soup.find_all(True):
    for attr in attributes_to_translate:
        value = element.attrs.get(attr)
        if not value or isinstance(value, list):
            continue
        stripped = value.strip()
        if not stripped:
            continue
        if element.name == 'meta' and attr == 'content':
            name_attr = element.attrs.get('name', '').lower()
            if name_attr not in {'description', 'keywords', 'title'}:
                continue
        cached = translation_cache.get(stripped)
        if cached is None:
            cached = translator.translate(stripped)
            translation_cache[stripped] = cached
        element.attrs[attr] = cached

for element in soup.find_all(['link', 'script', 'img', 'a']):
    for attr in ('href', 'src'):
        value = element.attrs.get(attr)
        if not value or isinstance(value, list):
            continue
        if value.startswith('../'):
            element.attrs[attr] = value[3:]

nav_html = nav_source_path.read_text(encoding='utf-8')
nav_soup = BeautifulSoup(nav_html, 'html.parser')
nav_replacement = nav_soup.find('nav', class_='navbar')
nav_target = soup.find('nav', class_='navbar')
if nav_replacement and nav_target:
    nav_target.replace_with(nav_replacement)

output_path.write_text(str(soup), encoding='utf-8')
print(f'Translated file written to {output_path}')

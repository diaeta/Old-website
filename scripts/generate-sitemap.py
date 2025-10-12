#!/usr/bin/env python3
import os
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

BASE_URL = 'https://diaeta.be'
EXCLUDE_DIRS = {'node_modules', '.git', 'scripts', '.byterover', '.claude', '.cursor', '.roo', '.vscode', '.github', '.tmp', 'test', 'mcp-servers'}

def get_html_files():
    html_files = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                html_files.append(filepath)
    return html_files

def normalize_path(filepath):
    path = filepath.replace('./', '').replace('.\', '').replace('\', '/')
    return quote(path, safe='/:')

def get_language(filepath):
    if filepath.startswith('EN/'):
        return 'en'
    elif filepath.startswith('NL/'):
        return 'nl'
    elif filepath.startswith('DE/'):
        return 'de'
    return 'fr'

def get_page_id(filepath):
    return re.sub(r'^(EN|NL|DE)/', '', filepath)

def get_file_mod_time(filepath):
    try:
        mtime = os.path.getmtime(filepath)
        return datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
    except:
        return datetime.now().strftime('%Y-%m-%d')

def get_priority(filename):
    basename = os.path.basename(filename).lower()
    priorities = {
        'index.html': '1.0',
        'home.html': '1.0',
        'contact.html': '0.9',
        'rendez-vous.html': '0.9'
    }
    return priorities.get(basename, '0.8')

def group_by_page(html_files):
    pages = {}
    for filepath in html_files:
        normalized = normalize_path(filepath)
        lang = get_language(normalized)
        page_id = get_page_id(normalized)
        
        if page_id not in pages:
            pages[page_id] = {}
        pages[page_id][lang] = normalized
    return pages

def generate_sitemap():
    print('🔍 Scanning for HTML files...\n')
    html_files = get_html_files()
    print(f'✅ Found {len(html_files)} HTML files\n')
    
    pages = group_by_page(html_files)
    print(f'📄 Grouped into {len(pages)} unique pages\n')
    
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
    sitemap += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    
    for filepath in sorted(html_files):
        url = normalize_path(filepath)
        full_url = f'{BASE_URL}/{url}'
        lastmod = get_file_mod_time(filepath)
        priority = get_priority(filepath)
        lang = get_language(url)
        page_id = get_page_id(url)
        alternates = pages.get(page_id, {})
        
        sitemap += '  <url>\n'
        sitemap += f'    <loc>{full_url}</loc>\n'
        sitemap += f'    <lastmod>{lastmod}</lastmod>\n'
        sitemap += f'    <priority>{priority}</priority>\n'
        
        # Add hreflang alternates
        if len(alternates) > 1:
            for alt_lang, alt_url in alternates.items():
                sitemap += f'    <xhtml:link rel="alternate" hreflang="{alt_lang}" href="{BASE_URL}/{alt_url}" />\n'
        
        sitemap += '  </url>\n'
        print(f'✅ {url} [{lang}]')
    
    sitemap += '</urlset>'
    
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap)
    
    print(f'\n📝 Sitemap generated: sitemap.xml')
    print(f'📊 Total URLs: {len(html_files)}')
    print(f'🌐 With hreflang support for {len(pages)} page groups')

if __name__ == '__main__':
    try:
        generate_sitemap()
        print('\n✅ Sitemap generation complete!')
    except Exception as e:
        print(f'❌ Error: {e}')
        exit(1)

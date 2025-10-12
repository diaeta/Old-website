#!/usr/bin/env python3
"""
SEO-Optimized Multilingual Sitemap Generator with hreflang support
"""
import os
import re
from datetime import datetime
from pathlib import Path
from urllib.parse import quote
from collections import defaultdict

BASE_URL = 'https://diaeta.be'
EXCLUDE_DIRS = {'node_modules', '.git', 'scripts', '.byterover', '.claude', '.cursor', '.roo', '.vscode', '.github', '.tmp', 'test', 'mcp-servers'}

def get_html_files():
    """Find all HTML files"""
    html_files = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for file in files:
            if file.endswith('.html') and file != 'flaticon.html':  # Exclude font files
                filepath = os.path.join(root, file)
                html_files.append(filepath)
    return sorted(html_files)

def normalize_path(filepath):
    """Normalize file path to URL path"""
    path = filepath.replace('./', '').replace('.\\', '').replace('\\', '/')
    return quote(path, safe='/:')

def get_language(filepath):
    """Extract language from path"""
    if filepath.startswith('EN/'):
        return 'en'
    elif filepath.startswith('NL/'):
        return 'nl'
    elif filepath.startswith('DE/'):
        return 'de'
    return 'fr'  # Default French

def get_page_id(filepath):
    """Get page identifier without language prefix"""
    return re.sub(r'^(EN|NL|DE)/', '', filepath)

def get_file_mod_time(filepath):
    """Get file modification time"""
    try:
        mtime = os.path.getmtime(filepath)
        return datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
    except:
        return datetime.now().strftime('%Y-%m-%d')

def get_priority(filename):
    """Determine URL priority"""
    basename = os.path.basename(filename).lower()
    priorities = {
        'index.html': '1.0',
        'home.html': '1.0',
        'contact.html': '0.9',
        'rendez-vous.html': '0.9'
    }
    return priorities.get(basename, '0.8')

def get_changefreq(filepath):
    """Determine change frequency"""
    basename = os.path.basename(filepath).lower()
    if basename in ['index.html', 'home.html']:
        return 'daily'
    elif 'contact' in basename or 'rendez-vous' in basename:
        return 'weekly'
    return 'monthly'

def generate_sitemap():
    """Generate SEO-optimized sitemap with hreflang"""
    print('🔍 Scanning for HTML files...\n')
    html_files = get_html_files()
    print(f'✅ Found {len(html_files)} HTML files\n')
    
    # Group pages by ID for hreflang
    page_groups = defaultdict(dict)
    for filepath in html_files:
        normalized = normalize_path(filepath)
        lang = get_language(normalized)
        page_id = get_page_id(normalized)
        page_groups[page_id][lang] = normalized
    
    print(f'📄 Grouped into {len(page_groups)} unique pages\n')
    
    # Generate sitemap XML
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    sitemap += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n'
    sitemap += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
    
    for filepath in html_files:
        url = normalize_path(filepath)
        full_url = f'{BASE_URL}/{url}'
        lastmod = get_file_mod_time(filepath)
        priority = get_priority(filepath)
        changefreq = get_changefreq(filepath)
        lang = get_language(url)
        page_id = get_page_id(url)
        alternates = page_groups[page_id]
        
        sitemap += '  <url>\n'
        sitemap += f'    <loc>{full_url}</loc>\n'
        sitemap += f'    <lastmod>{lastmod}</lastmod>\n'
        sitemap += f'    <changefreq>{changefreq}</changefreq>\n'
        sitemap += f'    <priority>{priority}</priority>\n'
        
        # Add hreflang alternates for multilingual SEO
        if len(alternates) > 1:
            for alt_lang, alt_url in sorted(alternates.items()):
                sitemap += f'    <xhtml:link rel="alternate" hreflang="{alt_lang}" href="{BASE_URL}/{alt_url}" />\n'
            # Add x-default for primary language (French)
            if 'fr' in alternates:
                sitemap += f'    <xhtml:link rel="alternate" hreflang="x-default" href="{BASE_URL}/{alternates["fr"]}" />\n'
        
        sitemap += '  </url>\n'
        
        hreflang_count = len(alternates) if len(alternates) > 1 else 0
        print(f'✅ {url} [{lang}] {f"({hreflang_count} alternates)" if hreflang_count else ""}')
    
    sitemap += '</urlset>\n'
    
    # Write sitemap
    with open('sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap)
    
    print(f'\n📝 Sitemap generated: sitemap.xml')
    print(f'📊 Total URLs: {len(html_files)}')
    print(f'🌐 With hreflang support for {len(page_groups)} page groups')
    print(f'\n🎯 SEO Features:')
    print('  ✓ hreflang tags for multilingual targeting')
    print('  ✓ x-default for primary language')
    print('  ✓ Priority based on page importance')
    print('  ✓ Change frequency indicators')
    print('  ✓ Last modification dates')

if __name__ == '__main__':
    try:
        generate_sitemap()
        print('\n✅ SEO-optimized sitemap generation complete!')
    except Exception as e:
        print(f'❌ Error: {e}')
        exit(1)

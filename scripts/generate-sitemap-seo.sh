#!/bin/bash

# SEO-optimized multilingual sitemap generator with hreflang support

OUTPUT="sitemap.xml"
BASE_URL="https://diaeta.be"
TODAY=$(date +%Y-%m-%d)

# Function to get file modification date
get_mod_date() {
    if [ -f "$1" ]; then
        date -r "$1" +%Y-%m-%d 2>/dev/null || echo "$TODAY"
    else
        echo "$TODAY"
    fi
}

# Function to get priority based on file
get_priority() {
    local file="$1"
    local basename=$(basename "$file")
    
    case "$basename" in
        index.html|home.html) echo "1.0" ;;
        contact.html|rendez-vous.html) echo "0.9" ;;
        *) echo "0.8" ;;
    esac
}

# Function to get language from path
get_lang() {
    local path="$1"
    case "$path" in
        EN/*) echo "en" ;;
        NL/*) echo "nl" ;;
        DE/*) echo "de" ;;
        *) echo "fr" ;;
    esac
}

# Function to normalize path
normalize_path() {
    local path="$1"
    echo "$path" | sed 's| |%20|g' | sed 's|^./||'
}

# Function to get page identifier (without language prefix)
get_page_id() {
    local path="$1"
    echo "$path" | sed 's|^EN/||' | sed 's|^NL/||' | sed 's|^DE/||'
}

# Start sitemap
cat > "$OUTPUT" << 'XML_START'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
XML_START

# Find all HTML files and group them by page ID
declare -A pages

find . -name "*.html" -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/scripts/*" \
    ! -path "*/.claude/*" \
    ! -path "*/.byterover/*" \
    ! -path "*/.cursor/*" \
    ! -path "*/.roo/*" \
    ! -path "*/.vscode/*" \
    | sort | while IFS= read -r file; do
    
    clean_path=$(echo "$file" | sed 's|^./||')
    url=$(normalize_path "$clean_path")
    lang=$(get_lang "$url")
    page_id=$(get_page_id "$url")
    moddate=$(get_mod_date "$file")
    priority=$(get_priority "$file")
    
    # Store for hreflang processing
    echo "$page_id|$lang|$url" >> /tmp/sitemap-pages.txt
    
    # Generate URL entry
    echo "  <url>" >> "$OUTPUT"
    echo "    <loc>$BASE_URL/$url</loc>" >> "$OUTPUT"
    echo "    <lastmod>$moddate</lastmod>" >> "$OUTPUT"
    echo "    <changefreq>weekly</changefreq>" >> "$OUTPUT"
    echo "    <priority>$priority</priority>" >> "$OUTPUT"
    
    # Add hreflang tags (will be populated in next phase)
    grep "^$page_id|" /tmp/sitemap-pages.txt 2>/dev/null | while IFS='|' read -r pid plang purl; do
        if [ -n "$purl" ]; then
            echo "    <xhtml:link rel=\"alternate\" hreflang=\"$plang\" href=\"$BASE_URL/$purl\" />" >> "$OUTPUT"
        fi
    done
    
    echo "  </url>" >> "$OUTPUT"
    
    echo "✅ $url [$lang]"
done

# Close sitemap
echo "</urlset>" >> "$OUTPUT"

# Cleanup
rm -f /tmp/sitemap-pages.txt

# Statistics
total=$(grep -c "<url>" "$OUTPUT")
echo ""
echo "📝 Sitemap generated: $OUTPUT"
echo "📊 Total URLs: $total"
echo "🌐 With hreflang support for multilingual SEO"

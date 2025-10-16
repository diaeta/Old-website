#!/bin/bash

# Fix French pages that incorrectly reference consultatie.html (Dutch) instead of Consultation.html (French)

files=(
  "index.html"
  "diabète.html"
  "nutrigenomics.html"
  "rendez-vous.html"
  "contact.html"
  "cookies.html"
  "conditions-generales.html"
  "mentions-legales.html"
  "politique-de-confidentialite.html"
  "diététique/diététicien-nutritionniste-diététique.html"
  "diététique/méthode-de-travail.html"
  "diététique/Consultation/Consultation.html"
)

# Add all French location pages
for file in diététicien-diététicienne-nutritionniste-*/*.html; do
  if [ -f "$file" ]; then
    files+=("$file")
  fi
done

# Add French service pages
for file in diététicien-diététicienne-nutritionniste/*/*.html; do
  if [ -f "$file" ]; then
    files+=("$file")
  fi
done

count=0
for file in "${files[@]}"; do
  if [ -f "$file" ] && grep -q "consultatie.html" "$file"; then
    sed -i 's|consultatie\.html|Consultation.html|g' "$file"
    echo "✓ Fixed: $file"
    ((count++))
  fi
done

echo ""
echo "Fixed $count files"

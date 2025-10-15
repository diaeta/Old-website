#!/bin/bash

files=(
  "contact.html"
  "DE/contact.html"
  "DE/Diabetes.html"
  "DE/Ernährungsberater-Diätassistent-Ernährungswissenschaftler/Termin.html"
  "conditions-generales.html"
  "cookies.html"
  "diabète.html"
  "index.html"
  "mentions-legales.html"
  "nutrigenomics.html"
  "politique-cookies.html"
  "politique-de-confidentialite.html"
  "privacy.html"
  "rendez-vous.html"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    perl -i -0pe 's/(<link\s+href="[^"]+"\s+rel="canonical")(\s+<link\s+rel="alternate"[^\n]+\n\s+<link\s+rel="alternate"[^\n]+\n)\/>/$1\/>\n$2/g' "$file"
  fi
done

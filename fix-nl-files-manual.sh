#!/bin/bash

# NL/legal.html
cat > "NL/legal.html" << 'EOF'
<html lang="nl"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Juridische Kennisgeving - Diaeta</title>
  <meta name="description" content="Juridische kennisgeving van Diaeta. Informatie over de uitgever en hostingvoorwaarden van de website van diëtist-voedingsdeskundige Pierre Abou-Zeid.">
  <meta http-equiv="refresh" content="0; url=juridische-kennisgeving.html">
  <link rel="canonical" href="https://diaeta.be/NL/legal.html">
    <link rel="alternate" hreflang="nl" href="https://diaeta.be/NL/juridische-kennisgeving.html">
    <link rel="alternate" hreflang="x-default" href="https://diaeta.be/NL/juridische-kennisgeving.html">
</head><body>

    <h1>Juridische Kennisgeving</h1>
    <p>U wordt doorgestuurd naar de juridische kennisgeving pagina...</p>



</body></html>
EOF

# NL/terms.html
cat > "NL/terms.html" << 'EOF'
<html lang="nl"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Algemene Voorwaarden - Diaeta</title>
  <meta name="description" content="Algemene voorwaarden voor gebruik van de diëtistenconsultaties van Diaeta. Raadpleeg onze voorwaarden voor afspraken en consulten.">
  <meta http-equiv="refresh" content="0; url=algemene-voorwaarden.html">
  <link rel="canonical" href="https://diaeta.be/NL/terms.html">
    <link rel="alternate" hreflang="nl" href="https://diaeta.be/NL/algemene-voorwaarden.html">
    <link rel="alternate" hreflang="x-default" href="https://diaeta.be/NL/algemene-voorwaarden.html">
</head><body>

    <h1>Algemene Voorwaarden</h1>
    <p>U wordt doorgestuurd naar de algemene voorwaarden pagina...</p>



</body></html>
EOF

echo "✓ Fixed NL/legal.html and NL/terms.html"

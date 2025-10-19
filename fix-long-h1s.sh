#!/bin/bash

# diabète.html
sed -i '268s#<h1 class="text-uppercase"><span class="big">Le diabète est une maladie&nbsp;caractérisée par un taux élevé de sucre dans le sang.</span></h1>#<h1 class="text-uppercase"><span class="big">Diabète: Maladie avec taux élevé de sucre dans le sang</span></h1>#' "diabète.html"

# EN/home.html  
sed -i '895s#<h1>Weight loss | Diabetes | Cholesterol | Irritable Bowel Syndrome (IBS) | Food intolerances</h1>#<h1>Weight loss | Diabetes | Cholesterol | IBS | Intolerances</h1>#' "EN/home.html"

# NL/home.html
sed -i '901s#<h1>Gewichtsverlies | Diabetes | Cholesterol | Prikkelbare Darmsyndroom (PDS) | Voedselintoleranties</h1>#<h1>Gewichtsverlies | Diabetes | Cholesterol | PDS | Intoleranties</h1>#' "NL/home.html"

# diététicien-diététicienne-nutritionniste-Berchem-Sainte-Agathe/diaeta-berchem-sainte-agathe.html
find . -name "diaeta-berchem-sainte-agathe.html" -exec sed -i 's#<h1>Berchem-Sainte-Agathe, Diététicien | Diététicienne | Nutritionniste</h1>#<h1>Berchem-Sainte-Agathe - Diététicien Nutritionniste</h1>#g' {} \;

# EN/nutrigenomics nutrigenetics/genetic test.html
sed -i 's#<h1>Nutrition is an essential factor in the interactions between environment and genes.</h1>#<h1>Nutrition: Interactions between environment and genes</h1>#g' "EN/nutrigenomics nutrigenetics/genetic test.html"

# nutrigenomics.html
sed -i 's#<h1>La nutrition est un facteur essentiel dans les interactions entre environnement et gènes.</h1>#<h1>Nutrition: Interactions entre environnement et gènes</h1>#g' "nutrigenomics.html"

echo "All H1s fixed"

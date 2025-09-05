function calculeIMC() {
    let imc = null,
        bmr = null,
        energy = null,
        poids = parseInt(document.getElementById('poids').value),
        taille = parseInt(document.getElementById('taille').value),
        age = parseInt(document.getElementById('age').value),
        activite_physique = parseInt(document.getElementById('inputGroupSelect01').value),
        sexe = parseInt(document.getElementById('inputGroupSelect02').value),
        results = document.getElementById('imcresults');


    if (sexe == 1) {
        bmr = (10 * poids) + (6.25 * taille) - (5 * age) + 5
    } else {
        bmr = (10 * poids) + (6.25 * taille) - (5 * age) - 161
    };

    if (activite_physique == 1) {
        energy = Math.round(bmr * 1.53)
    } else if (activite_physique == 2) {
        energy = Math.round(bmr * 1.76)
    } else {
        energy = Math.round(bmr * 2.25)
    };

    taille = taille / 100;
    imc = poids / (taille * taille);
    imc = Math.round(imc * 100) / 100;

    if (imc < 18.5) {
        results.innerHTML = "<p><span data-novi-id='4'> Votre besoin journalier en énergie est de: " + energy + " Kcal.<br/>Votre Indice de Masse Corporelle (IMC) est de: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Un IMC inférieur à 18,5 Kg/m<sup>2</sup>, reflète, souvent, une dénutrition ou un risque de dénutrition. Une visite chez un(e) diététicien(ne) est fortement conseillée.</span></p>";
    } else if (imc < 25) {
        results.innerHTML = "<p><span data-novi-id='4'> Votre besoin journalier en énergie est de: " + energy + " Kcal.<br/>Votre Indice de Masse Corporelle (IMC) est de: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Un IMC entre 18,5 et 25 Kg/m<sup>2</sup> est considéré comme sain</span></p>";
    } else
    if (imc < 30) {
        results.innerHTML = "<p><span data-novi-id='4'> Votre besoin journalier en énergie est de: " + energy + " Kcal.<br/>Votre Indice de Masse Corporelle (IMC) est de: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Un IMC entre 25 et 30 Kg/m<sup>2</sup>, reflète un surpoids. Le surpoids s'accompagne avec un risque de développement de maladie cardiovasculaire, diabète de type 2 et autres. Une visite chez un(e) diététicien(ne) est fortement conseillée.</span></p>";
    } else if (imc < 35) {
        results.innerHTML = "<p><span data-novi-id='4'> Votre besoin journalier en énergie est de: " + energy + " Kcal.<br/>Votre Indice de Masse Corporelle (IMC) est de: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Un IMC entre 30 et 35 Kg/m<sup>2</sup> reflète, une obésité de classe 1 et s'accompagne d'un risque plus élevé de développement de maladie cardiovasculaire, diabète de type 2 et autres. Une visite chez un(e) diététicien(ne) est fortement conseillée.</span></p>";
    } else if (imc < 40) {
        results.innerHTML = "<p><span data-novi-id='4'> Votre besoin journalier en énergie est de: " + energy + " Kcal.<br/>Votre Indice de Masse Corporelle (IMC) est de: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Un IMC entre 35 et 40 Kg/m<sup>2</sup> reflète, une obésité de classe 2 et s'accompagne d'un risque très élevé de développement de maladie cardiovasculaire, diabète de type 2 et autres. Une visite chez un(e) diététicien(ne) est fortement conseillée.</span></p>";
    } else {
        results.innerHTML = "<p><span data-novi-id='4'> Votre besoin journalier en énergie est de: " + energy + " Kcal.<br/>Votre Indice de Masse Corporelle (IMC) est de: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Un IMC supérieur à 40 Kg/m<sup>2</sup> reflète, une obésité morbide et s'accompagne d'un risque extrèmement élevé de développement de maladie cardiovasculaire, diabète de type 2 et autres. Une visite chez un(e) diététicien(ne) est fortement conseillée.</span></p>";
    }
    return false;
}

function calculeIMCNl() {
    let imc = null,
        bmr = null,
        energy = null,
        poids = parseInt(document.getElementById('poids').value),
        taille = parseInt(document.getElementById('taille').value),
        age = parseInt(document.getElementById('age').value),
        activite_physique = parseInt(document.getElementById('inputGroupSelect01').value),
        sexe = parseInt(document.getElementById('inputGroupSelect02').value),
        results = document.getElementById('imcresults');


    if (sexe == 1) {
        bmr = (10 * poids) + (6.25 * taille) - (5 * age) + 5
    } else {
        bmr = (10 * poids) + (6.25 * taille) - (5 * age) - 161
    };

    if (activite_physique == 1) {
        energy = Math.round(bmr * 1.53)
    } else if (activite_physique == 2) {
        energy = Math.round(bmr * 1.76)
    } else {
        energy = Math.round(bmr * 2.25)
    };

    taille = taille / 100;
    imc = poids / (taille * taille);
    imc = Math.round(imc * 100) / 100;

    if (imc < 18.5) {
        results.innerHTML = "<p><span data-novi-id='4'> Uw dagelijkse energiebehoefte is: " + energy + " Kcal.<br/>Uw Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Een BMI lager dan 18,5 Kg/m<sup>2</sup>, duidt vaak op ondervoeding of een risico op ondervoeding. Een bezoek bij een diëtist wordt sterk aanbevolen.</span></p>";
    } else if (imc < 25) {
        results.innerHTML = "<p><span data-novi-id='4'> Uw dagelijkse energiebehoefte is: " + energy + " Kcal.<br/>Uw Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Een BMI tussen 18,5 en 25 Kg/m<sup>2</sup> wordt als gezond beschouwd.</span></p>";
    } else
    if (imc < 30) {
        results.innerHTML = "<p><span data-novi-id='4'> Uw dagelijkse energiebehoefte is: " + energy + " Kcal.<br/>Uw Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Een BMI tussen 25 en 30 Kg/m<sup>2</sup>, weerspiegelt overgewicht. Overgewicht gaat gepaard met een risico op het ontwikkelen van hart- en vaatziekten, diabetes type 2 en andere ziekten. Een bezoek bij een diëtist wordt sterk aanbevolen.</span></p>";
    } else if (imc < 35) {
        results.innerHTML = "<p><span data-novi-id='4'> Uw dagelijkse energiebehoefte is: " + energy + " Kcal.<br/>Uw Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Een BMI tussen 30 en 35 Kg/m<sup>2</sup> weerspiegelt obesitas klasse 1 en wordt geassocieerd met een hoge risico op het ontwikkelen van hart- en vaatziekten, diabetes type 2 en andere ziekten. Een bezoek bij een diëtist wordt sterk aanbevolen.</span></p>";
    } else if (imc < 40) {
        results.innerHTML = "<p><span data-novi-id='4'> Uw dagelijkse energiebehoefte is: " + energy + " Kcal.<br/>Uw Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Een BMI tussen 35 en 40 Kg/m<sup>2</sup> weerspiegelt obesitas klasse 2 en wordt geassocieerd met een zeer hoge risico op het ontwikkelen van hart- en vaatziekten, diabetes type 2 en andere ziekten. Een bezoek bij een diëtist wordt sterk aanbevolen.</span></p>";
    } else {
        results.innerHTML = "<p><span data-novi-id='4'> Uw dagelijkse energiebehoefte is: " + energy + " Kcal.<br/>Uw Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Een BMI hoger dan 40 Kg/m<sup>2</sup> weerspiegelt morbide obesitas en wordt geassocieerd met een extreem hoog risico op het ontwikkelen van hart- en vaatziekten, diabetes type 2 en andere ziekten. Een bezoek bij een diëtist wordt sterk aanbevolen.</span></p>";
    }
    return false;
}


function calculeIMCEn() {
    let imc = null,
        bmr = null,
        energy = null,
        poids = parseInt(document.getElementById('poids').value),
        taille = parseInt(document.getElementById('taille').value),
        age = parseInt(document.getElementById('age').value),
        activite_physique = parseInt(document.getElementById('inputGroupSelect01').value),
        sexe = parseInt(document.getElementById('inputGroupSelect02').value),
        results = document.getElementById('imcresults');


    if (sexe == 1) {
        bmr = (10 * poids) + (6.25 * taille) - (5 * age) + 5
    } else {
        bmr = (10 * poids) + (6.25 * taille) - (5 * age) - 161
    };

    if (activite_physique == 1) {
        energy = Math.round(bmr * 1.53)
    } else if (activite_physique == 2) {
        energy = Math.round(bmr * 1.76)
    } else {
        energy = Math.round(bmr * 2.25)
    };

    taille = taille / 100;
    imc = poids / (taille * taille);
    imc = Math.round(imc * 100) / 100;

    if (imc < 18.5) {
        results.innerHTML = "<p><span data-novi-id='4'> Your daily energy requirement is: " + energy + " Kcal.<br/>Your Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. A BMI lower than 18,5 Kg/m<sup>2</sup>, often suggests undernutrition or a risk of undernutrition. A visit to a dietitian is strongly recommended.</span></p>";
    } else if (imc < 25) {
        results.innerHTML = "<p><span data-novi-id='4'> Your daily energy requirement is: " + energy + " Kcal.<br/>Your Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. A BMI between 18,5 and 25 Kg/m<sup>2</sup> is considered as healthy</span></p>";
    } else
    if (imc < 30) {
        results.innerHTML = "<p><span data-novi-id='4'> Your daily energy requirement is: " + energy + " Kcal.<br/>Your Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. A BMI between 25 et 30 Kg/m<sup>2</sup>, suggests overweight and comes with a risk of developing cardiovascular diseases, type 2 diabetes and other diseases. A visit to a dietitian is strongly recommended.</span></p>";
    } else if (imc < 35) {
        results.innerHTML = "<p><span data-novi-id='4'> Your daily energy requirement is: " + energy + " Kcal.<br/>Your Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. A BMI between 30 et 35 Kg/m<sup>2</sup>, suggests obesity class 1 and comes with a high risk of developing cardiovascular diseases, type 2 diabetes and other diseases. A visit to a dietitian is strongly recommended.</span></p>";
    } else if (imc < 40) {
        results.innerHTML = "<p><span data-novi-id='4'> Your daily energy requirement is: " + energy + " Kcal.<br/>Your Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. A BMI between 35 et 40 Kg/m<sup>2</sup>, suggests obesity class 2 and comes with a very high risk of developing cardiovascular diseases, type 2 diabetes and other diseases. A visit to a dietitian is strongly recommended.</span></p>";
    } else {
        results.innerHTML = "<p><span data-novi-id='4'> Your daily energy requirement is: " + energy + " Kcal.<br/>Your Body Mass Index (BMI) is: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. A BMI higher than 40 Kg/m<sup>2</sup>, suggests morbid obesity and comes with an extremely high risk of developing cardiovascular diseases, type 2 diabetes and other diseases. A visit to a dietitian is strongly recommended.</span></p>";
    }
    return false;
}


function calculeIMCDe() {
    let imc = null,
        bmr = null,
        energy = null,
        poids = parseInt(document.getElementById('poids').value),
        taille = parseInt(document.getElementById('taille').value),
        age = parseInt(document.getElementById('age').value),
        activite_physique = parseInt(document.getElementById('inputGroupSelect01').value),
        sexe = parseInt(document.getElementById('inputGroupSelect02').value),
        results = document.getElementById('imcresults');


    if (sexe == 1) {
        bmr = (10 * poids) + (6.25 * taille) - (5 * age) + 5
    } else {
        bmr = (10 * poids) + (6.25 * taille) - (5 * age) - 161
    };

    if (activite_physique == 1) {
        energy = Math.round(bmr * 1.53)
    } else if (activite_physique == 2) {
        energy = Math.round(bmr * 1.76)
    } else {
        energy = Math.round(bmr * 2.25)
    };

    taille = taille / 100;
    imc = poids / (taille * taille);
    imc = Math.round(imc * 100) / 100;

    if (imc < 18.5) {
        results.innerHTML = "<p><span data-novi-id='4'> Ihr täglicher Energiebedarf ist: " + energy + " Kcal.<br/>Ihr Body Mass Index (BMI) ist: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Ein BMI niedriger als 18,5 Kg/m<sup>2</sup>, weist häufig auf Unterernährung oder ein Risiko für Unterernährung hin. Ein Besuch bei einem Ernährungsberater wird dringend empfohlen.</span></p>";
    } else if (imc < 25) {
        results.innerHTML = "<p><span data-novi-id='4'> Ihr täglicher Energiebedarf ist: " + energy + " Kcal.<br/>Ihr Body Mass Index (BMI) ist: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Ein BMI zwischen 18,5 und 25 Kg/m<sup>2</sup> gilt als gesund.</span></p>";
    } else
    if (imc < 30) {
        results.innerHTML = "<p><span data-novi-id='4'> Ihr täglicher Energiebedarf ist: " + energy + " Kcal.<br/>Ihr Body Mass Index (BMI) ist: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Ein BMI zwischen 25 und 30 Kg/m<sup>2</sup>, deutet auf Übergewicht hin und birgt das Risiko, Herz-Kreislauf-Erkrankungen, Typ-2-Diabetes und andere Krankheiten zu entwickeln. Ein Besuch bei einem Ernährungsberater wird dringend empfohlen.</span></p>";
    } else if (imc < 35) {
        results.innerHTML = "<p><span data-novi-id='4'> Ihr täglicher Energiebedarf ist: " + energy + " Kcal.<br/>Ihr Body Mass Index (BMI) ist: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Ein BMI zwischen 30 und 35 Kg/m<sup>2</sup> deutet auf Obesitas der Klasse 1 hin und birgt ein hohes Risiko für Herz-Kreislauf-Erkrankungen, Typ-2-Diabetes und andere Krankheiten. Ein Besuch bei einem Ernährungsberater wird dringend empfohlen.</span></p>";
    } else if (imc < 40) {
        results.innerHTML = "<p><span data-novi-id='4'> Ihr täglicher Energiebedarf ist: " + energy + " Kcal.<br/>Ihr Body Mass Index (BMI) ist: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Ein BMI zwischen 35 und 40 Kg/m<sup>2</sup> deutet auf Obesitas der Klasse 2 hin und birgt ein sehr hohes Risiko für die Entwicklung von Herz-Kreislauf-Erkrankungen, Typ-2-Diabetes und anderen Krankheiten. Ein Besuch bei einem Ernährungsberater wird dringend empfohlen.</span></p>";
    } else {
        results.innerHTML = "<p><span data-novi-id='4'> Ihr täglicher Energiebedarf ist: " + energy + " Kcal.<br/>Ihr Body Mass Index (BMI) ist: " + imc.toLocaleString() + " Kg/m<sup>2</sup>. Ein BMI höher als 40 Kg/m<sup>2</sup> deutet auf krankhafte Fettleibigkeit hin und birgt ein extrem hohes Risiko für Herz-Kreislauf-Erkrankungen, Typ-2-Diabetes und andere Krankheiten. Ein Besuch bei einem Ernährungsberater wird dringend empfohlen.</span></p>";
    }
    return false;
}

function calculeIMCAr() {
    let imc = null,
        bmr = null,
        energy = null,
        poids = parseInt(document.getElementById('poids').value),
        taille = parseInt(document.getElementById('taille').value),
        age = parseInt(document.getElementById('age').value),
        activite_physique = parseInt(document.getElementById('inputGroupSelect01').value),
        sexe = parseInt(document.getElementById('inputGroupSelect02').value),
        results = document.getElementById('imcresults');


    if (sexe == 1) {
        bmr = (10 * poids) + (6.25 * taille) - (5 * age) + 5
    } else {
        bmr = (10 * poids) + (6.25 * taille) - (5 * age) - 161
    };

    if (activite_physique == 1) {
        energy = Math.round(bmr * 1.53)
    } else if (activite_physique == 2) {
        energy = Math.round(bmr * 1.76)
    } else {
        energy = Math.round(bmr * 2.25)
    };

    taille = taille / 100;
    imc = poids / (taille * taille);
    imc = Math.round(imc * 100) / 100;

    if (imc < 18.5) {
        results.innerHTML = "<p style='text-align:right'><span data-novi-id='4'> متطلباتك اليومية من الطاقة هي : " + energy + " سعرة حرارية.<br/>مؤشر كتلة الجسم (BMI) هو : " + imc.toLocaleString() + " كلغ/م<sup>٢</sup>. يشير مؤشر كتلة الجسم الذي يقل عن ١٨,٥ كلغ/م<sup>٢</sup> غالبًا إلى نقص التغذية أو خطر الإصابة بنقص التغذية. ينصح بشدة بزيارة اختصاصي تغذية.</span></p>";
    } else if (imc < 25) {
        results.innerHTML = "<p style='text-align:right'><span data-novi-id='4'> متطلباتك اليومية من الطاقة هي : " + energy + " سعرة حرارية.<br/>مؤشر كتلة الجسم (BMI) هو : " + imc.toLocaleString() + " كلغ/م<sup>٢</sup>. يعتبر مؤشر كتلة الجسم بين ١٨,٥ و ٢٥ كلغ/م <sup>٢</sup> صحيًا.</span></p>";
    } else
    if (imc < 30) {
        results.innerHTML = "<p style='text-align:right'><span data-novi-id='4'> متطلباتك اليومية من الطاقة هي : " + energy + " سعرة حرارية.<br/>مؤشر كتلة الجسم (BMI) هو : " + imc.toLocaleString() + " كلغ/م<sup>٢</sup>. يشير مؤشر كتلة الجسم الذي يتراوح بين ٢٥ و ٣٠  كلغ/م <sup>٢</sup> إلى زيادة الوزن وخطر الإصابة بأمراض القلب والأوعية الدموية والسكري من النوع ٢ وأمراض أخرى. ينصح بشدة بزيارة اختصاصي تغذية.</span></p>";
    } else if (imc < 35) {
        results.innerHTML = "<p style='text-align:right'<span data-novi-id='4'> متطلباتك اليومية من الطاقة هي : " + energy + " سعرة حرارية.<br/>مؤشر كتلة الجسم (BMI) هو : " + imc.toLocaleString() + " كلغ/م<sup>٢</sup>. يشير مؤشر كتلة الجسم بين ٣٠ و ٣٥  كلغ/م <sup>٢</sup> إلى أن السمنة فئة ١ وتأتي مع مخاطر عالية للإصابة بأمراض القلب والأوعية الدموية والسكري من النوع ٢ وأمراض أخرى. ينصح بشدة بزيارة اختصاصي تغذية.</span></p>";
    } else if (imc < 40) {
        results.innerHTML = "<p style='text-align:right'><span data-novi-id='4'> متطلباتك اليومية من الطاقة هي : " + energy + " سعرة حرارية.<br/>مؤشر كتلة الجسم (BMI) هو : " + imc.toLocaleString() + " كلغ/م<sup>٢</sup>. يشير مؤشر كتلة الجسم بين ٣٥ و ٤٠  كلغ/م <sup>٢</sup>  إلى أن السمنة فئة ٢ وتأتي مع مخاطر عالية جدًا للإصابة بأمراض القلب والأوعية الدموية والسكري من النوع ٢ وأمراض أخرى. ينصح بشدة بزيارة اختصاصي تغذي</span></p>";
    } else {
        results.innerHTML = "<p style='text-align:right'><span data-novi-id='4'> متطلباتك اليومية من الطاقة هي : " + energy + " سعرة حرارية.<br/>مؤشر كتلة الجسم (BMI) هو : " + imc.toLocaleString() + " كلغ/م<sup>٢</sup>. يشير مؤشر كتلة الجسم الذي يزيد عن ٤٠  كلغ/م <sup>٢</sup> إلى السمنة المرضية ويأتي مع مخاطر عالية للغاية للإصابة بأمراض القلب والأوعية الدموية والسكري من النوع ٢ وأمراض أخرى. ينصح بشدة بزيارة اختصاصي تغذية.</span></p>";
    }
    return false;
}
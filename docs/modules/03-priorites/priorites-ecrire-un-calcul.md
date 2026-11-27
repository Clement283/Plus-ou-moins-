# Cours 6 — Écrire un calcul d'un seul coup
Module : Priorités (`docs/modules/03-priorites/module.md`) · Précédent : cours 5 « La nature d'un calcul » · Sources : cycle 4 p. 7 (« Traduire […] en une seule expression ») et p. 9 ; Fonteniaud (partie V), Monka (partie 3 b), documents de 5e.

## Points importants
- À retenir : (1) une phrase se traduit mot à mot, dans l'ordre ; (2) « la somme de 2 et 7 », « la différence », « le produit », « le quotient » sont des blocs : on les met entre parenthèses quand on les retranche, qu'on les multiplie ou qu'on les divise ; (3) un petit problème en mots : j'écris le calcul d'un seul coup, puis je le calcule ligne par ligne.
- Pièges : 30 − 2 + 7 pour « 30 moins la somme de 2 et 7 » (il faut 30 − (2 + 7)) ; 30 − 2 − 7 est un calcul juste en valeur mais n'est pas la phrase ; 2 + 3 × 4 pour « le produit de la somme de 2 et 3 par 4 ».
- Vu dans ce cours : « la somme / la différence / le produit / le quotient de … et … », « de … par … », écrire un calcul entier, vérifier par le calcul ligne par ligne.
- Écarts et choix : problèmes en mots courts (une ou deux phrases, entiers, décidé le 2026-11-27) ; calcul jugé sur sa **structure** (30 − 2 − 7 et 30 − (2 + 7) ont la même valeur mais pas la même structure : message gris, l'élève recommence) ; pas de lettres ; on ne calcule après avoir écrit que pour les **problèmes** ; programmes de calcul pas à pas (« Pars du nombre 4 et ajoute-lui 3. », jamais « Choisis 4 ») ; la comparaison porte sur 30 − (2 + 7) contre 30 − 2 + 7 (la vraie confusion), l'exemple guidé sur « le produit de la somme de 3 et de 4 par 2 » (phrase, sans calcul ensuite). Décidé le 2026-11-27 après relecture : des **nombres négatifs** dans les phrases aux niveaux 2 et 3 (révisions, entraînement ; jamais un diviseur) ; **problèmes plus compliqués** aux niveaux 2 (cinéma, partage après une dépense, feutres en trousses) et 3 (avec négatifs : température, compte en banque).
- Dans l'appli : 8 écrans avant l'annonce de la fin (exemple guidé compris) ; `essais/priorites-ecrire-un-calcul.ts` ; exercices de fin = question `ecrire` (rangs 0 à 4 : phrase, programme, phrase, problème, programme) ; les phrases viennent d'un arbre de calcul (phrase et écritures justes déduites, somme et produit dans les deux ordres) ; erreurs `parentheses-oubliees` (règle 2) et `ordre` (règle 1) ; pas encore relu ni essayé dans l'appli.

## Fiche
### Règles
1. Je traduis la phrase mot à mot, dans l'ordre : « 30 moins 2 » donne 30 − 2.
2. « La somme de a et b » est un seul bloc : si on le retranche, le multiplie ou le divise, il va entre parenthèses (évite 30 − 2 + 7).
3. Un problème en mots : je repère les nombres et les mots-opérations, j'écris le calcul d'un seul coup, puis je le calcule ligne par ligne.
### Idée de départ
Écrire un calcul est le geste inverse de le calculer : on part d'une phrase, on arrive à des symboles, et la structure (les parenthèses) porte le sens.
### Erreurs attendues → règle
| id | réponse fausse typique | règle | message |
|---|---|---|---|
| parenthese-oubliee | 30 − 2 + 7 pour « 30 moins la somme de 2 et 7 » | 2 | La somme de 2 et 7 est un bloc : 30 − (2 + 7). |
| structure-differente | 30 − 2 − 7 (même valeur) | 2 | La valeur est juste, mais l'énoncé parle de la somme de 2 et 7 : écris-la en bloc. |
| ordre-phrase | 7 − 30 pour « 30 moins 7 » | 1 | Dans « a moins b », a vient d'abord. |
### Techniques
- Principale : souligner les mots-opérations, écrire de gauche à droite, mettre en parenthèses chaque bloc « la somme / la différence de … ».
- Autres : problème en mots (un énoncé de 1 ou 2 phrases) : écrire, puis calculer.
### Reprises et comparaison
- Reprise : nature d'un calcul (cours 5) ; parenthèses (cours 3).
- À comparer : « 30 moins la somme de 2 et 7 » contre « 30 moins 2, plus 7 ».
- Exemple guidé : « le produit de la somme de 3 et 4 par 2 » (écrire (3 + 4) × 2, puis calculer).
### Niveaux
1 : une phrase, deux nombres et un bloc · 2 : deux blocs, problème en mots · 3 : trois opérations, quotients, relatifs · calcul-piège : « moins la somme de ».
### Hors catalogue
Question `ecrire` (mode calcul), codée et validée (maquette `docs/design/ecrans/priorites-ecrire-un-calcul.html`, 2026-11-27) : ligne du catalogue des écrans.

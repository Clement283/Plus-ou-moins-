# Cours 4 — Parenthèses dans des parenthèses
Module : Priorités (`docs/modules/03-priorites/module.md`) · Précédent : cours 3 « Les parenthèses d'abord » · Sources : Fonteniaud (règle n° 6 et « II »), Monka (règle sur les parenthèses imbriquées et les crochets), documents de 5e.

## Points importants
- À retenir : (1) quand des parenthèses sont dans d'autres, on commence par les plus intérieures ; (2) les crochets [ ] jouent le même rôle que les parenthèses, ils servent à mieux lire ; (3) dans un crochet aussi, on applique les priorités (× et ÷ avant + et −).
- Pièges : 2 × [10 − (4 + 2)] = 16 (on a fait 10 − 4 avant la parenthèse intérieure) ; = 14 (le crochet ignoré) ; priorité oubliée dans un crochet.
- Vu dans ce cours : « parenthèses les plus intérieures », crochets, aller de l'intérieur vers l'extérieur, une seule opération par ligne.
- Écarts et choix : deux niveaux d'imbrication au plus (une parenthèse dans un crochet) ; le clavier de l'écran gagne les touches [ ] ; comparer 10 − (4 + 2) et 10 − 4 + 2 (la parenthèse intérieure change le résultat).
- Dans l'appli : 8 écrans avant l'annonce de la fin (exemple guidé compris) ; `essais/priorites-parentheses-imbriquees.ts` ; calcul par lignes avec crochets.

## Fiche
### Règles
1. Des parenthèses dans d'autres : je commence par les plus intérieures (évite 3 × [10 − (4 + 2)] = 24).
2. Les crochets sont des parenthèses plus grandes : je les calcule quand il n'y a plus rien dedans qu'un calcul simple (évite 2 × [10 − (4 + 2)] = 16).
3. Dans un crochet, j'applique les priorités habituelles (évite [2 + 3 × (8 − 5)] − 1 = 14).
### Idée de départ
Des poupées russes : on ouvre la plus petite en premier, et on remonte jusqu'à la plus grande.
### Erreurs attendues → règle
| id | réponse fausse typique | règle | message |
|---|---|---|---|
| ordre-parentheses | 2 × [10 − (4 + 2)] = 16 | 1 | On part de la parenthèse la plus intérieure : 4 + 2 d'abord. |
| parenthese | 2 × [10 − (4 + 2)] = 14 | 2 | Ne pas ignorer les parenthèses : elles passent en premier. |
| priorite | [2 + 3 × (8 − 5)] − 1 = 14 | 3 | Dans le crochet, le × passe avant le +. |
### Techniques
- Principale : repérer la parenthèse la plus intérieure, la calculer, recopier, recommencer.
- Autres : aucune.
### Reprises et comparaison
- Reprise : parenthèses d'abord et priorités (cours précédents).
- À comparer : 10 − (4 + 2) contre 10 − 4 + 2 (4 contre 8).
- Exemple guidé : 4 × [2 + (9 − 5) × 3] (priorité dans le crochet).
### Niveaux
1 : une parenthèse dans un crochet, nombres de 2 à 12, résultats positifs · 2 : en plus un nombre ou un produit autour, résultats négatifs possibles · 3 : relatifs, ÷, produit dans le crochet · calcul-piège : un nombre juste avant la parenthèse intérieure (10 − (…)).
### Hors catalogue
Rien (touches [ ] au clavier du calcul par lignes).

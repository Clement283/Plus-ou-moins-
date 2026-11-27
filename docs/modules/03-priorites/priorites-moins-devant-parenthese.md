# Cours 7 — Un moins devant une parenthèse
Module : Priorités (`docs/modules/03-priorites/module.md`) · Précédent : cours 6 « Écrire un calcul d'un seul coup » (fiche seule, écran en attente) · Sources : 2nde 2026 p. 5 (« − (a + b) = −a − b, − (a − b) = b − a ») ; ancien plan `docs/validation/10-calculs/B-priorites.md`, cours 11.

## Points importants
- À retenir : (1) un + devant une parenthèse ne change rien : 8 + (3 − 2) = 8 + 3 − 2 ; (2) un − devant une parenthèse change le signe de chaque terme : 8 − (3 + 2) = 8 − 3 − 2 et 8 − (3 − 2) = 8 − 3 + 2 ; (3) on peut calculer la parenthèse d'abord ou l'enlever avec les signes changés : même résultat.
- Pièges : 8 − (3 − 2) = 8 − 3 − 2 = 3 (signe d'un terme non changé) ; 8 + (3 − 2) lu avec un signe changé.
- Vu dans ce cours : « changer le signe de chaque terme », enlever une parenthèse, −(a + b) = −a − b, −(a − b) = −a + b. **Partie lettres** (−(x − 3) = −x + 3, −(2x − 5) = −2x + 5, un seul x, sans réduire) : prévue en fin de cours, à brancher (écran fait par la session principale, à insérer avant l'exemple guidé).
- Écarts et choix : absent des documents de 5e, au programme de 2nde ; les exercices de fin (partie nombres) sont des calculs par lignes ; la méthode « calculer la parenthèse d'abord » est toujours acceptée ; entiers seulement.
- Dans l'appli : 8 écrans avant l'annonce de la fin (exemple guidé compris) pour la partie nombres ; `essais/priorites-moins-devant-parenthese.ts` ; **partie lettres non codée** (manque signalé).

## Fiche
### Règles
1. Un + devant une parenthèse : j'enlève la parenthèse, rien ne change (évite de changer des signes pour rien).
2. Un − devant une parenthèse : j'enlève la parenthèse et je change le signe de chaque terme (évite 8 − (3 − 2) = 8 − 3 − 2).
3. Je peux aussi calculer la parenthèse d'abord : les deux chemins donnent le même résultat.
### Idée de départ
Soustraire un paquet, c'est retirer tout ce qu'il contient : ses « plus » sont retirés, ses « moins » sont rendus.
### Erreurs attendues → règle
| id | réponse fausse typique | règle | message |
|---|---|---|---|
| parenthese | 8 − (3 − 2) = 3 | 2 | Le − change le signe de chaque terme : − 3 et + 2. |
| signe | 8 + (3 − 2) = 13 | 1 | Un + devant la parenthèse ne change aucun signe. |
### Techniques
- Principale : enlever la parenthèse en changeant les signes si elle est précédée d'un −.
- Autres : calculer la parenthèse d'abord (cours 3).
### Reprises et comparaison
- Reprise : parenthèses (cours 3) ; soustraire c'est ajouter l'opposé (module Relatifs).
- À comparer : 8 − (3 + 2) contre 8 − (3 − 2) (3 contre 7).
- Exemple guidé : 15 − (4 − 9) (résultat de la parenthèse négatif).
### Niveaux
1 : une parenthèse précédée d'un + ou d'un −, résultats positifs · 2 : deux termes autour, résultats négatifs possibles · 3 : relatifs dans la parenthèse, deux parenthèses · calcul-piège : − devant une parenthèse qui contient un −.
### Hors catalogue
Partie nombres : rien. **Partie lettres** : demande un écran qui juge la réécriture −(x − 3) = −x + 3 (voir `exercises/rewrite.ts`, `Reecrire.tsx`) : traité par la session principale.

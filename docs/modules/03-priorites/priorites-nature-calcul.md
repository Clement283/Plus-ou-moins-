# Cours 5 — La nature d'un calcul
Module : Priorités (`docs/modules/03-priorites/module.md`) · Précédent : cours 4 « Parenthèses dans des parenthèses » · Sources : cycle 4 p. 7 et p. 9 ; Fonteniaud (partie IV), Monka (partie 3), documents de 5e.

## Points importants
- À retenir : (1) la dernière opération faite donne la nature du calcul : somme (+), différence (−), produit (×), quotient (÷) ; (2) les nombres d'une somme ou d'une différence sont des termes, ceux d'un produit des facteurs ; (3) des parenthèses changent la dernière opération : 3 + 4 × 2 est une somme, (3 + 4) × 2 est un produit.
- Pièges : appeler 3 + 4 × 2 un produit (à cause du ×) ; appeler (3 + 4) × 2 une somme (à cause du +) ; prendre la première opération au lieu de la dernière.
- Vu dans ce cours : somme, différence, produit, quotient, terme, facteur, dividende et diviseur (cités, pas travaillés), « dernière opération », lire un calcul sans le faire.
- Écarts et choix : aucune saisie : questions à 4 choix et un toucher sur la dernière opération ; pas de décimaux ni de fractions ; les erreurs reconnues sont des choix (pas de valeur numérique).
- Dans l'appli : 8 écrans avant l'annonce de la fin (exemple guidé compris) ; `essais/priorites-nature-calcul.ts` ; exercices de fin = question `choix` à 4 réponses ; erreurs de choix pas encore reliées à « Relire la règle N » (le choix n'a pas de type d'erreur).

## Fiche
### Règles
1. La dernière opération faite donne la nature du calcul (évite : « il y a un ×, donc c'est un produit »).
2. Termes pour + et −, facteurs pour × et ÷ ; un terme ou un facteur peut être un calcul entier.
3. Les parenthèses se calculent d'abord : elles ne sont jamais la dernière opération du calcul qui les contient.
### Idée de départ
On lit un calcul comme on le calcule : la dernière opération faite est celle qui « relie » les deux grands morceaux.
### Erreurs attendues → règle
| id | réponse fausse typique | règle | message |
|---|---|---|---|
| premiere-operation | 3 + 4 × 2 : « produit » | 1 | Le × se fait en premier ; la dernière opération est le +. |
| terme-facteur | « 4 × 2 est un terme » mal reconnu | 2 | Dans une somme, 4 × 2 est un terme. |
| parenthese-nature | (3 + 4) × 2 : « somme » | 3 | La parenthèse se calcule d'abord : la dernière opération est ×. |
### Techniques
- Principale : calculer dans sa tête l'ordre des opérations, repérer la dernière.
- Autres : aucune.
### Reprises et comparaison
- Reprise : priorités et parenthèses des cours 1 à 4.
- À comparer : 3 + 4 × 2 contre (3 + 4) × 2.
- Exemple guidé : 12 − 3 × (4 − 2) (différence ; le produit contient une parenthèse).
### Niveaux
1 : sans parenthèse, 3 nombres · 2 : une parenthèse, 3 ou 4 nombres · 3 : crochets, plusieurs blocs · calcul-piège : aucun (questions à choix).
### Hors catalogue
Rien : question `choix` et action `morceau` existantes.

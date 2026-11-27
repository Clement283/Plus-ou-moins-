# Cours 2 — Les × et les ÷ d'abord
Module : Priorités (`docs/modules/03-priorites/module.md`) · Précédent : cours 1 « Gauche à droite » · Sources : cycle 4 p. 7 ; Fonteniaud (règles 2 à 4) et Monka (règles 2 et 3), documents de 5e.

## Points importants
- À retenir : (1) les × et les ÷ passent avant les + et les − ; (2) un signe + ou − reste devant son bloc : 10 − 6 ÷ 2 se lit 10 − (6 ÷ 2) ; (3) plusieurs blocs : je calcule chaque bloc (× ÷ de gauche à droite), puis je finis de gauche à droite.
- Pièges : 3 + 4 × 2 = 14 (addition faite en premier) ; 15 − 8 ÷ 2 × 3 = 3 (÷ ou × pas dans l'ordre).
- Vu dans ce cours : « priorité », « bloc » (souligner les blocs × ÷), mélange des 4 opérations, relatifs aux niveaux 2 et 3.
- Écarts et choix : pas de parenthèses ici (cours suivant) ; comparer 3 + 4 × 2 et 3 × 4 + 2 (la place du × change le résultat), pas la comparaison avec parenthèses (au cours 3).
- Dans l'appli : 8 écrans avant l'annonce de la fin (exemple guidé compris) ; `essais/priorites-fois-avant-plus.ts` ; exercices = calcul par lignes sans x.

## Fiche
### Règles
1. × et ÷ avant + et − (évite 3 + 4 × 2 = 14).
2. Le signe devant un bloc reste devant le bloc : 10 − 6 ÷ 2 = 10 − 3 (évite 4 ÷ 2 = 2).
3. Plusieurs blocs : chaque bloc de gauche à droite, puis les + et − de gauche à droite (évite 15 − 8 ÷ 2 × 3 = 3).
### Idée de départ
Deux ordres possibles pour 3 + 4 × 2 : 14 ou 11. Les mathématiciens ont choisi : le produit « colle » ses deux nombres, comme 4 sacs de 2 billes ajoutés à 3 billes.
### Erreurs attendues → règle
| id | réponse fausse typique | règle | message |
|---|---|---|---|
| priorite | 3 + 4 × 2 = 14 | 1 | La multiplication passe avant l'addition : 4 × 2 d'abord. |
| gauche-droite | 15 − 8 ÷ 2 × 3 = 3 | 3 | Dans un bloc de × et ÷, de gauche à droite. |
### Techniques
- Principale : souligner les blocs × ÷, les calculer, puis finir de gauche à droite.
- Autres : aucune.
### Reprises et comparaison
- Reprise : le cours « Gauche à droite » (dans un bloc, et pour finir).
- À comparer : 3 + 4 × 2 contre 3 × 4 + 2 (11 contre 14).
- Exemple guidé : −6 ÷ 3 + 4 × (−2) − 5 (négatifs, deux blocs).
### Niveaux
1 : un bloc de 2 facteurs et un nombre seul, résultats positifs · 2 : 3 blocs, nombres de 3 à 12 · 3 : 3 ou 4 blocs, négatifs, blocs de 3 facteurs · calcul-piège : un + ou − à gauche d'un bloc.
### Hors catalogue
Rien.

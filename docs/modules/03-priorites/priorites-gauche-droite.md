# Cours 1 — Gauche à droite
Module : Priorités (`docs/modules/03-priorites/module.md`) · Précédent : module 2, cours 11 · Sources : cycle 4 p. 7 ; Fonteniaud (règle 1) et Monka (règle 1), documents de 5e.

## Points importants
- À retenir : (1) avec seulement des + et des −, je calcule de gauche à droite ; (2) avec seulement des × et des ÷, pareil ; (3) j'écris une ligne par opération (A = …, puis = …).
- Pièges : 10 − 3 + 2 = 5 (on a retiré 3 + 2) ; 12 ÷ 3 × 2 = 2 (on a divisé par 3 × 2).
- Vu dans ce cours : « de gauche à droite », une opération par ligne, que des + et − ou que des × et ÷ (jamais mélangés : c'est le cours suivant), relatifs en fin de calcul.
- Écarts et choix : pas de mélange des 4 opérations ici (décidé le 2026-11-27) ; entiers seulement, divisions qui tombent juste.
- Dans l'appli : 8 écrans avant l'annonce de la fin (exemple guidé compris) ; `essais/priorites-gauche-droite.ts` ; exercices = calcul par lignes à partir d'un calcul seul (A = …), sans x.

## Fiche
### Règles
1. Que des + et des − : je vais de gauche à droite (évite 10 − 3 + 2 = 5).
2. Que des × et des ÷ : même chose (évite 12 ÷ 3 × 2 = 2).
3. Une ligne par opération : je recopie le reste et je calcule une seule opération.
### Idée de départ
Un calcul se lit comme une phrase, de gauche à droite : « dix moins trois, plus deux ». Sans parenthèse, personne ne peut deviner un autre ordre.
### Erreurs attendues → règle
| id | réponse fausse typique | règle | message |
|---|---|---|---|
| gauche-droite | 10 − 3 + 2 = 5 ; 12 ÷ 3 × 2 = 2 | 1 ou 2 | On calcule dans l'ordre de lecture : 10 − 3 d'abord, puis + 2. |
### Techniques
- Principale : lire de gauche à droite, calculer les deux premiers nombres, recopier le reste.
- Autres : aucune.
### Reprises et comparaison
- À comparer : 10 − 3 + 2 contre 10 − 3 − 2 (le dernier signe change tout : 9 contre 5).
- Exemple guidé : 5 − 8 + (−2) (résultat négatif, parenthèses du module Relatifs).
### Niveaux
1 : 3 nombres de 1 à 9, résultats positifs · 2 : 4 nombres de 10 à 40 · 3 : 5 nombres, relatifs, ou chaînes de × et ÷ de 4 facteurs · calcul-piège : un − (ou ÷) suivi d'un + (ou ×).
### Hors catalogue
Rien : écran « Calculer par lignes » (variante sans x ajoutée au moteur).

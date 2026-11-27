# Cours 3 — Les parenthèses d'abord
Module : Priorités (`docs/modules/03-priorites/module.md`) · Précédent : cours 2 « Les × et les ÷ d'abord » · Sources : cycle 4 p. 7 ; Fonteniaud (règle « II » et n° 5), Monka (règle des parenthèses), documents de 5e.

## Points importants
- À retenir : (1) on calcule d'abord ce qui est entre parenthèses ; (2) une parenthèse de calcul n'est pas la parenthèse d'un négatif : (3 − 5) devient (−2) et la parenthèse reste ; (3) après les parenthèses, les priorités du cours précédent.
- Pièges : 2 × (3 + 4) = 10 (parenthèse ignorée) ; 2 × (3 − 5) = 4 (signe perdu) ; 3 + 2 × (8 − 5) = 15 (priorité oubliée).
- Vu dans ce cours : « calcul entre parenthèses », parenthèses de calcul contre parenthèses d'un négatif, résultat négatif d'une parenthèse, calculs à une seule paire de parenthèses (ou deux, côte à côte).
- Écarts et choix : pas de parenthèses imbriquées (cours suivant) ; la comparaison 3 + 4 × 2 contre (3 + 4) × 2 est ici (pas au cours 2) ; le piège 2 × (3 − 5) est montré à l'écran de la règle 2.
- Dans l'appli : 8 écrans avant l'annonce de la fin (exemple guidé compris) ; `essais/priorites-parentheses.ts` ; calcul par lignes avec parenthèses (moteur étendu).

## Fiche
### Règles
1. Je calcule d'abord ce qui est entre parenthèses (évite 2 × (3 + 4) = 10).
2. Une parenthèse de calcul se transforme en un nombre, négatif s'il le faut, qui garde sa parenthèse (évite 2 × (3 − 5) = 4).
3. Ensuite : × et ÷, puis + et − de gauche à droite (évite 3 + 2 × (8 − 5) = 15).
### Idée de départ
Les parenthèses sont un paquet fermé : on l'ouvre et on le calcule en premier, comme un sac qu'on pèse avant de l'ajouter.
### Erreurs attendues → règle
| id | réponse fausse typique | règle | message |
|---|---|---|---|
| parenthese | 2 × (3 + 4) = 10 | 1 | Les parenthèses passent en premier : 3 + 4 = 7, puis 2 × 7. |
| signe | 2 × (3 − 5) = 4 | 2 | 3 − 5 = −2 : le résultat est négatif, 2 × (−2) = −4. |
| priorite | 3 + 2 × (8 − 5) = 15 | 3 | Après la parenthèse, le × passe avant le +. |
### Techniques
- Principale : entourer la parenthèse, la calculer, recopier le reste.
- Autres : aucune.
### Reprises et comparaison
- Reprise : × et ÷ d'abord, gauche à droite, une opération par ligne.
- À comparer : 3 + 4 × 2 contre (3 + 4) × 2 (11 contre 14).
- Exemple guidé : 5 + 3 × (4 − 9) (parenthèse négative, puis produit).
### Niveaux
1 : une paire de parenthèses, nombres positifs, résultat de la parenthèse positif · 2 : deux parenthèses ou parenthèse négative, + − autour · 3 : relatifs dans les parenthèses, ÷ · calcul-piège : un × ou ÷ collé à une parenthèse.
### Hors catalogue
Rien (calcul par lignes avec parenthèses : moteur étendu).

# 04 — Les QCM : comment on choisit les réponses proposées

*Statut : à valider*

Les QCM servent dans les révisions et dans l'entraînement. Ce document décrit comment on choisit les mauvaises réponses proposées, qu'on appelle les **pièges**.

## 1. Le principe

- **4 choix** : la bonne réponse et 3 pièges.
- **L'ordre des choix est mélangé** à chaque question.
- Jamais deux fois la même valeur, et la bonne réponse n'apparaît jamais parmi les pièges.
- **Deux sortes de pièges :**
  - **piège typique** : le résultat d'une erreur reconnue du cours. Pour (−3) × (−3), « −9 » correspond à une erreur sur la règle des signes, et « −6 » ou « 6 » à une addition au lieu d'une multiplication ;
  - **piège non typique** : une valeur plausible, proche du résultat, qui ne correspond à aucune erreur précise.
- **Chaque choix est relié à une erreur.** Quand elle se trompe, l'appli sait laquelle : piège typique → l'erreur correspondante ; piège non typique → « autre erreur ». C'est ce qui alimente les erreurs récentes (doc 01) et ta page de suivi.

## 2. Comment le mélange évolue

Ça dépend du nombre de fois où elle a déjà vu ce cours en QCM.

**Au début (moins de 5 QCM sur ce cours)** : surtout des pièges typiques.
> bonne réponse + **2 pièges typiques** + 1 piège non typique

**Ensuite** : on tire au hasard, une fois sur deux, l'une des deux formules suivantes.

- **Formule « paires de signes »** : la bonne réponse, **son opposé**, un autre nombre **et son opposé**.
  > Pour (−3) × (−3) = 9 : **9, −9, 6, −6**
  Comme il y a deux paires, se dire « c'est 9 ou −9 » ne suffit pas : elle doit trouver **la bonne valeur et le bon signe**.
- **Formule « mélangée »** : la bonne réponse + 1 piège typique + 2 pièges non typiques. L'opposé de la bonne réponse **n'est pas forcément là**.
  > Pour (−3) × (−3) = 9 : **9, 6, 12, 8**

*Pourquoi :* c'est ta remarque. Si le choix se résume toujours à « 9 ou −9 », elle devine. Avec les paires de signes, cette astuce ne marche plus. Avec la formule mélangée, elle ne peut plus compter sur l'opposé pour se repérer.

Si un cours n'a pas assez de pièges typiques pour la formule demandée, on complète avec des pièges non typiques.

## 3. Comment on fabrique un piège non typique

- **Même ordre de grandeur que la bonne réponse :**
  - réponse entre −20 et 20 : on ajoute ou retire 1, 2 ou 3 ;
  - réponse plus grande : on ajoute ou retire 10 %, 20 % ou un nombre de dizaines, arrondi à un entier.
- **Le signe :** une fois sur deux, on garde celui de la bonne réponse, sinon on prend l'autre (sauf dans la formule « paires de signes », où il est imposé).
- **Si la réponse est entière, les pièges sont entiers.**
- **Pas de 0 comme piège**, sauf si la bonne réponse est entre −3 et 3.

## Exemples

| Calcul | Bonne réponse | QCM déjà vus sur ce cours | Formule | Choix proposés (avant mélange), avec l'erreur reliée |
|---|---|---|---|---|
| (−3) × (−3) | 9 | 0 | début | 9 ✓ · −9 *règle des signes* · 6 *addition au lieu de multiplication* · 8 *autre* |
| (−3) × (−3) | 9 | 7 | paires de signes | 9 ✓ · −9 *règle des signes* · 6 *addition au lieu de multiplication* · −6 *addition au lieu de multiplication* |
| (−3) × (−3) | 9 | 7 | mélangée | 9 ✓ · −6 *addition au lieu de multiplication* · 12 *autre* · 7 *autre* |
| (−3) + (−5) | −8 | 2 | début | −8 ✓ · 8 *signe oublié* · −2 *soustraction au lieu d'addition* · −7 *autre* |
| (−3) + 5 | 2 | 10 | paires de signes | 2 ✓ · −2 *signe du mauvais nombre* · 8 *addition au lieu de soustraction* · −8 *addition au lieu de soustraction* |
| 5 − (−3) | 8 | 10 | mélangée | 8 ✓ · 2 *opposé oublié* · 11 *autre* · −9 *autre* |
| (−248) + 75 | −173 | 12 | mélangée | −173 ✓ · 173 *signe du mauvais nombre* · −190 *autre* · 156 *autre* |
| (−7) + 7 | 0 | 0 | début | 0 ✓ · −14 *addition au lieu de soustraction* · 14 *addition au lieu de soustraction* · 1 *autre* |

Règles toujours vraies, vérifiées sur 1 000 QCM tirés au hasard :

| Vérification | Attendu |
|---|---|
| Nombre de choix | toujours 4 |
| Bonne réponse | présente exactement une fois |
| Doublons | aucun |
| Réponse entière | tous les choix sont entiers |
| Formule « paires de signes » | chaque choix a son opposé parmi les choix (sauf 0) |

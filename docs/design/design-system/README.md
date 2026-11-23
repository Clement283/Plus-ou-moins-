# Design system de Plus ou moins — « Cahier au propre »

*Statut : proposition, en attente de validation du porteur du projet (2026-11-23).*

Pour une collégienne qui révise ses nombres relatifs : un cahier tenu au propre. Papier légèrement bleuté, encre indigo pour agir, vert juste et rouge du prof pour corriger, corail pour le module Calculs. Un seul motif fort : la droite graduée (jauge du jour). Police unique : Lexend.

Structure de référence : Material (tokens) + catalogue MUI (l'appli est une PWA pour téléphone).

## Fichiers

| Fichier | Rôle |
|---|---|
| `styles.css` | Tokens (`:root`, thème sombre `:root[data-theme="dark"]`) + classes de composants. **Source unique.** |
| `index.html` | Catalogue vivant : fondations, composants propres à l'appli, catalogue MUI complet, mode inspection, « Copier comme consigne ». |
| `concept.html` | Deux écrans concept : accueil de l'élève (4 situations) et question de cours. |
| `icons.html` | Sprite SVG canonique (copié en tête de `index.html` et `concept.html`). |
| `number-line.js` | Rendu de la droite graduée. |
| `theme.js` | Bascule clair / sombre partagée. |

S'ouvrent directement dans un navigateur (`file://`), sans compilation.

## Règles

- Les composants n'utilisent **que des tokens** (jamais de couleur ou de taille en dur).
- Chaque fond a son `--on-*` ; contrastes vérifiés au calcul (texte ≥ 4,5:1, dans les deux thèmes).
- L'indigo mène les actions ; vert et rouge uniquement pour juste / faux ; corail = module Calculs.
- Le signe moins est toujours « − » (U+2212). Aucune correction automatique de la saisie.
- Espacements : éléments liés 8 < groupes 16 < grandes parties 24 ; marge d'écran 16 ; cible tactile 48, bouton principal 56.

## Ajouter quelque chose

- **Un token** : l'ajouter dans le bon groupe de `:root` **et** dans le bloc sombre, puis le référencer.
- **Un composant** : un bloc de classes dans `styles.css` (tokens seulement), une `<section id="clé">` dans `index.html`, une entrée `SPECS.clé` (le bouton « Copier comme consigne » apparaît tout seul).
- **Un module** (après Calculs) : ajouter son trio `--module-x`, `--module-x-container`, `--on-module-x-container`, contraste vérifié.
- **Changer de thème** : ne modifier que les valeurs des tokens ; catalogue et écrans suivent.

# Consignes communes pour les maquettes d'écrans (étape design, étape 1)

Ces maquettes sont des **propositions à valider** par le porteur du projet. Aucun code d'appli.

## Ce qui est déjà validé
- Design system « Cahier au propre » : `docs/design/design-system/` (lire `README.md`, `styles.css`, et `concept.html` comme exemple d'écran fini). Police Lexend, papier bleuté, indigo = action, corail = module Calculs, vert = juste, rouge du prof = faux, gris = « pas faux mais inutile ».
- Écrans validés : accueil de l'élève et question de cours (`concept.html`). Les reprendre tels quels quand ils apparaissent.
- Décisions : série affichée sur l'accueil ; prénom affiché (« Léa » est un exemple) ; fenêtre de 4 cours au lieu de la bande complète.

## Règles de contenu
- Source de vérité : `docs/validation/01` à `07` (le 07 prime). Ne rien inventer qui contredise ces documents ; si un cas n'est pas couvert, faire un choix simple et le signaler dans la liste « Questions » de la page.
- Copie en français, tutoiement, phrases courtes, pas d'emoji dans l'interface, pas de majuscules forcées, pas de « · » entre les infos (écrire des phrases ou des virgules), pas de flèche « → » dans les boutons.
- Le signe moins est toujours « − » (U+2212). Calculs réels du programme (nombres relatifs, Cours 0 à 7 du doc 06).
- L'élève est une collégienne : « elle » dans les notes, « tu » dans l'interface.

## Règles techniques
- Un fichier HTML autonome par lot dans `docs/design/ecrans/`, sur le modèle de `docs/design/design-system/concept.html` : même `<head>` (Lexend, `../design-system/styles.css`, `../design-system/theme.js`), même sélecteur Clair/Sombre et même barre `.pagebar` en haut, sprite d'icônes copié depuis `docs/design/design-system/icons.html` (ajouter un `<symbol>` si besoin, style Lucide, trait 2).
- Lien retour en haut vers `../design-system/concept.html`.
- Chaque écran dans un cadre `.device` de 375 px de large max, 760 px de haut, avec un titre court au-dessus. Les cadres s'enchaînent en colonne sur téléphone, côte à côte sur grand écran.
- **Ne pas modifier `styles.css`** ni aucun fichier hors de votre lot. Utiliser les classes existantes. Si un composant manque, le styler dans le `<style>` de votre page avec des tokens uniquement (aucune couleur en dur), et le lister dans votre compte rendu sous « Composants à ajouter au design system ».
- Pas de bibliothèque externe. Un peu de JS seulement pour basculer entre des états d'un même écran (comme les boutons de situation de `concept.html`).
- En bas de page : une courte légende, puis un bloc « Questions pour toi » (3 au maximum) sur les vrais points ouverts.

## Vérification avant de rendre
Script Playwright (Chromium préinstallé, `require('playwright')`, ne rien installer) écrit dans `/tmp/claude-0/-home-user-Plus-ou-moins-/b1f11f01-49ed-52ed-b25f-3ad99ff973a4/scratchpad/` : ouvrir votre page à 375 × 812 en clair et en sombre, vérifier `document.documentElement.scrollWidth === 375` et l'absence d'erreur console, capturer chaque `.device` (nommer les images `<lot>-<n>-<theme>.png` dans le scratchpad), regarder 2 ou 3 captures pour vérifier lisibilité et contrastes.

## Compte rendu (moins de 200 mots)
Écrans faits, choix non couverts par les docs, composants à ajouter, résultat de la vérification. Ne pas commiter.

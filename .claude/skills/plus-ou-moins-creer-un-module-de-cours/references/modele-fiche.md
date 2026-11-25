# Modèle de fiche de cours (`docs/fiches/cNN-nom.md`)

Produite par le skill module (une par cours), lue par le skill cours : **c'est la seule chose que l'assistant d'un cours lit en plus de son catalogue**. 40 lignes au plus, des phrases courtes, pas de texte d'écran (c'est le travail du cours).

```markdown
# Cours N — Titre
Module : … · Précédent : cours M « … » (ou : module précédent, cours M) · Plan : docs/validation/NN-module-….md · Sources : …

## Règles (1 à 3) : une phrase chacune, et l'erreur qu'elle évite
1. …
## Idée de départ (le pourquoi, avant toute règle)
…
## Erreurs attendues → règle
| id | réponse fausse typique (exemple) | règle | message en une phrase (idée) |
## Techniques (2 à 4)
- Principale (fiche mémo) : nom · quand · exemple chiffré
- Autres (étapes de la leçon ou « Autres façons de faire », 2 ou 3) : …
## Reprises
- Cas B à comparer (du cours précédent) : …
- Question de la série tirée du cours précédent : …
## Niveaux (les nombres ET la longueur du calcul)
1 : … · 2 : … · 3 : … · calculs-pièges : …
## Hors catalogue
Rien / nouvelle brique d'écran nécessaire : … (→ mode maquette)

## Points importants
(ébauchés par le plan, complétés à la fin de l'écriture ; 8 lignes au plus ; c'est ce qu'on relit à la place du cours)
- À retenir : les règles, une ligne chacune.
- Pièges : les erreurs reconnues, une ligne chacune.
- Écarts et choix : ce qui diffère du cours du prof ou du programme, décisions prises sans document, à valider.
- Dans l'appli : n écrans, note sur n questions, niveaux, fichier du cours.
```

Le script `scripts/points-importants.ts` ne lit que le titre (`# Cours N — Titre`), la ligne « Module : … » et la section « Points importants » : respecter ces trois formes.

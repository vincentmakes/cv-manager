# Langue

## Langue de l'interface d'administration

Cliquez sur l'**icone de globe** dans la barre d'outils pour changer la langue de l'interface d'administration. Une grille deroulante affiche toutes les langues disponibles — cliquez sur l'une d'elles pour l'appliquer immediatement.

**Langues prises en charge :** anglais (English), allemand (Deutsch), francais, neerlandais (Nederlands), espagnol (Espanol), italien (Italiano), portugais (Portugues), chinois (中文).

Le parametre de langue n'affecte que les libelles, boutons et menus de l'interface d'administration. Votre preference est enregistree et conservee entre les sessions.

## Langue du contenu du CV

Independamment de la langue de l'interface, chaque jeu de donnees enregistre possede sa propre **langue de contenu** — c'est la langue dans laquelle le contenu du CV est redige. La langue du contenu est affichee sous forme de badge (EN, DE, FR, etc.) sur chaque ligne de jeu de donnees dans le Gestionnaire CV.

Lorsque vous chargez un jeu de donnees, l'interface d'administration bascule automatiquement pour correspondre a sa langue de contenu. Cela signifie que si vous chargez un CV allemand, l'interface passe egalement en allemand, afin que les en-tetes de section et les libelles de formulaire soient dans la meme langue que le contenu que vous editez.

### Changer la langue d'un jeu de donnees

Pour changer la langue assignee a un jeu de donnees existant :

1. Ouvrez le **Gestionnaire CV**
2. Cliquez sur le **badge de langue** (par exemple, EN) sur la ligne du jeu de donnees
3. Selectionnez la nouvelle langue dans le selecteur

Cela reassigne le code de langue sans modifier le contenu lui-meme — utile pour les jeux de donnees qui etaient par defaut en anglais lors de la configuration initiale.

## Variantes linguistiques

Vous pouvez creer **plusieurs variantes linguistiques** du meme CV. Par exemple, vous pouvez maintenir une version anglaise et une version allemande qui partagent la meme structure mais ont un contenu independant.

Consultez [Jeux de donnees & Variantes linguistiques](datasets.md#variantes-linguistiques) pour les details sur la creation et la gestion des variantes linguistiques.

## Changement de langue sur le site public

Lorsque le jeu de donnees par defaut a des variantes linguistiques, les visiteurs peuvent changer de langue sur le site public :

- La **langue par defaut** est servie a `/`
- Les autres langues sont disponibles a `/{lang}` (par exemple, `/de`, `/fr`)
- Un bouton de changement de langue apparait sur le site public pour permettre aux visiteurs de basculer entre les langues disponibles

Pour les jeux de donnees partages non par defaut, les variantes linguistiques sont servies a `/v/slug/{lang}`.

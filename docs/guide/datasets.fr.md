# Jeux de donnees & Variantes linguistiques

## Fonctionnement des jeux de donnees

Les jeux de donnees sont des instantanes enregistres de votre CV. Un jeu de donnees est toujours le jeu **par defaut** — c'est la version que les visiteurs voient a l'URL racine (`/`). Vous pouvez creer des jeux de donnees supplementaires pour differents publics (par exemple, un CV technique, un CV de management), dans differentes langues, et les partager via leurs propres URL.

Lorsque vous installez CV Manager pour la premiere fois, un jeu de donnees « Par defaut » est automatiquement cree a partir de vos donnees de CV. Toutes les modifications que vous effectuez dans l'interface d'administration sont **automatiquement enregistrees** dans le jeu de donnees actif — il n'y a pas d'etape de sauvegarde separee.

## Le Gestionnaire CV

Cliquez sur **Gestionnaire CV** dans la barre d'outils pour ouvrir la fenetre centralisee pour toutes les operations sur les jeux de donnees : enregistrement, chargement, creation de versions, ajout de langues, definition du jeu par defaut et gestion de la visibilite.

La fenetre comporte deux zones :

- Un **formulaire d'enregistrement** en haut — champ de nom, selecteur de langue et un bouton d'enregistrement
- Une **liste des CV enregistres** en dessous — regroupes par nom de base, avec toutes les actions de gestion

### Enregistrer un nouveau jeu de donnees

Le champ de nom est pre-rempli avec le nom du jeu de donnees actif. Le menu deroulant de langue affiche par defaut la langue active.

- **Saisissez un nouveau nom** et cliquez sur le bouton bleu **Enregistrer sous « ... »** pour creer un tout nouveau jeu de donnees
- **Cliquez sur une ligne existante** dans la liste pour remplir le champ de nom — le bouton devient l'orange **Ecraser « ... »** (avec confirmation)

### Liste des jeux de donnees

Chaque CV enregistre apparait sous forme de **groupe** avec un en-tete affichant le nom de base, un bouton **+ Nouvelle version** et un badge indiquant le nombre de versions/langues.

A l'interieur de chaque groupe, chaque variante linguistique est une ligne :

```
○  FR  v2  Full Stack Developer v2     /v/full-stack-dev/fr   16/04/2026   [Charger]  ⋮
```

- **Bouton radio** (○) — selectionne le jeu de donnees que les visiteurs voient a `/` (le jeu par defaut)
- **Badge de langue** (FR) — la langue du contenu de cette variante
- **Badge de version** (v2) — affiche lorsque le groupe a plusieurs versions
- **Nom** — le nom du jeu de donnees
- **URL** — le chemin d'URL public (si partage ou par defaut)
- **Date** — derniere modification
- **Charger** — basculer vers l'edition de ce jeu de donnees
- **⋮** (menu debordement) — actions supplementaires

### Menu debordement (⋮)

Le menu debordement de chaque ligne contient :

| Action | Description |
|--------|-------------|
| **Rendre partage / Rendre prive** | Activer/desactiver la visibilite publique a `/v/slug` (masque pour le jeu par defaut et ses variantes linguistiques) |
| **Changer la langue** | Reassigner le code de langue de ce jeu de donnees |
| **Apercu** | Ouvrir la version enregistree dans un nouvel onglet |
| **Copier l'URL** | Copier l'URL publique ou d'apercu dans le presse-papiers |
| **Supprimer** | Supprimer definitivement (desactive pour le jeu de donnees par defaut) |

## Versions

Les jeux de donnees qui partagent le meme nom de base sont regroupes. Par exemple, `Frontend Engineer`, `Frontend Engineer v2` et `Frontend Engineer v3` apparaissent dans un meme bloc sous un en-tete commun.

### Creer une nouvelle version

Cliquez sur **+ Nouvelle version** dans l'en-tete du groupe. Le champ de nom se remplit automatiquement avec le prochain numero de version (par exemple, `Frontend Engineer v4`). Lors de l'enregistrement, la nouvelle version :

- Recoit un badge de version (v4)
- Partage le meme slug d'URL que ses versions soeurs
- Herite de toutes les variantes linguistiques de la version precedente

### Anciennes versions repliables

Lorsqu'un groupe a plusieurs versions, seule la plus recente est affichee. Un bouton **« N anciennes versions »** permet de deplier pour voir toutes les versions. Si le jeu de donnees que vous editez ou le jeu par defaut se trouve dans une ancienne version, il est automatiquement deplie pour que vous puissiez toujours le voir.

!!! tip
    Utilisez la convention de nommage `Base vN` (par exemple, `Frontend Engineer`, `Frontend Engineer v2`) pour beneficier du regroupement automatique des versions et des suggestions de version suivante.

## Variantes linguistiques

Chaque version d'un jeu de donnees peut avoir plusieurs variantes linguistiques — par exemple, une version anglaise et une version allemande du meme CV, partageant la meme structure mais avec un contenu independant.

### Ajouter une variante linguistique

1. Ouvrez le **Gestionnaire CV**
2. Cliquez sur **+ Ajouter une langue** dans l'en-tete du groupe (ou utilisez le flux **⋮ → Ajouter une langue** depuis le formulaire d'enregistrement)
3. Selectionnez la langue cible et enregistrez

La nouvelle variante commence comme une copie du contenu existant. L'interface d'administration bascule automatiquement vers la nouvelle langue pour que vous puissiez commencer a traduire.

### Changer de langue

Lorsque vous editez un jeu de donnees qui a des variantes linguistiques, un **selecteur de langue** apparait dans la banniere du jeu de donnees actif sous la barre d'outils. Cliquez sur un code de langue pour changer — votre travail en cours est d'abord automatiquement enregistre, puis l'autre variante est chargee et la langue de l'interface s'adapte.

### Synchronisation structurelle

Les modifications de **structure** — ordre des sections, visibilite, disposition des sections personnalisees et nombre d'elements — se propagent automatiquement a toutes les variantes linguistiques. Le **contenu** (texte, titres, descriptions) reste independant par langue, vous pouvez donc traduire librement sans vous soucier des decalages de mise en page.

### Changer la langue d'un jeu de donnees

Cliquez sur le **badge de langue** sur n'importe quelle ligne pour ouvrir un selecteur et reassigner son code de langue. C'est utile pour les anciens jeux de donnees qui etaient par defaut en anglais lors de la configuration initiale.

## Definir le jeu par defaut

Le jeu de donnees par defaut est la version que les visiteurs voient a votre URL racine (`/`). Pour le modifier :

1. Ouvrez le **Gestionnaire CV**
2. Cliquez sur le **bouton radio** (○) a cote du jeu de donnees que vous souhaitez definir par defaut
3. Le changement prend effet immediatement

Les variantes linguistiques du jeu par defaut sont automatiquement accessibles a `/{lang}` (par exemple, `/de`, `/fr`) — elles n'ont pas besoin d'un bouton de partage separe.

!!! note
    Le site public sert le jeu de donnees par defaut enregistre, pas vos modifications en cours. Vous pouvez experimenter en toute securite dans l'interface d'administration sans affecter ce que voient les visiteurs.

## URL publiques versionnees

Les jeux de donnees non par defaut peuvent etre partages via leurs propres URL. Utilisez l'action **⋮ → Rendre partage** pour rendre un jeu de donnees public a `/v/slug`. Plusieurs jeux de donnees peuvent etre publics simultanement.

- **Jeu de donnees par defaut** : servi a `/`
- **Variantes linguistiques du jeu par defaut** : servies a `/{lang}` (par exemple, `/fr`)
- **Jeux de donnees partages** : servis a `/v/slug` ou `/v/slug/{lang}`
- **Jeux de donnees prives** : uniquement previsualisables depuis l'interface d'administration

!!! tip "Copier les URL"
    Cliquez sur le chemin d'URL affiche sur chaque ligne pour copier l'URL publique complete dans votre presse-papiers.

# Jeux de données (Versions multiples de CV)

## Fonctionnement des jeux de données

Les jeux de données sont des instantanés enregistrés de votre CV. Un jeu de données est toujours le jeu **par défaut** — c'est la version que les visiteurs voient à l'URL racine (`/`). Vous pouvez créer des jeux de données supplémentaires pour différents publics (par exemple, un CV technique, un CV de management) et les partager via leurs propres URL.

Lorsque vous installez CV Manager pour la première fois, un jeu de données « Default » est automatiquement créé à partir de vos données de CV. Toutes les modifications que vous effectuez dans l'interface d'administration sont **automatiquement enregistrées** dans le jeu de données actif — il n'y a pas d'étape de sauvegarde séparée.

## La bannière du jeu de données actif

Une bannière située sous la barre d'outils indique le jeu de données que vous êtes en train de modifier. Elle affiche :

- Le **nom du jeu de données** (par exemple, « Default », « CV Technique »)
- Un **badge « Default »** si ce jeu de données est celui servi à `/`
- Un **statut de sauvegarde automatique** — affiche brièvement « Saving… » puis « ✓ Saved » après chaque modification

Chaque modification que vous apportez (ajout d'éléments, modification de contenu, réorganisation, activation/désactivation de la visibilité) est automatiquement enregistrée dans le jeu de données actif après un court délai.

## Enregistrer un nouveau jeu de données

Cliquez sur **Save As...** dans la barre d'outils, saisissez un nom (par exemple, « CV Technique », « Poste Marketing »), et l'état actuel de votre CV est enregistré en tant que nouvel instantané. Le nouveau jeu de données devient le jeu actif.

## La fenêtre d'ouverture

Cliquez sur **Open...** pour voir tous les jeux de données enregistrés. Une **légende** en haut explique les trois contrôles :

| Contrôle | Fonction |
|----------|----------|
| **Bouton radio** | Sélectionner le jeu de données servi à votre URL racine `/` (le jeu par défaut) |
| **Interrupteur** | Partager d'autres jeux de données via leur propre URL `/v/slug` |
| **Bouton œil** | Prévisualiser un jeu de données enregistré sans le rendre public |

Chaque ligne de jeu de données affiche :

- Le **nom** et la date de dernière mise à jour
- Un **badge « Default »** — sur le jeu de données sélectionné avec le bouton radio
- Un **badge « Editing »** — sur le jeu de données actuellement chargé dans l'interface d'administration
- Une **URL versionnée** (par exemple, `/v/technical-cv-1`) — masquée pour le jeu de données par défaut puisqu'il est servi à `/`
- Un bouton **Load** — bascule vers ce jeu de données (affiche « Reload » s'il est déjà actif)
- Un bouton **Delete** — supprime définitivement le jeu de données (désactivé pour le jeu par défaut actuel)

## Définir le jeu de données par défaut

Le jeu de données par défaut est la version que les visiteurs voient lorsqu'ils accèdent à votre URL racine (`/`). Pour le modifier :

1. Ouvrez la fenêtre **Open...**
2. Cliquez sur le **bouton radio** à côté du jeu de données que vous souhaitez utiliser comme CV public
3. Le changement prend effet immédiatement — le site public sert désormais ce jeu de données

Cela permet de découpler votre CV public de votre travail d'édition. Vous pouvez modifier librement le contenu dans l'interface d'administration sans que les visiteurs voient les modifications en cours jusqu'à ce que vous soyez prêt.

## URL publiques versionnées

Chaque jeu de données enregistré (autre que celui par défaut) obtient un chemin d'URL unique (par exemple, `/v/technical-cv-1`). Par défaut, ceux-ci sont **privés** — accessibles uniquement depuis l'interface d'administration pour la prévisualisation.

Pour partager une version spécifique publiquement :

1. Ouvrez la fenêtre **Open...**
2. Trouvez le jeu de données que vous souhaitez partager
3. Activez l'**interrupteur** à côté — il devient bleu et un badge vert **Public** apparaît
4. L'URL `/v/slug` est maintenant accessible sur le **site public** (port 3001)

Cela vous permet de partager des versions de CV adaptées à différents publics. Par exemple, vous pourriez rendre un « CV Technique » public pour les postes d'ingénierie tout en gardant un « CV Management » privé jusqu'à ce que ce soit nécessaire.

**Copier l'URL** : Cliquez sur l'icône de copie à côté du slug pour copier l'URL complète dans votre presse-papiers. Le message de notification vous indiquera si vous avez copié une URL publique ou une URL de prévisualisation uniquement.

!!! note
    La page publique principale à `/` affiche toujours le **jeu de données par défaut** — et non vos modifications en cours. Cela signifie que vous pouvez expérimenter en toute sécurité dans l'interface d'administration sans affecter ce que voient les visiteurs.

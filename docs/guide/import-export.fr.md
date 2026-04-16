# Import et export

## Exporter votre CV

Cliquez sur **Exporter** dans la barre d'outils pour telecharger l'integralite de votre CV sous forme de fichier JSON. Celui-ci inclut toutes les sections, les elements, les parametres et les sections personnalisees. Utilisez cette fonctionnalite pour les sauvegardes ou pour transferer votre CV vers une autre instance.

Le fichier exporte est nomme `cv-data-{lang}.json` (par exemple, `cv-data-de.json`) et inclut la langue du jeu de donnees actif. Cela vous permet de savoir quelle version linguistique vous avez exportee.

## Importer des donnees

Cliquez sur **Importer** et selectionnez un fichier JSON precedemment exporte. Cela remplace vos donnees de CV actuelles par les donnees importees. Les sections personnalisees et tous les parametres sont inclus.

Si le fichier importe contient un champ `language`, l'interface d'administration bascule automatiquement vers cette langue apres l'import. Cela signifie que si vous importez un export de CV allemand, l'interface passe en allemand pour que vous puissiez continuer a editer dans la bonne langue.

!!! tip
    Exportez votre CV avant d'importer, afin de disposer d'une sauvegarde de l'etat actuel.

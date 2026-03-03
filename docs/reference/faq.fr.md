# FAQ

## Général

??? question "Mes données sont-elles stockées sur un serveur externe ?"
    Non. Tout fonctionne localement sur votre serveur. Vos données de CV sont stockées dans un fichier de base de données SQLite dans le répertoire `/data`.

??? question "Puis-je exécuter CV Manager sans Docker ?"
    Oui. Installez Node.js 18+, exécutez `npm install` dans le répertoire du projet, puis `node src/server.js`. L'interface d'administration fonctionne sur le port 3000 et le site public sur le port 3001.

??? question "Plusieurs personnes peuvent-elles utiliser la même instance ?"
    CV Manager est conçu comme une application mono-utilisateur. Chaque instance gère le CV d'une seule personne. Pour plusieurs personnes, exécutez des conteneurs séparés.

## Édition

??? question "Comment indiquer qu'un poste est en cours ?"
    Laissez le champ **End Date** vide. Il s'affichera comme « Present » sur le CV.

??? question "Puis-je réorganiser les éléments au sein d'une section ?"
    Oui. La plupart des éléments prennent en charge le glisser-déposer pour la réorganisation. L'ordre est enregistré automatiquement.

??? question "Comment ajouter des puces à une expérience ?"
    Modifiez l'expérience et saisissez les points clés dans le champ **Highlights** — une puce par ligne.

??? question "Comment ajouter un logo d'entreprise ?"
    Modifiez l'expérience, faites défiler jusqu'à la section **Company Logo**, puis cliquez sur **Choose image** pour télécharger une image. Vous pouvez également cliquer sur **Use existing** pour réutiliser un logo déjà téléchargé. Activez le bouton **« Sync logo across all [Company] »** pour appliquer le même logo à toutes les expériences de cette entreprise.

??? question "J'ai accidentellement supprimé quelque chose. Puis-je annuler ?"
    Il n'existe pas de fonction d'annulation. Étant donné que les modifications sont automatiquement enregistrées dans le jeu de données actif, le changement est persisté immédiatement. Si vous disposez d'un export précédent ou d'un jeu de données sauvegardé séparé, vous pouvez restaurer à partir de celui-ci. Il est recommandé d'exporter régulièrement votre CV en tant que sauvegarde.

## Sections personnalisées

??? question "Combien de sections personnalisées puis-je créer ?"
    Il n'y a pas de limite stricte. Créez-en autant que nécessaire.

??? question "Puis-je changer le type de mise en page d'une section personnalisée après sa création ?"
    Oui. Modifiez la section et sélectionnez une mise en page différente. Notez que certains champs peuvent ne pas être transférés entre les types de mise en page (par exemple, passer de cards à social links).

??? question "Quelle est la différence entre les mises en page « Bullet Points » et « Free Text » ?"
    **Bullet Points** affiche chaque ligne sous forme d'élément de liste à puces avec un titre de groupe. **Free Text** affiche du texte brut avec des retours à la ligne préservés et sans titre — similaire à la section About/Bio.

## Impression et PDF

??? question "Pourquoi mon PDF est-il différent de l'affichage à l'écran ?"
    L'impression utilise des styles d'impression dédiés, optimisés pour le papier. Certains effets visuels (états de survol, animations, dégradés) sont simplifiés. Les éléments masqués et les contrôles d'administration sont automatiquement supprimés.

??? question "Comment faire tenir mon CV sur moins de pages ?"
    Essayez d'activer **Allow Section Splits** et **Allow Item Splits** dans les paramètres Print & Export. Vous pouvez également masquer les éléments ou sections moins importants, ou utiliser des mises en page de sections personnalisées plus compactes. Vous pouvez aussi ajuster l'échelle d'impression via la fenêtre d'impression de votre navigateur (parfois un peu cachée).

??? question "Pourquoi certains éléments sont-ils absents de mon CV imprimé ?"
    Vérifiez si ces éléments ont été basculés en mode masqué (icône en forme d'œil). Les éléments masqués sont exclus de l'impression et de la vue publique.

??? question "Les numéros de page ne s'affichent pas ?"
    Assurez-vous que **Page Numbers** est activé dans Settings → Print & Export. Certains lecteurs PDF intégrés aux navigateurs peuvent ne pas afficher les numéros de page générés par CSS — essayez de télécharger le PDF et de l'ouvrir dans un lecteur dédié.

## Chronologie

??? question "La chronologie affiche des dates incorrectes / uniquement des années / des dates complètes ?"
    La chronologie dispose de son propre paramètre de date. Accédez à **Settings → Advanced → Timeline: Years Only** pour basculer entre l'affichage des années uniquement et le format de date complet.

??? question "Puis-je ajouter des entrées directement dans la chronologie ?"
    Non. La chronologie est générée automatiquement à partir de vos expériences professionnelles. Ajoutez ou modifiez des expériences et la chronologie se met à jour en conséquence.

??? question "Le drapeau du pays ne s'affiche pas sur la chronologie ?"
    Assurez-vous que le champ **Country Code** de l'expérience contient un code pays ISO à 2 lettres valide (par exemple, `us`, `gb`, `ch`, `de`, `fr`). Les drapeaux sont chargés depuis un CDN externe.

??? question "Que se passe-t-il lorsque j'ai deux emplois en même temps ?"
    La chronologie détecte automatiquement les postes qui se chevauchent et les affiche sous forme de **pistes parallèles**. L'emploi simultané apparaît sur une branche surélevée avec des connecteurs en courbe S indiquant les points de bifurcation et de fusion. Aucune configuration n'est nécessaire — le calcul repose entièrement sur vos dates de début et de fin. Les chevauchements de moins d'un mois sont ignorés (fréquents lors des transitions professionnelles).

??? question "Pourquoi la chronologie affiche-t-elle un logo au lieu du nom de l'entreprise ?"
    Si vous avez téléchargé un logo d'entreprise pour cette expérience, la chronologie affiche l'image du logo au lieu du texte. Si le fichier du logo est manquant, le nom de l'entreprise est affiché à la place. Pour supprimer un logo de la chronologie, modifiez l'expérience et cliquez sur **Remove** dans la section Company Logo.

## Langue et mises à jour

??? question "Comment changer la langue de l'interface d'administration ?"
    Cliquez sur l'**icône de globe** dans la barre d'outils et sélectionnez une langue dans la grille déroulante. Le changement s'applique immédiatement et est conservé entre les sessions.

??? question "Comment vérifier quelle version j'utilise ?"
    Ouvrez **Settings** — le numéro de version est affiché dans le coin inférieur gauche de la fenêtre modale (par exemple, `v1.11.0`).

??? question "Je ne vois pas la bannière de mise à jour alors qu'une nouvelle version est disponible ?"
    La vérification de version est mise en cache pendant 24 heures. Redémarrez votre serveur (ou conteneur Docker) pour vider le cache et forcer une nouvelle vérification. Votre serveur doit également avoir un accès Internet sortant pour atteindre `raw.githubusercontent.com`.

## Jeux de données / CV multiples

??? question "Qu'est-ce que le jeu de données « Default » ?"
    Le jeu de données par défaut est la version de votre CV que les visiteurs voient à l'URL racine (`/`). Lors de la première installation, CV Manager crée automatiquement un jeu de données « Default » à partir de vos données de CV. Vous pouvez changer le jeu de données par défaut à tout moment en utilisant le bouton radio dans la fenêtre Open.

??? question "Mes modifications sont-elles enregistrées automatiquement ?"
    Oui. Chaque modification que vous effectuez dans l'interface d'administration (ajout, modification, suppression, réorganisation, basculement de visibilité) est automatiquement enregistrée dans le jeu de données actif après un court délai. La bannière affiche « Saving… » puis « ✓ Saved » pour confirmer.

??? question "Que se passe-t-il lorsque je « charge » un jeu de données ?"
    Le chargement d'un jeu de données bascule votre copie de travail vers ce jeu de données. Vos modifications précédentes ont déjà été enregistrées automatiquement, donc rien n'est perdu.

??? question "Les visiteurs peuvent-ils voir mes modifications en temps réel ?"
    Non. Le site public affiche le jeu de données par défaut figé, et non vos modifications en cours. Les visiteurs ne voient les changements qu'après que l'enregistrement automatique les a écrits dans le jeu de données par défaut. Si vous modifiez un jeu de données qui n'est pas celui par défaut, les visiteurs ne verront pas ces modifications tant que vous ne l'aurez pas défini comme jeu de données par défaut.

??? question "Les visiteurs peuvent-ils voir mes jeux de données sauvegardés ?"
    Uniquement si vous les rendez publics. Chaque jeu de données dispose d'un bouton bascule dans la fenêtre Open. Lorsqu'il est défini comme public, cette version devient accessible à l'adresse `/v/slug` sur le site public (port 3001). Les jeux de données privés ne sont consultables qu'en aperçu depuis l'interface d'administration.

??? question "Comment partager une version spécifique de mon CV avec quelqu'un ?"
    Ouvrez la fenêtre **Open...**, basculez le jeu de données en mode public, puis cliquez sur l'icône de copie à côté de l'URL du slug. Partagez ce lien — il fonctionne sur le site public sans exposer votre interface d'administration.

??? question "Puis-je avoir plusieurs versions publiques en même temps ?"
    Oui. Vous pouvez rendre publics autant de jeux de données que vous le souhaitez. Chacun obtient sa propre URL (par exemple, `/v/technical-cv-1`, `/v/marketing-cv-2`). La page principale `/` affiche le jeu de données par défaut.

??? question "Puis-je supprimer le jeu de données par défaut ?"
    Non. Le jeu de données actuellement sélectionné comme défaut (via le bouton radio) ne peut pas être supprimé. Définissez d'abord un autre jeu de données comme défaut, puis supprimez l'ancien.

??? question "Les moteurs de recherche indexeront-ils mes URL versionnées ?"
    Par défaut, non — les pages versionnées reçoivent `noindex, nofollow`. Pour autoriser l'indexation, activez **Index Versioned URLs** dans Settings → Advanced.

## Site public et SEO

??? question "Comment partager mon CV ?"
    Partagez l'URL de votre serveur public (port 3001). Si vous avez configuré un domaine avec Cloudflare Tunnel ou un reverse proxy, partagez ce domaine. L'URL racine affiche toujours votre jeu de données par défaut. Vous pouvez également partager des versions spécifiques en utilisant les URL versionnées publiques (voir [Datasets](../guide/datasets.md)).

??? question "Les moteurs de recherche indexeront-ils mon CV ?"
    Par défaut, oui — la page publique principale inclut des balises meta appropriées, un sitemap et un fichier robots.txt. Pour empêcher l'indexation, changez le paramètre **Search Engine Indexing** en « No Index » dans Settings → Advanced. Les URL versionnées publiques (`/v/slug`) ne sont **pas indexées** par défaut ; activez **Index Versioned URLs** si vous souhaitez qu'elles soient explorées.

??? question "Puis-je ajouter Google Analytics à mon CV ?"
    Oui. Collez votre code de suivi dans **Settings → Advanced → Tracking Code**. Il est injecté uniquement sur les pages publiques.

## Docker et infrastructure

??? question "Mes modifications n'apparaissent pas sur le site public ?"
    Le site public affiche le **jeu de données par défaut**, qui est mis à jour automatiquement lorsque vous effectuez des modifications dans l'interface d'administration. Essayez un rafraîchissement forcé (`Ctrl+Shift+R`) sur le site public. Si vous utilisez des conteneurs séparés, assurez-vous qu'ils partagent le même volume de données.

??? question "J'obtiens une erreur « port already in use » ?"
    Modifiez le mappage de port hôte dans votre configuration Docker. Par exemple, mappez vers `3010:3000` et `3011:3001`. Ne modifiez **pas** la variable d'environnement `PUBLIC_PORT` — c'est le port interne du conteneur.

??? question "Comment sauvegarder mes données ?"
    Deux options : utilisez le bouton **Export** dans la barre d'outils d'administration (exporte en JSON), ou sauvegardez le répertoire `data/` qui contient la base de données SQLite et les images téléchargées.

??? question "La photo de profil ne s'affiche pas ?"
    Assurez-vous que l'image a été téléchargée via l'interface d'administration. Le fichier est stocké à l'emplacement `data/uploads/picture.jpeg`. Vérifiez les permissions du fichier si vous utilisez Linux.

# FAQ

## General

??? question "Mes donnees sont-elles stockees sur un serveur externe ?"
    Non. Tout fonctionne localement sur votre serveur. Vos donnees de CV sont stockees dans un fichier de base de donnees SQLite dans le repertoire `/data`.

??? question "Puis-je utiliser CV Manager sans Docker ?"
    Oui. Installez Node.js 18+, executez `npm install` dans le repertoire du projet, puis `node src/server.js`. L'interface d'administration fonctionne sur le port 3000 et le site public sur le port 3001.

??? question "Plusieurs personnes peuvent-elles utiliser la meme instance ?"
    CV Manager est concu comme une application mono-utilisateur. Chaque instance gere le CV d'une seule personne. Pour plusieurs personnes, executez des conteneurs separes.

## Edition

??? question "Comment marquer un poste comme « actuel » ?"
    Laissez le champ **Date de fin** vide. Il s'affichera comme « Actuel » sur le CV.

??? question "Puis-je reorganiser les elements au sein d'une section ?"
    Oui. La plupart des elements prennent en charge la reorganisation par glisser-deposer. L'ordre est enregistre automatiquement.

??? question "Comment ajouter des puces a une experience ?"
    Modifiez l'experience et saisissez les points cles dans le champ **Points forts** — une puce par ligne.

??? question "Comment ajouter un logo d'entreprise ?"
    Modifiez l'experience, faites defiler jusqu'a la section **Logo de l'entreprise** et cliquez sur **Choisir une image** pour telecharger un fichier. Vous pouvez egalement cliquer sur **Utiliser un existant** pour reutiliser un logo deja telecharge. Activez l'option **« Synchroniser le logo pour toutes les experiences [Entreprise] »** pour appliquer le meme logo a toutes les experiences de cette entreprise.

??? question "J'ai accidentellement supprime quelque chose. Puis-je annuler ?"
    Il n'y a pas de fonction d'annulation. Comme les modifications sont automatiquement enregistrees dans le jeu de donnees actif, le changement prend effet immediatement. Si vous disposez d'un export precedent ou d'un jeu de donnees enregistre separement, vous pouvez restaurer a partir de celui-ci. Il est recommande d'exporter regulierement votre CV en tant que sauvegarde.

## Sections personnalisees

??? question "Combien de sections personnalisees puis-je creer ?"
    Il n'y a pas de limite fixe. Creez autant de sections que necessaire.

??? question "Puis-je changer le type de mise en page d'une section personnalisee apres sa creation ?"
    Oui. Modifiez la section et selectionnez une mise en page differente. Notez que certains champs peuvent ne pas etre conserves entre les types de mise en page (par exemple, en passant de cartes a liens sociaux).

??? question "Quelle est la difference entre les mises en page « Puces » et « Texte libre » ?"
    **Puces** affiche chaque ligne sous forme d'element de liste a puces avec un titre de groupe. **Texte libre** affiche du texte brut avec des retours a la ligne preserves et sans titre — similaire a la section A propos / Bio.

## Impression et PDF

??? question "Pourquoi mon PDF est-il different de l'affichage a l'ecran ?"
    La sortie d'impression utilise des styles d'impression dedies optimises pour le papier. Certains effets visuels (etats de survol, animations, degrades) sont simplifies. Les elements masques et les controles d'administration sont automatiquement supprimes.

??? question "Comment faire tenir mon CV en moins de pages ?"
    Essayez d'activer **Autoriser les coupures de section** et **Autoriser les coupures d'element** dans les parametres Impression et export. Vous pouvez egalement masquer les elements ou sections moins importants, ou utiliser des mises en page de sections personnalisees plus compactes. Vous pouvez aussi ajuster l'echelle d'impression via la boite de dialogue d'impression de n'importe quel navigateur (parfois un peu masquee).

??? question "Pourquoi certains elements sont-ils absents de mon CV imprime ?"
    Verifiez si ces elements ont ete bascules en masque (icone oeil). Les elements masques sont exclus de la sortie d'impression et de la vue publique.

??? question "Les numeros de page ne s'affichent pas ?"
    Assurez-vous que **Numeros de page** est active dans Parametres → Impression et export. Certains lecteurs PDF integres aux navigateurs peuvent ne pas afficher les numeros de page generes par CSS — essayez de telecharger le PDF et de l'ouvrir dans un lecteur dedie.

## Chronologie

??? question "La chronologie affiche les mauvaises dates / uniquement les annees / les dates completes ?"
    La chronologie possede son propre parametre de date. Allez dans **Parametres → Avance → Chronologie : Annees uniquement** pour basculer entre l'affichage des annees uniquement et le format de date complet.

??? question "Puis-je ajouter des entrees directement dans la chronologie ?"
    Non. La chronologie est generee automatiquement a partir de vos experiences professionnelles. Ajoutez ou modifiez des experiences et la chronologie se met a jour en consequence.

??? question "Le drapeau du pays ne s'affiche pas sur la chronologie ?"
    Assurez-vous que le champ **Code pays** de l'experience est defini sur un code pays ISO a 2 lettres valide (par exemple, `us`, `gb`, `ch`, `de`, `fr`). Les drapeaux sont charges depuis un CDN externe.

??? question "Que se passe-t-il lorsque j'ai deux emplois en meme temps ?"
    La chronologie detecte automatiquement les postes qui se chevauchent et les affiche sous forme de **pistes paralleles**. L'emploi simultane apparait sur une ligne de branche surelevee avec des connecteurs en courbe S montrant les points de bifurcation et de convergence. Aucune configuration necessaire — c'est entierement base sur vos dates de debut et de fin. Les chevauchements de moins d'un mois sont ignores (courants lors des transitions professionnelles).

??? question "Pourquoi la chronologie affiche-t-elle un logo au lieu du nom de l'entreprise ?"
    Si vous avez telecharge un logo d'entreprise pour cette experience, la chronologie affiche l'image du logo au lieu du texte. Si le fichier du logo est manquant, le nom de l'entreprise est affiche en remplacement. Pour supprimer un logo de la chronologie, modifiez l'experience et cliquez sur **Supprimer** dans la section Logo de l'entreprise.

## Langue et mises a jour

??? question "Comment changer la langue de l'interface d'administration ?"
    Cliquez sur l'**icone globe** dans la barre d'outils et selectionnez une langue dans la grille deroulante. Le changement s'applique immediatement et est conserve entre les sessions.

??? question "Comment verifier quelle version j'utilise ?"
    Ouvrez les **Parametres** — le numero de version est affiche dans le coin inferieur gauche de la fenetre (par exemple, `v1.11.0`).

??? question "Je ne vois pas la banniere de mise a jour alors qu'une nouvelle version est disponible ?"
    La verification de version est mise en cache pendant 24 heures. Redemarrez votre serveur (ou conteneur Docker) pour vider le cache et forcer une nouvelle verification. Votre serveur doit egalement avoir un acces Internet sortant pour atteindre `raw.githubusercontent.com`.

## Jeux de donnees / CV multiples

??? question "Qu'est-ce que le jeu de donnees « Par defaut » ?"
    Le jeu de donnees par defaut est la version de votre CV que les visiteurs voient a votre URL racine (`/`). Lors de la premiere installation, CV Manager cree automatiquement un jeu de donnees « Par defaut » a partir de vos donnees de CV. Vous pouvez changer le jeu de donnees par defaut a tout moment en utilisant le bouton radio dans la fenetre du Gestionnaire CV.

??? question "Mes modifications sont-elles enregistrees automatiquement ?"
    Oui. Chaque modification que vous effectuez dans l'interface d'administration (ajout, modification, suppression, reorganisation, activation/desactivation de la visibilite) est automatiquement enregistree dans le jeu de donnees actif apres un court delai. La banniere affiche « Enregistrement... » puis « ✓ Enregistre » pour confirmer.

??? question "Que se passe-t-il lorsque je « charge » un jeu de donnees ?"
    Le chargement d'un jeu de donnees bascule votre copie de travail vers ce jeu de donnees. Vos modifications precedentes ont deja ete automatiquement enregistrees, donc rien n'est perdu. La langue de l'interface d'administration bascule egalement pour correspondre a la langue du contenu du jeu de donnees.

??? question "Les visiteurs peuvent-ils voir mes modifications en temps reel ?"
    Non. Le site public sert le jeu de donnees par defaut fige, pas vos modifications en cours. Les visiteurs ne voient les changements qu'apres que la sauvegarde automatique les a ecrits dans le jeu de donnees par defaut. Si vous modifiez un jeu de donnees qui n'est pas le jeu par defaut, les visiteurs ne verront pas du tout ces changements tant que vous ne l'aurez pas defini comme jeu par defaut.

??? question "Les visiteurs peuvent-ils voir mes jeux de donnees enregistres ?"
    Uniquement si vous les rendez publics. Chaque jeu de donnees dispose d'une action **Rendre partage** dans le menu ⋮. Lorsqu'il est partage, cette version devient accessible a `/v/slug` sur le site public (port 3001). Les jeux de donnees prives ne sont previsualisables que depuis l'interface d'administration.

??? question "Comment partager une version specifique de mon CV avec quelqu'un ?"
    Ouvrez le **Gestionnaire CV**, utilisez le menu ⋮ sur le jeu de donnees → **Rendre partage**, puis **Copier l'URL**. Partagez ce lien — il fonctionne sur le site public sans exposer votre interface d'administration.

??? question "Puis-je avoir plusieurs versions publiques en meme temps ?"
    Oui. Vous pouvez partager autant de jeux de donnees que vous le souhaitez. Chacun obtient sa propre URL (par exemple, `/v/technical-cv-1`, `/v/marketing-cv-2`). La page principale `/` affiche le jeu de donnees par defaut.

??? question "Puis-je supprimer le jeu de donnees par defaut ?"
    Non. Le jeu de donnees actuellement selectionne comme jeu par defaut (via le bouton radio) ne peut pas etre supprime. Definissez d'abord un autre jeu de donnees comme jeu par defaut, puis supprimez l'ancien.

??? question "Les moteurs de recherche indexeront-ils mes URL versionnees ?"
    Par defaut, non — les pages versionnees recoivent `noindex, nofollow`. Pour permettre l'indexation, activez **Indexer les URL versionnees** dans Parametres → Avance.

## Variantes linguistiques

??? question "Comment creer un CV dans une autre langue ?"
    Ouvrez le **Gestionnaire CV** et cliquez sur **+ Ajouter une langue** dans l'en-tete du groupe du jeu de donnees que vous souhaitez traduire. Selectionnez la langue cible et enregistrez. La nouvelle variante commence comme une copie du contenu existant — basculez ensuite vers celle-ci et traduisez le texte.

??? question "Comment fonctionnent les variantes linguistiques ?"
    Les variantes linguistiques sont des jeux de donnees distincts qui partagent le meme nom et le meme slug d'URL. Elles sont liees par un groupe linguistique — les modifications structurelles (ordre des sections, visibilite, mise en page) se synchronisent automatiquement entre toutes les variantes, tandis que le contenu (texte, titres, descriptions) reste independant.

??? question "Les visiteurs peuvent-ils changer de langue sur le site public ?"
    Oui. Lorsque le jeu de donnees par defaut a des variantes linguistiques, un bouton de changement de langue apparait sur le site public. Les visiteurs peuvent basculer entre les URL `/{lang}` (par exemple, `/`, `/de`, `/fr`). Pour les jeux de donnees partages non par defaut, les variantes linguistiques se trouvent a `/v/slug/{lang}`.

??? question "Que se passe-t-il lorsque je definis une variante linguistique comme jeu par defaut ?"
    Definir une variante linguistique comme jeu par defaut en fait la version principale a `/`. Ses variantes linguistiques deviennent automatiquement accessibles a `/{lang}` sans avoir besoin de les partager individuellement — elles sont implicitement publiques.

## Site public et SEO

??? question "Comment partager mon CV ?"
    Partagez l'URL de votre serveur public (port 3001). Si vous avez configure un domaine avec Cloudflare Tunnel ou un proxy inverse, partagez ce domaine. L'URL racine affiche toujours votre jeu de donnees par defaut. Vous pouvez egalement partager des versions specifiques en utilisant des URL versionnees publiques (voir [Jeux de donnees](../guide/datasets.md)).

??? question "Les moteurs de recherche indexeront-ils mon CV ?"
    Par defaut, oui — la page publique principale inclut les balises meta appropriees, un sitemap et un fichier robots.txt. Pour empecher l'indexation, changez le parametre **Indexation par les moteurs de recherche** sur « Ne pas indexer » dans Parametres → Avance. Les URL versionnees publiques (`/v/slug`) ne sont **pas indexees** par defaut ; activez **Indexer les URL versionnees** si vous souhaitez qu'elles soient explorees.

??? question "Puis-je ajouter Google Analytics a mon CV ?"
    Oui. Collez votre code de suivi dans **Parametres → Avance → Code de suivi**. Il est injecte uniquement sur les pages publiques.

## Docker et infrastructure

??? question "Mes modifications n'apparaissent pas sur le site public ?"
    Le site public sert le **jeu de donnees par defaut**, qui est mis a jour automatiquement lorsque vous effectuez des modifications dans l'interface d'administration. Essayez un rafraichissement force (`Ctrl+Shift+R`) sur le site public. Si vous utilisez des conteneurs separes, assurez-vous qu'ils partagent le meme volume de donnees.

??? question "J'obtiens une erreur « port already in use » ?"
    Modifiez le mappage de port hote dans votre configuration Docker. Par exemple, mappez vers `3010:3000` et `3011:3001`. Ne modifiez **pas** la variable d'environnement `PUBLIC_PORT` — c'est le port interne du conteneur.

??? question "Comment sauvegarder mes donnees ?"
    Deux options : utilisez le bouton **Exporter** dans la barre d'outils d'administration (exporte en JSON), ou sauvegardez le repertoire `data/` qui contient la base de donnees SQLite et les images telechargees.

??? question "La photo de profil ne s'affiche pas ?"
    Assurez-vous que l'image a ete telechargee via l'interface d'administration. Le fichier est stocke a `data/uploads/picture.jpeg`. Verifiez les permissions de fichier si vous utilisez Linux.

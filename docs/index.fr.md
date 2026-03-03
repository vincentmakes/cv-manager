# CV Manager

Un systeme de gestion de CV auto-heberge, deploye via Docker. Creez, personnalisez et partagez des CV professionnels depuis votre propre serveur.

---

## Qu'est-ce que CV Manager ?

CV Manager est une application web qui s'execute sur votre propre serveur via Docker. Elle vous offre deux interfaces :

- **Administration** (port par defaut 3000) — ou vous creez et gerez votre CV
- **Publique** (port par defaut 3001) — une version en lecture seule que vous pouvez partager avec les recruteurs, employeurs ou toute autre personne

Vos donnees sont stockees localement dans une base de donnees SQLite. Rien n'est envoye vers des serveurs externes.

## Fonctionnalites principales

- **7 sections integrees** — A propos, Chronologie, Experience, Certifications, Formation, Competences, Projets
- **Sections personnalisees** — Ajoutez n'importe quel contenu avec 7 types de mise en page (grilles, listes, cartes, liens sociaux, puces, texte libre)
- **Visualisation chronologique** — Generee automatiquement a partir des experiences professionnelles avec prise en charge des emplois simultanes
- **Versions multiples du CV** — Enregistrez des jeux de donnees pour differents publics avec des URL versionnees publiques
- **Personnalisation du theme** — Selecteur de couleur, formats de date, mode clair/sombre
- **Impression et export PDF** — Sortie d'impression optimisee avec numeros de page et decoupage configurables
- **Compatible ATS** — Balisage Schema.org, HTML semantique, bloc de texte ATS masque
- **8 langues d'interface** — anglais, allemand, francais, neerlandais, espagnol, italien, portugais, chinois
- **Import et export** — Sauvegarde et restauration completes en JSON
- **Deploiement Docker** — Installation en une ligne, Docker Compose, prise en charge Unraid

## Liens rapides

<div class="grid cards" markdown>

- :material-rocket-launch: **[Demarrage](getting-started/index.md)** — Installer et configurer CV Manager
- :material-book-open-variant: **[Guide utilisateur](guide/index.md)** — Decouvrir toutes les fonctionnalites
- :material-cog: **[Avance](advanced/index.md)** — SEO, securite et parametres ATS
- :material-frequently-asked-questions: **[FAQ](reference/faq.md)** — Reponses aux questions frequentes

</div>

## Support

- **GitHub** : [github.com/vincentmakes/cv-manager](https://github.com/vincentmakes/cv-manager)
- **Problemes** : [github.com/vincentmakes/cv-manager/issues](https://github.com/vincentmakes/cv-manager/issues)
- **Soutenir le projet** : [ko-fi.com/vincentmakes](https://ko-fi.com/vincentmakes)

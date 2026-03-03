# CV Manager

Un système de gestion de CV auto-hébergé, déployé via Docker. Créez, personnalisez et partagez des CV professionnels depuis votre propre serveur.

---

## Qu'est-ce que CV Manager ?

CV Manager est une application web qui s'exécute sur votre propre serveur via Docker. Elle vous offre deux interfaces :

- **Administration** (port par défaut 3000) — où vous créez et gérez votre CV
- **Publique** (port par défaut 3001) — une version en lecture seule que vous pouvez partager avec les recruteurs, employeurs ou toute autre personne

Vos données sont stockées localement dans une base de données SQLite. Rien n'est envoyé vers des serveurs externes.

## Fonctionnalités principales

- **7 sections intégrées** — À propos, Chronologie, Expérience, Certifications, Formation, Compétences, Projets
- **Sections personnalisées** — Ajoutez n'importe quel contenu avec 7 types de mise en page (grilles, listes, cartes, liens sociaux, puces, texte libre)
- **Visualisation chronologique** — Générée automatiquement à partir des expériences professionnelles avec prise en charge des emplois simultanés
- **Versions multiples du CV** — Enregistrez des jeux de données pour différents publics avec des URL versionnées publiques
- **Personnalisation du thème** — Sélecteur de couleur, formats de date, mode clair/sombre
- **Impression et export PDF** — Sortie d'impression optimisée avec numéros de page et découpage configurables
- **Compatible ATS** — Balisage Schema.org, HTML sémantique, bloc de texte ATS masqué
- **8 langues d'interface** — anglais, allemand, français, néerlandais, espagnol, italien, portugais, chinois
- **Import et export** — Sauvegarde et restauration complètes en JSON
- **Déploiement Docker** — Installation en une ligne, Docker Compose, prise en charge Unraid

## Liens rapides

<div class="grid cards" markdown>

- :material-rocket-launch: **[Démarrage](getting-started/index.md)** — Installer et configurer CV Manager
- :material-book-open-variant: **[Guide utilisateur](guide/index.md)** — Découvrir toutes les fonctionnalités
- :material-cog: **[Avancé](advanced/index.md)** — SEO, sécurité et paramètres ATS
- :material-frequently-asked-questions: **[FAQ](reference/faq.md)** — Réponses aux questions fréquentes

</div>

## Support

- **GitHub** : [github.com/vincentmakes/cv-manager](https://github.com/vincentmakes/cv-manager)
- **Problèmes** : [github.com/vincentmakes/cv-manager/issues](https://github.com/vincentmakes/cv-manager/issues)
- **Soutenir le projet** : [ko-fi.com/vincentmakes](https://ko-fi.com/vincentmakes)

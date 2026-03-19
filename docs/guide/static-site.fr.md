# Export site statique

Exportez votre CV sous forme de site web entièrement statique, hébergeable gratuitement sur GitHub Pages, Cloudflare Pages, Netlify ou tout autre hébergeur de fichiers statiques. Aucun serveur requis.

## Comment exporter

1. Ouvrez **Paramètres → Impression et export**
2. Faites défiler jusqu'à **Export site statique**
3. Cliquez sur **Télécharger le ZIP**

Le fichier ZIP contient tout ce qui est nécessaire pour faire fonctionner votre CV comme un site web autonome :

- `index.html` — La page de votre CV avec les balises méta et les données SEO préremplies
- `data.json` — Toutes vos données CV (profil, expériences, formations, compétences, etc.)
- `shared/` — Fichiers CSS, JavaScript et de traduction
- `uploads/` — Votre photo de profil et les logos d'entreprises
- Fichiers favicon

## Contenu de l'export

L'export statique contient tout ce qui est visible sur votre CV public :

- Toutes les sections et leur ordre
- Votre couleur de thème et vos paramètres
- Photo de profil et logos d'entreprises
- Toutes les traductions (i18n) pour la langue sélectionnée
- Code de suivi/analytique (si configuré)
- Balises méta SEO et données Open Graph

Les données sensibles (e-mail, téléphone) ne sont **pas** incluses dans l'export.

## Déployer sur GitHub Pages

### Option 1 : Via l'interface GitHub (sans Git)

1. Créez un nouveau dépôt sur [github.com/new](https://github.com/new)
2. Nommez-le `votrenom.github.io` pour un site racine, ou n'importe quel nom pour un site de projet
3. Extrayez le fichier ZIP téléchargé sur votre ordinateur
4. Cliquez sur **Add file → Upload files** dans le dépôt
5. Faites glisser tous les fichiers extraits dans la zone de dépôt et validez
6. Allez dans **Settings → Pages**
7. Sous **Source**, sélectionnez **Deploy from a branch**
8. Sélectionnez la branche **main** et le dossier **/ (root)**, puis cliquez sur **Save**
9. Votre CV sera en ligne à l'adresse `https://votrenom.github.io` en quelques minutes

### Option 2 : Via Git

```bash
# Créer un nouveau dépôt
mkdir my-cv && cd my-cv
git init

# Extraire le contenu du ZIP dans ce répertoire
unzip /path/to/Your_Name_static_site.zip

# Pousser vers GitHub
git add .
git commit -m "Deploy CV static site"
git branch -M main
git remote add origin https://github.com/votrenom/votrenom.github.io.git
git push -u origin main
```

Activez ensuite GitHub Pages dans les paramètres du dépôt comme décrit ci-dessus.

### Domaine personnalisé

Pour utiliser un domaine personnalisé (par ex. `cv.votredomaine.com`) :

1. Dans votre dépôt, allez dans **Settings → Pages → Custom domain**
2. Saisissez votre domaine et cliquez sur **Save**
3. Ajoutez un enregistrement CNAME chez votre fournisseur DNS pointant vers `votrenom.github.io`

!!! tip
    Cochez **Enforce HTTPS** dans les paramètres Pages pour obtenir un certificat SSL gratuit.

## Déployer sur Cloudflare Pages

1. Poussez les fichiers de votre site statique vers un dépôt GitHub ou GitLab (voir les étapes Git ci-dessus)
2. Connectez-vous au [tableau de bord Cloudflare](https://dash.cloudflare.com)
3. Allez dans **Workers & Pages → Create → Pages → Connect to Git**
4. Sélectionnez votre dépôt
5. Configurez les paramètres de build :
    - **Build command** : laissez vide (aucune étape de build nécessaire)
    - **Build output directory** : `/` (racine)
6. Cliquez sur **Save and Deploy**

Votre CV sera en ligne à l'adresse `https://votre-projet.pages.dev` en moins d'une minute.

### Dépôt direct (sans Git)

1. Allez dans **Workers & Pages → Create → Pages → Upload assets**
2. Nommez votre projet
3. Extrayez le ZIP et faites glisser le contenu du dossier dans la zone de dépôt
4. Cliquez sur **Deploy**

### Domaine personnalisé sur Cloudflare

1. Dans votre projet Pages, allez dans **Custom domains**
2. Cliquez sur **Set up a custom domain**
3. Saisissez votre domaine — Cloudflare gère le DNS automatiquement si le domaine est sur Cloudflare

## Déployer sur Netlify

1. Rendez-vous sur [app.netlify.com](https://app.netlify.com)
2. Glissez-déposez le dossier ZIP extrait dans la zone de déploiement
3. Votre site est instantanément en ligne à une URL `*.netlify.app`

## Mettre à jour votre site statique

Chaque fois que vous mettez à jour votre CV, exportez à nouveau le site statique et re-téléversez les fichiers. La procédure écrase la version précédente.

!!! tip
    Pour un flux de travail optimal avec GitHub Pages ou Cloudflare Pages, conservez un clone Git local et remplacez simplement les fichiers avant de pousser :
    ```bash
    # Dans votre dépôt de site statique
    rm -rf shared uploads *.html *.json *.png *.ico
    unzip /path/to/new-export.zip
    git add -A && git commit -m "Update CV" && git push
    ```

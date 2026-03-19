# Static Site Export

Export your CV as a fully static website that can be hosted for free on GitHub Pages, Cloudflare Pages, Netlify, or any static file hosting provider. No server required.

## How to Export

1. Open **Settings → Print & Export**
2. Scroll to **Static Site Export**
3. Click **Download ZIP**

The ZIP file contains everything needed to run your CV as a standalone website:

- `index.html` — Your CV page with pre-filled meta tags and SEO data
- `data.json` — All your CV data (profile, experiences, education, skills, etc.)
- `shared/` — CSS, JavaScript, and translation files
- `uploads/` — Your profile picture and company logos
- Favicon files

## What's Included

The static export contains everything visible on your public CV:

- All sections and their ordering
- Your theme color and settings
- Profile picture and company logos
- All translations (i18n) for the selected language
- Tracking/analytics code (if configured)
- SEO meta tags and Open Graph data

Sensitive data (email, phone) is **not** included in the export.

## Deploy to GitHub Pages

### Option 1: Using GitHub UI (no Git required)

1. Create a new repository on [github.com/new](https://github.com/new)
2. Name it `yourusername.github.io` for a root site, or any name for a project site
3. Extract the downloaded ZIP file on your computer
4. Click **Add file → Upload files** in the repository
5. Drag all extracted files into the upload area and commit
6. Go to **Settings → Pages**
7. Under **Source**, select **Deploy from a branch**
8. Select the **main** branch and **/ (root)** folder, then click **Save**
9. Your CV will be live at `https://yourusername.github.io` within a few minutes

### Option 2: Using Git

```bash
# Create a new repository
mkdir my-cv && cd my-cv
git init

# Extract the ZIP contents into this directory
unzip /path/to/Your_Name_static_site.zip

# Push to GitHub
git add .
git commit -m "Deploy CV static site"
git branch -M main
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

Then enable GitHub Pages in the repository settings as described above.

### Custom Domain

To use a custom domain (e.g., `cv.yourdomain.com`):

1. In your repository, go to **Settings → Pages → Custom domain**
2. Enter your domain and click **Save**
3. Add a CNAME record at your DNS provider pointing to `yourusername.github.io`

!!! tip
    Check **Enforce HTTPS** in the Pages settings for a free SSL certificate.

## Deploy to Cloudflare Pages

1. Push your static site files to a GitHub or GitLab repository (see Git steps above)
2. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com)
3. Go to **Workers & Pages → Create → Pages → Connect to Git**
4. Select your repository
5. Configure the build settings:
    - **Build command**: leave empty (no build step needed)
    - **Build output directory**: `/` (root)
6. Click **Save and Deploy**

Your CV will be live at `https://your-project.pages.dev` within a minute.

### Direct Upload (no Git required)

1. Go to **Workers & Pages → Create → Pages → Upload assets**
2. Name your project
3. Extract the ZIP and drag the folder contents into the upload area
4. Click **Deploy**

### Custom Domain on Cloudflare

1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain — Cloudflare handles DNS automatically if the domain is on Cloudflare

## Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag and drop your extracted ZIP folder onto the deploy area
3. Your site is live instantly at a `*.netlify.app` URL

## Updating Your Static Site

Each time you update your CV, re-export the static site and re-upload the files. The process overwrites the previous version.

!!! tip
    For the fastest workflow with GitHub Pages or Cloudflare Pages, keep a local Git clone and simply replace the files and push:
    ```bash
    # In your static site repo
    rm -rf shared uploads *.html *.json *.png *.ico
    unzip /path/to/new-export.zip
    git add -A && git commit -m "Update CV" && git push
    ```

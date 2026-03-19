# Statische site exporteren

Exporteer je cv als een volledig statische website die gratis gehost kan worden op GitHub Pages, Cloudflare Pages, Netlify, of elke andere aanbieder van statische bestandshosting. Geen server vereist.

## Hoe te exporteren

1. Open **Instellingen → Afdrukken & Export**
2. Scroll naar **Statische site exporteren**
3. Klik op **ZIP downloaden**

Het ZIP-bestand bevat alles wat nodig is om je cv als zelfstandige website te draaien:

- `index.html` — Je cv-pagina met vooraf ingevulde metatags en SEO-data
- `data.json` — Al je cv-gegevens (profiel, ervaringen, opleiding, vaardigheden, enz.)
- `shared/` — CSS-, JavaScript- en vertaalbestanden
- `uploads/` — Je profielfoto en bedrijfslogo's
- Faviconbestanden

## Wat is inbegrepen

De statische export bevat alles wat zichtbaar is op je openbare cv:

- Alle secties en hun volgorde
- Je themakleur en instellingen
- Profielfoto en bedrijfslogo's
- Alle vertalingen (i18n) voor de geselecteerde taal
- Tracking-/analysecode (indien geconfigureerd)
- SEO-metatags en Open Graph-gegevens

Gevoelige gegevens (e-mail, telefoonnummer) zijn **niet** opgenomen in de export.

## Implementeren op GitHub Pages

### Optie 1: Via de GitHub-interface (geen Git vereist)

1. Maak een nieuwe repository aan op [github.com/new](https://github.com/new)
2. Geef hem de naam `jouwnaam.github.io` voor een rootsite, of een willekeurige naam voor een projectsite
3. Pak het gedownloade ZIP-bestand uit op je computer
4. Klik op **Bestand toevoegen → Bestanden uploaden** in de repository
5. Sleep alle uitgepakte bestanden naar het uploadgebied en commit
6. Ga naar **Instellingen → Pages**
7. Selecteer onder **Bron** de optie **Implementeren vanuit een branch**
8. Selecteer de **main**-branch en de map **/ (root)**, klik vervolgens op **Opslaan**
9. Je cv is binnen enkele minuten beschikbaar op `https://jouwnaam.github.io`

### Optie 2: Met Git

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
git remote add origin https://github.com/jouwnaam/jouwnaam.github.io.git
git push -u origin main
```

Schakel daarna GitHub Pages in via de repository-instellingen zoals hierboven beschreven.

### Aangepast domein

Om een aangepast domein te gebruiken (bijv. `cv.jouwdomein.nl`):

1. Ga in je repository naar **Instellingen → Pages → Aangepast domein**
2. Voer je domein in en klik op **Opslaan**
3. Voeg een CNAME-record toe bij je DNS-provider die verwijst naar `jouwnaam.github.io`

!!! tip
    Vink **HTTPS afdwingen** aan in de Pages-instellingen voor een gratis SSL-certificaat.

## Implementeren op Cloudflare Pages

1. Push je statische sitebestanden naar een GitHub- of GitLab-repository (zie de Git-stappen hierboven)
2. Log in op het [Cloudflare-dashboard](https://dash.cloudflare.com)
3. Ga naar **Workers & Pages → Maken → Pages → Verbinden met Git**
4. Selecteer je repository
5. Stel de buildinstellingen in:
    - **Buildopdracht**: leeg laten (geen buildstap vereist)
    - **Builduitvoermap**: `/` (root)
6. Klik op **Opslaan en implementeren**

Je cv is binnen een minuut beschikbaar op `https://jouw-project.pages.dev`.

### Directe upload (geen Git vereist)

1. Ga naar **Workers & Pages → Maken → Pages → Assets uploaden**
2. Geef je project een naam
3. Pak het ZIP-bestand uit en sleep de mapinhoud naar het uploadgebied
4. Klik op **Implementeren**

### Aangepast domein op Cloudflare

1. Ga in je Pages-project naar **Aangepaste domeinen**
2. Klik op **Een aangepast domein instellen**
3. Voer je domein in — Cloudflare verwerkt DNS automatisch als het domein op Cloudflare staat

## Implementeren op Netlify

1. Ga naar [app.netlify.com](https://app.netlify.com)
2. Sleep je uitgepakte ZIP-map naar het implementatiegebied
3. Je site is direct beschikbaar op een `*.netlify.app`-URL

## Je statische site bijwerken

Elke keer dat je je cv bijwerkt, exporteer je de statische site opnieuw en upload je de bestanden opnieuw. Het proces overschrijft de vorige versie.

!!! tip
    Voor de snelste workflow met GitHub Pages of Cloudflare Pages: houd een lokale Git-kloon bij en vervang eenvoudig de bestanden en push:
    ```bash
    # In your static site repo
    rm -rf shared uploads *.html *.json *.png *.ico
    unzip /path/to/new-export.zip
    git add -A && git commit -m "Update CV" && git push
    ```

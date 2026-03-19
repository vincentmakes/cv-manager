# Esportazione del sito statico

Esporta il tuo CV come sito web completamente statico, ospitabile gratuitamente su GitHub Pages, Cloudflare Pages, Netlify o qualsiasi altro provider di hosting per file statici. Non è richiesto alcun server.

## Come esportare

1. Apri **Impostazioni → Stampa ed esportazione**
2. Scorri fino a **Esporta sito statico**
3. Fai clic su **Scarica ZIP**

Il file ZIP contiene tutto il necessario per eseguire il tuo CV come sito web autonomo:

- `index.html` — La pagina del tuo CV con metatag e dati SEO precompilati
- `data.json` — Tutti i dati del tuo CV (profilo, esperienze, istruzione, competenze, ecc.)
- `shared/` — File CSS, JavaScript e di traduzione
- `uploads/` — La tua foto profilo e i loghi aziendali
- File favicon

## Cosa è incluso

L'esportazione statica contiene tutto ciò che è visibile nel tuo CV pubblico:

- Tutte le sezioni e il loro ordinamento
- Il colore del tema e le impostazioni
- Foto profilo e loghi aziendali
- Tutte le traduzioni (i18n) per la lingua selezionata
- Codice di tracciamento/analisi (se configurato)
- Metatag SEO e dati Open Graph

I dati sensibili (e-mail, telefono) **non** sono inclusi nell'esportazione.

## Pubblicare su GitHub Pages

### Opzione 1: Tramite l'interfaccia di GitHub (senza Git)

1. Crea un nuovo repository su [github.com/new](https://github.com/new)
2. Chiamalo `tuonome.github.io` per un sito radice, oppure un qualsiasi nome per un sito di progetto
3. Estrai il file ZIP scaricato sul tuo computer
4. Fai clic su **Aggiungi file → Carica file** nel repository
5. Trascina tutti i file estratti nell'area di caricamento e conferma il commit
6. Vai su **Impostazioni → Pages**
7. In **Sorgente**, seleziona **Distribuisci da un branch**
8. Seleziona il branch **main** e la cartella **/ (radice)**, quindi fai clic su **Salva**
9. Il tuo CV sarà disponibile su `https://tuonome.github.io` entro pochi minuti

### Opzione 2: Con Git

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
git remote add origin https://github.com/tuonome/tuonome.github.io.git
git push -u origin main
```

Poi abilita GitHub Pages nelle impostazioni del repository come descritto sopra.

### Dominio personalizzato

Per usare un dominio personalizzato (es. `cv.tuodominio.com`):

1. Nel tuo repository, vai su **Impostazioni → Pages → Dominio personalizzato**
2. Inserisci il tuo dominio e fai clic su **Salva**
3. Aggiungi un record CNAME presso il tuo provider DNS che punti a `tuonome.github.io`

!!! tip
    Attiva **Imponi HTTPS** nelle impostazioni di Pages per ottenere un certificato SSL gratuito.

## Pubblicare su Cloudflare Pages

1. Carica i file del tuo sito statico su un repository GitHub o GitLab (vedi i passaggi Git sopra)
2. Accedi alla [dashboard di Cloudflare](https://dash.cloudflare.com)
3. Vai su **Workers & Pages → Crea → Pages → Connetti a Git**
4. Seleziona il tuo repository
5. Configura le impostazioni di build:
    - **Comando di build**: lascia vuoto (non è necessario alcun passaggio di build)
    - **Directory di output del build**: `/` (radice)
6. Fai clic su **Salva e distribuisci**

Il tuo CV sarà disponibile su `https://tuo-progetto.pages.dev` entro un minuto.

### Caricamento diretto (senza Git)

1. Vai su **Workers & Pages → Crea → Pages → Carica risorse**
2. Assegna un nome al tuo progetto
3. Estrai il file ZIP e trascina il contenuto della cartella nell'area di caricamento
4. Fai clic su **Distribuisci**

### Dominio personalizzato su Cloudflare

1. Nel tuo progetto Pages, vai su **Domini personalizzati**
2. Fai clic su **Configura un dominio personalizzato**
3. Inserisci il tuo dominio — Cloudflare gestisce il DNS automaticamente se il dominio è su Cloudflare

## Pubblicare su Netlify

1. Vai su [app.netlify.com](https://app.netlify.com)
2. Trascina la cartella ZIP estratta nell'area di distribuzione
3. Il tuo sito è immediatamente disponibile a un URL `*.netlify.app`

## Aggiornare il sito statico

Ogni volta che aggiorni il tuo CV, riesporta il sito statico e ricarica i file. Il processo sovrascrive la versione precedente.

!!! tip
    Per il flusso di lavoro più rapido con GitHub Pages o Cloudflare Pages, mantieni un clone Git locale e sostituisci semplicemente i file e fai push:
    ```bash
    # In your static site repo
    rm -rf shared uploads *.html *.json *.png *.ico
    unzip /path/to/new-export.zip
    git add -A && git commit -m "Update CV" && git push
    ```

# Statische Webseite exportieren

Exportieren Sie Ihren Lebenslauf als vollständig statische Webseite, die kostenlos auf GitHub Pages, Cloudflare Pages, Netlify oder einem beliebigen statischen Hosting-Dienst gehostet werden kann. Kein Server erforderlich.

## So exportieren Sie

1. Öffnen Sie **Einstellungen → Drucken & Export**
2. Scrollen Sie zu **Statische Webseite exportieren**
3. Klicken Sie auf **ZIP herunterladen**

Die ZIP-Datei enthält alles, was Sie benötigen, um Ihren Lebenslauf als eigenständige Webseite zu betreiben:

- `index.html` — Ihre Lebenslauf-Seite mit vorausgefüllten Meta-Tags und SEO-Daten
- `data.json` — Alle Ihre Lebenslaufdaten (Profil, Erfahrungen, Ausbildung, Fähigkeiten usw.)
- `shared/` — CSS-, JavaScript- und Übersetzungsdateien
- `uploads/` — Ihr Profilbild und Firmenlogos
- Favicon-Dateien

## Was enthalten ist

Der statische Export enthält alles, was auf Ihrem öffentlichen Lebenslauf sichtbar ist:

- Alle Abschnitte und deren Reihenfolge
- Ihre Designfarbe und Einstellungen
- Profilbild und Firmenlogos
- Alle Übersetzungen (i18n) für die gewählte Sprache
- Tracking-/Analysecode (falls konfiguriert)
- SEO-Meta-Tags und Open-Graph-Daten

Sensible Daten (E-Mail, Telefon) sind **nicht** im Export enthalten.

## Auf GitHub Pages bereitstellen

### Option 1: Über die GitHub-Oberfläche (ohne Git)

1. Erstellen Sie ein neues Repository auf [github.com/new](https://github.com/new)
2. Benennen Sie es `ihrbenutzername.github.io` für eine Root-Seite oder beliebig für eine Projektseite
3. Entpacken Sie die heruntergeladene ZIP-Datei auf Ihrem Computer
4. Klicken Sie im Repository auf **Datei hinzufügen → Dateien hochladen**
5. Ziehen Sie alle entpackten Dateien in den Upload-Bereich und bestätigen Sie den Commit
6. Gehen Sie zu **Einstellungen → Pages**
7. Wählen Sie unter **Quelle** die Option **Von einem Branch bereitstellen**
8. Wählen Sie den Branch **main** und den Ordner **/ (root)**, dann klicken Sie auf **Speichern**
9. Ihr Lebenslauf ist innerhalb weniger Minuten unter `https://ihrbenutzername.github.io` erreichbar

### Option 2: Mit Git

```bash
# Neues Repository anlegen
mkdir my-cv && cd my-cv
git init

# ZIP-Inhalt in dieses Verzeichnis entpacken
unzip /path/to/Your_Name_static_site.zip

# Auf GitHub pushen
git add .
git commit -m "Deploy CV static site"
git branch -M main
git remote add origin https://github.com/ihrbenutzername/ihrbenutzername.github.io.git
git push -u origin main
```

Aktivieren Sie anschließend GitHub Pages in den Repository-Einstellungen wie oben beschrieben.

### Eigene Domain

Um eine eigene Domain zu verwenden (z. B. `cv.ihredomain.com`):

1. Gehen Sie in Ihrem Repository zu **Einstellungen → Pages → Benutzerdefinierte Domain**
2. Geben Sie Ihre Domain ein und klicken Sie auf **Speichern**
3. Fügen Sie bei Ihrem DNS-Anbieter einen CNAME-Eintrag hinzu, der auf `ihrbenutzername.github.io` zeigt

!!! tip
    Aktivieren Sie **HTTPS erzwingen** in den Pages-Einstellungen, um ein kostenloses SSL-Zertifikat zu erhalten.

## Auf Cloudflare Pages bereitstellen

1. Pushen Sie Ihre statischen Dateien in ein GitHub- oder GitLab-Repository (siehe Git-Schritte oben)
2. Melden Sie sich beim [Cloudflare-Dashboard](https://dash.cloudflare.com) an
3. Gehen Sie zu **Workers & Pages → Erstellen → Pages → Mit Git verbinden**
4. Wählen Sie Ihr Repository aus
5. Konfigurieren Sie die Build-Einstellungen:
    - **Build-Befehl**: leer lassen (kein Build-Schritt erforderlich)
    - **Build-Ausgabeverzeichnis**: `/` (root)
6. Klicken Sie auf **Speichern und bereitstellen**

Ihr Lebenslauf ist innerhalb einer Minute unter `https://ihr-projekt.pages.dev` erreichbar.

### Direkter Upload (ohne Git)

1. Gehen Sie zu **Workers & Pages → Erstellen → Pages → Assets hochladen**
2. Benennen Sie Ihr Projekt
3. Entpacken Sie die ZIP-Datei und ziehen Sie den Ordnerinhalt in den Upload-Bereich
4. Klicken Sie auf **Bereitstellen**

### Eigene Domain auf Cloudflare

1. Gehen Sie in Ihrem Pages-Projekt zu **Benutzerdefinierte Domains**
2. Klicken Sie auf **Benutzerdefinierte Domain einrichten**
3. Geben Sie Ihre Domain ein — Cloudflare verwaltet DNS automatisch, wenn die Domain bei Cloudflare liegt

## Auf Netlify bereitstellen

1. Gehen Sie zu [app.netlify.com](https://app.netlify.com)
2. Ziehen Sie Ihren entpackten ZIP-Ordner per Drag-and-drop in den Bereitstellungsbereich
3. Ihre Seite ist sofort unter einer `*.netlify.app`-URL erreichbar

## Ihre statische Webseite aktualisieren

Jedes Mal, wenn Sie Ihren Lebenslauf aktualisieren, exportieren Sie die statische Seite erneut und laden die Dateien neu hoch. Dieser Vorgang überschreibt die vorherige Version.

!!! tip
    Für den schnellsten Workflow mit GitHub Pages oder Cloudflare Pages empfiehlt sich ein lokaler Git-Klon. Ersetzen Sie einfach die Dateien und pushen Sie:
    ```bash
    # Im Verzeichnis Ihres statischen Seiten-Repos
    rm -rf shared uploads *.html *.json *.png *.ico
    unzip /path/to/new-export.zip
    git add -A && git commit -m "Update CV" && git push
    ```

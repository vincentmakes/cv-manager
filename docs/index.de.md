# CV Manager

Ein selbst gehostetes, Docker-basiertes System zur Verwaltung von Lebensläufen. Erstellen, anpassen und teilen Sie professionelle Lebensläufe von Ihrem eigenen Server.

---

## Was ist CV Manager?

CV Manager ist eine Webanwendung, die auf Ihrem eigenen Server via Docker läuft. Sie bietet Ihnen zwei Oberflächen:

- **Admin** (Standard-Port 3000) — hier erstellen und verwalten Sie Ihren Lebenslauf
- **Öffentlich** (Standard-Port 3001) — eine schreibgeschützte Version, die Sie mit Personalvermittlern, Arbeitgebern oder anderen teilen können

Ihre Daten werden lokal in einer SQLite-Datenbank gespeichert. Es werden keine Daten an externe Server gesendet.

## Hauptfunktionen

- **7 integrierte Abschnitte** — Über mich, Zeitstrahl, Berufserfahrung, Zertifizierungen, Ausbildung, Fähigkeiten, Projekte
- **Benutzerdefinierte Abschnitte** — Beliebige Inhalte mit 7 Layout-Typen hinzufügen (Raster, Listen, Karten, Social Links, Aufzählungen, Freitext)
- **Zeitstrahl-Visualisierung** — Automatisch aus Berufserfahrungen generiert, mit Unterstützung paralleler Positionen
- **Mehrere Lebenslauf-Versionen** — Datensätze für verschiedene Zielgruppen speichern, mit öffentlichen versionierten URLs
- **Design-Anpassung** — Farbwähler, Datumsformate, Hell-/Dunkelmodus
- **Druck & PDF-Export** — Optimierte Druckausgabe mit konfigurierbaren Seitenzahlen und Seitenumbrüchen
- **ATS-freundlich** — Schema.org-Markup, semantisches HTML, versteckter ATS-Textblock
- **8 Oberflächensprachen** — Englisch, Deutsch, Französisch, Niederländisch, Spanisch, Italienisch, Portugiesisch, Chinesisch
- **Import & Export** — Vollständige JSON-Sicherung und -Wiederherstellung
- **Docker-Bereitstellung** — Installation mit einem Befehl, Docker Compose, Unraid-Unterstützung

## Schnellzugriff

<div class="grid cards" markdown>

- :material-rocket-launch: **[Erste Schritte](getting-started/index.md)** — CV Manager installieren und einrichten
- :material-book-open-variant: **[Benutzerhandbuch](guide/index.md)** — Alle Funktionen kennenlernen
- :material-cog: **[Erweitert](advanced/index.md)** — SEO, Sicherheit und ATS-Einstellungen
- :material-frequently-asked-questions: **[FAQ](reference/faq.md)** — Antworten auf häufige Fragen

</div>

## Unterstützung

- **GitHub**: [github.com/vincentmakes/cv-manager](https://github.com/vincentmakes/cv-manager)
- **Issues**: [github.com/vincentmakes/cv-manager/issues](https://github.com/vincentmakes/cv-manager/issues)
- **Projekt unterstützen**: [ko-fi.com/vincentmakes](https://ko-fi.com/vincentmakes)

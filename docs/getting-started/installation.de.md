# Installation

## Docker Compose (Empfohlen)

```bash
docker-compose up -d --build
```

Dies startet sowohl den Admin-Server (Port 3000) als auch den öffentlichen Server (Port 3001).

## Installation mit einem Befehl

```bash
curl -fsSL https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh | bash
```

## Docker Hub

```bash
docker pull vincentmakes/cv-manager:latest
docker run -d -p 3000:3000 -p 3001:3001 -v cv-data:/app/data vincentmakes/cv-manager:latest
```

## Unraid

Installation über **Community Applications** — suchen Sie nach „cv-manager". Zwei Vorlagen sind verfügbar:

- **cv-manager** (Admin) — auf Port 3000 zugeordnet
- **cv-manager-public** (Öffentlich) — auf Port 3001 zugeordnet, schreibgeschützt

Beide Container teilen sich dasselbe Datenverzeichnis (typischerweise `/mnt/user/appdata/cv-manager`).

## Ihren Lebenslauf mit Cloudflare Tunnel öffentlich machen

1. Richten Sie einen Cloudflare Tunnel ein, der auf Port 3001 (den öffentlichen Server) zeigt
2. Verwenden Sie **Cloudflare Access**, um Port 3000 (Admin) hinter einer Authentifizierung zu schützen
3. Ihr Lebenslauf ist nun unter Ihrer Domain erreichbar, während der Admin-Bereich gesichert bleibt

## Betrieb ohne Docker

Installieren Sie Node.js 18+, führen Sie `npm install` im Projektverzeichnis aus und starten Sie dann `node src/server.js`. Der Admin-Server läuft auf Port 3000 und die öffentliche Seite auf Port 3001.

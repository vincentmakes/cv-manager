# Installatie

## Docker Compose (aanbevolen)

```bash
docker-compose up -d --build
```

Dit start zowel de admin- (poort 3000) als de publieke server (poort 3001).

## Installatie met een enkele opdracht

```bash
curl -fsSL https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh | bash
```

## Docker Hub

```bash
docker pull vincentmakes/cv-manager:latest
docker run -d -p 3000:3000 -p 3001:3001 -v cv-data:/app/data vincentmakes/cv-manager:latest
```

## Unraid

Installeer via **Community Applications** — zoek naar "cv-manager". Er zijn twee templates beschikbaar:

- **cv-manager** (Admin) — gekoppeld aan poort 3000
- **cv-manager-public** (Publiek) — gekoppeld aan poort 3001, alleen-lezen

Beide containers delen dezelfde gegevensdirectory (doorgaans `/mnt/user/appdata/cv-manager`).

## Uw CV openbaar maken met Cloudflare Tunnel

1. Stel een Cloudflare Tunnel in die verwijst naar poort 3001 (de publieke server)
2. Gebruik **Cloudflare Access** om poort 3000 (admin) te beschermen met authenticatie
3. Uw CV is nu bereikbaar op uw domein terwijl de admin beveiligd blijft

## Draaien zonder Docker

Installeer Node.js 18+, voer `npm install` uit in de projectdirectory en voer vervolgens `node src/server.js` uit. De admin draait op poort 3000 en de publieke site op poort 3001.

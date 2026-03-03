# Installation

## Docker Compose (Recommended)

```bash
docker-compose up -d --build
```

This starts both the admin (port 3000) and public (port 3001) servers.

## One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh | bash
```

## Docker Hub

```bash
docker pull vincentmakes/cv-manager:latest
docker run -d -p 3000:3000 -p 3001:3001 -v cv-data:/app/data vincentmakes/cv-manager:latest
```

## Unraid

Install via **Community Applications** — search for "cv-manager". Two templates are available:

- **cv-manager** (Admin) — mapped to port 3000
- **cv-manager-public** (Public) — mapped to port 3001, read-only

Both containers share the same data directory (typically `/mnt/user/appdata/cv-manager`).

## Making Your CV Public with Cloudflare Tunnel

1. Set up a Cloudflare Tunnel pointing to port 3001 (the public server)
2. Use **Cloudflare Access** to protect port 3000 (admin) behind authentication
3. Your CV is now accessible at your domain while the admin stays secured

## Running Without Docker

Install Node.js 18+, run `npm install` in the project directory, then `node src/server.js`. The admin runs on port 3000 and the public site on port 3001.

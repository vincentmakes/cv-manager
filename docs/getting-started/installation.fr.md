# Installation

## Docker Compose (recommandé)

```bash
docker-compose up -d --build
```

Cela démarre le serveur d'administration (port 3000) et le serveur public (port 3001).

## Installation en une ligne

```bash
curl -fsSL https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh | bash
```

## Docker Hub

```bash
docker pull vincentmakes/cv-manager:latest
docker run -d -p 3000:3000 -p 3001:3001 -v cv-data:/app/data vincentmakes/cv-manager:latest
```

## Unraid

Installez via **Community Applications** — recherchez "cv-manager". Deux modèles sont disponibles :

- **cv-manager** (Administration) — mappé sur le port 3000
- **cv-manager-public** (Public) — mappé sur le port 3001, lecture seule

Les deux conteneurs partagent le même répertoire de données (généralement `/mnt/user/appdata/cv-manager`).

## Rendre votre CV public avec Cloudflare Tunnel

1. Configurez un Cloudflare Tunnel pointant vers le port 3001 (le serveur public)
2. Utilisez **Cloudflare Access** pour protéger le port 3000 (administration) derrière une authentification
3. Votre CV est désormais accessible à votre domaine tandis que l'administration reste sécurisée

## Fonctionnement sans Docker

Installez Node.js 18+, exécutez `npm install` dans le répertoire du projet, puis `node src/server.js`. L'administration s'exécute sur le port 3000 et le site public sur le port 3001.

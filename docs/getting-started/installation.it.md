# Installazione

## Docker Compose (Consigliato)

```bash
docker-compose up -d --build
```

Questo avvia sia il server admin (porta 3000) che il server pubblico (porta 3001).

## Installazione con un solo comando

```bash
curl -fsSL https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh | bash
```

## Docker Hub

```bash
docker pull vincentmakes/cv-manager:latest
docker run -d -p 3000:3000 -p 3001:3001 -v cv-data:/app/data vincentmakes/cv-manager:latest
```

## Unraid

Installazione tramite **Community Applications** — cercate "cv-manager". Sono disponibili due template:

- **cv-manager** (Admin) — mappato sulla porta 3000
- **cv-manager-public** (Pubblico) — mappato sulla porta 3001, sola lettura

Entrambi i container condividono la stessa directory dei dati (tipicamente `/mnt/user/appdata/cv-manager`).

## Rendere il CV pubblico con Cloudflare Tunnel

1. Configurate un Cloudflare Tunnel che punti alla porta 3001 (il server pubblico)
2. Utilizzate **Cloudflare Access** per proteggere la porta 3000 (admin) con autenticazione
3. Il CV è ora accessibile sul vostro dominio mentre l'admin resta protetto

## Esecuzione senza Docker

Installate Node.js 18+, eseguite `npm install` nella directory del progetto, quindi `node src/server.js`. L'admin funziona sulla porta 3000 e il sito pubblico sulla porta 3001.

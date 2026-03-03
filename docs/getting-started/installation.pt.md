# Instalação

## Docker Compose (Recomendado)

```bash
docker-compose up -d --build
```

Isso inicia os servidores admin (porta 3000) e público (porta 3001).

## Instalação em Uma Linha

```bash
curl -fsSL https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh | bash
```

## Docker Hub

```bash
docker pull vincentmakes/cv-manager:latest
docker run -d -p 3000:3000 -p 3001:3001 -v cv-data:/app/data vincentmakes/cv-manager:latest
```

## Unraid

Instale via **Community Applications** — pesquise por "cv-manager". Dois templates estão disponíveis:

- **cv-manager** (Admin) — mapeado para a porta 3000
- **cv-manager-public** (Público) — mapeado para a porta 3001, somente leitura

Ambos os containers compartilham o mesmo diretório de dados (normalmente `/mnt/user/appdata/cv-manager`).

## Tornando Seu CV Público com Cloudflare Tunnel

1. Configure um Cloudflare Tunnel apontando para a porta 3001 (o servidor público)
2. Use o **Cloudflare Access** para proteger a porta 3000 (admin) com autenticação
3. Seu CV agora está acessível no seu domínio enquanto o admin permanece protegido

## Executando Sem Docker

Instale o Node.js 18+, execute `npm install` no diretório do projeto e depois `node src/server.js`. O admin roda na porta 3000 e o site público na porta 3001.

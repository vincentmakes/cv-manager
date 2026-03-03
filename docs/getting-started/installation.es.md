# Instalación

## Docker Compose (Recomendado)

```bash
docker-compose up -d --build
```

Esto inicia tanto el servidor de administración (puerto 3000) como el público (puerto 3001).

## Instalación en una línea

```bash
curl -fsSL https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh | bash
```

## Docker Hub

```bash
docker pull vincentmakes/cv-manager:latest
docker run -d -p 3000:3000 -p 3001:3001 -v cv-data:/app/data vincentmakes/cv-manager:latest
```

## Unraid

Instale mediante **Community Applications** — busque "cv-manager". Hay dos plantillas disponibles:

- **cv-manager** (Administración) — mapeado al puerto 3000
- **cv-manager-public** (Público) — mapeado al puerto 3001, solo lectura

Ambos contenedores comparten el mismo directorio de datos (normalmente `/mnt/user/appdata/cv-manager`).

## Hacer público su CV con Cloudflare Tunnel

1. Configure un Cloudflare Tunnel apuntando al puerto 3001 (el servidor público)
2. Use **Cloudflare Access** para proteger el puerto 3000 (administración) con autenticación
3. Su CV ahora es accesible en su dominio mientras la administración permanece protegida

## Ejecución sin Docker

Instale Node.js 18+, ejecute `npm install` en el directorio del proyecto y luego `node src/server.js`. La administración se ejecuta en el puerto 3000 y el sitio público en el puerto 3001.

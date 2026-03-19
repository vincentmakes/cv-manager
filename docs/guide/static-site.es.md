# Exportar sitio estático

Exporta tu CV como un sitio web completamente estático que puede alojarse de forma gratuita en GitHub Pages, Cloudflare Pages, Netlify o cualquier proveedor de alojamiento de archivos estáticos. No se necesita servidor.

## Cómo exportar

1. Abre **Configuración → Imprimir y exportar**
2. Desplázate hasta **Exportar sitio estático**
3. Haz clic en **Descargar ZIP**

El archivo ZIP contiene todo lo necesario para ejecutar tu CV como un sitio web independiente:

- `index.html` — Tu página de CV con metatags y datos SEO preconfigurados
- `data.json` — Todos los datos de tu CV (perfil, experiencias, educación, habilidades, etc.)
- `shared/` — Archivos CSS, JavaScript y de traducción
- `uploads/` — Tu foto de perfil y logotipos de empresas
- Archivos de favicon

## Qué se incluye

La exportación estática contiene todo lo visible en tu CV público:

- Todas las secciones y su orden
- Tu color de tema y configuración
- Foto de perfil y logotipos de empresas
- Todas las traducciones (i18n) para el idioma seleccionado
- Código de seguimiento/analíticas (si está configurado)
- Metatags SEO y datos Open Graph

Los datos sensibles (correo electrónico, teléfono) **no** se incluyen en la exportación.

## Publicar en GitHub Pages

### Opción 1: Usando la interfaz de GitHub (sin Git)

1. Crea un nuevo repositorio en [github.com/new](https://github.com/new)
2. Nómbralo `tunombredeusuario.github.io` para un sitio raíz, o cualquier nombre para un sitio de proyecto
3. Extrae el archivo ZIP descargado en tu computadora
4. Haz clic en **Añadir archivo → Subir archivos** en el repositorio
5. Arrastra todos los archivos extraídos al área de carga y confirma el commit
6. Ve a **Configuración → Pages**
7. En **Fuente**, selecciona **Implementar desde una rama**
8. Selecciona la rama **main** y la carpeta **/ (raíz)**, luego haz clic en **Guardar**
9. Tu CV estará disponible en `https://tunombredeusuario.github.io` en pocos minutos

### Opción 2: Usando Git

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
git remote add origin https://github.com/tunombredeusuario/tunombredeusuario.github.io.git
git push -u origin main
```

Luego activa GitHub Pages en la configuración del repositorio como se describe arriba.

### Dominio personalizado

Para usar un dominio personalizado (p. ej., `cv.tudominio.com`):

1. En tu repositorio, ve a **Configuración → Pages → Dominio personalizado**
2. Introduce tu dominio y haz clic en **Guardar**
3. Añade un registro CNAME en tu proveedor de DNS apuntando a `tunombredeusuario.github.io`

!!! tip
    Activa **Forzar HTTPS** en la configuración de Pages para obtener un certificado SSL gratuito.

## Publicar en Cloudflare Pages

1. Sube los archivos de tu sitio estático a un repositorio de GitHub o GitLab (consulta los pasos de Git anteriores)
2. Inicia sesión en el [panel de Cloudflare](https://dash.cloudflare.com)
3. Ve a **Workers & Pages → Crear → Pages → Conectar a Git**
4. Selecciona tu repositorio
5. Configura los ajustes de compilación:
    - **Comando de compilación**: déjalo vacío (no se necesita paso de compilación)
    - **Directorio de salida de compilación**: `/` (raíz)
6. Haz clic en **Guardar e implementar**

Tu CV estará disponible en `https://tu-proyecto.pages.dev` en menos de un minuto.

### Subida directa (sin Git)

1. Ve a **Workers & Pages → Crear → Pages → Subir recursos**
2. Ponle un nombre a tu proyecto
3. Extrae el ZIP y arrastra el contenido de la carpeta al área de carga
4. Haz clic en **Implementar**

### Dominio personalizado en Cloudflare

1. En tu proyecto de Pages, ve a **Dominios personalizados**
2. Haz clic en **Configurar un dominio personalizado**
3. Introduce tu dominio — Cloudflare gestiona el DNS automáticamente si el dominio está en Cloudflare

## Publicar en Netlify

1. Ve a [app.netlify.com](https://app.netlify.com)
2. Arrastra y suelta la carpeta ZIP extraída en el área de implementación
3. Tu sitio estará disponible al instante en una URL `*.netlify.app`

## Actualizar tu sitio estático

Cada vez que actualices tu CV, vuelve a exportar el sitio estático y sube los archivos de nuevo. El proceso sobrescribe la versión anterior.

!!! tip
    Para el flujo de trabajo más rápido con GitHub Pages o Cloudflare Pages, mantén un clon local de Git y simplemente reemplaza los archivos y haz push:
    ```bash
    # In your static site repo
    rm -rf shared uploads *.html *.json *.png *.ico
    unzip /path/to/new-export.zip
    git add -A && git commit -m "Update CV" && git push
    ```

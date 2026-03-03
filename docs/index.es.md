# CV Manager

Un sistema autohospedado de gestión de CV/currículum, desplegado con Docker. Cree, personalice y comparta currículums profesionales desde su propio servidor.

---

## ¿Qué es CV Manager?

CV Manager es una aplicación web que se ejecuta en su propio servidor mediante Docker. Le ofrece dos interfaces:

- **Administración** (puerto predeterminado 3000) — donde construye y gestiona su CV
- **Pública** (puerto predeterminado 3001) — una versión de solo lectura que puede compartir con reclutadores, empleadores o cualquier persona

Sus datos se almacenan localmente en una base de datos SQLite. No se envía nada a servidores externos.

## Características principales

- **7 secciones integradas** — Acerca de, Línea de tiempo, Experiencia, Certificaciones, Educación, Habilidades, Proyectos
- **Secciones personalizadas** — Agregue cualquier contenido con 7 tipos de diseño (cuadrículas, listas, tarjetas, enlaces sociales, viñetas, texto libre)
- **Visualización de línea de tiempo** — Generada automáticamente a partir de experiencias laborales con soporte para empleos paralelos
- **Múltiples versiones del CV** — Guarde conjuntos de datos para diferentes audiencias con URL públicas versionadas
- **Personalización del tema** — Selector de color, formatos de fecha, modo claro/oscuro
- **Impresión y exportación a PDF** — Salida de impresión optimizada con números de página y división configurables
- **Compatible con ATS** — Marcado Schema.org, HTML semántico, bloque de texto ATS oculto
- **8 idiomas de interfaz** — Inglés, alemán, francés, neerlandés, español, italiano, portugués, chino
- **Importar y exportar** — Respaldo y restauración completa en JSON
- **Despliegue con Docker** — Instalación en una línea, Docker Compose, soporte para Unraid

## Enlaces rápidos

<div class="grid cards" markdown>

- :material-rocket-launch: **[Primeros pasos](getting-started/index.md)** — Instale y configure CV Manager
- :material-book-open-variant: **[Guía del usuario](guide/index.md)** — Aprenda a usar cada función
- :material-cog: **[Avanzado](advanced/index.md)** — SEO, seguridad y configuración ATS
- :material-frequently-asked-questions: **[Preguntas frecuentes](reference/faq.md)** — Respuestas a preguntas comunes

</div>

## Soporte

- **GitHub**: [github.com/vincentmakes/cv-manager](https://github.com/vincentmakes/cv-manager)
- **Problemas**: [github.com/vincentmakes/cv-manager/issues](https://github.com/vincentmakes/cv-manager/issues)
- **Apoyar el proyecto**: [ko-fi.com/vincentmakes](https://ko-fi.com/vincentmakes)

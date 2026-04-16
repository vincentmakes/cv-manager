# Compatibilidad con ATS

## ¿Qué es un ATS?

Un **ATS** (Applicant Tracking System, sistema de seguimiento de candidatos) es un software utilizado por reclutadores y empresas para gestionar las solicitudes de empleo. Cuando sube su CV a un portal de empleo o sitio web de una empresa, un ATS analiza el documento para extraer datos estructurados — su nombre, títulos de puesto, empresas, fechas, habilidades y formación. Estos datos se utilizan luego para la coincidencia de palabras clave, la clasificación y el filtrado de candidatos.

Si el ATS no puede analizar su documento correctamente, su solicitud puede ser descartada o información clave puede perderse — incluso si sus cualificaciones son una coincidencia perfecta.

## Optimización ATS integrada

CV Manager genera automáticamente una salida compatible con ATS en el sitio público:

- **Marcado Schema.org** — datos estructurados que los sistemas ATS pueden analizar (Person, OrganizationRole, EducationalOccupationalCredential, etc.)
- **HTML semántico** — jerarquía de encabezados adecuada, elementos article y listas
- **Bloque ATS oculto** — una versión en texto plano de su CV está incrustada en la página para los analizadores que no procesan HTML con estilos
- **Salida de impresión limpia** — sin desorden visual, jerarquía de contenido adecuada

No se necesita ninguna configuración especial — estas funciones están siempre activas.

## Exportación de documento ATS

Además de la optimización web integrada, CV Manager puede generar un **PDF dedicado compatible con ATS**, diseñado específicamente para subir a portales de empleo y sistemas ATS.

### Cómo usar

1. Haga clic en **Documento ATS** en la barra de herramientas de administración
2. Ajuste el control deslizante de **Escala** para controlar la densidad del contenido (50%–150%)
3. Elija su **Tamaño de papel** preferido (A4 o Letter)
4. Si trabaja en un idioma distinto al inglés, opcionalmente marque **Encabezados de sección en inglés** para mostrar los encabezados de sección (Experiencia laboral, Educación, Habilidades, etc.) en inglés mientras el resto del contenido permanece en el idioma activo
5. Previsualice el documento en el modal
6. Haga clic en **Descargar PDF** para guardar el archivo

### Encabezados de sección en inglés

Cuando su CV está en un idioma distinto al inglés, muchos sistemas ATS aún esperan encabezados de sección en inglés para categorizar correctamente el contenido. La casilla **Encabezados de sección en inglés** (solo visible cuando la configuración regional activa no es inglés) fuerza los encabezados de sección a mostrarse en inglés mientras todo lo demás — fechas, contenido, habilidades — permanece en el idioma activo.

Esto es útil cuando solicita empleo en empresas internacionales o a través de portales de empleo en inglés con un CV escrito en otro idioma.

### Diferencia con Imprimir / PDF

| Característica | Imprimir / PDF | Documento ATS |
|----------------|----------------|---------------|
| **Propósito** | Presentación visual | Análisis automático |
| **Diseño** | Diseño completo con colores, iconos, línea de tiempo | Texto estructurado y limpio, formato mínimo |
| **Contenido** | Todas las secciones visibles incluyendo línea de tiempo | Todas las secciones excepto línea de tiempo (no relevante para ATS) |
| **Control de escala** | Diálogo de impresión del navegador | Control deslizante integrado con vista previa en vivo |
| **Generación** | Motor de impresión del navegador | Del lado del servidor (pdfmake) |
| **Consistencia** | Varía según el navegador | Salida idéntica en todas partes |

### Consejos para el éxito con ATS

!!! tip "Use el documento ATS para solicitudes de empleo"
    Suba siempre el documento ATS (no la versión Imprimir/PDF) al postularse a través de portales de empleo. El diseño estructurado está diseñado para ser analizado correctamente por sistemas automatizados.

!!! tip "Mantenga su sección de habilidades completa"
    Los sistemas ATS dependen en gran medida de la coincidencia de palabras clave. Asegúrese de que su sección de Habilidades contenga todas las tecnologías, herramientas y metodologías relevantes — la exportación ATS las incluye como una lista plana de palabras clave para una mejor coincidencia.

!!! tip "Use Imprimir/PDF para lectores humanos"
    Cuando envíe su CV directamente por correo electrónico a un responsable de contratación o lo lleve a una entrevista, use la versión Imprimir/PDF — tiene el diseño visual completo con los colores de su tema y la línea de tiempo.

!!! tip "Escala para densidad"
    Si su CV es largo, intente reducir la escala al 70–80% para incluir más contenido por página. La vista previa se actualiza en tiempo real para que pueda encontrar el punto óptimo.

!!! tip "Encabezados en inglés para solicitudes internacionales"
    Si el contenido de su CV está en francés, alemán u otro idioma, active la opción de encabezados en inglés cuando solicite empleo en empresas que utilizan sistemas ATS en inglés. La mayoría de los analizadores ATS esperan encabezados de sección en inglés como "Work Experience" y "Education".

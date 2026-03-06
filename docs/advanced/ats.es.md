# Compatibilidad con ATS

## ¿Qué es un ATS?

Un **ATS** (Applicant Tracking System, sistema de seguimiento de candidatos) es un software utilizado por reclutadores y empresas para gestionar las solicitudes de empleo. Cuando subes tu CV a un portal de empleo o sitio web de una empresa, un ATS analiza el documento para extraer datos estructurados — tu nombre, títulos de puesto, empresas, fechas, habilidades y formación. Estos datos se utilizan luego para la coincidencia de palabras clave, la clasificación y el filtrado de candidatos.

Si el ATS no puede analizar tu documento correctamente, tu solicitud puede ser descartada o información clave puede perderse — incluso si tus cualificaciones son una coincidencia perfecta.

## Optimización ATS integrada

CV Manager genera automáticamente una salida compatible con ATS en el sitio público:

- **Marcado Schema.org** — datos estructurados que los sistemas ATS pueden analizar (Person, OrganizationRole, EducationalOccupationalCredential, etc.)
- **HTML semántico** — jerarquía de encabezados adecuada, elementos de artículo y listas
- **Bloque ATS oculto** — una versión en texto plano de su CV está incrustada en la página para los analizadores que no procesan HTML con estilos
- **Salida de impresión limpia** — sin desorden visual, jerarquía de contenido adecuada

No se necesita ninguna configuración especial — estas funciones están siempre activas.

## Exportación de documento ATS

Además de la optimización web integrada, CV Manager puede generar un **PDF dedicado compatible con ATS**, diseñado específicamente para subir a portales de empleo y sistemas ATS.

### Cómo usar

1. Haz clic en **Documento ATS** en la barra de herramientas de administración
2. Ajusta el control deslizante de **Escala** para controlar la densidad del contenido (50%–150%)
3. Elige tu **Tamaño de papel** preferido (A4 o Letter)
4. Previsualiza el documento en el modal
5. Haz clic en **Descargar PDF** para guardar el archivo

### Diferencia con Imprimir / PDF

| Característica | Imprimir / PDF | Documento ATS |
|----------------|----------------|---------------|
| **Propósito** | Presentación visual | Análisis automático |
| **Diseño** | Diseño completo con colores, iconos, línea de tiempo | Texto estructurado y limpio, formato mínimo |
| **Contenido** | Todas las secciones visibles incluyendo línea de tiempo | Todas las secciones excepto línea de tiempo (no relevante para ATS) |
| **Control de escala** | Diálogo de impresión del navegador | Control deslizante integrado con vista previa en vivo |
| **Generación** | Motor de impresión del navegador | Lado del servidor (pdfmake) |
| **Consistencia** | Varía según el navegador | Salida idéntica en todas partes |

### Consejos para el éxito con ATS

!!! tip "Usa el documento ATS para solicitudes de empleo"
    Sube siempre el documento ATS (no la versión Imprimir/PDF) al postularte a través de portales de empleo. El diseño estructurado está diseñado para ser analizado correctamente por sistemas automatizados.

!!! tip "Mantén tu sección de habilidades completa"
    Los sistemas ATS dependen en gran medida de la coincidencia de palabras clave. Asegúrate de que tu sección de Habilidades contenga todas las tecnologías, herramientas y metodologías relevantes — la exportación ATS las incluye como una lista plana de palabras clave para un mejor matching.

!!! tip "Usa Imprimir/PDF para lectores humanos"
    Cuando envíes tu CV directamente por correo electrónico a un responsable de contratación o lo lleves a una entrevista, usa la versión Imprimir/PDF — tiene el diseño visual completo con los colores de tu tema y la línea de tiempo.

!!! tip "Escala para densidad"
    Si tu CV es largo, intenta reducir la escala al 70–80% para incluir más contenido por página. La vista previa se actualiza en tiempo real para que puedas encontrar el punto óptimo.

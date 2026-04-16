# Conjuntos de datos y variantes de idioma

## Cómo funcionan los conjuntos de datos

Los conjuntos de datos son instantáneas guardadas de su CV. Un conjunto de datos siempre es el **predeterminado** — esta es la versión que los visitantes ven en su URL raíz (`/`). Puede crear conjuntos de datos adicionales para diferentes audiencias (por ejemplo, un CV técnico, un CV de gestión), en diferentes idiomas, y compartirlos en sus propias URLs.

Cuando instala CV Manager por primera vez, se crea automáticamente un conjunto de datos "Default" a partir de los datos de su CV. Todas las ediciones que realice en el panel de administración se **guardan automáticamente** en el conjunto de datos activo — no hay un paso separado de "guardar".

## El Gestor de CV

Haga clic en **Gestor de CV** en la barra de herramientas para abrir el modal unificado para todas las operaciones de conjuntos de datos: guardar, cargar, crear versiones, agregar idiomas, establecer valores predeterminados y gestionar la visibilidad.

El modal tiene dos zonas:

- Un **formulario de guardar como** en la parte superior — campo de nombre, selector de idioma y un botón de guardar
- Una **lista de CVs guardados** debajo — agrupados por nombre base, con todas las acciones de gestión

### Guardar un nuevo conjunto de datos

El campo de nombre está prellenado con el nombre del conjunto de datos activo. El menú desplegable de idioma se establece por defecto en el idioma activo.

- **Escriba un nombre nuevo** y haga clic en el botón azul **Guardar como nuevo "..."** para crear un conjunto de datos completamente nuevo
- **Haga clic en una fila existente** en la lista para rellenar el campo de nombre — el botón cambia al botón naranja **Sobrescribir "..."** (con confirmación)

### Lista de conjuntos de datos

Cada CV guardado aparece como un **grupo** con un encabezado que muestra el nombre base, un botón **+ Nueva versión** y una insignia con el recuento de versiones/idiomas.

Dentro de cada grupo, cada variante de idioma es una fila:

```
○  ES  v2  Full Stack Developer v2     /v/full-stack-dev/es   16/04/2026   [Cargar]  ⋮
```

- **Botón de radio** (○) — seleccione qué conjunto de datos ven los visitantes en `/` (el predeterminado)
- **Insignia de idioma** (ES) — el idioma del contenido de esta variante
- **Insignia de versión** (v2) — se muestra cuando el grupo tiene múltiples versiones
- **Nombre** — el nombre del conjunto de datos
- **URL** — la ruta URL pública (si es compartido o predeterminado)
- **Fecha** — última modificación
- **Cargar** — cambiar a la edición de este conjunto de datos
- **⋮** (menú de desbordamiento) — acciones adicionales

### Menú de desbordamiento (⋮)

El menú de desbordamiento de cada fila contiene:

| Acción | Descripción |
|--------|-------------|
| **Hacer compartido / Hacer privado** | Alternar la visibilidad pública en `/v/slug` (oculto para el predeterminado y sus variantes de idioma) |
| **Cambiar idioma** | Reasignar el código de idioma de este conjunto de datos |
| **Vista previa** | Abrir la versión guardada en una nueva pestaña |
| **Copiar URL** | Copiar la URL pública o de vista previa al portapapeles |
| **Eliminar** | Eliminar permanentemente (deshabilitado para el conjunto de datos predeterminado) |

## Versiones

Los conjuntos de datos que comparten el mismo nombre base se agrupan juntos. Por ejemplo, `Frontend Engineer`, `Frontend Engineer v2` y `Frontend Engineer v3` aparecen como un bloque bajo un encabezado compartido.

### Crear una nueva versión

Haga clic en **+ Nueva versión** en el encabezado del grupo. El campo de nombre se rellena automáticamente con el siguiente número de versión (por ejemplo, `Frontend Engineer v4`). Al guardar, la nueva versión:

- Obtiene una insignia de versión adecuada (v4)
- Comparte el mismo slug de URL que sus versiones hermanas
- Hereda todas las variantes de idioma de la versión anterior

### Versiones anteriores colapsables

Cuando un grupo tiene múltiples versiones, solo se muestra la más reciente. Un botón **"N versiones anteriores"** le permite expandir para ver todas las versiones. Si el conjunto de datos que está editando o el predeterminado está en una versión anterior, se expande automáticamente para que siempre pueda verlo.

!!! tip
    Use la convención de nombres `Base vN` (por ejemplo, `Frontend Engineer`, `Frontend Engineer v2`) para obtener agrupación automática de versiones y sugerencias de la siguiente versión.

## Variantes de idioma

Cada versión de un conjunto de datos puede tener múltiples variantes de idioma — por ejemplo, una versión en inglés y una en alemán del mismo CV, compartiendo la misma estructura pero con contenido independiente.

### Agregar una variante de idioma

1. Abra el **Gestor de CV**
2. Haga clic en **+ Agregar idioma** en el encabezado del grupo (o use el flujo **⋮ → Agregar idioma** desde el formulario de guardar como)
3. Seleccione el idioma de destino y guarde

La nueva variante comienza como una copia del contenido existente. La interfaz de administración cambia automáticamente al nuevo idioma para que pueda comenzar a traducir.

### Cambiar de idioma

Cuando edita un conjunto de datos que tiene variantes de idioma, aparece un **selector de idioma** en el banner del conjunto de datos activo debajo de la barra de herramientas. Haga clic en un código de idioma para cambiar — su trabajo actual se guarda automáticamente primero, luego se carga la otra variante y la configuración regional de la interfaz cambia para coincidir.

### Sincronización estructural

Los cambios en la **estructura** — orden de secciones, visibilidad, diseño de secciones personalizadas y número de elementos — se propagan automáticamente a todas las variantes de idioma. El **contenido** (texto, títulos, descripciones) permanece independiente por idioma, para que pueda traducir libremente sin preocuparse por desajustes en el diseño.

### Cambiar el idioma de un conjunto de datos

Haga clic en la **insignia de idioma** en cualquier fila para abrir un selector y reasignar su código de idioma. Esto es útil para conjuntos de datos antiguos que quedaron configurados en inglés durante la instalación inicial.

## Establecer el predeterminado

El conjunto de datos predeterminado es la versión que los visitantes ven en su URL raíz (`/`). Para cambiarlo:

1. Abra el **Gestor de CV**
2. Haga clic en el **botón de radio** (○) junto al conjunto de datos que desea como predeterminado
3. El cambio surte efecto inmediatamente

Las variantes de idioma del predeterminado son automáticamente accesibles en `/{idioma}` (por ejemplo, `/de`, `/fr`) — no necesitan un interruptor de publicación separado.

!!! note
    El sitio público sirve el conjunto de datos predeterminado guardado, no sus ediciones en vivo. Puede experimentar con seguridad en el panel de administración sin afectar lo que ven los visitantes.

## URLs públicas versionadas

Los conjuntos de datos no predeterminados pueden compartirse en sus propias URLs. Use la acción **⋮ → Hacer compartido** para hacer público un conjunto de datos en `/v/slug`. Múltiples conjuntos de datos pueden ser públicos simultáneamente.

- **Conjunto de datos predeterminado**: se sirve en `/`
- **Variantes de idioma del predeterminado**: se sirven en `/{idioma}` (por ejemplo, `/fr`)
- **Conjuntos de datos compartidos**: se sirven en `/v/slug` o `/v/slug/{idioma}`
- **Conjuntos de datos privados**: solo se pueden previsualizar desde el panel de administración

!!! tip "Copiar URLs"
    Haga clic en la ruta URL mostrada en cada fila para copiar la URL pública completa a su portapapeles.

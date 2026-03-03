# Conjuntos de datos (Múltiples versiones del CV)

## Cómo funcionan los conjuntos de datos

Los conjuntos de datos son instantáneas guardadas de su CV. Un conjunto de datos siempre es el **predeterminado** — esta es la versión que los visitantes ven en su URL raíz (`/`). Puede crear conjuntos de datos adicionales para diferentes audiencias (por ejemplo, un CV técnico, un CV de gestión) y compartirlos en sus propias URLs.

Cuando instala CV Manager por primera vez, se crea automáticamente un conjunto de datos "Default" a partir de los datos de su CV. Todas las ediciones que realice en el panel de administración se **guardan automáticamente** en el conjunto de datos activo — no hay un paso separado de "guardar".

## El banner del conjunto de datos activo

Un banner debajo de la barra de herramientas muestra qué conjunto de datos está editando actualmente. Muestra:

- El **nombre del conjunto de datos** (por ejemplo, "Default", "Technical CV")
- Una **insignia "Default"** si este conjunto de datos es el que se sirve en `/`
- Un **estado de autoguardado** — muestra brevemente "Saving…" y luego "✓ Saved" después de cada edición

Cada cambio que realice (agregar elementos, editar contenido, reordenar, alternar visibilidad) se guarda automáticamente en el conjunto de datos activo después de un breve retraso.

## Guardar un nuevo conjunto de datos

Haga clic en **Save As...** en la barra de herramientas, ingrese un nombre (por ejemplo, "Technical CV", "Marketing Role"), y el estado actual de su CV se guardará como una nueva instantánea. El nuevo conjunto de datos se convierte en el activo.

## El modal de apertura

Haga clic en **Open...** para ver todos los conjuntos de datos guardados. Una **leyenda** en la parte superior explica los tres controles:

| Control | Propósito |
|---------|-----------|
| **Botón de radio** | Seleccione qué conjunto de datos se sirve en su URL raíz `/` (el predeterminado) |
| **Interruptor** | Comparta otros conjuntos de datos en su propia URL `/v/slug` |
| **Botón de ojo** | Previsualice un conjunto de datos guardado sin hacerlo público |

Cada fila de conjunto de datos muestra:

- **Nombre** y fecha de última actualización
- **Insignia "Default"** — en el conjunto de datos seleccionado con el botón de radio
- **Insignia "Editing"** — en el conjunto de datos actualmente cargado en el panel de administración
- Una **URL versionada** (por ejemplo, `/v/technical-cv-1`) — oculta para el conjunto de datos predeterminado ya que se sirve en `/`
- Botón **Load** — cambia a este conjunto de datos (muestra "Reload" si ya está activo)
- Botón **Delete** — elimina permanentemente el conjunto de datos (deshabilitado para el predeterminado actual)

## Establecer el conjunto de datos predeterminado

El conjunto de datos predeterminado es la versión que los visitantes ven cuando visitan su URL raíz (`/`). Para cambiarlo:

1. Abra el modal **Open...**
2. Haga clic en el **botón de radio** junto al conjunto de datos que desea como su CV público
3. El cambio surte efecto inmediatamente — el sitio público ahora sirve ese conjunto de datos

Esto desacopla su CV público de su edición. Puede editar contenido libremente en el panel de administración sin que los visitantes vean cambios en progreso hasta que esté listo.

## URLs públicas versionadas

Cada conjunto de datos guardado (aparte del predeterminado) obtiene una ruta URL única (por ejemplo, `/v/technical-cv-1`). Por defecto, estas son **privadas** — solo accesibles desde la interfaz de administración para previsualización.

Para compartir una versión específica públicamente:

1. Abra el modal **Open...**
2. Encuentre el conjunto de datos que desea compartir
3. Active el **interruptor** junto a él — se vuelve azul y aparece una insignia verde **Public**
4. La URL `/v/slug` ahora es accesible en el **sitio público** (puerto 3001)

Esto le permite compartir versiones personalizadas de su CV con diferentes audiencias. Por ejemplo, podría hacer público un "Technical CV" para roles de ingeniería mientras mantiene un "Management CV" privado hasta que lo necesite.

**Copiar la URL**: Haga clic en el ícono de copiar junto al slug para copiar la URL completa a su portapapeles. El mensaje de notificación le indicará si copió una URL pública o solo de previsualización.

!!! note
    La página pública principal en `/` siempre muestra el **conjunto de datos predeterminado** — no sus ediciones en vivo. Esto significa que puede experimentar con seguridad en el panel de administración sin afectar lo que ven los visitantes.

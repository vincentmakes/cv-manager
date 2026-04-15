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

Haz clic en **Guardar como...** en la barra de herramientas para abrir el modal de guardado. Desde aquí puedes crear un conjunto de datos nuevo o sobrescribir uno existente.

El modal tiene dos partes:

- Un **campo de nombre** en la parte superior, precompletado con el nombre del conjunto de datos actualmente activo
- Una lista de **CVs existentes** debajo, con las versiones relacionadas agrupadas visualmente

### Versiones agrupadas

Los conjuntos de datos que comparten el mismo nombre base se muestran juntos. Por ejemplo, `Frontend Engineer`, `Frontend Engineer v2` y `Frontend Engineer v3` aparecen como un único bloque bajo una cabecera compartida — cada versión está etiquetada con una pequeña insignia `v1`/`v2`/`v3`. Los CVs independientes sin versiones hermanas se muestran en una sola fila.

### Haz clic en un CV para sobrescribirlo

Al hacer clic en cualquier fila de la lista, el campo de nombre se rellena con el nombre de ese CV y el botón principal cambia a **Sobrescribir "…"** (naranja). Al hacer clic, se te pedirá que confirmes antes de reemplazar ese CV con tus datos actuales.

### Crear una nueva versión

Cada grupo tiene un atajo **+ Nueva versión** que sugiere el siguiente nombre `vN` disponible — si `Frontend Engineer v3` es la versión más reciente, el atajo rellena el campo con `Frontend Engineer v4`. El botón muestra **Guardar como nuevo "…"** y al enviar se guarda la nueva versión junto a las existentes.

### Escribir un nombre nuevo

Si escribes un nombre que no coincide con ningún CV existente, el botón muestra **Guardar como nuevo "…"** (azul). Al enviar se crea un conjunto de datos completamente nuevo.

!!! tip
    Usa la convención de nombres `Base vN` (por ejemplo, `Frontend Engineer`, `Frontend Engineer v2`) para obtener agrupación automática de versiones y sugerencias de la siguiente versión. Los conjuntos de datos sin sufijo `vN` se tratan como la "v1" de su nombre.

## El modal de apertura

Haga clic en **Open...** para ver todos los conjuntos de datos guardados. Una **leyenda** en la parte superior explica los tres controles:

| Control | Propósito |
|---------|-----------|
| **Botón de radio** | Seleccione qué conjunto de datos se sirve en su URL raíz `/` (el predeterminado) |
| **Interruptor** | Comparta otros conjuntos de datos en su propia URL `/v/slug` |
| **Botón de ojo** | Previsualice un conjunto de datos guardado sin hacerlo público |

Las versiones hermanas de un mismo CV base se muestran **agrupadas**. Una familia como `Frontend Engineer`, `Frontend Engineer v2`, `Frontend Engineer v3` aparece como un solo bloque bajo una cabecera compartida — cada versión está sangrada bajo un conector de árbol y etiquetada con una pequeña insignia `v1` / `v2` / `v3`. Los CVs independientes sin otras versiones siguen mostrándose como una sola fila.

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

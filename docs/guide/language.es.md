# Idioma

## Idioma de la interfaz de administración

Haga clic en el **icono de globo** en la barra de herramientas para cambiar el idioma de la interfaz de administración. Una cuadrícula desplegable muestra todos los idiomas disponibles — haga clic en uno para aplicarlo inmediatamente.

**Idiomas disponibles:** inglés, alemán (Deutsch), francés (Français), neerlandés (Nederlands), español (Español), italiano (Italiano), portugués (Português), chino (中文).

La configuración de idioma solo afecta las etiquetas, botones y menús de la interfaz de administración. Su preferencia se guarda y persiste entre sesiones.

## Idioma del contenido del CV

Independientemente del idioma de la interfaz, cada conjunto de datos guardado tiene su propio **idioma de contenido** — este es el idioma en el que está escrito el contenido del CV. El idioma del contenido se muestra como una insignia (EN, DE, FR, etc.) en cada fila de conjunto de datos en el Gestor de CV.

Cuando carga un conjunto de datos, la interfaz de administración cambia automáticamente para coincidir con su idioma de contenido. Esto significa que si carga un CV en alemán, la interfaz también cambia a alemán, de modo que los encabezados de sección y las etiquetas de formulario estén en el mismo idioma que el contenido que está editando.

### Cambiar el idioma de un conjunto de datos

Para cambiar el idioma asignado a un conjunto de datos existente:

1. Abra el **Gestor de CV**
2. Haga clic en la **insignia de idioma** (por ejemplo, EN) en la fila del conjunto de datos
3. Seleccione el nuevo idioma en el selector

Esto reasigna el código de idioma sin cambiar el contenido en sí — útil para conjuntos de datos que quedaron configurados en inglés durante la instalación inicial.

## Variantes de idioma

Puede crear **múltiples variantes de idioma** del mismo CV. Por ejemplo, mantener una versión en inglés y otra en alemán que compartan la misma estructura pero tengan contenido independiente.

Consulte [Conjuntos de datos y variantes de idioma](datasets.es.md#variantes-de-idioma) para obtener detalles sobre cómo crear y gestionar variantes de idioma.

## Cambio de idioma en el sitio público

Cuando el conjunto de datos predeterminado tiene variantes de idioma, los visitantes pueden cambiar de idioma en el sitio público:

- El **idioma predeterminado** se sirve en `/`
- Otros idiomas están disponibles en `/{idioma}` (por ejemplo, `/de`, `/fr`)
- Un botón de cambio de idioma aparece en el sitio público para que los visitantes puedan alternar entre los idiomas disponibles

Para conjuntos de datos compartidos no predeterminados, las variantes de idioma se sirven en `/v/slug/{idioma}`.

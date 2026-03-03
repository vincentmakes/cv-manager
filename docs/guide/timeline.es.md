# Línea de tiempo

La línea de tiempo se genera automáticamente a partir de sus experiencias laborales. Muestra:

- Logotipos de empresas (o nombres de empresas si no se ha establecido un logotipo)
- Cargos
- Rangos de fechas
- Banderas de países (cuando el país cambia entre experiencias)

## Navegación al hacer clic en la línea de tiempo

Al hacer clic en cualquier elemento de la línea de tiempo, se desplaza hasta la tarjeta de experiencia correspondiente y la resalta brevemente.

## Trabajos paralelos (ramificación de la línea de tiempo)

Cuando dos o más experiencias laborales se superponen en el tiempo, la línea de tiempo puede mostrarlas automáticamente como **pistas paralelas**:

- La posición concurrente se divide en una **pista de rama** sobre la línea de tiempo principal
- **Conectores en curva S** muestran visualmente dónde la rama se bifurca y vuelve a unirse a la pista principal
- Si una posición paralela está en curso (sin fecha de fin), la línea de la rama se extiende hasta el borde derecho de la línea de tiempo
- Las tarjetas de los elementos en la pista de rama se posicionan por separado para evitar superposiciones con las tarjetas de la pista principal

No se necesita configuración — la ramificación es completamente automática basada en las fechas de sus experiencias.

### ¿Cuándo se crea una ramificación?

Se crea una ramificación cuando dos experiencias se superponen durante **3 o más meses**. Este umbral filtra las transiciones breves (comenzar un nuevo trabajo uno o dos meses antes de dejar el anterior) mientras muestra correctamente las posiciones genuinamente simultáneas.

**Excepción para posiciones cortas:** Si una experiencia es muy corta (por ejemplo, un rol interino de 2 meses) y cae completamente dentro del rango de fechas de otra posición, siempre aparecerá en la pista de rama, incluso si su duración es inferior a 3 meses. Lo importante es que toda su duración esté contenida dentro de las fechas de la otra posición.

### ¿Cuándo permanece continua una ramificación?

Si mantiene una posición de larga duración (por ejemplo, un trabajo a tiempo parcial o una actividad secundaria) junto con una serie de posiciones principales sucesivas, la ramificación permanece **continua** — una sola línea paralela a la pista principal. Incluso si una de las posiciones sucesivas es demasiado corta para alcanzar el umbral de superposición, la ramificación no se fusiona y vuelve a bifurcarse mientras la misma posición de larga duración sea el punto de anclaje común.

### ¿Cuándo NO se crea una ramificación?

- **Las superposiciones de 1 a 2 meses** entre dos posiciones largas se tratan como transiciones laborales, no como empleo paralelo. Este es el caso más común: comienza un nuevo rol poco antes de que termine su periodo de preaviso en el anterior.
- **Sin superposición** — las posiciones sucesivas sin superposición de fechas permanecen en la pista principal.
- **Espacio horizontal insuficiente** — si la línea de tiempo está muy comprimida (muchos elementos en un ancho reducido), las ramificaciones que serían demasiado estrechas para mostrarse claramente se aplanan automáticamente a la pista principal.

## Formato de fecha de la línea de tiempo

De forma predeterminada, la línea de tiempo muestra solo los años (por ejemplo, "2020 - 2023"). Puede cambiar esto en **Settings → Advanced → Timeline: Years Only**. Cuando está desactivado, la línea de tiempo utiliza el mismo formato de fecha que el resto de su CV.

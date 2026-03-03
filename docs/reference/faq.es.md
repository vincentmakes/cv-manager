# Preguntas frecuentes

## General

??? question "¿Se almacenan mis datos en algún servidor externo?"
    No. Todo se ejecuta localmente en su servidor. Los datos de su CV se almacenan en un archivo de base de datos SQLite en el directorio `/data`.

??? question "¿Puedo ejecutar CV Manager sin Docker?"
    Sí. Instale Node.js 18+, ejecute `npm install` en el directorio del proyecto y luego `node src/server.js`. El panel de administración se ejecuta en el puerto 3000 y el sitio público en el puerto 3001.

??? question "¿Pueden varias personas usar la misma instancia?"
    CV Manager está diseñado como una aplicación de usuario único. Cada instancia gestiona el CV de una persona. Para varias personas, ejecute contenedores separados.

## Edición

??? question "¿Cómo marco un puesto como 'actual'?"
    Deje el campo **End Date** vacío. Se mostrará como "Present" en el CV.

??? question "¿Puedo reordenar elementos dentro de una sección?"
    Sí. La mayoría de los elementos admiten reordenación mediante arrastrar y soltar. El orden se guarda automáticamente.

??? question "¿Cómo agrego viñetas a una experiencia?"
    Edite la experiencia e ingrese los puntos destacados en el campo **Highlights** — una viñeta por línea.

??? question "¿Cómo agrego un logotipo de empresa?"
    Edite la experiencia, desplácese hasta la sección **Company Logo** y haga clic en **Choose image** para subir una imagen. También puede hacer clic en **Use existing** para reutilizar un logotipo que ya haya subido. Active el interruptor **"Sync logo across all [Company]"** para aplicar el mismo logotipo a todas las experiencias en esa empresa.

??? question "Eliminé algo accidentalmente. ¿Puedo deshacerlo?"
    No hay función de deshacer. Dado que las ediciones se guardan automáticamente en el conjunto de datos activo, el cambio se almacena de inmediato. Si tiene una exportación anterior o un conjunto de datos guardado separado, puede restaurar desde ahí. Se recomienda exportar su CV regularmente como copia de seguridad.

## Secciones personalizadas

??? question "¿Cuántas secciones personalizadas puedo crear?"
    No hay un límite estricto. Cree tantas como necesite.

??? question "¿Puedo cambiar el tipo de diseño de una sección personalizada después de crearla?"
    Sí. Edite la sección y seleccione un diseño diferente. Tenga en cuenta que algunos campos pueden no transferirse entre tipos de diseño (por ejemplo, al cambiar de tarjetas a enlaces sociales).

??? question "¿Cuál es la diferencia entre los diseños 'Bullet Points' y 'Free Text'?"
    **Bullet Points** muestra cada línea como un elemento de lista con viñeta con un título de grupo. **Free Text** muestra texto plano con saltos de línea preservados y sin título — similar a la sección About/Bio.

## Imprimir y PDF

??? question "¿Por qué mi PDF se ve diferente a la pantalla?"
    La salida de impresión utiliza estilos de impresión dedicados optimizados para papel. Algunos efectos visuales (estados de hover, animaciones, degradados) se simplifican. Los elementos ocultos y los controles de administración se eliminan automáticamente.

??? question "¿Cómo hago que mi CV ocupe menos páginas?"
    Intente habilitar **Allow Section Splits** y **Allow Item Splits** en la configuración de Print & Export. También puede ocultar elementos o secciones menos importantes, o usar diseños de secciones personalizadas más compactos. Además, puede ajustar la escala de impresión desde el cuadro de diálogo de impresión del navegador (esta opción a veces no es visible de inmediato).

??? question "¿Por qué faltan algunos elementos en mi CV impreso?"
    Verifique si esos elementos están ocultos (ícono de ojo). Los elementos ocultos se excluyen de la salida de impresión y de la vista pública.

??? question "Los números de página no aparecen"
    Asegúrese de que **Page Numbers** esté habilitado en Settings → Print & Export. Algunos visores de PDF del navegador pueden no mostrar los números de página generados por CSS — intente descargar el PDF y abrirlo en un lector dedicado.

## Línea de tiempo

??? question "La línea de tiempo muestra las fechas incorrectas / solo años / fechas completas"
    La línea de tiempo tiene su propia configuración de fechas. Vaya a **Settings → Advanced → Timeline: Years Only** para alternar entre la visualización de solo años y el formato de fecha completo.

??? question "¿Puedo agregar entradas a la línea de tiempo directamente?"
    No. La línea de tiempo se genera automáticamente a partir de sus experiencias laborales. Agregue o edite experiencias y la línea de tiempo se actualiza en consecuencia.

??? question "La bandera del país no aparece en la línea de tiempo"
    Asegúrese de que el campo **Country Code** en la experiencia esté configurado con un código de país ISO de 2 letras válido (por ejemplo, `us`, `gb`, `ch`, `de`, `fr`). Las banderas se cargan desde un CDN externo.

??? question "¿Qué sucede cuando tengo dos trabajos al mismo tiempo?"
    La línea de tiempo detecta automáticamente posiciones superpuestas y las muestra como **pistas paralelas**. El trabajo concurrente aparece en una línea de rama elevada con conectores en forma de S que muestran los puntos de bifurcación y unión. No se necesita configuración — se basa completamente en sus fechas de inicio/fin. Las superposiciones menores a 1 mes se ignoran (comunes durante las transiciones laborales).

??? question "¿Por qué la línea de tiempo muestra un logotipo en lugar del nombre de la empresa?"
    Si ha subido un logotipo de empresa para esa experiencia, la línea de tiempo muestra la imagen del logotipo en lugar del texto. Si el archivo del logotipo no se encuentra, se recurre al nombre de la empresa. Para eliminar un logotipo de la línea de tiempo, edite la experiencia y haga clic en **Remove** en la sección Company Logo.

## Idioma y actualizaciones

??? question "¿Cómo cambio el idioma del panel de administración?"
    Haga clic en el **ícono de globo** en la barra de herramientas y seleccione un idioma de la cuadrícula desplegable. El cambio se aplica inmediatamente y se guarda entre sesiones.

??? question "¿Cómo verifico qué versión estoy ejecutando?"
    Abra **Settings** — el número de versión se muestra en la esquina inferior izquierda del modal (por ejemplo, `v1.11.0`).

??? question "No veo el banner de actualización aunque hay una nueva versión disponible"
    La verificación de versión se almacena en caché durante 24 horas. Reinicie su servidor (o contenedor Docker) para borrar la caché y forzar una verificación nueva. Su servidor también necesita acceso a Internet saliente para alcanzar `raw.githubusercontent.com`.

## Conjuntos de datos / Múltiples CVs

??? question "¿Qué es el conjunto de datos 'Default'?"
    El conjunto de datos predeterminado es la versión de su CV que los visitantes ven en su URL raíz (`/`). En la primera instalación, CV Manager crea automáticamente un conjunto de datos "Default" a partir de los datos de su CV. Puede cambiar qué conjunto de datos es el predeterminado en cualquier momento usando el botón de radio en el modal Open.

??? question "¿Se guardan mis ediciones automáticamente?"
    Sí. Cada cambio que realice en el panel de administración (agregar, editar, eliminar, reordenar, alternar visibilidad) se guarda automáticamente en el conjunto de datos activo después de un breve retraso. El banner muestra "Saving…" y luego "✓ Saved" para confirmar.

??? question "¿Qué sucede cuando 'cargo' un conjunto de datos?"
    Cargar un conjunto de datos cambia su copia de trabajo a ese conjunto de datos. Sus ediciones anteriores ya se guardaron automáticamente, por lo que no se pierde nada.

??? question "¿Pueden los visitantes ver mis ediciones en tiempo real?"
    No. El sitio público sirve el conjunto de datos predeterminado congelado, no sus ediciones en vivo. Los visitantes solo ven los cambios después de que el autoguardado los escribe en el conjunto de datos predeterminado. Si está editando un conjunto de datos no predeterminado, los visitantes no verán esos cambios en absoluto hasta que lo establezca como predeterminado.

??? question "¿Pueden los visitantes ver mis conjuntos de datos guardados?"
    Solo si los hace públicos. Cada conjunto de datos tiene un interruptor en el modal Open. Cuando se establece como público, esa versión se vuelve accesible en `/v/slug` en el sitio público (puerto 3001). Los conjuntos de datos privados solo se pueden previsualizar desde la interfaz de administración.

??? question "¿Cómo comparto una versión específica de mi CV con alguien?"
    Abra el modal **Open...**, active el conjunto de datos como público, luego haga clic en el ícono de copiar junto a la URL del slug. Comparta ese enlace — funciona en el sitio público sin exponer su interfaz de administración.

??? question "¿Puedo tener múltiples versiones públicas al mismo tiempo?"
    Sí. Puede hacer públicos tantos conjuntos de datos como desee. Cada uno obtiene su propia URL (por ejemplo, `/v/technical-cv-1`, `/v/marketing-cv-2`). La página principal `/` muestra el conjunto de datos predeterminado.

??? question "¿Puedo eliminar el conjunto de datos predeterminado?"
    No. El conjunto de datos actualmente seleccionado como predeterminado (mediante el botón de radio) no se puede eliminar. Establezca primero un conjunto de datos diferente como predeterminado y luego elimine el anterior.

??? question "¿Los motores de búsqueda indexarán mis URLs versionadas?"
    Por defecto, no — las páginas versionadas reciben `noindex, nofollow`. Para permitir la indexación, habilite **Index Versioned URLs** en Settings → Advanced.

## Sitio público y SEO

??? question "¿Cómo comparto mi CV?"
    Comparta la URL de su servidor público (puerto 3001). Si ha configurado un dominio con Cloudflare Tunnel o un proxy inverso, comparta ese dominio. La URL raíz siempre muestra su conjunto de datos predeterminado. También puede compartir versiones específicas usando URLs públicas versionadas (consulte [Conjuntos de datos](../guide/datasets.es.md)).

??? question "¿Los motores de búsqueda indexarán mi CV?"
    Por defecto, sí — la página pública principal incluye meta etiquetas adecuadas, un sitemap y robots.txt. Para evitar la indexación, cambie la configuración de **Search Engine Indexing** a "No Index" en Settings → Advanced. Las URLs públicas versionadas (`/v/slug`) **no se indexan** por defecto; habilite **Index Versioned URLs** si desea que sean rastreadas.

??? question "¿Puedo agregar Google Analytics a mi CV?"
    Sí. Pegue su código de seguimiento en **Settings → Advanced → Tracking Code**. Se inyecta únicamente en las páginas públicas.

## Docker e infraestructura

??? question "Mis cambios no aparecen en el sitio público"
    El sitio público sirve el **conjunto de datos predeterminado**, que se actualiza automáticamente cuando edita en el panel de administración. Intente una recarga forzada (`Ctrl+Shift+R`) en el sitio público. Si ejecuta contenedores separados, asegúrese de que compartan el mismo volumen de datos.

??? question "Recibo un error de 'puerto en uso'"
    Cambie el mapeo de puertos del host en su configuración de Docker. Por ejemplo, mapee a `3010:3000` y `3011:3001`. **No** cambie la variable de entorno `PUBLIC_PORT` — ese es el puerto interno del contenedor.

??? question "¿Cómo hago una copia de seguridad de mis datos?"
    Dos opciones: use el botón **Export** en la barra de herramientas del administrador (exporta JSON), o haga una copia de seguridad del directorio `data/` que contiene la base de datos SQLite y las imágenes subidas.

??? question "La foto de perfil no se muestra"
    Asegúrese de que la imagen fue subida a través de la interfaz de administración. El archivo se almacena en `data/uploads/picture.jpeg`. Verifique los permisos de archivo si ejecuta en Linux.

# Configuración avanzada

## Indexación en motores de búsqueda (Robots Meta)

Controle cómo los motores de búsqueda interactúan con su CV público en **Settings → Advanced → Search Engine Indexing**:

| Opción | Efecto |
|--------|--------|
| **Index, Follow** | El CV aparece en los resultados de búsqueda, los motores de búsqueda siguen sus enlaces (predeterminado) |
| **No Index, Follow** | El CV se oculta de los resultados de búsqueda, pero los enlaces son seguidos |
| **Index, No Follow** | El CV aparece en los resultados de búsqueda, pero los enlaces salientes se ignoran |
| **No Index, No Follow** | Completamente invisible para los motores de búsqueda |

Esta configuración afecta tanto a la etiqueta `<meta name="robots">` como al archivo `/robots.txt`, y se aplica del lado del servidor para compatibilidad con todos los rastreadores de motores de búsqueda.

## Indexación de URLs versionadas

Por defecto, las URLs públicas versionadas (`/v/slug`) **no son indexadas** por los motores de búsqueda — reciben una meta etiqueta `noindex, nofollow`. Esto es útil si desea compartir enlaces directos sin que esas páginas aparezcan en los resultados de búsqueda.

Para permitir que los motores de búsqueda rastreen las URLs versionadas, habilite **Index Versioned URLs** en **Settings → Advanced**. Esta configuración es independiente de la opción principal de indexación en motores de búsqueda mencionada anteriormente, que solo afecta a la página principal `/`.

## Código de seguimiento

Pegue el código de seguimiento de analítica (Google Analytics, Matomo, Plausible, etc.) en **Settings → Advanced → Tracking Code**. El código se inyecta únicamente en las páginas públicas del CV — no en la interfaz de administración.

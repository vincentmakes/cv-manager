# Erweiterte Einstellungen

## Suchmaschinenindexierung (Robots Meta)

Steuern Sie unter **Einstellungen → Erweitert → Suchmaschinenindexierung**, wie Suchmaschinen mit Ihrem öffentlichen Lebenslauf interagieren:

| Option | Wirkung |
|--------|---------|
| **Index, Follow** | Lebenslauf erscheint in Suchergebnissen, Suchmaschinen folgen Ihren Links (Standard) |
| **No Index, Follow** | Lebenslauf wird in Suchergebnissen ausgeblendet, aber Links werden verfolgt |
| **Index, No Follow** | Lebenslauf erscheint in Suchergebnissen, aber ausgehende Links werden ignoriert |
| **No Index, No Follow** | Vollständig unsichtbar für Suchmaschinen |

Diese Einstellung betrifft sowohl das `<meta name="robots">`-Tag als auch die `/robots.txt`-Datei und wird serverseitig angewendet, um die Kompatibilität mit allen Suchmaschinen-Crawlern sicherzustellen.

## Indexierung versionierter URLs

Standardmäßig werden öffentliche versionierte URLs (`/v/slug`) **nicht** von Suchmaschinen indexiert — sie erhalten ein `noindex, nofollow`-Meta-Tag. Dies ist nützlich, wenn Sie direkte Links teilen möchten, ohne dass diese Seiten in Suchergebnissen erscheinen.

Um Suchmaschinen das Crawlen versionierter URLs zu erlauben, aktivieren Sie **Versionierte URLs indexieren** unter **Einstellungen → Erweitert**. Diese Einstellung ist unabhängig von der oben genannten Suchmaschinenindexierungs-Option, die nur die Hauptseite `/` betrifft.

## Tracking-Code

Fügen Sie Analytics-Tracking-Code (Google Analytics, Matomo, Plausible etc.) unter **Einstellungen → Erweitert → Tracking-Code** ein. Der Code wird nur in die öffentlichen Lebenslauf-Seiten eingefügt — nicht in die Admin-Oberfläche.

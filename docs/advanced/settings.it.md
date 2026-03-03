# Impostazioni Avanzate

## Indicizzazione nei Motori di Ricerca (Meta Robots)

Controllate come i motori di ricerca interagiscono con il vostro CV pubblico in **Settings → Advanced → Search Engine Indexing**:

| Opzione | Effetto |
|---------|---------|
| **Index, Follow** | Il CV appare nei risultati di ricerca, i motori di ricerca seguono i vostri link (predefinito) |
| **No Index, Follow** | Il CV è nascosto dai risultati di ricerca, ma i link vengono seguiti |
| **Index, No Follow** | Il CV appare nei risultati di ricerca, ma i link in uscita vengono ignorati |
| **No Index, No Follow** | Completamente invisibile ai motori di ricerca |

Questa impostazione influisce sia sul tag `<meta name="robots">` che sul file `/robots.txt`, e viene applicata lato server per compatibilità con tutti i crawler dei motori di ricerca.

## Indicizzazione degli URL con Versione

Per impostazione predefinita, gli URL pubblici con versione (`/v/slug`) **non vengono indicizzati** dai motori di ricerca — ricevono un meta tag `noindex, nofollow`. Questo è utile se desiderate condividere link diretti senza che quelle pagine appaiano nei risultati di ricerca.

Per consentire ai motori di ricerca di scansionare gli URL con versione, abilitate **Index Versioned URLs** in **Settings → Advanced**. Questa impostazione è indipendente dall'opzione principale di Indicizzazione nei Motori di Ricerca sopra descritta, che influisce solo sulla pagina principale `/`.

## Codice di Tracciamento

Incollate il codice di tracciamento analytics (Google Analytics, Matomo, Plausible, ecc.) in **Settings → Advanced → Tracking Code**. Il codice viene iniettato solo nelle pagine del CV pubblico — non nell'interfaccia di amministrazione.

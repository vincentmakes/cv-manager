# Geavanceerde instellingen

## Zoekmachine-indexering (Robots Meta)

Bepaal hoe zoekmachines omgaan met uw publieke CV via **Settings → Advanced → Search Engine Indexing**:

| Optie | Effect |
|-------|--------|
| **Index, Follow** | CV verschijnt in zoekresultaten, zoekmachines volgen uw links (standaard) |
| **No Index, Follow** | CV is verborgen in zoekresultaten, maar links worden wel gevolgd |
| **Index, No Follow** | CV verschijnt in zoekresultaten, maar uitgaande links worden genegeerd |
| **No Index, No Follow** | Volledig onzichtbaar voor zoekmachines |

Deze instelling beïnvloedt zowel de `<meta name="robots">`-tag als het `/robots.txt`-bestand, en wordt server-side toegepast voor compatibiliteit met alle zoekmachinecrawlers.

## Versie-URL-indexering

Standaard worden openbare versie-URL's (`/v/slug`) **niet geïndexeerd** door zoekmachines — zij krijgen een `noindex, nofollow` meta-tag. Dit is handig als u directe links wilt delen zonder dat die pagina's in zoekresultaten verschijnen.

Om zoekmachines toe te staan versie-URL's te crawlen, schakelt u **Index Versioned URLs** in via **Settings → Advanced**. Deze instelling staat los van de bovenstaande optie voor zoekmachine-indexering, die alleen de hoofd-`/`-pagina beïnvloedt.

## Trackingcode

Plak analytische trackingcode (Google Analytics, Matomo, Plausible, enz.) in **Settings → Advanced → Tracking Code**. De code wordt alleen op de publieke CV-pagina's geïnjecteerd — niet in de beheerinterface.

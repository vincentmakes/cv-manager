# Taal

## Taal van de admin-interface

Klik op het **wereldbolpictogram** in de werkbalk om de taal van de admin-interface te wijzigen. Een uitklapmenu met een raster toont alle beschikbare talen — klik op een taal om deze direct toe te passen.

**Ondersteunde talen:** Engels, Duits (Deutsch), Frans (Français), Nederlands, Spaans (Español), Italiaans (Italiano), Portugees (Português), Chinees (中文).

De taalinstelling is alleen van invloed op de labels, knoppen en menu's van de admin-interface. Uw voorkeur wordt opgeslagen en blijft behouden tussen sessies.

## Taal van de CV-inhoud

Los van de interfacetaal heeft elke opgeslagen dataset een eigen **inhoudstaal** — dit is de taal waarin de CV-inhoud is geschreven. De inhoudstaal wordt weergegeven als een badge (EN, DE, FR, enz.) op elke datasetrij in de CV-beheerder.

Wanneer u een dataset laadt, schakelt de admin-interface automatisch over naar de bijbehorende inhoudstaal. Dit betekent dat wanneer u een Duits CV laadt, de interface ook overschakelt naar Duits, zodat sectiekoppen en formulierlabels in dezelfde taal staan als de inhoud die u bewerkt.

### De taal van een dataset wijzigen

Om de taal te wijzigen die aan een bestaande dataset is toegewezen:

1. Open **CV-beheerder**
2. Klik op de **taalbadge** (bijv. EN) in de datasetrij
3. Selecteer de nieuwe taal in het keuzemenu

Hiermee wordt de taalcode opnieuw toegewezen zonder de inhoud zelf te wijzigen — handig voor datasets die tijdens de eerste installatie standaard op Engels zijn ingesteld.

## Taalvarianten

U kunt **meerdere taalvarianten** van hetzelfde CV aanmaken. Onderhoud bijvoorbeeld een Engelse en een Duitse versie die dezelfde structuur delen maar onafhankelijke inhoud hebben.

Zie [Datasets & Taalvarianten](datasets.nl.md#taalvarianten) voor details over het aanmaken en beheren van taalvarianten.

## Taalwisseling op de openbare site

Wanneer de standaarddataset taalverwanten heeft, kunnen bezoekers op de openbare site van taal wisselen:

- De **standaardtaal** wordt getoond op `/`
- Andere talen zijn beschikbaar op `/{taal}` (bijv. `/de`, `/fr`)
- Een taalwisselaarknop verschijnt op de openbare site waarmee bezoekers kunnen schakelen tussen beschikbare talen

Voor niet-standaard gedeelde datasets worden taalvarianten getoond op `/v/slug/{taal}`.

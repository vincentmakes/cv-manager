# Datasets & Taalvarianten

## Hoe datasets werken

Datasets zijn opgeslagen momentopnames van uw CV. Eén dataset is altijd de **standaard** — dit is de versie die bezoekers zien op uw hoofd-URL (`/`). U kunt extra datasets aanmaken voor verschillende doelgroepen (bijv. een technisch CV, een management-CV), in verschillende talen, en deze delen via hun eigen URL's.

Wanneer u CV Manager voor het eerst installeert, wordt automatisch een "Default"-dataset aangemaakt op basis van uw CV-gegevens. Alle bewerkingen die u in het beheerpaneel maakt, worden **automatisch opgeslagen** naar de actieve dataset — er is geen aparte "opslaan"-stap.

## De CV-beheerder

Klik op **CV-beheerder** in de werkbalk om het gecombineerde venster te openen voor alle datasetbewerkingen: opslaan, laden, versies aanmaken, talen toevoegen, standaardinstellingen wijzigen en zichtbaarheid beheren.

Het venster heeft twee zones:

- Een **opslaan-als-formulier** bovenaan — naamveld, taalkeuze en een opslaanknop
- Een **lijst met opgeslagen CV's** eronder — gegroepeerd op basisnaam, met alle beheeracties

### Een nieuwe dataset opslaan

Het naamveld is vooraf ingevuld met de naam van de actieve dataset. Het taalmenu staat standaard op de actieve taal.

- **Typ een nieuwe naam** en klik op de blauwe knop **Opslaan als nieuw "..."** om een geheel nieuwe dataset aan te maken
- **Klik op een bestaande rij** in de lijst om het naamveld te vullen — de knop verandert in de oranje knop **"..." overschrijven** (met bevestiging)

### Datasetlijst

Elk opgeslagen CV verschijnt als een **groep** met een kop die de basisnaam toont, een knop **+ Nieuwe versie** en een badge met het versie-/talaantal.

Binnen elke groep is elke taalvariant een rij:

```
○  NL  v2  Full Stack Developer v2     /v/full-stack-dev/nl   16/04/2026   [Laden]  ⋮
```

- **Keuzerondje** (○) — selecteer welke dataset bezoekers zien op `/` (de standaard)
- **Taalbadge** (NL) — de inhoudstaal van deze variant
- **Versiebadge** (v2) — wordt getoond wanneer de groep meerdere versies heeft
- **Naam** — de datasetnaam
- **URL** — het openbare URL-pad (indien gedeeld of standaard)
- **Datum** — laatst gewijzigd
- **Laden** — overschakelen naar het bewerken van deze dataset
- **⋮** (overflowmenu) — aanvullende acties

### Overflowmenu (⋮)

Het overflowmenu van elke rij bevat:

| Actie | Beschrijving |
|-------|-------------|
| **Gedeeld maken / Privé maken** | Openbare zichtbaarheid in-/uitschakelen op `/v/slug` (verborgen voor standaard en diens taalverwanten) |
| **Taal wijzigen** | De taalcode van deze dataset opnieuw toewijzen |
| **Voorbeeld bekijken** | De opgeslagen versie openen in een nieuw tabblad |
| **URL kopiëren** | De openbare of voorbeeld-URL naar het klembord kopiëren |
| **Verwijderen** | Permanent verwijderen (uitgeschakeld voor de standaarddataset) |

## Versies

Datasets die dezelfde basisnaam delen, worden samen gegroepeerd. Bijvoorbeeld: `Frontend Engineer`, `Frontend Engineer v2` en `Frontend Engineer v3` verschijnen als één blok onder een gedeelde kop.

### Een nieuwe versie aanmaken

Klik op **+ Nieuwe versie** in de groepskop. Het naamveld wordt automatisch ingevuld met het volgende versienummer (bijv. `Frontend Engineer v4`). Wanneer u opslaat:

- Krijgt de nieuwe versie een versiebadge (v4)
- Deelt deze dezelfde URL-slug als de verwante versies
- Erft deze alle taalvarianten over van de vorige versie

### Inklapbare oudere versies

Wanneer een groep meerdere versies heeft, wordt alleen de nieuwste getoond. Een schakelaar **"N oudere versies"** laat u alle versies uitklappen. Als de dataset die u bewerkt of de standaard zich in een oudere versie bevindt, wordt deze automatisch uitgeklapt zodat u deze altijd kunt zien.

!!! tip
    Gebruik de naamgevingsconventie `Basis vN` (bijv. `Frontend Engineer`, `Frontend Engineer v2`) voor automatische versiegroepering en suggesties voor de volgende versie.

## Taalvarianten

Elke versie van een dataset kan meerdere taalvarianten hebben — bijvoorbeeld een Engelse en een Duitse versie van hetzelfde CV, die dezelfde structuur delen maar onafhankelijke inhoud hebben.

### Een taalvariant toevoegen

1. Open **CV-beheerder**
2. Klik op **+ Taal toevoegen** op de groepskop (of gebruik de **⋮ → Taal toevoegen**-optie vanuit het opslaan-als-formulier)
3. Selecteer de doeltaal en sla op

De nieuwe variant begint als een kopie van de bestaande inhoud. De admin-interface schakelt automatisch over naar de nieuwe taal, zodat u direct kunt beginnen met vertalen.

### Wisselen tussen talen

Wanneer u een dataset bewerkt die taalverwanten heeft, verschijnt een **taalwisselaar** in de banner van de actieve dataset onder de werkbalk. Klik op een taalcode om te wisselen — uw huidige werk wordt eerst automatisch opgeslagen, waarna de andere variant wordt geladen en de UI-taal mee overschakelt.

### Structurele synchronisatie

Wijzigingen aan de **structuur** — sectievolgorde, zichtbaarheid, lay-out van aangepaste secties en aantal items — worden automatisch doorgevoerd naar alle taalverwanten. **Inhoud** (tekst, titels, beschrijvingen) blijft per taal onafhankelijk, zodat u vrij kunt vertalen zonder dat de lay-out uit de pas loopt.

### De taal van een dataset wijzigen

Klik op de **taalbadge** in een rij om een keuzemenu te openen en de taalcode opnieuw toe te wijzen. Dit is handig voor oudere datasets die tijdens de installatie standaard op Engels zijn ingesteld.

## De standaard instellen

De standaarddataset is de versie die bezoekers zien op uw hoofd-URL (`/`). Om deze te wijzigen:

1. Open **CV-beheerder**
2. Klik op het **keuzerondje** (○) naast de dataset die u als standaard wilt instellen
3. De wijziging gaat onmiddellijk in

Taalverwanten van de standaard zijn automatisch toegankelijk op `/{taal}` (bijv. `/de`, `/fr`) — ze hebben geen aparte openbare schakelaar nodig.

!!! note
    De openbare site toont de opgeslagen standaarddataset, niet uw live bewerkingen. U kunt veilig experimenteren in het beheerpaneel zonder dat dit invloed heeft op wat bezoekers zien.

## Openbare versie-URL's

Niet-standaard datasets kunnen worden gedeeld via hun eigen URL's. Gebruik de actie **⋮ → Gedeeld maken** om een dataset openbaar te maken op `/v/slug`. Meerdere datasets kunnen tegelijkertijd openbaar zijn.

- **Standaarddataset**: wordt getoond op `/`
- **Taalverwanten van de standaard**: worden getoond op `/{taal}` (bijv. `/fr`)
- **Gedeelde datasets**: worden getoond op `/v/slug` of `/v/slug/{taal}`
- **Privédatasets**: alleen te bekijken vanuit het beheerpaneel

!!! tip "URL's kopiëren"
    Klik op het URL-pad dat bij elke rij wordt getoond om de volledige openbare URL naar uw klembord te kopiëren.

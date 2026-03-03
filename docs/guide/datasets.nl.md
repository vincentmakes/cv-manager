# Datasets (Meerdere CV-versies)

## Hoe datasets werken

Datasets zijn opgeslagen momentopnames van uw CV. Eén dataset is altijd de **standaard** — dit is de versie die bezoekers zien op uw hoofd-URL (`/`). U kunt extra datasets aanmaken voor verschillende doelgroepen (bijv. een technisch CV, een management-CV) en deze delen via hun eigen URL's.

Wanneer u CV Manager voor het eerst installeert, wordt automatisch een "Default"-dataset aangemaakt op basis van uw CV-gegevens. Alle bewerkingen die u in het beheerpaneel maakt, worden **automatisch opgeslagen** naar de actieve dataset — er is geen aparte "opslaan"-stap.

## De banner van de actieve dataset

Een banner onder de werkbalk toont welke dataset u momenteel bewerkt. Deze toont:

- De **datasetnaam** (bijv. "Default", "Technisch CV")
- Een **"Default"-badge** als deze dataset degene is die op `/` wordt getoond
- Een **automatische opslagstatus** — toont kort "Saving…" en daarna "✓ Saved" na elke bewerking

Elke wijziging die u maakt (items toevoegen, inhoud bewerken, volgorde wijzigen, zichtbaarheid in-/uitschakelen) wordt na een korte vertraging automatisch opgeslagen in de actieve dataset.

## Een nieuwe dataset opslaan

Klik op **Save As...** in de werkbalk, voer een naam in (bijv. "Technisch CV", "Marketing Functie") en uw huidige CV-status wordt opgeslagen als een nieuwe momentopname. De nieuwe dataset wordt de actieve dataset.

## Het open-venster

Klik op **Open...** om alle opgeslagen datasets te bekijken. Een **legenda** bovenaan verklaart de drie besturingselementen:

| Besturingselement | Doel |
|-------------------|------|
| **Keuzerondje** | Selecteer welke dataset op uw hoofd-URL `/` wordt getoond (de standaard) |
| **Schakelaar** | Deel andere datasets via hun eigen `/v/slug`-URL |
| **Oog-knop** | Bekijk een voorvertoning van een opgeslagen dataset zonder deze openbaar te maken |

Elke dataset-rij toont:

- **Naam** en datum van laatste wijziging
- **"Default"-badge** — bij de dataset die met het keuzerondje is geselecteerd
- **"Editing"-badge** — bij de dataset die momenteel in het beheerpaneel is geladen
- Een **versie-URL** (bijv. `/v/technical-cv-1`) — verborgen voor de standaarddataset aangezien deze op `/` wordt getoond
- **Load**-knop — schakelt naar deze dataset (toont "Reload" als deze al actief is)
- **Delete**-knop — verwijdert de dataset permanent (uitgeschakeld voor de huidige standaard)

## De standaarddataset instellen

De standaarddataset is de versie die bezoekers zien wanneer zij uw hoofd-URL (`/`) bezoeken. Om deze te wijzigen:

1. Open het **Open...**-venster
2. Klik op het **keuzerondje** naast de dataset die u als uw openbare CV wilt instellen
3. De wijziging gaat onmiddellijk in — de publieke site toont nu die dataset

Dit ontkoppelt uw openbare CV van uw bewerkingen. U kunt vrij inhoud bewerken in het beheerpaneel zonder dat bezoekers werk-in-uitvoering zien, totdat u er klaar voor bent.

## Openbare versie-URL's

Elke opgeslagen dataset (behalve de standaard) krijgt een uniek URL-pad (bijv. `/v/technical-cv-1`). Standaard zijn deze **privé** — alleen toegankelijk vanuit de beheerinterface voor voorvertoningen.

Om een specifieke versie openbaar te delen:

1. Open het **Open...**-venster
2. Zoek de dataset die u wilt delen
3. Schakel de **schakelaar** ernaast in — deze wordt blauw en er verschijnt een groene **Public**-badge
4. De `/v/slug`-URL is nu toegankelijk op de **publieke site** (poort 3001)

Hiermee kunt u op maat gemaakte CV-versies delen met verschillende doelgroepen. U kunt bijvoorbeeld een "Technisch CV" openbaar maken voor technische functies, terwijl u een "Management-CV" privé houdt totdat dit nodig is.

**URL kopiëren**: Klik op het kopieerpictogram naast de slug om de volledige URL naar uw klembord te kopiëren. De melding geeft aan of u een openbare of alleen-voorvertoning-URL hebt gekopieerd.

!!! note
    De openbare hoofdpagina op `/` toont altijd de **standaarddataset** — niet uw live bewerkingen. Dit betekent dat u veilig kunt experimenteren in het beheerpaneel zonder dat dit invloed heeft op wat bezoekers zien.

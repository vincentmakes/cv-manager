# Veelgestelde Vragen

## Algemeen

??? question "Worden mijn gegevens op een externe server opgeslagen?"
    Nee. Alles draait lokaal op uw server. Uw CV-gegevens worden opgeslagen in een SQLite-databasebestand in de `/data`-map.

??? question "Kan ik CV Manager zonder Docker gebruiken?"
    Ja. Installeer Node.js 18+, voer `npm install` uit in de projectmap en vervolgens `node src/server.js`. Het beheerpaneel draait op poort 3000 en de publieke site op poort 3001.

??? question "Kunnen meerdere personen dezelfde instantie gebruiken?"
    CV Manager is ontworpen als een applicatie voor één gebruiker. Elke instantie beheert het CV van één persoon. Voor meerdere personen kunt u afzonderlijke containers draaien.

## Bewerken

??? question "Hoe markeer ik een functie als 'huidig'?"
    Laat het veld **End Date** leeg. Het wordt op het CV weergegeven als "Present".

??? question "Kan ik items binnen een sectie herschikken?"
    Ja. De meeste items ondersteunen herschikken via slepen en neerzetten. De volgorde wordt automatisch opgeslagen.

??? question "Hoe voeg ik opsommingstekens toe aan een ervaring?"
    Bewerk de ervaring en voer hoogtepunten in het veld **Highlights** in — één opsommingsteken per regel.

??? question "Hoe voeg ik een bedrijfslogo toe?"
    Bewerk de ervaring, scroll naar het gedeelte **Company Logo** en klik op **Choose image** om te uploaden. U kunt ook op **Use existing** klikken om een eerder geüpload logo te hergebruiken. Schakel de optie **"Sync logo across all [Company]"** in om hetzelfde logo toe te passen op alle ervaringen bij dat bedrijf.

??? question "Ik heb per ongeluk iets verwijderd. Kan ik het ongedaan maken?"
    Er is geen ongedaan maken-functie. Omdat bewerkingen automatisch naar de actieve dataset worden opgeslagen, wordt de wijziging onmiddellijk vastgelegd. Als u een eerdere export of een apart opgeslagen dataset hebt, kunt u daarvan herstellen. Het is verstandig om uw CV regelmatig te exporteren als back-up.

## Aangepaste Secties

??? question "Hoeveel aangepaste secties kan ik aanmaken?"
    Er is geen harde limiet. Maak er zoveel aan als u nodig hebt.

??? question "Kan ik het lay-outtype van een aangepaste sectie wijzigen na het aanmaken?"
    Ja. Bewerk de sectie en selecteer een ander lay-outtype. Houd er rekening mee dat sommige velden mogelijk niet worden overgenomen tussen lay-outtypes (bijv. bij het wisselen van kaarten naar sociale links).

??? question "Wat is het verschil tussen de lay-outs 'Bullet Points' en 'Free Text'?"
    **Bullet Points** toont elke regel als een opsommingsitem met een groepstitel. **Free Text** toont platte tekst met behouden regelafbrekingen en zonder titel — vergelijkbaar met de sectie Over/Bio.

## Afdrukken & PDF

??? question "Waarom ziet mijn PDF er anders uit dan het scherm?"
    De afdrukuitvoer gebruikt speciale afdrukstijlen die zijn geoptimaliseerd voor papier. Sommige visuele effecten (hover-statussen, animaties, kleurverlopen) worden vereenvoudigd. Verborgen items en beheerelementen worden automatisch verwijderd.

??? question "Hoe laat ik mijn CV op minder pagina's passen?"
    Probeer **Allow Section Splits** en **Allow Item Splits** in te schakelen in de instellingen voor Afdrukken & Exporteren. U kunt ook minder belangrijke items of secties verbergen, of compactere lay-outs voor aangepaste secties gebruiken. Pas ook de schaal aan via het afdrukvenster van uw browser (soms een beetje verborgen).

??? question "Waarom ontbreken sommige items in mijn afgedrukte CV?"
    Controleer of die items op verborgen zijn gezet (oog-pictogram). Verborgen items worden uitgesloten van de afdrukuitvoer en de publieke weergave.

??? question "Paginanummers worden niet weergegeven?"
    Zorg ervoor dat **Page Numbers** is ingeschakeld in Settings → Print & Export. Sommige PDF-viewers in browsers tonen mogelijk geen CSS-gegenereerde paginanummers — probeer de PDF te downloaden en te openen in een speciale lezer.

## Tijdlijn

??? question "De tijdlijn toont verkeerde datums / alleen jaren / volledige datums?"
    De tijdlijn heeft een eigen datuminstelling. Ga naar **Settings → Advanced → Timeline: Years Only** om te wisselen tussen alleen-jaren-weergave en het volledige datumformaat.

??? question "Kan ik items rechtstreeks aan de tijdlijn toevoegen?"
    Nee. De tijdlijn wordt automatisch gegenereerd op basis van uw werkervaringen. Voeg ervaringen toe of bewerk ze, en de tijdlijn wordt dienovereenkomstig bijgewerkt.

??? question "De landvlag wordt niet weergegeven op de tijdlijn?"
    Zorg ervoor dat het veld **Country Code** bij de ervaring is ingesteld op een geldige 2-letterige ISO-landcode (bijv. `us`, `gb`, `ch`, `de`, `fr`). Vlaggen worden geladen vanaf een extern CDN.

??? question "Wat gebeurt er als ik twee banen tegelijk heb?"
    De tijdlijn detecteert automatisch overlappende functies en toont deze als **parallelle sporen**. De gelijktijdige baan verschijnt op een verhoogde vertakking met S-curveverbindingen die de splits- en samenvoegpunten tonen. Er is geen configuratie nodig — het is volledig gebaseerd op uw begin-/einddatums. Overlappingen korter dan 1 maand worden genegeerd (gebruikelijk bij functiewisselingen).

??? question "Waarom toont de tijdlijn een logo in plaats van de bedrijfsnaam?"
    Als u een bedrijfslogo hebt geüpload voor die ervaring, toont de tijdlijn de logo-afbeelding in plaats van tekst. Als het logobestand ontbreekt, wordt teruggevallen op de bedrijfsnaam. Om een logo van de tijdlijn te verwijderen, bewerkt u de ervaring en klikt u op **Remove** in het gedeelte Company Logo.

## Taal & Updates

??? question "Hoe wijzig ik de taal van het beheerpaneel?"
    Klik op het **wereldbol-pictogram** in de werkbalk en selecteer een taal uit het vervolgkeuzeraster. De wijziging wordt onmiddellijk toegepast en wordt opgeslagen voor toekomstige sessies.

??? question "Hoe controleer ik welke versie ik gebruik?"
    Open **Settings** — het versienummer wordt weergegeven in de linkerbenedenhoek van het venster (bijv. `v1.11.0`).

??? question "Ik zie de updatebanner niet, hoewel er een nieuwe versie beschikbaar is?"
    De versiecontrole wordt 24 uur in de cache opgeslagen. Herstart uw server (of Docker-container) om de cache te wissen en een nieuwe controle te forceren. Uw server heeft ook uitgaande internettoegang nodig om `raw.githubusercontent.com` te bereiken.

## Datasets / Meerdere CV's

??? question "Wat is de 'Default'-dataset?"
    De standaarddataset is de versie van uw CV die bezoekers zien op uw hoofd-URL (`/`). Bij de eerste installatie maakt CV Manager automatisch een "Default"-dataset aan op basis van uw CV-gegevens. U kunt op elk moment wijzigen welke dataset de standaard is met het keuzerondje in het Open-venster.

??? question "Worden mijn bewerkingen automatisch opgeslagen?"
    Ja. Elke wijziging die u in het beheerpaneel maakt (toevoegen, bewerken, verwijderen, herschikken, zichtbaarheid in-/uitschakelen) wordt na een korte vertraging automatisch opgeslagen naar de actieve dataset. De banner toont "Saving…" en vervolgens "✓ Saved" ter bevestiging.

??? question "Wat gebeurt er als ik een dataset 'Load'?"
    Het laden van een dataset schakelt uw werkkopie over naar die dataset. Uw eerdere bewerkingen zijn al automatisch opgeslagen, dus er gaat niets verloren.

??? question "Kunnen bezoekers mijn bewerkingen in realtime zien?"
    Nee. De publieke site toont de bevroren standaarddataset, niet uw live bewerkingen. Bezoekers zien wijzigingen pas nadat het automatisch opslaan deze naar de standaarddataset heeft geschreven. Als u een niet-standaard dataset bewerkt, zien bezoekers die wijzigingen helemaal niet totdat u deze als standaard instelt.

??? question "Kunnen bezoekers mijn opgeslagen datasets zien?"
    Alleen als u ze openbaar maakt. Elke dataset heeft een schakelaar in het Open-venster. Wanneer deze op openbaar staat, wordt die versie toegankelijk op `/v/slug` op de publieke site (poort 3001). Privédatasets zijn alleen te bekijken vanuit de beheerinterface.

??? question "Hoe deel ik een specifieke CV-versie met iemand?"
    Open het **Open...**-venster, zet de dataset op openbaar en klik vervolgens op het kopieerpictogram naast de slug-URL. Deel die link — deze werkt op de publieke site zonder uw beheerinterface bloot te stellen.

??? question "Kan ik meerdere openbare versies tegelijkertijd hebben?"
    Ja. U kunt zoveel datasets openbaar maken als u wilt. Elke dataset krijgt een eigen URL (bijv. `/v/technical-cv-1`, `/v/marketing-cv-2`). De hoofd-`/`-pagina toont de standaarddataset.

??? question "Kan ik de standaarddataset verwijderen?"
    Nee. De dataset die momenteel als standaard is geselecteerd (via het keuzerondje) kan niet worden verwijderd. Stel eerst een andere dataset in als standaard en verwijder daarna de oude.

??? question "Worden mijn versie-URL's door zoekmachines geïndexeerd?"
    Standaard niet — versiepagina's krijgen `noindex, nofollow`. Om indexering toe te staan, schakelt u **Index Versioned URLs** in via Settings → Advanced.

## Publieke Site & SEO

??? question "Hoe deel ik mijn CV?"
    Deel de URL van uw publieke server (poort 3001). Als u een domein hebt ingesteld met Cloudflare Tunnel of een reverse proxy, deel dan dat domein. De hoofd-URL toont altijd uw standaarddataset. U kunt ook specifieke versies delen via openbare versie-URL's (zie [Datasets](../guide/datasets.md)).

??? question "Worden zoekmachines mijn CV indexeren?"
    Standaard wel — de publieke hoofdpagina bevat de juiste metatags, een sitemap en robots.txt. Om indexering te voorkomen, wijzigt u de instelling **Search Engine Indexing** naar "No Index" in Settings → Advanced. Openbare versie-URL's (`/v/slug`) worden standaard **niet geïndexeerd**; schakel **Index Versioned URLs** in als u wilt dat ze worden gecrawld.

??? question "Kan ik Google Analytics toevoegen aan mijn CV?"
    Ja. Plak uw trackingcode in **Settings → Advanced → Tracking Code**. Deze wordt alleen op de publieke pagina's geïnjecteerd.

## Docker & Infrastructuur

??? question "Mijn wijzigingen verschijnen niet op de publieke site?"
    De publieke site toont de **standaarddataset**, die automatisch wordt bijgewerkt wanneer u in het beheerpaneel bewerkt. Probeer een harde vernieuwing (`Ctrl+Shift+R`) op de publieke site. Als u afzonderlijke containers draait, zorg er dan voor dat ze hetzelfde datavolume delen.

??? question "Ik krijg een foutmelding 'port already in use'?"
    Wijzig de hostpoort-toewijzing in uw Docker-configuratie. Gebruik bijvoorbeeld `3010:3000` en `3011:3001`. Wijzig **niet** de omgevingsvariabele `PUBLIC_PORT` — dat is de interne containerpoort.

??? question "Hoe maak ik een back-up van mijn gegevens?"
    Twee opties: gebruik de **Export**-knop in de beheerwerkbalk (exporteert JSON), of maak een back-up van de `data/`-map die de SQLite-database en geüploade afbeeldingen bevat.

??? question "Profielfoto wordt niet weergegeven?"
    Zorg ervoor dat de afbeelding via de beheerinterface is geüpload. Het bestand wordt opgeslagen op `data/uploads/picture.jpeg`. Controleer de bestandsrechten als u op Linux draait.

# Veelgestelde vragen

## Algemeen

??? question "Worden mijn gegevens op een externe server opgeslagen?"
    Nee. Alles draait lokaal op uw server. Uw CV-gegevens worden opgeslagen in een SQLite-databasebestand in de `/data` map.

??? question "Kan ik CV Manager zonder Docker gebruiken?"
    Ja. Installeer Node.js 18+, voer `npm install` uit in de projectmap en voer vervolgens `node src/server.js` uit. De beheerinterface draait op poort 3000 en de publieke site op poort 3001.

??? question "Kunnen meerdere personen dezelfde instantie gebruiken?"
    CV Manager is ontworpen als een applicatie voor één gebruiker. Elke instantie beheert het CV van één persoon. Voor meerdere personen kunt u afzonderlijke containers draaien.

## Bewerken

??? question "Hoe markeer ik een positie als 'huidig'?"
    Laat het veld **Einddatum** leeg. Het wordt op het CV weergegeven als "Heden".

??? question "Kan ik items binnen een sectie herordenen?"
    Ja. De meeste items ondersteunen herordenen via slepen en neerzetten. De volgorde wordt automatisch opgeslagen.

??? question "Hoe voeg ik opsommingstekens toe aan een werkervaring?"
    Bewerk de werkervaring en voer hoogtepunten in het veld **Hoogtepunten** in — één opsommingsteken per regel.

??? question "Hoe voeg ik een bedrijfslogo toe?"
    Bewerk de werkervaring, scroll naar het gedeelte **Bedrijfslogo** en klik op **Afbeelding kiezen** om te uploaden. U kunt ook op **Bestaande gebruiken** klikken om een eerder geüpload logo opnieuw te gebruiken. Schakel de optie **"Logo synchroniseren voor alle [Bedrijf]"** in om hetzelfde logo toe te passen op alle werkervaringen bij dat bedrijf.

??? question "Ik heb per ongeluk iets verwijderd. Kan ik dit ongedaan maken?"
    Er is geen functie voor ongedaan maken. Omdat bewerkingen automatisch worden opgeslagen in de actieve dataset, wordt de wijziging onmiddellijk vastgelegd. Als u een eerdere export of een afzonderlijk opgeslagen dataset heeft, kunt u daaruit herstellen. Het is raadzaam om uw CV regelmatig te exporteren als back-up.

## Aangepaste secties

??? question "Hoeveel aangepaste secties kan ik aanmaken?"
    Er is geen vaste limiet. U kunt er zoveel aanmaken als u nodig heeft.

??? question "Kan ik het lay-outtype van een aangepaste sectie wijzigen nadat ik deze heb aangemaakt?"
    Ja. Bewerk de sectie en selecteer een andere lay-out. Houd er rekening mee dat sommige velden mogelijk niet behouden blijven bij het wisselen van lay-outtype (bijv. bij het overschakelen van kaarten naar sociale links).

??? question "Wat is het verschil tussen de layouts 'Opsommingstekens' en 'Vrije tekst'?"
    **Opsommingstekens** geeft elke regel weer als een lijstitem met opsommingsteken en een groepstitel. **Vrije tekst** geeft platte tekst weer met behouden regelafbrekingen en zonder titel — vergelijkbaar met de sectie Over mij/Bio.

## Afdrukken en PDF

??? question "Waarom ziet mijn PDF er anders uit dan op het scherm?"
    De afdrukuitvoer gebruikt speciale afdrukstijlen die zijn geoptimaliseerd voor papier. Sommige visuele effecten (hover-statussen, animaties, verlopen) worden vereenvoudigd. Verborgen items en beheerknoppen worden automatisch verwijderd.

??? question "Hoe pas ik mijn CV op minder pagina's?"
    Probeer **Sectiesplitsing toestaan** en **Itemsplitsing toestaan** in te schakelen in de instellingen voor Afdrukken en exporteren. U kunt ook minder belangrijke items of secties verbergen, of compactere aangepaste sectie-lay-outs gebruiken. U kunt ook de afdrukschaal aanpassen via het afdrukvenster van uw browser (soms wat verborgen).

??? question "Waarom ontbreken sommige items in mijn afgedrukte CV?"
    Controleer of die items zijn ingesteld als verborgen (oogpictogram). Verborgen items worden uitgesloten van de afdrukuitvoer en de publieke weergave.

??? question "Paginanummers worden niet weergegeven?"
    Zorg ervoor dat **Paginanummers** is ingeschakeld in Instellingen → Afdrukken en exporteren. Sommige PDF-viewers in browsers geven door CSS gegenereerde paginanummers mogelijk niet weer — probeer de PDF te downloaden en in een speciale reader te openen.

## Tijdlijn

??? question "De tijdlijn toont verkeerde datums / alleen jaren / volledige datums?"
    De tijdlijn heeft een eigen datuminstelling. Ga naar **Instellingen → Geavanceerd → Tijdlijn: Alleen jaren** om te schakelen tussen weergave met alleen jaren en het volledige datumformaat.

??? question "Kan ik rechtstreeks vermeldingen aan de tijdlijn toevoegen?"
    Nee. De tijdlijn wordt automatisch gegenereerd op basis van uw werkervaringen. Voeg werkervaringen toe of bewerk deze en de tijdlijn wordt dienovereenkomstig bijgewerkt.

??? question "De landvlag wordt niet weergegeven op de tijdlijn?"
    Zorg ervoor dat het veld **Landcode** bij de werkervaring is ingesteld op een geldige tweeletterige ISO-landcode (bijv. `us`, `gb`, `ch`, `de`, `fr`). Vlaggen worden geladen vanaf een externe CDN.

??? question "Wat gebeurt er als ik twee banen tegelijkertijd heb?"
    De tijdlijn detecteert automatisch overlappende posities en geeft deze weer als **parallelle sporen**. De gelijktijdige baan verschijnt op een verhoogde vertakkingslijn met S-vormige verbindingslijnen die de vertakkings- en samenvoegpunten tonen. Er is geen configuratie nodig — het is volledig gebaseerd op uw start-/einddatums. Overlappingen korter dan 1 maand worden genegeerd (gebruikelijk bij baanwisselingen).

??? question "Waarom toont de tijdlijn een logo in plaats van de bedrijfsnaam?"
    Als u een bedrijfslogo heeft geüpload voor die werkervaring, toont de tijdlijn de logoafbeelding in plaats van tekst. Als het logobestand ontbreekt, wordt teruggevallen op de bedrijfsnaam. Om een logo van de tijdlijn te verwijderen, bewerkt u de werkervaring en klikt u op **Verwijderen** in het gedeelte Bedrijfslogo.

## Taal en updates

??? question "Hoe wijzig ik de taal van de beheerinterface?"
    Klik op het **wereldbolpictogram** in de werkbalk en selecteer een taal uit het keuzeraster. De wijziging wordt onmiddellijk toegepast en wordt opgeslagen voor toekomstige sessies.

??? question "Hoe controleer ik welke versie ik gebruik?"
    Open **Instellingen** — het versienummer wordt weergegeven in de linkerbenedenhoek van het venster (bijv. `v1.11.0`).

??? question "Ik zie de updatebanner niet, ook al is er een nieuwe versie beschikbaar?"
    De versiecontrole wordt 24 uur in de cache bewaard. Start uw server (of Docker-container) opnieuw op om de cache te wissen en een nieuwe controle af te dwingen. Uw server heeft ook uitgaande internettoegang nodig om `raw.githubusercontent.com` te bereiken.

## Datasets / Meerdere CV's

??? question "Wat is de 'Standaard' dataset?"
    De standaarddataset is de versie van uw CV die bezoekers zien op uw hoofd-URL (`/`). Bij de eerste installatie maakt CV Manager automatisch een "Standaard" dataset aan op basis van uw CV-gegevens. U kunt op elk moment wijzigen welke dataset de standaard is met behulp van het keuzerondje in het venster Openen.

??? question "Worden mijn bewerkingen automatisch opgeslagen?"
    Ja. Elke wijziging die u aanbrengt in de beheerinterface (toevoegen, bewerken, verwijderen, herordenen, zichtbaarheid wijzigen) wordt na een korte vertraging automatisch opgeslagen in de actieve dataset. De banner toont "Opslaan..." en vervolgens "Opgeslagen" ter bevestiging.

??? question "Wat gebeurt er als ik een dataset 'Laad'?"
    Het laden van een dataset schakelt uw werkkopie over naar die dataset. Uw eerdere bewerkingen zijn al automatisch opgeslagen, dus er gaat niets verloren.

??? question "Kunnen bezoekers mijn bewerkingen in realtime zien?"
    Nee. De publieke site toont de bevroren standaarddataset, niet uw live bewerkingen. Bezoekers zien wijzigingen pas nadat automatisch opslaan deze naar de standaarddataset heeft geschreven. Als u een niet-standaarddataset bewerkt, zien bezoekers die wijzigingen helemaal niet totdat u deze als standaard instelt.

??? question "Kunnen bezoekers mijn opgeslagen datasets zien?"
    Alleen als u ze openbaar maakt. Elke dataset heeft een schakelaar in het venster Openen. Wanneer deze op openbaar staat, wordt die versie toegankelijk via `/v/slug` op de publieke site (poort 3001). Privédatasets zijn alleen te bekijken vanuit de beheerinterface.

??? question "Hoe deel ik een specifieke CV-versie met iemand?"
    Open het venster **Openen...**, zet de dataset op openbaar en klik vervolgens op het kopieerpictogram naast de slug-URL. Deel die link — deze werkt op de publieke site zonder uw beheerinterface bloot te stellen.

??? question "Kan ik meerdere openbare versies tegelijkertijd hebben?"
    Ja. U kunt zoveel datasets openbaar maken als u wilt. Elke dataset krijgt een eigen URL (bijv. `/v/technical-cv-1`, `/v/marketing-cv-2`). De hoofdpagina `/` toont de standaarddataset.

??? question "Kan ik de standaarddataset verwijderen?"
    Nee. De dataset die momenteel als standaard is geselecteerd (via het keuzerondje) kan niet worden verwijderd. Stel eerst een andere dataset in als standaard en verwijder vervolgens de oude.

??? question "Indexeren zoekmachines mijn versie-URL's?"
    Standaard niet — versie-URL-pagina's krijgen `noindex, nofollow`. Om indexering toe te staan, schakelt u **Versie-URL's indexeren** in via Instellingen → Geavanceerd.

## Publieke site en SEO

??? question "Hoe deel ik mijn CV?"
    Deel de URL van uw publieke server (poort 3001). Als u een domein heeft ingesteld met Cloudflare Tunnel of een reverse proxy, deel dan dat domein. De hoofd-URL toont altijd uw standaarddataset. U kunt ook specifieke versies delen via openbare versie-URL's (zie [Datasets](../guide/datasets.nl.md)).

??? question "Indexeren zoekmachines mijn CV?"
    Standaard wel — de hoofdpagina van de publieke site bevat de juiste metatags, een sitemap en robots.txt. Om indexering te voorkomen, wijzigt u de instelling **Zoekmachine-indexering** naar "Niet indexeren" in Instellingen → Geavanceerd. Openbare versie-URL's (`/v/slug`) worden standaard **niet geïndexeerd**; schakel **Versie-URL's indexeren** in als u wilt dat ze worden gecrawld.

??? question "Kan ik Google Analytics toevoegen aan mijn CV?"
    Ja. Plak uw trackingcode in **Instellingen → Geavanceerd → Trackingcode**. Deze wordt alleen geïnjecteerd op de publiek zichtbare pagina's.

## Docker en infrastructuur

??? question "Mijn wijzigingen verschijnen niet op de publieke site?"
    De publieke site toont de **standaarddataset**, die automatisch wordt bijgewerkt wanneer u bewerkt in de beheerinterface. Probeer een harde verversing (`Ctrl+Shift+R`) op de publieke site. Als u afzonderlijke containers draait, zorg er dan voor dat ze hetzelfde datavolume delen.

??? question "Ik krijg een foutmelding 'poort is al in gebruik'?"
    Wijzig de hostpoorttoewijzing in uw Docker-configuratie. Wijs bijvoorbeeld toe aan `3010:3000` en `3011:3001`. Wijzig **niet** de omgevingsvariabele `PUBLIC_PORT` — dat is de interne containerpoort.

??? question "Hoe maak ik een back-up van mijn gegevens?"
    Twee opties: gebruik de knop **Exporteren** in de beheerwerkbalk (exporteert JSON), of maak een back-up van de map `data/` die de SQLite-database en geüploade afbeeldingen bevat.

??? question "Profielfoto wordt niet weergegeven?"
    Zorg ervoor dat de afbeelding is geüpload via de beheerinterface. Het bestand wordt opgeslagen op `data/uploads/picture.jpeg`. Controleer de bestandsrechten als u op Linux draait.

# ATS-compatibiliteit

## Wat is een ATS?

Een **ATS** (Applicant Tracking System, sollicitatiebeheersysteem) is software die door recruiters en bedrijven wordt gebruikt om sollicitaties te beheren. Wanneer u uw CV uploadt naar een vacatureportaal of bedrijfswebsite, parseert een ATS het document om gestructureerde gegevens te extraheren — uw naam, functietitels, bedrijven, data, vaardigheden en opleiding. Deze gegevens worden vervolgens gebruikt voor trefwoordmatching, rangschikking en filtering van kandidaten.

Als het ATS uw document niet correct kan verwerken, kan uw sollicitatie worden afgewezen of kunnen belangrijke informatie verloren gaan — zelfs als uw kwalificaties perfect passen.

## Ingebouwde ATS-optimalisatie

CV Manager genereert automatisch ATS-vriendelijke uitvoer op de openbare site:

- **Schema.org-markup** — gestructureerde gegevens die ATS-systemen kunnen verwerken (Person, OrganizationRole, EducationalOccupationalCredential, enz.)
- **Semantische HTML** — correcte kopjeshiërarchie, article-elementen en lijsten
- **Verborgen ATS-blok** — een plattetekstversie van uw CV is ingebed in de pagina voor parsers die geen gestileerde HTML verwerken
- **Nette afdrukuitvoer** — geen visuele rommel, correcte inhoudshiërarchie

Er is geen speciale configuratie nodig — deze functies zijn altijd actief.

## ATS-document exporteren

Naast de ingebouwde weboptimalisatie kan CV Manager een **speciaal ATS-vriendelijk PDF** genereren, speciaal ontworpen voor het uploaden naar vacatureportalen en ATS-systemen.

### Hoe te gebruiken

1. Klik op **ATS-document** in de admin-werkbalk
2. Pas de **Schaal**-schuifregelaar aan om de inhoudsdichtheid te regelen (50%–150%)
3. Kies uw gewenste **Papierformaat** (A4 of Letter)
4. Bekijk het document in het modale venster
5. Klik op **PDF downloaden** om het bestand op te slaan

### Verschil met Afdrukken / PDF

| Functie | Afdrukken / PDF | ATS-document |
|---------|-----------------|--------------|
| **Doel** | Visuele presentatie | Machinale verwerking |
| **Layout** | Volledig ontwerp met kleuren, pictogrammen, tijdlijn | Schone gestructureerde tekst, minimale opmaak |
| **Inhoud** | Alle zichtbare secties inclusief tijdlijn | Alle secties behalve tijdlijn (niet ATS-relevant) |
| **Schaalcontrole** | Afdrukdialoogvenster van browser | Ingebouwde schuifregelaar met live voorbeeld |
| **Generatie** | Afdrukengine van browser | Serverside (pdfmake) |
| **Consistentie** | Varieert per browser | Overal identieke uitvoer |

### Tips voor ATS-succes

!!! tip "Gebruik het ATS-document voor sollicitaties"
    Upload altijd het ATS-document (niet de Afdrukken/PDF-versie) wanneer u solliciteert via vacatureportalen. De gestructureerde layout is ontworpen om correct te worden verwerkt door geautomatiseerde systemen.

!!! tip "Houd uw vaardigheden-sectie compleet"
    ATS-systemen vertrouwen sterk op trefwoordmatching. Zorg ervoor dat uw Vaardigheden-sectie alle relevante technologieën, tools en methodologieën bevat — de ATS-export bevat deze als een platte trefwoordenlijst voor betere matching.

!!! tip "Gebruik Afdrukken/PDF voor menselijke lezers"
    Wanneer u uw CV rechtstreeks per e-mail naar een hiring manager stuurt of meeneemt naar een sollicitatiegesprek, gebruik dan de Afdrukken/PDF-versie — deze heeft het volledige visuele ontwerp met uw themakleuren en tijdlijn.

!!! tip "Schaal voor dichtheid"
    Als uw CV lang is, probeer dan de schaal te verlagen naar 70–80% om meer inhoud per pagina te plaatsen. Het voorbeeld wordt in realtime bijgewerkt, zodat u de juiste balans kunt vinden.

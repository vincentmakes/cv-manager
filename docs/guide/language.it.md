# Lingua

## Lingua dell'interfaccia admin

Fate clic sull'**icona del globo** nella barra degli strumenti per cambiare la lingua dell'interfaccia admin. Un menu a griglia mostra tutte le lingue disponibili — fate clic su una per applicarla immediatamente.

**Lingue supportate:** Inglese, Tedesco (Deutsch), Francese (Français), Olandese (Nederlands), Spagnolo (Español), Italiano (Italiano), Portoghese (Português), Cinese (中文).

L'impostazione della lingua influisce solo sulle etichette, i pulsanti e i menu dell'interfaccia admin. La vostra preferenza viene salvata e mantenuta tra le sessioni.

## Lingua del contenuto del CV

Separatamente dalla lingua dell'interfaccia, ogni dataset salvato ha la propria **lingua del contenuto** — ovvero la lingua in cui è scritto il contenuto del CV. La lingua del contenuto è mostrata come badge (EN, DE, FR, ecc.) su ogni riga del dataset nel Gestore CV.

Quando caricate un dataset, l'interfaccia admin si adatta automaticamente alla lingua del suo contenuto. Questo significa che se caricate un CV in tedesco, l'interfaccia passa al tedesco, così le intestazioni delle sezioni e le etichette dei moduli sono nella stessa lingua del contenuto che state modificando.

### Cambiare la lingua di un dataset

Per cambiare la lingua assegnata a un dataset esistente:

1. Aprite il **Gestore CV**
2. Fate clic sul **badge lingua** (ad esempio, EN) sulla riga del dataset
3. Selezionate la nuova lingua dal selettore

Questo riassegna il codice lingua senza modificare il contenuto stesso — utile per i dataset che erano impostati sull'inglese durante la configurazione iniziale.

## Varianti linguistiche

Potete creare **più varianti linguistiche** dello stesso CV. Ad esempio, mantenere una versione in inglese e una in tedesco che condividono la stessa struttura ma hanno contenuti indipendenti.

Per i dettagli sulla creazione e gestione delle varianti linguistiche, consultate [Dataset e varianti linguistiche](datasets.md#varianti-linguistiche).

## Cambio lingua sul sito pubblico

Quando il dataset predefinito ha fratelli linguistici, i visitatori possono cambiare lingua sul sito pubblico:

- La **lingua predefinita** è servita all'indirizzo `/`
- Le altre lingue sono disponibili all'indirizzo `/{lang}` (ad esempio, `/de`, `/fr`)
- Un pulsante per il cambio lingua appare sul sito pubblico per permettere ai visitatori di passare da una lingua all'altra

Per i dataset condivisi non predefiniti, le varianti linguistiche sono servite all'indirizzo `/v/slug/{lang}`.

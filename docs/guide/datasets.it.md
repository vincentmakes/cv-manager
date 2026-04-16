# Dataset e varianti linguistiche

## Come funzionano i dataset

I dataset sono istantanee salvate del vostro CV. Un dataset è sempre quello **predefinito** — questa è la versione che i visitatori vedono al vostro URL principale (`/`). Potete creare dataset aggiuntivi per destinatari diversi (ad esempio, un CV tecnico, un CV manageriale), in lingue diverse, e condividerli tramite URL dedicati.

Quando installate CV Manager per la prima volta, un dataset "Default" viene creato automaticamente a partire dai dati del vostro CV. Tutte le modifiche che apportate nell'interfaccia di amministrazione vengono **salvate automaticamente** nel dataset attivo — non esiste un passaggio separato di "salvataggio".

## Il Gestore CV

Fate clic su **Gestore CV** nella barra degli strumenti per aprire la finestra modale unificata per tutte le operazioni sui dataset: salvataggio, caricamento, creazione di versioni, aggiunta di lingue, impostazione del predefinito e gestione della visibilità.

La finestra modale ha due zone:

- Un **modulo "Salva con nome"** in alto — campo nome, selettore lingua e pulsante di salvataggio
- Un **elenco dei CV salvati** sotto — raggruppati per nome base, con tutte le azioni di gestione

### Salvare un nuovo dataset

Il campo nome è precompilato con il nome del dataset attivo. Il menu a tendina della lingua è impostato sulla lingua attiva.

- **Digitate un nuovo nome** e fate clic sul pulsante blu **Salva come nuovo "…"** per creare un dataset completamente nuovo
- **Fate clic su una riga esistente** nell'elenco per compilare il campo nome — il pulsante cambia in **Sovrascrivi "…"** arancione (con conferma)

### Elenco dei dataset

Ogni CV salvato appare come un **gruppo** con un'intestazione che mostra il nome base, un pulsante **+ Nuova versione** e un badge con il conteggio versioni/lingue.

All'interno di ogni gruppo, ogni variante linguistica è una riga:

```
○  EN  v2  Full Stack Developer v2     /v/full-stack-dev/en   16/04/2026   [Carica]  ⋮
```

- **Pulsante radio** (○) — seleziona quale dataset vedono i visitatori all'indirizzo `/` (il predefinito)
- **Badge lingua** (EN) — la lingua del contenuto di questa variante
- **Badge versione** (v2) — mostrato quando il gruppo ha più versioni
- **Nome** — il nome del dataset
- **URL** — il percorso URL pubblico (se condiviso o predefinito)
- **Data** — ultima modifica
- **Carica** — passa alla modifica di questo dataset
- **⋮** (menu overflow) — azioni aggiuntive

### Menu overflow (⋮)

Il menu overflow di ogni riga contiene:

| Azione | Descrizione |
|--------|-------------|
| **Rendi condiviso / Rendi privato** | Attiva/disattiva la visibilità pubblica all'indirizzo `/v/slug` (nascosto per il predefinito e i suoi fratelli linguistici) |
| **Cambia lingua** | Riassegna il codice lingua di questo dataset |
| **Anteprima** | Apre la versione salvata in una nuova scheda |
| **Copia URL** | Copia l'URL pubblico o di anteprima negli appunti |
| **Elimina** | Rimuove permanentemente (disabilitato per il dataset predefinito) |

## Versioni

I dataset che condividono lo stesso nome base vengono raggruppati insieme. Ad esempio, `Frontend Engineer`, `Frontend Engineer v2` e `Frontend Engineer v3` appaiono come un unico blocco sotto un'intestazione condivisa.

### Creare una nuova versione

Fate clic su **+ Nuova versione** nell'intestazione del gruppo. Il campo nome si compila automaticamente con il prossimo numero di versione (ad esempio, `Frontend Engineer v4`). Quando salvate, la nuova versione:

- Ottiene un badge di versione appropriato (v4)
- Condivide lo stesso slug URL dei suoi fratelli
- Eredita tutte le varianti linguistiche dalla versione precedente

### Versioni precedenti comprimibili

Quando un gruppo ha più versioni, viene mostrata solo la più recente. Un pulsante **"N versioni precedenti"** permette di espandere per vedere tutte le versioni. Se il dataset che state modificando o quello predefinito si trova in una versione precedente, si espande automaticamente così potete sempre vederlo.

!!! tip
    Utilizzate la convenzione di denominazione `Base vN` (ad esempio, `Frontend Engineer`, `Frontend Engineer v2`) per ottenere il raggruppamento automatico delle versioni e i suggerimenti per la versione successiva.

## Varianti linguistiche

Ogni versione di un dataset può avere più varianti linguistiche — ad esempio, una versione inglese e una tedesca dello stesso CV, che condividono la stessa struttura ma con contenuti indipendenti.

### Aggiungere una variante linguistica

1. Aprite il **Gestore CV**
2. Fate clic su **+ Aggiungi lingua** nell'intestazione del gruppo (o usate il flusso **⋮ → Aggiungi lingua** dal modulo "Salva con nome")
3. Selezionate la lingua di destinazione e salvate

La nuova variante inizia come una copia del contenuto esistente. L'interfaccia di amministrazione passa automaticamente alla nuova lingua così potete iniziare a tradurre.

### Cambio lingua

Quando modificate un dataset che ha fratelli linguistici, un **selettore lingua** appare nel banner del dataset attivo sotto la barra degli strumenti. Fate clic su un codice lingua per cambiare — il vostro lavoro attuale viene salvato automaticamente, poi l'altra variante viene caricata e la lingua dell'interfaccia si adatta di conseguenza.

### Sincronizzazione strutturale

Le modifiche alla **struttura** — ordine delle sezioni, visibilità, layout delle sezioni personalizzate e conteggio degli elementi — si propagano automaticamente a tutti i fratelli linguistici. Il **contenuto** (testo, titoli, descrizioni) resta indipendente per ogni lingua, così potete tradurre liberamente senza preoccuparvi di disallineamenti nel layout.

### Cambiare la lingua di un dataset

Fate clic sul **badge lingua** di qualsiasi riga per aprire un selettore e riassegnare il codice lingua. Questo è utile per i dataset precedenti che erano impostati sull'inglese durante la configurazione iniziale.

## Impostare il predefinito

Il dataset predefinito è la versione che i visitatori vedono al vostro URL principale (`/`). Per cambiarlo:

1. Aprite il **Gestore CV**
2. Fate clic sul **pulsante radio** (○) accanto al dataset che desiderate come predefinito
3. La modifica ha effetto immediato

I fratelli linguistici del predefinito sono automaticamente accessibili all'indirizzo `/{lang}` (ad esempio, `/de`, `/fr`) — non necessitano di un toggle pubblico separato.

!!! note
    Il sito pubblico serve il dataset predefinito salvato, non le vostre modifiche in tempo reale. Potete sperimentare liberamente nell'interfaccia di amministrazione senza influire su ciò che vedono i visitatori.

## URL pubblici con versione

I dataset non predefiniti possono essere condivisi tramite i propri URL. Usate l'azione **⋮ → Rendi condiviso** per rendere un dataset pubblico all'indirizzo `/v/slug`. Più dataset possono essere pubblici contemporaneamente.

- **Dataset predefinito**: servito all'indirizzo `/`
- **Fratelli linguistici del predefinito**: serviti all'indirizzo `/{lang}` (ad esempio, `/fr`)
- **Dataset condivisi**: serviti all'indirizzo `/v/slug` o `/v/slug/{lang}`
- **Dataset privati**: visualizzabili in anteprima solo dall'interfaccia di amministrazione

!!! tip "Copiare gli URL"
    Fate clic sul percorso URL mostrato su ogni riga per copiare l'URL pubblico completo negli appunti.

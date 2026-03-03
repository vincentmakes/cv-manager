# FAQ

## Generale

??? question "I miei dati sono memorizzati su qualche server esterno?"
    No. Tutto viene eseguito localmente sul vostro server. I dati del vostro CV sono memorizzati in un file di database SQLite nella directory `/data`.

??? question "Posso eseguire CV Manager senza Docker?"
    Sì. Installate Node.js 18+, eseguite `npm install` nella directory del progetto, poi `node src/server.js`. L'interfaccia di amministrazione viene eseguita sulla porta 3000 e il sito pubblico sulla porta 3001.

??? question "Più persone possono utilizzare la stessa istanza?"
    CV Manager è progettato come applicazione per singolo utente. Ogni istanza gestisce il CV di una persona. Per più persone, eseguite container separati.

## Modifica

??? question "Come faccio a contrassegnare una posizione come 'attuale'?"
    Lasciate vuoto il campo **End Date**. Verrà visualizzato come "Present" sul CV.

??? question "Posso riordinare gli elementi all'interno di una sezione?"
    Sì. La maggior parte degli elementi supporta il riordinamento tramite trascinamento. L'ordine viene salvato automaticamente.

??? question "Come faccio ad aggiungere punti elenco a un'esperienza?"
    Modificate l'esperienza e inserite i punti salienti nel campo **Highlights** — un punto elenco per riga.

??? question "Come faccio ad aggiungere il logo di un'azienda?"
    Modificate l'esperienza, scorrete fino alla sezione **Company Logo** e cliccate su **Choose image** per caricare un'immagine. Potete anche cliccare su **Use existing** per riutilizzare un logo già caricato. Abilitate l'opzione **"Sync logo across all [Company]"** per applicare lo stesso logo a tutte le esperienze presso quell'azienda.

??? question "Ho cancellato qualcosa per sbaglio. Posso annullare?"
    Non esiste una funzione di annullamento. Poiché le modifiche vengono salvate automaticamente nel dataset attivo, la modifica viene mantenuta immediatamente. Se disponete di un'esportazione precedente o di un dataset salvato separatamente, potete ripristinare da quello. È buona pratica esportare regolarmente il vostro CV come backup.

## Sezioni Personalizzate

??? question "Quante sezioni personalizzate posso creare?"
    Non esiste un limite rigido. Createne quante ne avete bisogno.

??? question "Posso cambiare il tipo di layout di una sezione personalizzata dopo averla creata?"
    Sì. Modificate la sezione e selezionate un layout diverso. Tenete presente che alcuni campi potrebbero non essere trasferiti tra i tipi di layout (ad esempio, passando da cards a social links).

??? question "Qual è la differenza tra i layout 'Bullet Points' e 'Free Text'?"
    **Bullet Points** visualizza ogni riga come elemento di un elenco puntato con un titolo di gruppo. **Free Text** visualizza testo semplice con interruzioni di riga preservate e senza titolo — simile alla sezione About/Bio.

## Stampa e PDF

??? question "Perché il mio PDF appare diverso dallo schermo?"
    L'output di stampa utilizza stili di stampa dedicati ottimizzati per la carta. Alcuni effetti visivi (stati al passaggio del mouse, animazioni, sfumature) vengono semplificati. Gli elementi nascosti e i controlli di amministrazione vengono automaticamente rimossi.

??? question "Come faccio a far stare il mio CV in meno pagine?"
    Provate ad abilitare **Allow Section Splits** e **Allow Item Splits** nelle impostazioni Print & Export. Potete anche nascondere elementi o sezioni meno importanti, oppure utilizzare layout di sezioni personalizzate più compatti. È inoltre possibile ridimensionare la stampa tramite la finestra di dialogo di stampa di qualsiasi browser (a volte l'opzione è un po' nascosta).

??? question "Perché mancano alcuni elementi nel mio CV stampato?"
    Verificate se quegli elementi sono stati impostati come nascosti (icona occhio). Gli elementi nascosti vengono esclusi dall'output di stampa e dalla visualizzazione pubblica.

??? question "I numeri di pagina non vengono visualizzati?"
    Assicuratevi che **Page Numbers** sia abilitato in Settings → Print & Export. Alcuni visualizzatori PDF dei browser potrebbero non mostrare i numeri di pagina generati via CSS — provate a scaricare il PDF e ad aprirlo in un lettore dedicato.

## Timeline

??? question "La timeline mostra date errate / solo anni / date complete?"
    La timeline ha una propria impostazione per le date. Andate su **Settings → Advanced → Timeline: Years Only** per alternare tra la visualizzazione solo anno e il formato data completo.

??? question "Posso aggiungere voci direttamente alla timeline?"
    No. La timeline viene generata automaticamente dalle vostre esperienze lavorative. Aggiungete o modificate le esperienze e la timeline si aggiorna di conseguenza.

??? question "La bandiera del paese non viene mostrata nella timeline?"
    Assicuratevi che il campo **Country Code** dell'esperienza sia impostato su un codice paese ISO a 2 lettere valido (ad esempio, `us`, `gb`, `ch`, `de`, `fr`). Le bandiere vengono caricate da un CDN esterno.

??? question "Cosa succede quando ho due lavori contemporaneamente?"
    La timeline rileva automaticamente le posizioni sovrapposte e le visualizza come **tracciati paralleli**. Il lavoro concomitante appare su una linea rialzata con connettori a curva S che mostrano i punti di biforcazione e convergenza. Non è necessaria alcuna configurazione — si basa interamente sulle date di inizio/fine. Le sovrapposizioni inferiori a 1 mese vengono ignorate (comuni durante i cambi di lavoro).

??? question "Perché la timeline mostra un logo invece del nome dell'azienda?"
    Se avete caricato un logo aziendale per quell'esperienza, la timeline mostra l'immagine del logo invece del testo. Se il file del logo manca, viene utilizzato il nome dell'azienda come fallback. Per rimuovere un logo dalla timeline, modificate l'esperienza e cliccate su **Remove** nella sezione Company Logo.

## Lingua e Aggiornamenti

??? question "Come faccio a cambiare la lingua dell'interfaccia di amministrazione?"
    Cliccate sull'**icona del globo** nella barra degli strumenti e selezionate una lingua dalla griglia a discesa. La modifica viene applicata immediatamente e salvata tra le sessioni.

??? question "Come faccio a verificare quale versione sto utilizzando?"
    Aprite **Settings** — il numero di versione è mostrato nell'angolo in basso a sinistra della finestra (ad esempio, `v1.11.0`).

??? question "Non vedo il banner di aggiornamento anche se è disponibile una nuova versione?"
    Il controllo della versione viene memorizzato nella cache per 24 ore. Riavviate il vostro server (o il container Docker) per svuotare la cache e forzare un nuovo controllo. Il vostro server necessita inoltre di accesso a Internet in uscita per raggiungere `raw.githubusercontent.com`.

## Dataset / CV Multipli

??? question "Cos'è il dataset 'Default'?"
    Il dataset predefinito è la versione del vostro CV che i visitatori vedono al vostro URL principale (`/`). Alla prima installazione, CV Manager crea automaticamente un dataset "Default" dai dati del vostro CV. Potete cambiare quale dataset è il predefinito in qualsiasi momento utilizzando il pulsante radio nella finestra Open.

??? question "Le mie modifiche vengono salvate automaticamente?"
    Sì. Ogni modifica apportata nell'interfaccia di amministrazione (aggiunta, modifica, eliminazione, riordinamento, attivazione/disattivazione della visibilità) viene automaticamente salvata nel dataset attivo dopo un breve ritardo. Il banner mostra "Saving…" e poi "✓ Saved" come conferma.

??? question "Cosa succede quando 'carico' un dataset?"
    Il caricamento di un dataset commuta la vostra copia di lavoro su quel dataset. Le vostre modifiche precedenti erano già state salvate automaticamente, quindi nulla viene perso.

??? question "I visitatori possono vedere le mie modifiche in tempo reale?"
    No. Il sito pubblico serve il dataset predefinito congelato, non le vostre modifiche in tempo reale. I visitatori vedono le modifiche solo dopo che il salvataggio automatico le scrive nel dataset predefinito. Se state modificando un dataset non predefinito, i visitatori non vedranno affatto quelle modifiche fino a quando non lo imposterete come predefinito.

??? question "I visitatori possono vedere i miei dataset salvati?"
    Solo se li rendete pubblici. Ogni dataset ha un interruttore nella finestra Open. Quando impostato su pubblico, quella versione diventa accessibile all'indirizzo `/v/slug` sul sito pubblico (porta 3001). I dataset privati sono visualizzabili in anteprima solo dall'interfaccia di amministrazione.

??? question "Come faccio a condividere una specifica versione del CV con qualcuno?"
    Aprite la finestra **Open...**, impostate il dataset su pubblico, poi cliccate sull'icona di copia accanto all'URL slug. Condividete quel link — funziona sul sito pubblico senza esporre la vostra interfaccia di amministrazione.

??? question "Posso avere più versioni pubbliche contemporaneamente?"
    Sì. Potete rendere pubblici quanti dataset desiderate. Ognuno ottiene il proprio URL (ad esempio, `/v/technical-cv-1`, `/v/marketing-cv-2`). La pagina principale `/` mostra il dataset predefinito.

??? question "Posso eliminare il dataset predefinito?"
    No. Il dataset attualmente selezionato come predefinito (tramite il pulsante radio) non può essere eliminato. Impostate prima un dataset diverso come predefinito, poi eliminate quello vecchio.

??? question "I motori di ricerca indicizzeranno i miei URL con versione?"
    Per impostazione predefinita, no — le pagine con versione ricevono `noindex, nofollow`. Per consentire l'indicizzazione, abilitate **Index Versioned URLs** in Settings → Advanced.

## Sito Pubblico e SEO

??? question "Come faccio a condividere il mio CV?"
    Condividete l'URL del vostro server pubblico (porta 3001). Se avete configurato un dominio con Cloudflare Tunnel o un reverse proxy, condividete quel dominio. L'URL principale mostra sempre il vostro dataset predefinito. Potete anche condividere versioni specifiche utilizzando gli URL pubblici con versione (vedi [Dataset](../guide/datasets.it.md)).

??? question "I motori di ricerca indicizzeranno il mio CV?"
    Per impostazione predefinita, sì — la pagina pubblica principale include meta tag appropriati, una sitemap e robots.txt. Per impedire l'indicizzazione, cambiate l'impostazione **Search Engine Indexing** su "No Index" in Settings → Advanced. Gli URL pubblici con versione (`/v/slug`) **non vengono indicizzati** per impostazione predefinita; abilitate **Index Versioned URLs** se desiderate che vengano scansionati.

??? question "Posso aggiungere Google Analytics al mio CV?"
    Sì. Incollate il vostro codice di tracciamento in **Settings → Advanced → Tracking Code**. Viene iniettato solo nelle pagine pubbliche.

## Docker e Infrastruttura

??? question "Le mie modifiche non appaiono sul sito pubblico?"
    Il sito pubblico serve il **dataset predefinito**, che viene aggiornato automaticamente quando modificate nell'interfaccia di amministrazione. Provate un aggiornamento forzato (`Ctrl+Shift+R`) sul sito pubblico. Se eseguite container separati, assicuratevi che condividano lo stesso volume dati.

??? question "Ricevo un errore 'port already in use'?"
    Cambiate la mappatura della porta host nella vostra configurazione Docker. Ad esempio, mappate su `3010:3000` e `3011:3001`. **Non** cambiate la variabile d'ambiente `PUBLIC_PORT` — quella è la porta interna del container.

??? question "Come faccio a eseguire il backup dei miei dati?"
    Due opzioni: utilizzate il pulsante **Export** nella barra degli strumenti dell'amministrazione (esporta in JSON), oppure eseguite il backup della directory `data/` che contiene il database SQLite e le immagini caricate.

??? question "L'immagine del profilo non viene mostrata?"
    Assicuratevi che l'immagine sia stata caricata tramite l'interfaccia di amministrazione. Il file viene memorizzato in `data/uploads/picture.jpeg`. Verificate i permessi del file se utilizzate Linux.

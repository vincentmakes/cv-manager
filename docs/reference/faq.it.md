# FAQ

## Generali

??? question "I miei dati vengono archiviati su qualche server esterno?"
    No. Tutto funziona localmente sul proprio server. I dati del CV vengono archiviati in un file di database SQLite nella directory `/data`.

??? question "Posso eseguire CV Manager senza Docker?"
    Si. Installare Node.js 18+, eseguire `npm install` nella directory del progetto, quindi `node src/server.js`. L'admin funziona sulla porta 3000 e il sito pubblico sulla porta 3001.

??? question "Piu persone possono utilizzare la stessa istanza?"
    CV Manager e progettato come applicazione per un singolo utente. Ogni istanza gestisce il CV di una persona. Per piu persone, eseguire container separati.

## Modifica

??? question "Come si contrassegna una posizione come 'attuale'?"
    Lasciare il campo **Data di fine** vuoto. Verra visualizzato come "Presente" nel CV.

??? question "E possibile riordinare gli elementi all'interno di una sezione?"
    Si. La maggior parte degli elementi supporta il riordinamento tramite trascinamento. L'ordine viene salvato automaticamente.

??? question "Come si aggiungono punti elenco a un'esperienza?"
    Modificare l'esperienza e inserire i punti salienti nel campo **Punti salienti** — un punto elenco per riga.

??? question "Come si aggiunge un logo aziendale?"
    Modificare l'esperienza, scorrere fino alla sezione **Logo aziendale** e fare clic su **Scegli immagine** per caricarlo. E anche possibile fare clic su **Usa esistente** per riutilizzare un logo gia caricato. Attivare l'interruttore **"Sincronizza il logo su tutte le esperienze di [Azienda]"** per applicare lo stesso logo a tutte le esperienze presso quell'azienda.

??? question "Ho eliminato qualcosa per errore. Posso annullare?"
    Non esiste una funzione di annullamento. Poiche le modifiche vengono salvate automaticamente nel dataset attivo, la modifica viene resa permanente immediatamente. Se si dispone di un'esportazione precedente o di un dataset salvato separato, e possibile ripristinare da quello. E buona pratica esportare regolarmente il CV come backup.

## Sezioni personalizzate

??? question "Quante sezioni personalizzate posso creare?"
    Non esiste un limite massimo. E possibile crearne quante se ne desiderano.

??? question "E possibile cambiare il tipo di layout di una sezione personalizzata dopo averla creata?"
    Si. Modificare la sezione e selezionare un layout diverso. Si noti che alcuni campi potrebbero non essere trasferiti tra tipi di layout (ad es. passando da schede a link social).

??? question "Qual e la differenza tra i layout 'Elenco puntato' e 'Testo libero'?"
    **Elenco puntato** visualizza ogni riga come un elemento di lista puntata con un titolo di gruppo. **Testo libero** visualizza testo semplice con interruzioni di riga preservate e senza titolo — simile alla sezione Informazioni personali/Biografia.

## Stampa e PDF

??? question "Perche il mio PDF ha un aspetto diverso dallo schermo?"
    L'output di stampa utilizza stili di stampa dedicati ottimizzati per la carta. Alcuni effetti visivi (stati hover, animazioni, gradienti) vengono semplificati. Gli elementi nascosti e i controlli admin vengono rimossi automaticamente.

??? question "Come faccio a far stare il CV in meno pagine?"
    Provare ad abilitare **Consenti suddivisione sezioni** e **Consenti suddivisione elementi** nelle impostazioni di Stampa ed esportazione. E anche possibile nascondere elementi o sezioni meno importanti, oppure utilizzare layout di sezioni personalizzate piu compatti. Si puo inoltre ridimensionare la stampa tramite la finestra di stampa di qualsiasi browser (a volte un po' nascosta).

??? question "Perche alcuni elementi mancano dal CV stampato?"
    Verificare se quegli elementi sono stati impostati come nascosti (icona occhio). Gli elementi nascosti vengono esclusi dall'output di stampa e dalla vista pubblica.

??? question "I numeri di pagina non vengono visualizzati?"
    Assicurarsi che **Numeri di pagina** sia abilitato in Impostazioni → Stampa ed esportazione. Alcuni visualizzatori PDF del browser potrebbero non mostrare i numeri di pagina generati tramite CSS — provare a scaricare il PDF e aprirlo in un lettore dedicato.

## Timeline

??? question "La timeline mostra le date sbagliate / solo gli anni / le date complete?"
    La timeline ha la propria impostazione per le date. Andare in **Impostazioni → Avanzate → Timeline: Solo anni** per alternare tra la visualizzazione solo anno e il formato data completo.

??? question "Posso aggiungere voci direttamente alla timeline?"
    No. La timeline viene generata automaticamente dalle esperienze lavorative. Aggiungere o modificare le esperienze e la timeline si aggiornera di conseguenza.

??? question "La bandiera del paese non viene mostrata sulla timeline?"
    Assicurarsi che il campo **Codice paese** nell'esperienza sia impostato su un codice ISO a 2 lettere valido (ad es. `us`, `gb`, `ch`, `de`, `fr`). Le bandiere vengono caricate da un CDN esterno.

??? question "Cosa succede quando si hanno due lavori contemporaneamente?"
    La timeline rileva automaticamente le posizioni sovrapposte e le visualizza come **tracce parallele**. Il lavoro contemporaneo appare su una linea di ramificazione sopraelevata con connettori a curva S che mostrano i punti di biforcazione e ricongiungimento. Non e necessaria alcuna configurazione — si basa interamente sulle date di inizio/fine. Le sovrapposizioni inferiori a 1 mese vengono ignorate (comuni durante i cambi di lavoro).

??? question "Perche la timeline mostra un logo invece del nome dell'azienda?"
    Se e stato caricato un logo aziendale per quell'esperienza, la timeline visualizza l'immagine del logo al posto del testo. Se il file del logo e mancante, viene mostrato il nome dell'azienda come fallback. Per rimuovere un logo dalla timeline, modificare l'esperienza e fare clic su **Rimuovi** nella sezione Logo aziendale.

## Lingua e aggiornamenti

??? question "Come si cambia la lingua dell'admin?"
    Fare clic sull'**icona del globo** nella barra degli strumenti e selezionare una lingua dalla griglia a discesa. La modifica si applica immediatamente e viene salvata tra le sessioni.

??? question "Come si verifica quale versione si sta utilizzando?"
    Aprire le **Impostazioni** — il numero di versione e mostrato nell'angolo in basso a sinistra della finestra modale (ad es. `v1.11.0`).

??? question "Non vedo il banner di aggiornamento anche se e disponibile una nuova versione?"
    Il controllo della versione viene memorizzato nella cache per 24 ore. Riavviare il server (o il container Docker) per svuotare la cache e forzare un nuovo controllo. Il server necessita inoltre di accesso Internet in uscita per raggiungere `raw.githubusercontent.com`.

## Dataset / CV multipli

??? question "Cos'e il dataset 'Default'?"
    Il dataset predefinito e la versione del CV che i visitatori vedono all'URL principale (`/`). Alla prima installazione, CV Manager crea automaticamente un dataset "Default" dai dati del CV. E possibile cambiare quale dataset e il predefinito in qualsiasi momento utilizzando il pulsante radio nella finestra Apri.

??? question "Le modifiche vengono salvate automaticamente?"
    Si. Ogni modifica effettuata nell'admin (aggiunta, modifica, eliminazione, riordinamento, attivazione/disattivazione della visibilita) viene automaticamente salvata nel dataset attivo dopo un breve ritardo. Il banner mostra "Salvataggio..." poi "Salvato" per confermare.

??? question "Cosa succede quando si 'Carica' un dataset?"
    Il caricamento di un dataset passa la copia di lavoro a quel dataset. Le modifiche precedenti sono gia state salvate automaticamente, quindi nulla va perso.

??? question "I visitatori possono vedere le mie modifiche in tempo reale?"
    No. Il sito pubblico serve il dataset predefinito congelato, non le modifiche in tempo reale. I visitatori vedono le modifiche solo dopo che il salvataggio automatico le scrive nel dataset predefinito. Se si sta modificando un dataset non predefinito, i visitatori non vedranno affatto quelle modifiche finche non lo si imposta come predefinito.

??? question "I visitatori possono vedere i miei dataset salvati?"
    Solo se vengono resi pubblici. Ogni dataset ha un interruttore nella finestra Apri. Quando impostato su pubblico, quella versione diventa accessibile a `/v/slug` sul sito pubblico (porta 3001). I dataset privati sono visibili in anteprima solo dall'interfaccia admin.

??? question "Come si condivide una versione specifica del CV con qualcuno?"
    Aprire la finestra **Apri...**, attivare l'interruttore del dataset su pubblico, quindi fare clic sull'icona di copia accanto all'URL dello slug. Condividere quel link — funziona sul sito pubblico senza esporre l'interfaccia admin.

??? question "Posso avere piu versioni pubbliche contemporaneamente?"
    Si. E possibile rendere pubblici quanti dataset si desidera. Ognuno ottiene il proprio URL (ad es. `/v/technical-cv-1`, `/v/marketing-cv-2`). La pagina principale `/` mostra il dataset predefinito.

??? question "Posso eliminare il dataset predefinito?"
    No. Il dataset attualmente selezionato come predefinito (tramite il pulsante radio) non puo essere eliminato. Impostare prima un altro dataset come predefinito, quindi eliminare quello precedente.

??? question "I motori di ricerca indicizzeranno i miei URL versionati?"
    Per impostazione predefinita, no — le pagine versionate hanno `noindex, nofollow`. Per consentire l'indicizzazione, abilitare **Indicizza URL versionati** in Impostazioni → Avanzate.

## Sito pubblico e SEO

??? question "Come si condivide il proprio CV?"
    Condividere l'URL del proprio server pubblico (porta 3001). Se e stato configurato un dominio con Cloudflare Tunnel o un reverse proxy, condividere quel dominio. L'URL principale mostra sempre il dataset predefinito. E anche possibile condividere versioni specifiche utilizzando URL pubblici versionati (vedere [Dataset](../guide/datasets.md)).

??? question "I motori di ricerca indicizzeranno il mio CV?"
    Per impostazione predefinita, si — la pagina pubblica principale include meta tag appropriati, una sitemap e robots.txt. Per impedire l'indicizzazione, cambiare l'impostazione **Indicizzazione motori di ricerca** su "No Index" in Impostazioni → Avanzate. Gli URL pubblici versionati (`/v/slug`) **non vengono indicizzati** per impostazione predefinita; abilitare **Indicizza URL versionati** se si desidera che vengano indicizzati.

??? question "Posso aggiungere Google Analytics al mio CV?"
    Si. Incollare il codice di tracciamento in **Impostazioni → Avanzate → Codice di tracciamento**. Viene iniettato solo nelle pagine pubbliche.

## Docker e infrastruttura

??? question "Le mie modifiche non appaiono sul sito pubblico?"
    Il sito pubblico serve il **dataset predefinito**, che viene aggiornato automaticamente quando si modifica nell'admin. Provare un aggiornamento forzato (`Ctrl+Shift+R`) sul sito pubblico. Se si eseguono container separati, assicurarsi che condividano lo stesso volume dati.

??? question "Ricevo un errore 'porta gia in uso'?"
    Cambiare la mappatura della porta host nella configurazione Docker. Ad esempio, mappare su `3010:3000` e `3011:3001`. **Non** modificare la variabile d'ambiente `PUBLIC_PORT` — quella e la porta interna del container.

??? question "Come si effettua il backup dei dati?"
    Due opzioni: utilizzare il pulsante **Esporta** nella barra degli strumenti dell'admin (esporta JSON), oppure fare il backup della directory `data/` che contiene il database SQLite e le immagini caricate.

??? question "La foto profilo non viene visualizzata?"
    Assicurarsi che l'immagine sia stata caricata tramite l'interfaccia admin. Il file viene archiviato in `data/uploads/picture.jpeg`. Verificare i permessi del file se si utilizza Linux.

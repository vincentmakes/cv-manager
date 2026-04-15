# Dataset (Versioni Multiple del CV)

## Come Funzionano i Dataset

I dataset sono istantanee salvate del vostro CV. Un dataset è sempre quello **predefinito** — questa è la versione che i visitatori vedono al vostro URL principale (`/`). Potete creare dataset aggiuntivi per destinatari diversi (ad esempio, un CV tecnico, un CV manageriale) e condividerli tramite URL dedicati.

Quando installate CV Manager per la prima volta, un dataset "Default" viene creato automaticamente a partire dai dati del vostro CV. Tutte le modifiche che apportate nell'interfaccia di amministrazione vengono **salvate automaticamente** nel dataset attivo — non esiste un passaggio separato di "salvataggio".

## Il Banner del Dataset Attivo

Un banner sotto la barra degli strumenti mostra quale dataset state attualmente modificando. Visualizza:

- Il **nome del dataset** (ad esempio, "Default", "CV Tecnico")
- Un **badge "Default"** se questo dataset è quello servito all'indirizzo `/`
- Uno **stato di salvataggio automatico** — mostra brevemente "Saving…" e poi "✓ Saved" dopo ogni modifica

Ogni modifica apportata (aggiunta di elementi, modifica di contenuti, riordinamento, attivazione/disattivazione della visibilità) viene automaticamente salvata nel dataset attivo dopo un breve ritardo.

## Salvare un Nuovo Dataset

Cliccate su **Salva con nome...** nella barra degli strumenti per aprire la finestra di salvataggio. Da qui potete creare un dataset completamente nuovo oppure sovrascriverne uno esistente.

La finestra è composta da due parti:

- Un **campo nome** in alto, precompilato con il nome del dataset attualmente attivo
- Un elenco dei **CV esistenti** sottostante, in cui le versioni correlate sono raggruppate visivamente

### Versioni raggruppate

I dataset che condividono lo stesso nome di base vengono mostrati insieme. Ad esempio, `Frontend Engineer`, `Frontend Engineer v2` e `Frontend Engineer v3` compaiono come un unico blocco sotto un'intestazione condivisa — ogni versione è contrassegnata con un piccolo badge `v1`/`v2`/`v3`. I CV autonomi senza altre versioni correlate vengono mostrati come una singola riga.

### Clicca un CV per sovrascriverlo

Cliccando su una qualsiasi riga dell'elenco, il campo nome viene riempito con il nome di quel CV e il pulsante principale passa a **Sovrascrivi "…"** (arancione). Cliccandolo vi verrà chiesto di confermare prima di sostituire quel CV con i dati attuali.

### Creare una nuova versione

Ogni gruppo dispone di una scorciatoia **+ Nuova versione** che suggerisce il prossimo nome `vN` libero — se `Frontend Engineer v3` è la versione più recente, la scorciatoia riempie il campo con `Frontend Engineer v4`. Il pulsante mostra **Salva come nuovo "…"** e inviando si salva la nuova versione accanto a quelle esistenti.

### Digitare un nuovo nome

Se digitate un nome che non corrisponde ad alcun CV esistente, il pulsante mostra **Salva come nuovo "…"** (blu). Inviando si crea un dataset completamente nuovo.

!!! tip
    Utilizzate la convenzione di denominazione `Base vN` (ad esempio `Frontend Engineer`, `Frontend Engineer v2`) per ottenere il raggruppamento automatico delle versioni e il suggerimento della versione successiva. I dataset senza suffisso `vN` vengono trattati come la "v1" del loro nome.

## La Finestra di Apertura

Cliccate su **Open...** per visualizzare tutti i dataset salvati. Una **legenda** in alto spiega i tre controlli:

| Controllo | Scopo |
|-----------|-------|
| **Pulsante radio** | Seleziona quale dataset viene servito al vostro URL principale `/` (il predefinito) |
| **Interruttore** | Condivide altri dataset al proprio URL `/v/slug` |
| **Pulsante occhio** | Anteprima di un dataset salvato senza renderlo pubblico |

Le versioni correlate di uno stesso CV di base vengono **raggruppate**. Una famiglia come `Frontend Engineer`, `Frontend Engineer v2`, `Frontend Engineer v3` appare come un unico blocco sotto un'intestazione condivisa — ogni versione è rientrata sotto un connettore ad albero ed etichettata con un piccolo badge `v1` / `v2` / `v3`. I CV autonomi senza altre versioni continuano a essere visualizzati come una singola riga.

Ogni riga di dataset mostra:

- **Nome** e data dell'ultimo aggiornamento
- **Badge "Default"** — sul dataset selezionato con il pulsante radio
- **Badge "Editing"** — sul dataset attualmente caricato nell'interfaccia di amministrazione
- Un **URL con versione** (ad esempio, `/v/technical-cv-1`) — nascosto per il dataset predefinito poiché viene servito all'indirizzo `/`
- Pulsante **Load** — passa a questo dataset (mostra "Reload" se già attivo)
- Pulsante **Delete** — rimuove permanentemente il dataset (disabilitato per il predefinito corrente)

## Impostare il Dataset Predefinito

Il dataset predefinito è la versione che i visitatori vedono quando accedono al vostro URL principale (`/`). Per cambiarlo:

1. Aprite la finestra **Open...**
2. Cliccate sul **pulsante radio** accanto al dataset che desiderate come CV pubblico
3. La modifica ha effetto immediato — il sito pubblico ora serve quel dataset

Questo separa il vostro CV pubblico dalla fase di modifica. Potete modificare liberamente i contenuti nell'interfaccia di amministrazione senza che i visitatori vedano le modifiche in corso fino a quando non siete pronti.

## URL Pubblici con Versione

Ogni dataset salvato (diverso da quello predefinito) ottiene un percorso URL univoco (ad esempio, `/v/technical-cv-1`). Per impostazione predefinita, questi sono **privati** — accessibili solo dall'interfaccia di amministrazione per l'anteprima.

Per condividere pubblicamente una versione specifica:

1. Aprite la finestra **Open...**
2. Trovate il dataset che desiderate condividere
3. Attivate l'**interruttore** accanto ad esso — diventa blu e appare un badge verde **Public**
4. L'URL `/v/slug` è ora accessibile sul **sito pubblico** (porta 3001)

Questo vi permette di condividere versioni personalizzate del CV con destinatari diversi. Ad esempio, potreste rendere pubblico un "CV Tecnico" per ruoli di ingegneria mantenendo privato un "CV Manageriale" fino a quando non sarà necessario.

**Copiare l'URL**: Cliccate sull'icona di copia accanto allo slug per copiare l'URL completo negli appunti. Il messaggio toast vi informerà se avete copiato un URL pubblico o solo di anteprima.

!!! note
    La pagina pubblica principale all'indirizzo `/` mostra sempre il **dataset predefinito** — non le vostre modifiche in tempo reale. Questo significa che potete sperimentare liberamente nell'interfaccia di amministrazione senza influire su ciò che vedono i visitatori.

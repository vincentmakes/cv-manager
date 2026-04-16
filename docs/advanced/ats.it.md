# Compatibilità ATS

## Cos'è un ATS?

Un **ATS** (Applicant Tracking System, sistema di tracciamento delle candidature) è un software utilizzato da recruiter e aziende per gestire le candidature. Quando caricate il vostro CV su un portale di lavoro o un sito aziendale, un ATS analizza il documento per estrarre dati strutturati — il vostro nome, titoli professionali, aziende, date, competenze e formazione. Questi dati vengono poi utilizzati per il matching delle parole chiave, la classificazione e il filtraggio dei candidati.

Se l'ATS non riesce ad analizzare correttamente il vostro documento, la vostra candidatura potrebbe essere scartata o informazioni chiave potrebbero andare perse — anche se le vostre qualifiche sono perfettamente corrispondenti.

## Ottimizzazione ATS integrata

CV Manager genera automaticamente output compatibile con gli ATS sul sito pubblico:

- **Markup Schema.org** — dati strutturati che i sistemi ATS possono analizzare (Person, OrganizationRole, EducationalOccupationalCredential, ecc.)
- **HTML semantico** — gerarchia corretta dei titoli, elementi article e liste
- **Blocco ATS nascosto** — una versione in testo semplice del vostro CV è incorporata nella pagina per i parser che non elaborano HTML formattato
- **Output di stampa pulito** — nessun elemento visivo superfluo, gerarchia dei contenuti corretta

Non è necessaria alcuna configurazione speciale — queste funzionalità sono sempre attive.

## Esportazione documento ATS

Oltre all'ottimizzazione web integrata, CV Manager può generare un **PDF dedicato compatibile con gli ATS**, progettato specificamente per il caricamento su portali di lavoro e sistemi ATS.

### Come utilizzare

1. Fate clic su **Documento ATS** nella barra degli strumenti di amministrazione
2. Regolate il cursore **Scala** per controllare la densità del contenuto (50%–150%)
3. Scegliete il **Formato carta** preferito (A4 o Letter)
4. Se lavorate in una lingua diversa dall'inglese, potete facoltativamente selezionare **Intestazioni delle sezioni in inglese** per visualizzare le intestazioni (Esperienza lavorativa, Formazione, Competenze, ecc.) in inglese mantenendo tutto il resto nella lingua attiva
5. Visualizzate l'anteprima del documento nella finestra modale
6. Fate clic su **Scarica PDF** per salvare il file

### Intestazioni delle sezioni in inglese

Quando il vostro CV è in una lingua diversa dall'inglese, molti sistemi ATS si aspettano comunque intestazioni in inglese per categorizzare correttamente il contenuto. La casella **Intestazioni delle sezioni in inglese** (visibile solo quando la lingua attiva non è l'inglese) forza le intestazioni a essere visualizzate in inglese mentre tutto il resto — date, contenuti, competenze — resta nella lingua attiva.

Questo è utile quando vi candidate presso aziende internazionali o tramite portali di lavoro in lingua inglese con un CV scritto in un'altra lingua.

### Differenza con Stampa / PDF

| Caratteristica | Stampa / PDF | Documento ATS |
|----------------|--------------|---------------|
| **Scopo** | Presentazione visiva | Analisi automatica |
| **Layout** | Design completo con colori, icone, timeline | Testo strutturato e pulito, formattazione minima |
| **Contenuto** | Tutte le sezioni visibili inclusa la timeline | Tutte le sezioni tranne la timeline (non rilevante per ATS) |
| **Controllo scala** | Finestra di stampa del browser | Cursore integrato con anteprima in tempo reale |
| **Generazione** | Motore di stampa del browser | Lato server (pdfmake) |
| **Coerenza** | Varia a seconda del browser | Output identico ovunque |

### Consigli per il successo con gli ATS

!!! tip "Usate il documento ATS per le candidature"
    Caricate sempre il documento ATS (non la versione Stampa/PDF) quando vi candidate tramite portali di lavoro. Il layout strutturato è progettato per essere analizzato correttamente dai sistemi automatizzati.

!!! tip "Mantenete completa la sezione competenze"
    I sistemi ATS si basano fortemente sul matching delle parole chiave. Assicuratevi che la sezione Competenze contenga tutte le tecnologie, strumenti e metodologie rilevanti — l'esportazione ATS li include come lista piatta di parole chiave per un migliore matching.

!!! tip "Usate Stampa/PDF per i lettori umani"
    Quando inviate il vostro CV direttamente via email a un responsabile delle assunzioni o lo portate a un colloquio, usate la versione Stampa/PDF — ha il design visivo completo con i colori del vostro tema e la timeline.

!!! tip "Scala per densità"
    Se il vostro CV è lungo, provate a ridurre la scala al 70–80% per inserire più contenuto per pagina. L'anteprima si aggiorna in tempo reale così potete trovare il giusto equilibrio.

!!! tip "Intestazioni in inglese per candidature internazionali"
    Se il contenuto del vostro CV è in francese, tedesco o un'altra lingua, attivate l'opzione delle intestazioni in inglese quando vi candidate presso aziende che utilizzano sistemi ATS in lingua inglese. La maggior parte dei parser ATS si aspetta intestazioni in inglese come "Work Experience" ed "Education".

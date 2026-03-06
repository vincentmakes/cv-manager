# Compatibilità ATS

## Cos'è un ATS?

Un **ATS** (Applicant Tracking System, sistema di tracciamento delle candidature) è un software utilizzato da recruiter e aziende per gestire le candidature. Quando carichi il tuo CV su un portale di lavoro o sito web aziendale, un ATS analizza il documento per estrarre dati strutturati — il tuo nome, titoli professionali, aziende, date, competenze e formazione. Questi dati vengono poi utilizzati per il matching delle parole chiave, la classificazione e il filtraggio dei candidati.

Se l'ATS non riesce ad analizzare correttamente il tuo documento, la tua candidatura potrebbe essere scartata o informazioni chiave potrebbero andare perse — anche se le tue qualifiche sono perfettamente corrispondenti.

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

1. Clicca su **Documento ATS** nella barra degli strumenti di amministrazione
2. Regola il cursore **Scala** per controllare la densità del contenuto (50%–150%)
3. Scegli il **Formato carta** preferito (A4 o Letter)
4. Visualizza l'anteprima del documento nel modale
5. Clicca su **Scarica PDF** per salvare il file

### Differenza con Stampa / PDF

| Caratteristica | Stampa / PDF | Documento ATS |
|----------------|--------------|---------------|
| **Scopo** | Presentazione visiva | Analisi automatica |
| **Layout** | Design completo con colori, icone, cronologia | Testo strutturato e pulito, formattazione minima |
| **Contenuto** | Tutte le sezioni visibili inclusa la cronologia | Tutte le sezioni tranne la cronologia (non rilevante per ATS) |
| **Controllo scala** | Finestra di stampa del browser | Cursore integrato con anteprima in tempo reale |
| **Generazione** | Motore di stampa del browser | Lato server (pdfmake) |
| **Coerenza** | Varia a seconda del browser | Output identico ovunque |

### Consigli per il successo con gli ATS

!!! tip "Usa il documento ATS per le candidature"
    Carica sempre il documento ATS (non la versione Stampa/PDF) quando ti candidi tramite portali di lavoro. Il layout strutturato è progettato per essere analizzato correttamente dai sistemi automatizzati.

!!! tip "Mantieni completa la sezione competenze"
    I sistemi ATS si basano fortemente sul matching delle parole chiave. Assicurati che la sezione Competenze contenga tutte le tecnologie, strumenti e metodologie rilevanti — l'esportazione ATS li include come lista piatta di parole chiave per un migliore matching.

!!! tip "Usa Stampa/PDF per i lettori umani"
    Quando invii il tuo CV direttamente via email a un responsabile delle assunzioni o lo porti a un colloquio, usa la versione Stampa/PDF — ha il design visivo completo con i colori del tuo tema e la cronologia.

!!! tip "Scala per densità"
    Se il tuo CV è lungo, prova a ridurre la scala al 70–80% per inserire più contenuto per pagina. L'anteprima si aggiorna in tempo reale così puoi trovare il giusto equilibrio.

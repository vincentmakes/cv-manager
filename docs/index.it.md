# CV Manager

Un sistema di gestione CV/curriculum self-hosted, distribuito tramite Docker. Create, personalizzate e condividete CV professionali dal vostro server.

---

## Cos'è CV Manager?

CV Manager è un'applicazione web che funziona sul vostro server tramite Docker. Offre due interfacce:

- **Admin** (porta predefinita 3000) — dove costruite e gestite il vostro CV
- **Pubblica** (porta predefinita 3001) — una versione di sola lettura da condividere con recruiter, datori di lavoro o chiunque altro

I dati vengono archiviati localmente in un database SQLite. Nessuna informazione viene inviata a server esterni.

## Funzionalità principali

- **7 sezioni predefinite** — Informazioni personali, Timeline, Esperienze lavorative, Certificazioni, Formazione, Competenze, Progetti
- **Sezioni personalizzate** — Possibilità di aggiungere qualsiasi contenuto con 7 tipi di layout (griglie, elenchi, schede, link social, elenchi puntati, testo libero)
- **Visualizzazione timeline** — Generata automaticamente dalle esperienze lavorative con supporto per posizioni parallele
- **Versioni multiple del CV** — Salvataggio di dataset per diversi destinatari con URL pubblici versionati
- **Personalizzazione del tema** — Selettore colore, formati data, modalità chiara/scura
- **Stampa ed esportazione PDF** — Output di stampa ottimizzato con numeri di pagina e suddivisione configurabili
- **Compatibile con ATS** — Markup Schema.org, HTML semantico, blocco di testo nascosto per ATS
- **8 lingue per l'interfaccia** — Inglese, Tedesco, Francese, Olandese, Spagnolo, Italiano, Portoghese, Cinese
- **Importazione ed esportazione** — Backup e ripristino completi in formato JSON
- **Distribuzione Docker** — Installazione con un solo comando, Docker Compose, supporto Unraid

## Link rapidi

<div class="grid cards" markdown>

- :material-rocket-launch: **[Per iniziare](getting-started/index.md)** — Installazione e configurazione di CV Manager
- :material-book-open-variant: **[Guida utente](guide/index.md)** — Scoprite come utilizzare ogni funzionalità
- :material-cog: **[Avanzate](advanced/index.md)** — SEO, sicurezza e impostazioni ATS
- :material-frequently-asked-questions: **[FAQ](reference/faq.md)** — Risposte alle domande più frequenti

</div>

## Supporto

- **GitHub**: [github.com/vincentmakes/cv-manager](https://github.com/vincentmakes/cv-manager)
- **Segnalazioni**: [github.com/vincentmakes/cv-manager/issues](https://github.com/vincentmakes/cv-manager/issues)
- **Supporta il progetto**: [ko-fi.com/vincentmakes](https://ko-fi.com/vincentmakes)

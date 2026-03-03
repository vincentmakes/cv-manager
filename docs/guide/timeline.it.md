# Timeline

La timeline viene generata automaticamente dalle esperienze lavorative. Visualizza:

- Loghi aziendali (o nomi delle aziende se non è stato impostato alcun logo)
- Titoli professionali
- Intervalli di date
- Bandiere dei paesi (quando il paese cambia tra le esperienze)

## Navigazione tramite clic sulla timeline

Facendo clic su qualsiasi elemento della timeline, la pagina scorre fino alla scheda dell'esperienza corrispondente e la evidenzia brevemente.

## Posizioni parallele (ramificazione della timeline)

Quando due o più esperienze lavorative si sovrappongono nel tempo, la timeline può mostrarle automaticamente come **tracce parallele**:

- La posizione contemporanea si divide su una **traccia secondaria** sopra la timeline principale
- **Connettori a curva S** mostrano visivamente dove la ramificazione si separa e si ricongiunge alla traccia principale
- Se una posizione parallela è ancora in corso (senza data di fine), la linea della ramificazione si estende fino al bordo destro della timeline
- Le schede degli elementi sulla traccia secondaria sono posizionate separatamente per evitare sovrapposizioni con le schede della traccia principale

Non è necessaria alcuna configurazione — la ramificazione è completamente automatica in base alle date delle esperienze. Se si preferisce una timeline piatta senza ramificazioni, è possibile disattivarle in **Impostazioni → Avanzate → Timeline: Ramificazione**.

### Quando viene creata una ramificazione?

Una ramificazione viene creata quando due esperienze si sovrappongono per **3 o più mesi**. Questa soglia filtra le brevi transizioni (iniziare un nuovo lavoro uno o due mesi prima di lasciare il precedente) mostrando correttamente le posizioni genuinamente simultanee.

**Eccezione per posizioni brevi:** Se un'esperienza è molto breve (ad es. un ruolo ad interim di 2 mesi) e rientra interamente nel periodo di un'altra posizione, apparirà sempre sulla traccia secondaria — anche se la sua durata è inferiore a 3 mesi. L'importante è che l'intera durata sia contenuta nelle date dell'altra posizione.

### Quando una ramificazione resta continua?

Se si mantiene una posizione di lunga durata (ad es. un lavoro part-time o un'attività secondaria) insieme a una serie di posizioni principali successive, la ramificazione resta **continua** — un'unica linea parallela alla traccia principale. Anche se una delle posizioni successive è troppo breve per raggiungere la soglia di sovrapposizione, la ramificazione non si ricongiunge per poi separarsi nuovamente finché la stessa posizione di lunga durata rimane il punto di ancoraggio comune.

### Quando NON viene creata una ramificazione?

- **Le sovrapposizioni di 1–2 mesi** tra due posizioni lunghe vengono trattate come transizioni lavorative, non come impiego parallelo. Questo è il caso più comune: si inizia un nuovo ruolo poco prima che termini il preavviso nel precedente.
- **Nessuna sovrapposizione** — le posizioni successive senza sovrapposizione di date restano sulla traccia principale.
- **Spazio orizzontale insufficiente** — se la timeline è molto compressa (molti elementi in una larghezza ridotta), le ramificazioni troppo strette per essere visualizzate chiaramente vengono automaticamente riportate sulla traccia principale.

## Attivare/Disattivare la ramificazione della timeline

Per impostazione predefinita, la ramificazione della timeline è attivata. È possibile disattivarla in **Impostazioni → Avanzate → Timeline: Ramificazione**. Quando disattivata, tutte le esperienze vengono visualizzate in un layout piatto e alternato su un'unica traccia — non vengono mostrate curve di biforcazione/fusione né linee di ramificazione sopraelevate, anche se le esperienze si sovrappongono nel tempo.

## Formato data della timeline

Per impostazione predefinita, la timeline mostra solo gli anni (ad es. "2020 - 2023"). Potete modificare questa impostazione in **Impostazioni → Avanzate → Timeline: Solo anni**. Quando disattivato, la timeline utilizza lo stesso formato data del resto del CV.

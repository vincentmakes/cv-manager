# Zeitstrahl

Der Zeitstrahl wird automatisch aus Ihren Berufserfahrungen generiert. Er zeigt:

- Unternehmenslogos (oder Unternehmensnamen, wenn kein Logo gesetzt ist)
- Jobtitel
- Zeiträume
- Länderflaggen (wenn sich das Land zwischen Erfahrungen ändert)

## Zeitstrahl-Klicknavigation

Durch Klicken auf ein Element im Zeitstrahl wird zur entsprechenden Erfahrungskarte gescrollt und diese kurz hervorgehoben.

## Parallele Positionen (Zeitstrahl-Verzweigung)

Wenn sich zwei oder mehr Berufserfahrungen zeitlich überlappen, kann der Zeitstrahl sie automatisch als **parallele Spuren** darstellen:

- Die gleichzeitige Position wird auf eine **Nebenspur** oberhalb des Hauptzeitstrahls aufgeteilt
- **S-Kurven-Verbindungen** zeigen visuell, wo die Verzweigung vom Hauptstrang abzweigt und wieder zusammenführt
- Wenn eine parallele Position noch andauert (kein Enddatum), erstreckt sich die Nebenspur bis zum rechten Rand des Zeitstrahls
- Karten für Nebenspur-Elemente werden separat positioniert, um Überlappungen mit Hauptspur-Karten zu vermeiden

Es ist keine Konfiguration erforderlich — die Verzweigung erfolgt vollautomatisch basierend auf Ihren Erfahrungsdaten.

### Wann wird eine Verzweigung erstellt?

Eine Verzweigung wird erstellt, wenn sich zwei Erfahrungen um **3 oder mehr Monate** überlappen. Dieser Schwellenwert filtert kurze Übergangsphasen heraus (z. B. wenn man einen neuen Job ein bis zwei Monate vor dem Verlassen des alten beginnt), zeigt aber echte gleichzeitige Positionen korrekt an.

**Ausnahme für kurze Positionen:** Wenn eine Erfahrung sehr kurz ist (z. B. eine 2-monatige Vertretungsrolle) und vollständig innerhalb des Zeitraums einer anderen Position liegt, erscheint sie immer auf der Nebenspur — auch wenn ihre Dauer weniger als 3 Monate beträgt. Entscheidend ist, dass ihre gesamte Laufzeit innerhalb der Daten der anderen Position liegt.

### Wann bleibt eine Verzweigung durchgehend?

Wenn Sie eine langfristige Position (z. B. eine Teilzeit- oder Nebentätigkeit) neben einer Reihe aufeinanderfolgender Hauptpositionen halten, bleibt die Verzweigung **durchgehend** — eine einzige Nebenspur parallel zum Hauptstrang. Auch wenn eine der aufeinanderfolgenden Positionen zu kurz ist, um den Überlappungsschwellenwert zu erreichen, führt die Verzweigung nicht zurück und gabelt sich erneut, solange dieselbe langfristige Position der gemeinsame Ankerpunkt ist.

### Wann wird KEINE Verzweigung erstellt?

- **Überlappungen von 1–2 Monaten** zwischen zwei langen Positionen werden als Stellenwechsel behandelt, nicht als parallele Beschäftigung. Dies ist der häufigste Fall — Sie beginnen eine neue Rolle kurz bevor Ihre Kündigungsfrist bei der alten endet.
- **Keine Überlappung** — aufeinanderfolgende Positionen ohne zeitliche Überschneidung bleiben auf dem Hauptstrang.
- **Unzureichender horizontaler Platz** — Wenn der Zeitstrahl sehr komprimiert ist (viele Einträge auf engem Raum), werden Verzweigungen, die zu schmal zur Darstellung wären, automatisch wieder auf den Hauptstrang zurückgeführt.

## Zeitstrahl-Datumsformat

Standardmäßig zeigt der Zeitstrahl nur Jahre an (z. B. „2020 - 2023"). Sie können dies unter **Einstellungen → Erweitert → Zeitstrahl: Nur Jahre** ändern. Wenn deaktiviert, verwendet der Zeitstrahl dasselbe Datumsformat wie der Rest Ihres Lebenslaufs.

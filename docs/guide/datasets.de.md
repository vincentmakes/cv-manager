# Datensätze (Mehrere Lebenslauf-Versionen)

## Wie Datensätze funktionieren

Datensätze sind gespeicherte Momentaufnahmen Ihres Lebenslaufs. Ein Datensatz ist immer der **Standard** — das ist die Version, die Besucher unter Ihrer Stamm-URL (`/`) sehen. Sie können zusätzliche Datensätze für verschiedene Zielgruppen erstellen (z. B. einen technischen Lebenslauf, einen Management-Lebenslauf) und diese über eigene URLs teilen.

Bei der Erstinstallation von CV Manager wird automatisch ein Standard-Datensatz aus Ihren Lebenslaufdaten erstellt. Alle Änderungen, die Sie im Admin-Bereich vornehmen, werden **automatisch gespeichert** — es gibt keinen separaten „Speichern"-Schritt.

## Das Banner des aktiven Datensatzes

Ein Banner unterhalb der Werkzeugleiste zeigt an, welchen Datensatz Sie gerade bearbeiten. Es zeigt:

- Den **Datensatznamen** (z. B. „Standard", „Technischer Lebenslauf")
- Ein **„Standard"-Badge**, wenn dieser Datensatz unter `/` angezeigt wird
- Einen **Autospeicher-Status** — zeigt kurz „Speichern…" und dann „✓ Gespeichert" nach jeder Änderung

Jede Änderung, die Sie vornehmen (Einträge hinzufügen, Inhalte bearbeiten, Reihenfolge ändern, Sichtbarkeit umschalten), wird nach einer kurzen Verzögerung automatisch im aktiven Datensatz gespeichert.

## Einen neuen Datensatz speichern

Klicken Sie auf **Speichern unter...** in der Werkzeugleiste, geben Sie einen Namen ein (z. B. „Technischer Lebenslauf", „Marketing-Stelle"), und Ihr aktueller Lebenslauf-Zustand wird als neue Momentaufnahme gespeichert. Der neue Datensatz wird zum aktiven Datensatz.

## Das Öffnen-Modal

Klicken Sie auf **Öffnen...**, um alle gespeicherten Datensätze anzuzeigen. Eine **Legende** oben erklärt die drei Steuerelemente:

| Steuerelement | Zweck |
|---------------|-------|
| **Optionsfeld** | Wählt aus, welcher Datensatz unter Ihrer Stamm-URL `/` angezeigt wird (der Standard) |
| **Schalter** | Gibt andere Datensätze unter einer eigenen `/v/slug`-URL frei |
| **Augen-Schaltfläche** | Vorschau eines gespeicherten Datensatzes, ohne ihn öffentlich zu machen |

Jede Datensatz-Zeile zeigt:

- **Name** und Datum der letzten Aktualisierung
- **„Standard"-Badge** — beim Datensatz, der mit dem Optionsfeld ausgewählt wurde
- **„Bearbeitung"-Badge** — beim Datensatz, der aktuell im Admin-Bereich geladen ist
- Eine **versionierte URL** (z. B. `/v/technical-cv-1`) — beim Standard-Datensatz ausgeblendet, da dieser unter `/` angezeigt wird
- **Laden**-Schaltfläche — wechselt zu diesem Datensatz (zeigt „Neu laden", wenn er bereits aktiv ist)
- **Löschen**-Schaltfläche — löscht den Datensatz dauerhaft (deaktiviert beim aktuellen Standard)

## Den Standard-Datensatz festlegen

Der Standard-Datensatz ist die Version, die Besucher sehen, wenn sie Ihre Stamm-URL (`/`) aufrufen. So ändern Sie ihn:

1. Öffnen Sie das **Öffnen...**-Modal
2. Klicken Sie auf das **Optionsfeld** neben dem Datensatz, den Sie als öffentlichen Lebenslauf verwenden möchten
3. Die Änderung wird sofort wirksam — die öffentliche Seite zeigt nun diesen Datensatz an

Dies entkoppelt Ihren öffentlichen Lebenslauf von Ihrer Bearbeitung. Sie können im Admin-Bereich frei Inhalte bearbeiten, ohne dass Besucher Ihre unfertigen Änderungen sehen, bis Sie bereit sind.

## Öffentliche versionierte URLs

Jeder gespeicherte Datensatz (außer dem Standard) erhält einen eindeutigen URL-Pfad (z. B. `/v/technical-cv-1`). Standardmäßig sind diese **privat** — nur über die Admin-Oberfläche zur Vorschau zugänglich.

Um eine bestimmte Version öffentlich zu teilen:

1. Öffnen Sie das **Öffnen...**-Modal
2. Finden Sie den Datensatz, den Sie teilen möchten
3. Schalten Sie den **Schalter** daneben um — er wird blau und ein grünes **Öffentlich**-Badge erscheint
4. Die `/v/slug`-URL ist nun auf der **öffentlichen Seite** (Port 3001) zugänglich

So können Sie maßgeschneiderte Lebenslauf-Versionen mit verschiedenen Zielgruppen teilen. Sie könnten beispielsweise einen „Technischen Lebenslauf" für Ingenieur-Stellen öffentlich machen, während Sie einen „Management-Lebenslauf" privat halten, bis er benötigt wird.

**URL kopieren**: Klicken Sie auf das Kopier-Symbol neben dem Slug, um die vollständige URL in die Zwischenablage zu kopieren. Die Benachrichtigung zeigt Ihnen an, ob Sie eine öffentliche oder eine Vorschau-URL kopiert haben.

!!! note
    Die öffentliche Hauptseite unter `/` zeigt immer den **Standard-Datensatz** — nicht Ihre aktuellen Bearbeitungen. Das bedeutet, dass Sie im Admin-Bereich experimentieren können, ohne zu beeinflussen, was Besucher sehen.

# Datensätze & Sprachvarianten

## Wie Datensätze funktionieren

Datensätze sind gespeicherte Momentaufnahmen Ihres Lebenslaufs. Ein Datensatz ist immer der **Standard** — das ist die Version, die Besucher unter Ihrer Stamm-URL (`/`) sehen. Sie können zusätzliche Datensätze für verschiedene Zielgruppen erstellen (z. B. einen technischen Lebenslauf, einen Management-Lebenslauf), in verschiedenen Sprachen, und diese über eigene URLs teilen.

Bei der Erstinstallation von CV Manager wird automatisch ein „Standard"-Datensatz aus Ihren Lebenslaufdaten erstellt. Alle Änderungen, die Sie im Admin-Bereich vornehmen, werden **automatisch gespeichert** — es gibt keinen separaten „Speichern"-Schritt.

## Die CV-Verwaltung

Klicken Sie auf **CV-Verwaltung** in der Werkzeugleiste, um das zentrale Modal für alle Datensatz-Operationen zu öffnen: Speichern, Laden, Versionen erstellen, Sprachen hinzufügen, Standard festlegen und Sichtbarkeit verwalten.

Das Modal hat zwei Bereiche:

- Ein **Speichern-unter-Formular** oben — Namensfeld, Sprachauswahl und eine Speichern-Schaltfläche
- Eine **Liste gespeicherter Lebensläufe** darunter — nach Basisnamen gruppiert, mit allen Verwaltungsaktionen

### Einen neuen Datensatz speichern

Das Namensfeld ist mit dem Namen des aktiven Datensatzes vorausgefüllt. Das Sprach-Dropdown zeigt standardmäßig die aktive Sprache.

- **Geben Sie einen neuen Namen ein** und klicken Sie auf die blaue Schaltfläche **Speichern unter „…"**, um einen völlig neuen Datensatz zu erstellen
- **Klicken Sie auf eine vorhandene Zeile** in der Liste, um das Namensfeld zu füllen — die Schaltfläche wechselt zur orangefarbenen **„…" überschreiben**-Schaltfläche (mit Bestätigung)

### Datensatz-Liste

Jeder gespeicherte Lebenslauf erscheint als **Gruppe** mit einer Kopfzeile, die den Basisnamen zeigt, einer **+ Neue Version**-Schaltfläche und einem Versions-/Sprachanzahl-Badge.

Innerhalb jeder Gruppe ist jede Sprachvariante eine Zeile:

```
○  DE  v2  Full Stack Developer v2     /v/full-stack-dev/de   16/04/2026   [Laden]  ⋮
```

- **Optionsfeld** (○) — wählt aus, welchen Datensatz Besucher unter `/` sehen (der Standard)
- **Sprach-Badge** (DE) — die Inhaltssprache dieser Variante
- **Versions-Badge** (v2) — wird angezeigt, wenn die Gruppe mehrere Versionen hat
- **Name** — der Datensatzname
- **URL** — der öffentliche URL-Pfad (wenn freigegeben oder Standard)
- **Datum** — letzte Änderung
- **Laden** — wechselt zur Bearbeitung dieses Datensatzes
- **⋮** (Overflow-Menü) — weitere Aktionen

### Overflow-Menü (⋮)

Das Overflow-Menü jeder Zeile enthält:

| Aktion | Beschreibung |
|--------|-------------|
| **Freigeben / Privat machen** | Öffentliche Sichtbarkeit unter `/v/slug` umschalten (beim Standard und dessen Sprachgeschwistern ausgeblendet) |
| **Sprache ändern** | Den Sprachcode dieses Datensatzes neu zuweisen |
| **Vorschau** | Die gespeicherte Version in einem neuen Tab öffnen |
| **URL kopieren** | Die öffentliche oder Vorschau-URL in die Zwischenablage kopieren |
| **Löschen** | Dauerhaft entfernen (beim Standard-Datensatz deaktiviert) |

## Versionen

Datensätze mit demselben Basisnamen werden gemeinsam gruppiert. Zum Beispiel erscheinen `Frontend Engineer`, `Frontend Engineer v2` und `Frontend Engineer v3` als ein Block unter einer gemeinsamen Überschrift.

### Eine neue Version erstellen

Klicken Sie auf **+ Neue Version** in der Gruppenüberschrift. Das Namensfeld wird automatisch mit der nächsten Versionsnummer gefüllt (z. B. `Frontend Engineer v4`). Beim Speichern erhält die neue Version:

- Ein eigenes Versions-Badge (v4)
- Denselben URL-Slug wie die Geschwister-Versionen
- Alle Sprachvarianten der vorherigen Version

### Einklappbare ältere Versionen

Wenn eine Gruppe mehrere Versionen hat, wird nur die neueste angezeigt. Ein **„N ältere Versionen"**-Schalter ermöglicht es, alle Versionen aufzuklappen. Wenn der aktuell bearbeitete oder der Standard-Datensatz in einer älteren Version liegt, wird diese automatisch aufgeklappt, damit Sie sie immer sehen können.

!!! tip
    Verwenden Sie die `Basis vN`-Namenskonvention (z. B. `Frontend Engineer`, `Frontend Engineer v2`), um automatische Versionsgruppierung und Vorschläge für die nächste Version zu erhalten.

## Sprachvarianten

Jede Version eines Datensatzes kann mehrere Sprachvarianten haben — zum Beispiel eine englische und eine deutsche Version desselben Lebenslaufs, die dieselbe Struktur teilen, aber unabhängige Inhalte haben.

### Eine Sprachvariante hinzufügen

1. Öffnen Sie die **CV-Verwaltung**
2. Klicken Sie auf **+ Sprache hinzufügen** in der Gruppenüberschrift (oder verwenden Sie den **⋮ → Sprache hinzufügen**-Ablauf aus dem Speichern-unter-Formular)
3. Wählen Sie die Zielsprache und speichern Sie

Die neue Variante beginnt als Kopie des vorhandenen Inhalts. Die Admin-Oberfläche wechselt automatisch zur neuen Sprache, damit Sie sofort mit dem Übersetzen beginnen können.

### Sprachen wechseln

Wenn Sie einen Datensatz bearbeiten, der Sprachgeschwister hat, erscheint ein **Sprachwechsler** im Banner des aktiven Datensatzes unterhalb der Werkzeugleiste. Klicken Sie auf einen Sprachcode, um zu wechseln — Ihre aktuelle Arbeit wird zuerst automatisch gespeichert, dann wird die andere Variante geladen und die UI-Sprache entsprechend angepasst.

### Strukturelle Synchronisierung

Änderungen an der **Struktur** — Abschnittsreihenfolge, Sichtbarkeit, Layout benutzerdefinierter Abschnitte und Anzahl der Einträge — werden automatisch über alle Sprachgeschwister hinweg synchronisiert. **Inhalte** (Text, Titel, Beschreibungen) bleiben pro Sprache unabhängig, sodass Sie frei übersetzen können, ohne sich um Layout-Abweichungen sorgen zu müssen.

### Die Sprache eines Datensatzes ändern

Klicken Sie auf das **Sprach-Badge** in einer beliebigen Zeile, um einen Picker zu öffnen und den Sprachcode neu zuzuweisen. Dies ist nützlich für ältere Datensätze, die bei der Einrichtung standardmäßig auf Englisch gesetzt wurden.

## Den Standard festlegen

Der Standard-Datensatz ist die Version, die Besucher unter Ihrer Stamm-URL (`/`) sehen. So ändern Sie ihn:

1. Öffnen Sie die **CV-Verwaltung**
2. Klicken Sie auf das **Optionsfeld** (○) neben dem Datensatz, den Sie als Standard festlegen möchten
3. Die Änderung wird sofort wirksam

Sprachgeschwister des Standards sind automatisch unter `/{lang}` (z. B. `/de`, `/fr`) erreichbar — sie benötigen keinen separaten Öffentlich-Schalter.

!!! note
    Die öffentliche Seite zeigt den gespeicherten Standard-Datensatz, nicht Ihre aktuellen Bearbeitungen. Sie können im Admin-Bereich bedenkenlos experimentieren, ohne zu beeinflussen, was Besucher sehen.

## Öffentliche versionierte URLs

Nicht-Standard-Datensätze können über eigene URLs freigegeben werden. Verwenden Sie die Aktion **⋮ → Freigeben**, um einen Datensatz unter `/v/slug` öffentlich zu machen. Mehrere Datensätze können gleichzeitig öffentlich sein.

- **Standard-Datensatz**: wird unter `/` angezeigt
- **Sprachgeschwister des Standards**: werden unter `/{lang}` angezeigt (z. B. `/fr`)
- **Freigegebene Datensätze**: werden unter `/v/slug` oder `/v/slug/{lang}` angezeigt
- **Private Datensätze**: nur aus dem Admin-Bereich als Vorschau zugänglich

!!! tip "URLs kopieren"
    Klicken Sie auf den URL-Pfad in jeder Zeile, um die vollständige öffentliche URL in Ihre Zwischenablage zu kopieren.

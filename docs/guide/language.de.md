# Sprache

## Sprache der Admin-Oberfläche

Klicken Sie auf das **Globus-Symbol** in der Werkzeugleiste, um die Sprache der Admin-Oberfläche zu wechseln. Ein Dropdown-Raster zeigt alle verfügbaren Sprachen — klicken Sie auf eine, um sie sofort anzuwenden.

**Unterstützte Sprachen:** Englisch (English), Deutsch, Französisch (Français), Niederländisch (Nederlands), Spanisch (Español), Italienisch (Italiano), Portugiesisch (Português), Chinesisch (中文).

Die Spracheinstellung betrifft nur die Beschriftungen, Schaltflächen und Menüs der Admin-Oberfläche. Ihre Einstellung wird gespeichert und bleibt über Sitzungen hinweg erhalten.

## Inhaltssprache des Lebenslaufs

Unabhängig von der Oberflächensprache hat jeder gespeicherte Datensatz seine eigene **Inhaltssprache** — das ist die Sprache, in der der Lebenslauf verfasst ist. Die Inhaltssprache wird als Badge (EN, DE, FR usw.) in jeder Datensatzzeile in der CV-Verwaltung angezeigt.

Wenn Sie einen Datensatz laden, wechselt die Admin-Oberfläche automatisch zur passenden Inhaltssprache. Das bedeutet: Wenn Sie einen deutschen Lebenslauf laden, wechselt die Oberfläche ebenfalls auf Deutsch, damit Abschnittsüberschriften und Formularbeschriftungen in derselben Sprache wie der bearbeitete Inhalt angezeigt werden.

### Die Sprache eines Datensatzes ändern

So ändern Sie die einem bestehenden Datensatz zugewiesene Sprache:

1. Öffnen Sie die **CV-Verwaltung**
2. Klicken Sie auf das **Sprach-Badge** (z. B. EN) in der Datensatzzeile
3. Wählen Sie die neue Sprache aus dem Picker

Damit wird der Sprachcode neu zugewiesen, ohne den Inhalt selbst zu ändern — nützlich für Datensätze, die bei der Ersteinrichtung standardmäßig auf Englisch gesetzt wurden.

## Sprachvarianten

Sie können **mehrere Sprachvarianten** desselben Lebenslaufs erstellen. Zum Beispiel können Sie eine englische und eine deutsche Version pflegen, die dieselbe Struktur teilen, aber unabhängige Inhalte haben.

Weitere Details zum Erstellen und Verwalten von Sprachvarianten finden Sie unter [Datensätze & Sprachvarianten](datasets.md#sprachvarianten).

## Sprachwechsel auf der öffentlichen Seite

Wenn der Standard-Datensatz Sprachgeschwister hat, können Besucher auf der öffentlichen Seite die Sprache wechseln:

- Die **Standardsprache** wird unter `/` angezeigt
- Andere Sprachen sind unter `/{lang}` verfügbar (z. B. `/de`, `/fr`)
- Ein Sprachwechsler-Button erscheint auf der öffentlichen Seite, mit dem Besucher zwischen den verfügbaren Sprachen wechseln können

Für nicht standardmäßige freigegebene Datensätze werden Sprachvarianten unter `/v/slug/{lang}` angezeigt.

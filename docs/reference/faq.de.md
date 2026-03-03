# FAQ

## Allgemein

??? question "Werden meine Daten auf einem externen Server gespeichert?"
    Nein. Alles läuft lokal auf Ihrem Server. Ihre Lebenslaufdaten werden in einer SQLite-Datenbankdatei im Verzeichnis `/data` gespeichert.

??? question "Kann ich CV Manager ohne Docker betreiben?"
    Ja. Installieren Sie Node.js 18+, führen Sie `npm install` im Projektverzeichnis aus und starten Sie dann `node src/server.js`. Der Admin-Bereich läuft auf Port 3000 und die öffentliche Seite auf Port 3001.

??? question "Können mehrere Personen dieselbe Instanz nutzen?"
    CV Manager ist als Einzelbenutzer-Anwendung konzipiert. Jede Instanz verwaltet den Lebenslauf einer Person. Für mehrere Personen starten Sie separate Container.

## Bearbeitung

??? question "Wie markiere ich eine Stelle als 'aktuell'?"
    Lassen Sie das Feld **Enddatum** leer. Es wird auf dem Lebenslauf als „Aktuell" angezeigt.

??? question "Kann ich Einträge innerhalb eines Abschnitts umsortieren?"
    Ja. Die meisten Einträge unterstützen Drag-and-Drop-Umsortierung. Die Reihenfolge wird automatisch gespeichert.

??? question "Wie füge ich Aufzählungspunkte zu einer Berufserfahrung hinzu?"
    Bearbeiten Sie die Berufserfahrung und geben Sie Ihre Erfolge im Feld **Wichtige Erfolge** ein — ein Aufzählungspunkt pro Zeile.

??? question "Wie füge ich ein Firmenlogo hinzu?"
    Bearbeiten Sie die Berufserfahrung, scrollen Sie zum Abschnitt **Firmenlogo** und klicken Sie auf **Bild auswählen**, um ein Bild hochzuladen. Sie können auch auf **Vorhandenes verwenden** klicken, um ein bereits hochgeladenes Logo wiederzuverwenden. Aktivieren Sie den Schalter **„Logo über alle [Unternehmen]-Erfahrungen synchronisieren"**, um dasselbe Logo auf alle Berufserfahrungen bei diesem Unternehmen anzuwenden.

??? question "Ich habe versehentlich etwas gelöscht. Kann ich das rückgängig machen?"
    Es gibt keine Rückgängig-Funktion. Da Änderungen automatisch im aktiven Datensatz gespeichert werden, wird die Änderung sofort übernommen. Wenn Sie einen früheren Export oder einen separaten gespeicherten Datensatz haben, können Sie von dort wiederherstellen. Es empfiehlt sich, Ihren Lebenslauf regelmäßig als Backup zu exportieren.

## Benutzerdefinierte Abschnitte

??? question "Wie viele benutzerdefinierte Abschnitte kann ich erstellen?"
    Es gibt kein festes Limit. Erstellen Sie so viele, wie Sie benötigen.

??? question "Kann ich den Layout-Typ eines benutzerdefinierten Abschnitts nachträglich ändern?"
    Ja. Bearbeiten Sie den Abschnitt und wählen Sie ein anderes Layout. Beachten Sie, dass einige Felder möglicherweise nicht zwischen Layout-Typen übertragen werden (z. B. beim Wechsel von Karten zu Social Links).

??? question "Was ist der Unterschied zwischen den Layouts 'Aufzählungspunkte' und 'Freitext'?"
    **Aufzählungspunkte** stellt jede Zeile als Aufzählungspunkt mit einem Gruppentitel dar. **Freitext** zeigt reinen Text mit beibehaltenen Zeilenumbrüchen und ohne Titel an — ähnlich dem Über-mich-/Bio-Abschnitt.

## Drucken & PDF

??? question "Warum sieht mein PDF anders aus als auf dem Bildschirm?"
    Die Druckausgabe verwendet spezielle Druckstile, die für Papier optimiert sind. Einige visuelle Effekte (Hover-Zustände, Animationen, Verläufe) werden vereinfacht. Ausgeblendete Einträge und Admin-Steuerelemente werden automatisch entfernt.

??? question "Wie bringe ich meinen Lebenslauf auf weniger Seiten unter?"
    Versuchen Sie, **Abschnittsumbrüche erlauben** und **Eintragsumbrüche erlauben** in den Drucken-&-Export-Einstellungen zu aktivieren. Sie können auch weniger wichtige Einträge oder Abschnitte ausblenden oder kompaktere Layouts für benutzerdefinierte Abschnitte verwenden. Außerdem können Sie die Druckausgabe über den Druckdialog jedes Browsers skalieren (manchmal etwas versteckt).

??? question "Warum fehlen einige Einträge in meinem gedruckten Lebenslauf?"
    Prüfen Sie, ob diese Einträge auf ausgeblendet gesetzt wurden (Augen-Symbol). Ausgeblendete Einträge werden von der Druckausgabe und der öffentlichen Ansicht ausgeschlossen.

??? question "Seitenzahlen werden nicht angezeigt?"
    Stellen Sie sicher, dass **Seitenzahlen** unter Einstellungen → Drucken & Export aktiviert ist. Einige Browser-PDF-Viewer zeigen CSS-generierte Seitenzahlen möglicherweise nicht an — versuchen Sie, das PDF herunterzuladen und in einem separaten PDF-Reader zu öffnen.

## Zeitstrahl

??? question "Der Zeitstrahl zeigt falsche Daten / nur Jahre / vollständige Daten?"
    Der Zeitstrahl hat eine eigene Datumseinstellung. Gehen Sie zu **Einstellungen → Erweitert → Zeitleiste: Nur Jahre**, um zwischen der reinen Jahresanzeige und dem vollständigen Datumsformat umzuschalten.

??? question "Kann ich Einträge direkt zum Zeitstrahl hinzufügen?"
    Nein. Der Zeitstrahl wird automatisch aus Ihren Berufserfahrungen generiert. Fügen Sie Berufserfahrungen hinzu oder bearbeiten Sie sie, und der Zeitstrahl wird entsprechend aktualisiert.

??? question "Die Länderflagge wird im Zeitstrahl nicht angezeigt?"
    Stellen Sie sicher, dass das Feld **Ländercode** bei der Berufserfahrung auf einen gültigen 2-stelligen ISO-Ländercode gesetzt ist (z. B. `us`, `gb`, `ch`, `de`, `fr`). Flaggen werden von einem externen CDN geladen.

??? question "Was passiert, wenn ich zwei Jobs gleichzeitig habe?"
    Der Zeitstrahl erkennt überlappende Positionen automatisch und stellt sie als **parallele Spuren** dar. Die gleichzeitige Stelle erscheint auf einem erhöhten Nebenstrang mit S-Kurven-Verbindungen, die die Abzweigungs- und Zusammenführungspunkte zeigen. Es ist keine Konfiguration erforderlich — es basiert vollständig auf Ihren Start-/Enddaten. Überlappungen von weniger als einem Monat werden ignoriert (häufig bei Jobwechseln).

??? question "Warum zeigt der Zeitstrahl ein Logo anstelle des Firmennamens?"
    Wenn Sie ein Firmenlogo für diese Berufserfahrung hochgeladen haben, zeigt der Zeitstrahl das Logo-Bild anstelle von Text an. Wenn die Logo-Datei fehlt, wird auf den Firmennamen zurückgegriffen. Um ein Logo aus dem Zeitstrahl zu entfernen, bearbeiten Sie die Berufserfahrung und klicken Sie im Abschnitt Firmenlogo auf **Entfernen**.

## Sprache & Updates

??? question "Wie ändere ich die Admin-Sprache?"
    Klicken Sie auf das **Globus-Symbol** in der Werkzeugleiste und wählen Sie eine Sprache aus dem Dropdown-Raster. Die Änderung wird sofort übernommen und sitzungsübergreifend gespeichert.

??? question "Wie prüfe ich, welche Version ich verwende?"
    Öffnen Sie **Einstellungen** — die Versionsnummer wird in der unteren linken Ecke des Modals angezeigt (z. B. `v1.11.0`).

??? question "Ich sehe das Update-Banner nicht, obwohl eine neue Version verfügbar ist?"
    Die Versionsprüfung wird für 24 Stunden zwischengespeichert. Starten Sie Ihren Server (oder Docker-Container) neu, um den Cache zu leeren und eine neue Prüfung zu erzwingen. Ihr Server benötigt außerdem ausgehenden Internetzugang zu `raw.githubusercontent.com`.

## Datensätze / Mehrere Lebensläufe

??? question "Was ist der Standard-Datensatz?"
    Der Standard-Datensatz ist die Version Ihres Lebenslaufs, die Besucher unter Ihrer Stamm-URL (`/`) sehen. Bei der Erstinstallation erstellt CV Manager automatisch einen Standard-Datensatz aus Ihren Lebenslaufdaten. Sie können jederzeit über das Optionsfeld im Öffnen-Modal ändern, welcher Datensatz der Standard ist.

??? question "Werden meine Änderungen automatisch gespeichert?"
    Ja. Jede Änderung, die Sie im Admin-Bereich vornehmen (Hinzufügen, Bearbeiten, Löschen, Umsortieren, Sichtbarkeit umschalten), wird nach einer kurzen Verzögerung automatisch im aktiven Datensatz gespeichert. Das Banner zeigt „Speichern…" und dann „✓ Gespeichert" zur Bestätigung.

??? question "Was passiert, wenn ich einen Datensatz 'lade'?"
    Das Laden eines Datensatzes wechselt Ihre Arbeitskopie zu diesem Datensatz. Ihre vorherigen Änderungen wurden bereits automatisch gespeichert, sodass nichts verloren geht.

??? question "Können Besucher meine Bearbeitungen in Echtzeit sehen?"
    Nein. Die öffentliche Seite zeigt den eingefrorenen Standard-Datensatz, nicht Ihre aktuellen Bearbeitungen. Besucher sehen Änderungen erst, nachdem die automatische Speicherung sie in den Standard-Datensatz geschrieben hat. Wenn Sie einen Nicht-Standard-Datensatz bearbeiten, sehen Besucher diese Änderungen überhaupt nicht, bis Sie ihn als Standard festlegen.

??? question "Können Besucher meine gespeicherten Datensätze sehen?"
    Nur wenn Sie sie öffentlich machen. Jeder Datensatz hat einen Schalter im Öffnen-Modal. Wenn er auf öffentlich gesetzt ist, wird diese Version unter `/v/slug` auf der öffentlichen Seite (Port 3001) zugänglich. Private Datensätze können nur über die Admin-Oberfläche als Vorschau angezeigt werden.

??? question "Wie teile ich eine bestimmte Lebenslauf-Version mit jemandem?"
    Öffnen Sie das **Öffnen...**-Modal, schalten Sie den Datensatz auf öffentlich und klicken Sie dann auf das Kopier-Symbol neben der Slug-URL. Teilen Sie diesen Link — er funktioniert auf der öffentlichen Seite, ohne Ihre Admin-Oberfläche preiszugeben.

??? question "Kann ich mehrere öffentliche Versionen gleichzeitig haben?"
    Ja. Sie können beliebig viele Datensätze öffentlich machen. Jeder erhält seine eigene URL (z. B. `/v/technical-cv-1`, `/v/marketing-cv-2`). Die Hauptseite `/` zeigt den Standard-Datensatz.

??? question "Kann ich den Standard-Datensatz löschen?"
    Nein. Der aktuell als Standard ausgewählte Datensatz (über das Optionsfeld) kann nicht gelöscht werden. Legen Sie zuerst einen anderen Datensatz als Standard fest und löschen Sie dann den alten.

??? question "Werden Suchmaschinen meine versionierten URLs indexieren?"
    Standardmäßig nein — versionierte Seiten erhalten `noindex, nofollow`. Um die Indexierung zu erlauben, aktivieren Sie **Versionierte URLs indexieren** unter Einstellungen → Erweitert.

## Öffentliche Seite & SEO

??? question "Wie teile ich meinen Lebenslauf?"
    Teilen Sie die URL Ihres öffentlichen Servers (Port 3001). Wenn Sie eine Domain mit Cloudflare Tunnel oder einem Reverse Proxy eingerichtet haben, teilen Sie diese Domain. Die Stamm-URL zeigt immer Ihren Standard-Datensatz. Sie können auch bestimmte Versionen über öffentliche versionierte URLs teilen (siehe [Datensätze](../guide/datasets.de.md)).

??? question "Werden Suchmaschinen meinen Lebenslauf indexieren?"
    Standardmäßig ja — die öffentliche Hauptseite enthält korrekte Meta-Tags, eine Sitemap und robots.txt. Um die Indexierung zu verhindern, ändern Sie die Einstellung **Suchmaschinenindexierung** auf „Nicht indexieren" unter Einstellungen → Erweitert. Öffentliche versionierte URLs (`/v/slug`) werden standardmäßig **nicht indexiert**; aktivieren Sie **Versionierte URLs indexieren**, wenn Sie möchten, dass sie gecrawlt werden.

??? question "Kann ich Google Analytics zu meinem Lebenslauf hinzufügen?"
    Ja. Fügen Sie Ihren Tracking-Code unter **Einstellungen → Erweitert → Tracking-Code** ein. Er wird nur auf den öffentlichen Seiten eingefügt.

## Docker & Infrastruktur

??? question "Meine Änderungen erscheinen nicht auf der öffentlichen Seite?"
    Die öffentliche Seite zeigt den **Standard-Datensatz**, der automatisch aktualisiert wird, wenn Sie im Admin-Bereich bearbeiten. Versuchen Sie ein erzwungenes Neuladen (`Ctrl+Shift+R`) auf der öffentlichen Seite. Wenn Sie separate Container betreiben, stellen Sie sicher, dass sie dasselbe Datenvolumen teilen.

??? question "Ich erhalte einen 'Port already in use'-Fehler?"
    Ändern Sie die Host-Port-Zuordnung in Ihrer Docker-Konfiguration. Zum Beispiel: Verwenden Sie `3010:3000` und `3011:3001`. Ändern Sie **nicht** die Umgebungsvariable `PUBLIC_PORT` — das ist der interne Container-Port.

??? question "Wie sichere ich meine Daten?"
    Zwei Optionen: Verwenden Sie die **Exportieren**-Schaltfläche in der Admin-Werkzeugleiste (exportiert JSON), oder sichern Sie das Verzeichnis `data/`, das die SQLite-Datenbank und hochgeladene Bilder enthält.

??? question "Das Profilbild wird nicht angezeigt?"
    Stellen Sie sicher, dass das Bild über die Admin-Oberfläche hochgeladen wurde. Die Datei wird unter `data/uploads/picture.jpeg` gespeichert. Überprüfen Sie die Dateiberechtigungen, wenn Sie unter Linux arbeiten.

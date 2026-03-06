# ATS-Kompatibilität

## Was ist ein ATS?

Ein **ATS** (Applicant Tracking System, Bewerbermanagementsystem) ist eine Software, die von Personalvermittlern und Unternehmen zur Verwaltung von Bewerbungen eingesetzt wird. Wenn Sie Ihren Lebenslauf auf einem Jobportal oder einer Unternehmenswebsite hochladen, analysiert ein ATS das Dokument, um strukturierte Daten zu extrahieren — Ihren Namen, Berufsbezeichnungen, Unternehmen, Daten, Fähigkeiten und Ausbildung. Diese Daten werden dann für den Schlüsselwortabgleich, die Rangfolge und die Filterung von Kandidaten verwendet.

Wenn das ATS Ihr Dokument nicht korrekt auswerten kann, wird Ihre Bewerbung möglicherweise verworfen oder wichtige Informationen gehen verloren — selbst wenn Ihre Qualifikationen perfekt passen.

## Integrierte ATS-Optimierung

CV Manager erzeugt automatisch ATS-freundliche Ausgaben auf der öffentlichen Seite:

- **Schema.org-Markup** — strukturierte Daten, die ATS-Systeme auswerten können (Person, OrganizationRole, EducationalOccupationalCredential usw.)
- **Semantisches HTML** — korrekte Überschriftenhierarchie, Article-Elemente und Listen
- **Versteckter ATS-Block** — eine Klartext-Version Ihres Lebenslaufs ist in die Seite eingebettet, für Parser, die gestyltes HTML nicht verarbeiten
- **Saubere Druckausgabe** — kein visuelles Durcheinander, korrekte Inhaltshierarchie

Es ist keine spezielle Konfiguration erforderlich — diese Funktionen sind immer aktiv.

## ATS-Dokument-Export

Zusätzlich zur integrierten Web-Optimierung kann CV Manager ein **dediziertes ATS-freundliches PDF** erstellen, das speziell für das Hochladen auf Jobportale und ATS-Systeme entwickelt wurde.

### Verwendung

1. Klicken Sie auf **ATS-Dokument** in der Admin-Symbolleiste
2. Passen Sie den **Skalierungs**-Regler an, um die Inhaltsdichte zu steuern (50%–150%)
3. Wählen Sie Ihr bevorzugtes **Papierformat** (A4 oder Letter)
4. Sehen Sie sich die Vorschau des Dokuments im Modal an
5. Klicken Sie auf **PDF herunterladen**, um die Datei zu speichern

### Unterschied zu Drucken / PDF

| Funktion | Drucken / PDF | ATS-Dokument |
|----------|---------------|--------------|
| **Zweck** | Visuelle Darstellung | Maschinelle Auswertung |
| **Layout** | Volles Design mit Farben, Icons, Zeitleiste | Sauber strukturierter Text, minimale Formatierung |
| **Inhalt** | Alle sichtbaren Abschnitte inkl. Zeitleiste | Alle Abschnitte außer Zeitleiste (nicht ATS-relevant) |
| **Skalierung** | Browser-Druckdialog | Integrierter Regler mit Live-Vorschau |
| **Erzeugung** | Browser-Druckengine | Serverseitig (pdfmake) |
| **Konsistenz** | Variiert je nach Browser | Überall identische Ausgabe |

### Tipps für den ATS-Erfolg

!!! tip "Verwenden Sie das ATS-Dokument für Bewerbungen"
    Laden Sie immer das ATS-Dokument (nicht die Drucken/PDF-Version) hoch, wenn Sie sich über Jobportale bewerben. Das strukturierte Layout ist darauf ausgelegt, von automatisierten Systemen korrekt ausgewertet zu werden.

!!! tip "Halten Sie Ihre Fähigkeiten-Sektion vollständig"
    ATS-Systeme verlassen sich stark auf den Schlüsselwortabgleich. Stellen Sie sicher, dass Ihre Fähigkeiten-Sektion alle relevanten Technologien, Tools und Methoden enthält — der ATS-Export enthält diese als flache Schlüsselwortliste für besseres Matching.

!!! tip "Verwenden Sie Drucken/PDF für menschliche Leser"
    Wenn Sie Ihren Lebenslauf direkt per E-Mail an einen Personalverantwortlichen senden oder zu einem Vorstellungsgespräch mitbringen, verwenden Sie die Drucken/PDF-Version — sie enthält das vollständige visuelle Design mit Ihren Designfarben und der Zeitleiste.

!!! tip "Skalierung für Dichte"
    Wenn Ihr Lebenslauf lang ist, versuchen Sie, die Skalierung auf 70–80% zu reduzieren, um mehr Inhalt pro Seite unterzubringen. Die Vorschau aktualisiert sich in Echtzeit, sodass Sie den optimalen Wert finden können.

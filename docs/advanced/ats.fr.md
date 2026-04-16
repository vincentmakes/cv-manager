# Compatibilite ATS

## Qu'est-ce qu'un ATS ?

Un **ATS** (Applicant Tracking System, systeme de suivi des candidatures) est un logiciel utilise par les recruteurs et les entreprises pour gerer les candidatures. Lorsque vous telechargez votre CV sur un portail d'emploi ou un site d'entreprise, un ATS analyse le document pour extraire des donnees structurees — votre nom, intitules de poste, entreprises, dates, competences et formation. Ces donnees sont ensuite utilisees pour la correspondance de mots-cles, le classement et le filtrage des candidats.

Si l'ATS ne peut pas analyser correctement votre document, votre candidature peut etre rejetee ou des informations cles peuvent etre perdues — meme si vos qualifications correspondent parfaitement.

## Optimisation ATS integree

CV Manager genere automatiquement une sortie compatible ATS sur le site public :

- **Balisage Schema.org** — des donnees structurees que les systemes ATS peuvent analyser (Person, OrganizationRole, EducationalOccupationalCredential, etc.)
- **HTML semantique** — hierarchie de titres appropriee, elements article et listes
- **Bloc ATS masque** — une version en texte brut de votre CV est integree dans la page pour les analyseurs qui ne traitent pas le HTML mis en forme
- **Sortie d'impression propre** — aucun encombrement visuel, hierarchie de contenu appropriee

Aucune configuration speciale n'est necessaire — ces fonctionnalites sont toujours actives.

## Export de document ATS

En plus de l'optimisation web integree, CV Manager peut generer un **PDF dedie compatible ATS**, concu specifiquement pour le telechargement sur les portails d'emploi et les systemes ATS.

### Comment l'utiliser

1. Cliquez sur **Document ATS** dans la barre d'outils d'administration
2. Ajustez le curseur **Echelle** pour controler la densite du contenu (50%–150%)
3. Choisissez votre **Format papier** prefere (A4 ou Letter)
4. Si vous travaillez dans une langue autre que l'anglais, cochez eventuellement **En-tetes de section en anglais** pour afficher les en-tetes de section (Experience professionnelle, Formation, Competences, etc.) en anglais tout en conservant le reste du contenu dans la langue active
5. Previsualisez le document dans la fenetre modale
6. Cliquez sur **Telecharger PDF** pour enregistrer le fichier

### En-tetes de section en anglais

Lorsque votre CV est dans une langue autre que l'anglais, de nombreux systemes ATS s'attendent neanmoins a des en-tetes de section en anglais pour categoriser correctement le contenu. La case **En-tetes de section en anglais** (visible uniquement lorsque la langue active n'est pas l'anglais) force l'affichage des en-tetes de section en anglais tandis que tout le reste — dates, contenu, competences — reste dans la langue active.

C'est utile lorsque vous postulez aupres d'entreprises internationales ou via des portails d'emploi anglophones avec un CV redige dans une autre langue.

### Difference avec Imprimer / PDF

| Fonctionnalite | Imprimer / PDF | Document ATS |
|----------------|----------------|--------------|
| **Objectif** | Presentation visuelle | Analyse automatique |
| **Mise en page** | Design complet avec couleurs, icones, chronologie | Texte structure et propre, formatage minimal |
| **Contenu** | Toutes les sections visibles y compris la chronologie | Toutes les sections sauf la chronologie (non pertinente pour l'ATS) |
| **Controle de l'echelle** | Boite de dialogue d'impression du navigateur | Curseur integre avec apercu en direct |
| **Generation** | Moteur d'impression du navigateur | Cote serveur (pdfmake) |
| **Coherence** | Varie selon le navigateur | Sortie identique partout |

### Conseils pour reussir avec les ATS

!!! tip "Utilisez le document ATS pour les candidatures"
    Telechargez toujours le document ATS (pas la version Imprimer/PDF) lorsque vous postulez via des portails d'emploi. La mise en page structuree est concue pour etre correctement analysee par les systemes automatises.

!!! tip "Gardez votre section competences complete"
    Les systemes ATS s'appuient fortement sur la correspondance de mots-cles. Assurez-vous que votre section Competences contient toutes les technologies, outils et methodologies pertinents — l'export ATS les inclut sous forme de liste de mots-cles pour un meilleur matching.

!!! tip "Utilisez Imprimer/PDF pour les lecteurs humains"
    Lorsque vous envoyez votre CV directement par e-mail a un responsable du recrutement ou que vous l'apportez a un entretien, utilisez la version Imprimer/PDF — elle propose le design visuel complet avec vos couleurs de theme et la chronologie.

!!! tip "Ajustez l'echelle pour la densite"
    Si votre CV est long, essayez de reduire l'echelle a 70–80% pour integrer plus de contenu par page. L'apercu se met a jour en temps reel pour vous permettre de trouver le bon equilibre.

!!! tip "En-tetes en anglais pour les candidatures internationales"
    Si le contenu de votre CV est en francais, allemand ou dans une autre langue, activez l'option des en-tetes en anglais lorsque vous postulez aupres d'entreprises qui utilisent des systemes ATS anglophones. La plupart des analyseurs ATS s'attendent a des en-tetes de section en anglais comme « Work Experience » et « Education ».

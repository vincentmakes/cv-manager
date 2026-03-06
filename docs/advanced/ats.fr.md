# Compatibilité ATS

## Qu'est-ce qu'un ATS ?

Un **ATS** (Applicant Tracking System, système de suivi des candidatures) est un logiciel utilisé par les recruteurs et les entreprises pour gérer les candidatures. Lorsque vous téléchargez votre CV sur un portail d'emploi ou un site d'entreprise, un ATS analyse le document pour extraire des données structurées — votre nom, intitulés de poste, entreprises, dates, compétences et formation. Ces données sont ensuite utilisées pour la correspondance de mots-clés, le classement et le filtrage des candidats.

Si l'ATS ne peut pas analyser correctement votre document, votre candidature peut être rejetée ou des informations clés peuvent être perdues — même si vos qualifications correspondent parfaitement.

## Optimisation ATS intégrée

CV Manager génère automatiquement une sortie compatible ATS sur le site public :

- **Balisage Schema.org** — des données structurées que les systèmes ATS peuvent analyser (Person, OrganizationRole, EducationalOccupationalCredential, etc.)
- **HTML sémantique** — hiérarchie de titres appropriée, éléments article et listes
- **Bloc ATS masqué** — une version en texte brut de votre CV est intégrée dans la page pour les analyseurs qui ne traitent pas le HTML mis en forme
- **Sortie d'impression propre** — aucun encombrement visuel, hiérarchie de contenu appropriée

Aucune configuration spéciale n'est nécessaire — ces fonctionnalités sont toujours actives.

## Export de document ATS

En plus de l'optimisation web intégrée, CV Manager peut générer un **PDF dédié compatible ATS**, conçu spécifiquement pour le téléchargement sur les portails d'emploi et les systèmes ATS.

### Comment l'utiliser

1. Cliquez sur **Document ATS** dans la barre d'outils d'administration
2. Ajustez le curseur **Échelle** pour contrôler la densité du contenu (50%–150%)
3. Choisissez votre **Format papier** préféré (A4 ou Letter)
4. Prévisualisez le document dans la fenêtre modale
5. Cliquez sur **Télécharger PDF** pour enregistrer le fichier

### Différence avec Imprimer / PDF

| Fonctionnalité | Imprimer / PDF | Document ATS |
|----------------|----------------|--------------|
| **Objectif** | Présentation visuelle | Analyse automatique |
| **Mise en page** | Design complet avec couleurs, icônes, chronologie | Texte structuré et propre, formatage minimal |
| **Contenu** | Toutes les sections visibles y compris la chronologie | Toutes les sections sauf la chronologie (non pertinente pour l'ATS) |
| **Contrôle de l'échelle** | Boîte de dialogue d'impression du navigateur | Curseur intégré avec aperçu en direct |
| **Génération** | Moteur d'impression du navigateur | Côté serveur (pdfmake) |
| **Cohérence** | Varie selon le navigateur | Sortie identique partout |

### Conseils pour réussir avec les ATS

!!! tip "Utilisez le document ATS pour les candidatures"
    Téléchargez toujours le document ATS (pas la version Imprimer/PDF) lorsque vous postulez via des portails d'emploi. La mise en page structurée est conçue pour être correctement analysée par les systèmes automatisés.

!!! tip "Gardez votre section compétences complète"
    Les systèmes ATS s'appuient fortement sur la correspondance de mots-clés. Assurez-vous que votre section Compétences contient toutes les technologies, outils et méthodologies pertinents — l'export ATS les inclut sous forme de liste de mots-clés pour un meilleur matching.

!!! tip "Utilisez Imprimer/PDF pour les lecteurs humains"
    Lorsque vous envoyez votre CV directement par e-mail à un responsable du recrutement ou que vous l'apportez à un entretien, utilisez la version Imprimer/PDF — elle propose le design visuel complet avec vos couleurs de thème et la chronologie.

!!! tip "Ajustez l'échelle pour la densité"
    Si votre CV est long, essayez de réduire l'échelle à 70–80% pour intégrer plus de contenu par page. L'aperçu se met à jour en temps réel pour vous permettre de trouver le bon équilibre.

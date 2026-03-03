# Paramètres avancés

## Indexation par les moteurs de recherche (balise meta Robots)

Contrôlez la façon dont les moteurs de recherche interagissent avec votre CV public dans **Settings → Advanced → Search Engine Indexing** :

| Option | Effet |
|--------|-------|
| **Index, Follow** | Le CV apparaît dans les résultats de recherche, les moteurs de recherche suivent vos liens (par défaut) |
| **No Index, Follow** | Le CV est masqué des résultats de recherche, mais les liens sont suivis |
| **Index, No Follow** | Le CV apparaît dans les résultats de recherche, mais les liens sortants sont ignorés |
| **No Index, No Follow** | Totalement invisible pour les moteurs de recherche |

Ce paramètre affecte à la fois la balise `<meta name="robots">` et le fichier `/robots.txt`, et est appliqué côté serveur pour assurer la compatibilité avec tous les robots d'indexation.

## Indexation des URL versionnées

Par défaut, les URL versionnées publiques (`/v/slug`) ne sont **pas indexées** par les moteurs de recherche — elles reçoivent une balise meta `noindex, nofollow`. Cela est utile si vous souhaitez partager des liens directs sans que ces pages apparaissent dans les résultats de recherche.

Pour permettre aux moteurs de recherche d'explorer les URL versionnées, activez **Index Versioned URLs** dans **Settings → Advanced**. Ce paramètre est indépendant de l'option principale d'indexation par les moteurs de recherche ci-dessus, qui n'affecte que la page principale `/`.

## Code de suivi

Collez votre code de suivi analytique (Google Analytics, Matomo, Plausible, etc.) dans **Settings → Advanced → Tracking Code**. Le code est injecté uniquement dans les pages du CV public — pas dans l'interface d'administration.

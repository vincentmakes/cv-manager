# Configurações Avançadas

## Indexação por Mecanismos de Busca (Robots Meta)

Controle como os mecanismos de busca interagem com seu CV público em **Settings → Advanced → Search Engine Indexing**:

| Opção | Efeito |
|-------|--------|
| **Index, Follow** | O CV aparece nos resultados de busca, mecanismos de busca seguem seus links (padrão) |
| **No Index, Follow** | O CV é ocultado dos resultados de busca, mas os links são seguidos |
| **Index, No Follow** | O CV aparece nos resultados de busca, mas links de saída são ignorados |
| **No Index, No Follow** | Totalmente invisível para mecanismos de busca |

Esta configuração afeta tanto a tag `<meta name="robots">` quanto o arquivo `/robots.txt`, e é aplicada no lado do servidor para compatibilidade com todos os crawlers de mecanismos de busca.

## Indexação de URLs Versionadas

Por padrão, URLs públicas versionadas (`/v/slug`) **não são indexadas** pelos mecanismos de busca — elas recebem uma meta tag `noindex, nofollow`. Isso é útil se você deseja compartilhar links diretos sem que essas páginas apareçam nos resultados de busca.

Para permitir que mecanismos de busca rastreiem URLs versionadas, ative **Index Versioned URLs** em **Settings → Advanced**. Esta configuração é independente da opção principal de Indexação por Mecanismos de Busca acima, que afeta apenas a página principal `/`.

## Código de Rastreamento

Cole o código de rastreamento de analytics (Google Analytics, Matomo, Plausible, etc.) em **Settings → Advanced → Tracking Code**. O código é injetado apenas nas páginas públicas do CV — não na interface de admin.

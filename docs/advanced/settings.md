# Advanced Settings

## Search Engine Indexing (Robots Meta)

Control how search engines interact with your public CV in **Settings → Advanced → Search Engine Indexing**:

| Option | Effect |
|--------|--------|
| **Index, Follow** | CV appears in search results, search engines follow your links (default) |
| **No Index, Follow** | CV is hidden from search results, but links are followed |
| **Index, No Follow** | CV appears in search results, but outbound links are ignored |
| **No Index, No Follow** | Fully invisible to search engines |

This setting affects both the `<meta name="robots">` tag and the `/robots.txt` file, and is applied server-side for compatibility with all search engine crawlers.

## Versioned URL Indexing

By default, public versioned URLs (`/v/slug`) are **not indexed** by search engines — they get a `noindex, nofollow` meta tag. This is useful if you want to share direct links without those pages appearing in search results.

To allow search engines to crawl versioned URLs, enable **Index Versioned URLs** in **Settings → Advanced**. This setting is independent of the main Search Engine Indexing option above, which only affects the main `/` page.

## Tracking Code

Paste analytics tracking code (Google Analytics, Matomo, Plausible, etc.) in **Settings → Advanced → Tracking Code**. The code is injected into the public CV pages only — not the admin interface.

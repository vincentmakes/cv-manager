# CLAUDE.md — AI-Assisted Development Guide

## Project Overview

CV Manager is a self-hosted, Docker-deployed CV/resume management system. It runs two Express servers: an admin interface (port 3000) for editing and a read-only public site (port 3001) for visitors.

**Tech stack:** Node.js 20, Express, SQLite (better-sqlite3), vanilla JS frontend (no frameworks), plain CSS.

## Quick Reference

```bash
npm start              # Production (admin :3000, public :3001)
npm run dev            # Development with --watch
npm test               # Run all tests
npm run test:backend   # Backend tests only
npm run test:frontend  # Frontend tests only
```

There is no linter or formatter configured. Tests use Node's built-in `node:test` module.

## Project Structure

```
src/server.js              # Express server (admin + public), DB schema, all API routes
public/index.html          # Admin interface HTML template
public/shared/admin.js     # Admin UI logic (modals, CRUD, datasets, sections)
public/shared/scripts.js   # Shared frontend utilities (API calls, date formatting, rendering)
public/shared/styles.css   # All CSS (admin toolbar hidden on public via .no-print)
public/shared/i18n.js      # Internationalization module
public/shared/i18n/*.json  # Translation files (en, de, fr, nl, es, it, pt, zh)
public-readonly/index.html # Public-facing HTML template (read-only)
tests/backend.test.js      # Backend API tests (spawns server on random port)
tests/frontend.test.js     # Frontend unit tests
data/                      # SQLite database (created at runtime)
version.json               # Current version (used by update checker)
```

## Architecture

### Dual-Server Model

- **Admin server** (PORT=3000): Full CRUD, file uploads, settings. Serves `public/`.
- **Public server** (PUBLIC_PORT=3001): GET-only, rate-limited (60 req/min), security headers, filters sensitive data (email/phone/IDs). Serves `public-readonly/`.
- **Public-only mode**: Auto-detected when filesystem is read-only, or forced via `PUBLIC_ONLY=true`.

### Database

SQLite with WAL mode. Key tables: `profile`, `experiences`, `certifications`, `education`, `skill_categories`, `skills`, `projects`, `section_visibility`, `saved_datasets`, `custom_sections`, `custom_section_items`, `settings`.

Automatic migrations run on startup — new columns are added dynamically, legacy date formats normalized.

### Dataset System

Multiple CV snapshots can be saved. One is marked "default" and served at `/` on the public site, decoupling live edits from the public page. Other datasets can be made public at `/v/{slug}`.

## Versioning System

The project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes or major architectural shifts
- **MINOR** (x.Y.0): New features (new sections, new settings, new capabilities)
- **PATCH** (x.y.Z): Bug fixes, translation fixes, small improvements

**Version must be updated in two files:**
1. `package.json` → `"version"` field
2. `version.json` → `"version"` field

Both must always match. The admin UI checks `version.json` on GitHub to show update notifications.

**Changelog:** `CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/) format. Every version bump must have a corresponding changelog entry with the date in `YYYY-MM-DD` format. Use categories: `Added`, `Changed`, `Fixed`, `Removed`.

## Internationalization (i18n)

### How It Works

1. **`I18n` module** (`public/shared/i18n.js`): Loads the user's language preference from `/api/settings/language`, fetches English as fallback, then loads the active locale's JSON file.

2. **`t(key, params)`** — Global translation function:
   ```js
   t('banner.update', { latest: '2.0.0', current: '1.0.0' })
   // → "Update available: v2.0.0 (you're on v1.0.0)"
   ```
   Lookup order: active locale → English fallback → returns key as-is.

3. **HTML attributes** — Static text in HTML uses:
   - `data-i18n="key"` → sets `textContent`
   - `data-i18n-title="key"` → sets `title` attribute
   - `data-i18n-placeholder="key"` → sets `placeholder` attribute

4. **JS strings** — Dynamic text in JavaScript uses `t('key')` directly.

5. **`I18n.refreshUI()`** — Called after locale change, walks the DOM and updates all `data-i18n*` elements.

### Currently Supported Languages (8)

| Code | Language   | Native     |
|------|-----------|------------|
| en   | English   | English    |
| de   | German    | Deutsch    |
| fr   | French    | Français   |
| nl   | Dutch     | Nederlands |
| es   | Spanish   | Español    |
| it   | Italian   | Italiano   |
| pt   | Portuguese| Português  |
| zh   | Chinese   | 中文       |

### How to Add a New Language

Follow these steps to add a new language (example: Japanese `ja`):

#### Step 1: Create the translation file

Copy `public/shared/i18n/en.json` to `public/shared/i18n/ja.json` and translate every value (keep the keys identical):

```json
{
    "toolbar.settings": "設定",
    "toolbar.theme": "テーマ",
    ...
}
```

The file must have the exact same keys as `en.json`. Missing keys will fall back to English automatically, but all keys should be translated for a complete experience.

#### Step 2: Register the language in i18n.js

In `public/shared/i18n.js`, add an entry to the `languages` array:

```js
languages: [
    { code: 'en', name: 'English', native: 'English' },
    // ... existing languages ...
    { code: 'ja', name: 'Japanese', native: '日本語' }
],
```

- `code`: ISO 639-1 two-letter code (must match the JSON filename)
- `name`: English name (shown as fallback)
- `native`: Name in the language itself (shown in the language picker)

That's it. No other code changes are needed — the language picker in Settings > Language automatically lists all entries from the `languages` array, and the `setLocale()` / `loadTranslations()` functions handle loading the JSON file by code.

#### Step 3: Translate section headings in server.js

In `src/server.js`, the `SECTION_DISPLAY_NAMES` object and `DEFAULT_SECTION_ORDER` define the built-in sections. Section display names shown on the public site are rendered server-side using these defaults but are overridable via `section_visibility.display_name` in the database.

The **public-facing HTML** (`public-readonly/index.html`) uses `data-i18n="section.*"` attributes so section headings are translated client-side by the i18n module. Ensure your new translation file includes all `section.*` keys.

#### Translation Key Conventions

Keys use dot-separated namespaces:
- `toolbar.*` — Toolbar buttons
- `theme.*` — Theme picker
- `banner.*` — Notification banners
- `section.*` — Section headings
- `action.*` — Action buttons (add/edit/toggle)
- `btn.*` — Generic buttons (save/cancel/delete)
- `modal.*` — Modal titles
- `form.*` — Form labels and placeholders
- `icon.*` — Icon category labels
- `settings.*` — Settings panel
- `datasets.*` — Dataset management
- `custom_section.*` / `custom_item.*` — Custom section UI
- `toast.*` — Toast notification messages
- `confirm.*` — Confirmation dialogs

Parameter interpolation uses `{{variable}}` syntax.

## Key Patterns

### API Conventions

- Success: `{ success: true }` or `{ id: 123 }`
- Errors: `{ error: "message" }` with appropriate HTTP status
- Admin API: full CRUD at `/api/*`
- Public API: GET-only, filters out sensitive fields

### Frontend Utilities (`scripts.js`)

- `api(endpoint, options)` — Fetch wrapper with JSON headers
- `escapeHtml(text)` — XSS prevention (use for all user content in HTML)
- `normalizeDate(dateStr)` — Parse flexible date formats to `YYYY-MM`
- `formatDate(dateStr)` — Display dates per user's format setting

### Section System

Built-in sections: `about`, `timeline`, `experience`, `certifications`, `education`, `skills`, `projects`. Custom sections use `layout_type` from: `social-links`, `grid-2`, `grid-3`, `list`, `cards`, `bullet-list`, `free-text`.

Visibility and ordering are controlled via the `section_visibility` table and the Settings > Sections panel.

### Date Formats

Dates are stored as `YYYY-MM` or `YYYY`. Display format is configurable per user: `MMM YYYY`, `MMMM YYYY`, `MM/YYYY`, `YYYY`, `MMM YY`.

## Environment Variables

```
PORT=3000              # Admin server port
PUBLIC_PORT=3001       # Public server port
DB_PATH=/app/data/cv.db  # SQLite database path
PUBLIC_ONLY=true       # Force read-only mode (auto-detected if filesystem is read-only)
NODE_ENV=production
```

## Testing

Tests spawn a server on a random port (13000–14000) with a temporary database. Run with:

```bash
npm test                    # All tests
npm run test:backend        # API endpoint tests
npm run test:frontend       # Frontend unit tests
```

Tests auto-clean up their temporary databases.

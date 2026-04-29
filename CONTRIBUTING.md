# Contributing to CV Manager

Thank you for your interest in CV Manager!

## First: a note on project scope

CV Manager is a solo side project, maintained in my free time using paid AI tools. I'm not actively looking for pull requests right now, and I'm not in a position to review and maintain external contributions on an ongoing basis.

**Please do not open pull requests unless you've discussed the change with me first and I've explicitly agreed to review it.** Unsolicited PRs — especially large ones or ones that come with full feature roadmaps — will likely be closed without review. I appreciate the enthusiasm, but a roadmap is something I get to set for my own project.

If you want to build on this project, the MIT license lets you fork it freely, and this guide has everything you need to do that well.

### What to do instead

- **Found a bug?** [Open an issue](https://github.com/vincentmakes/cv-manager/issues). Include steps to reproduce, what you expected, and what actually happened.
- **Have an idea or suggestion?** [Start a discussion](https://github.com/vincentmakes/cv-manager/discussions). I'm genuinely open to hearing what would be useful — just don't expect a commitment or a timeline. Be reasonable and don't flood the discussion section with your personal roadmap.
- **Want to add a translation?** That's the one area where contributions are most welcome. See [TRANSLATING.md](TRANSLATING.md).

---

## Fork development reference

Everything below is for people who want to develop their own fork.

### Prerequisites

- **Node.js 20** (or later)
- **npm**
- **Git**
- **Docker** (optional, for testing the containerized build)

### Setup

```bash
git clone https://github.com/vincentmakes/cv-manager.git
cd cv-manager
npm install
npm run dev
```

This starts both servers with `--watch` for auto-reload:
- **Admin interface**: http://localhost:3000
- **Public site**: http://localhost:3001

### Project Structure

```
src/server.js              # Express server, DB schema, all API routes
public/shared/admin.js     # Admin UI logic
public/shared/scripts.js   # Shared frontend utilities
public/shared/styles.css   # All CSS styles
public/shared/i18n.js      # Internationalization module
public/shared/i18n/*.json  # Translation files (8 languages)
public-readonly/index.html # Public-facing read-only template
tests/backend.test.js      # Backend API tests
tests/frontend.test.js     # Frontend unit tests
```

For the full architecture reference, see [CLAUDE.md](CLAUDE.md).

## Testing

```bash
npm test               # Run all tests
npm run test:backend   # Backend API tests only
npm run test:frontend  # Frontend unit tests only
```

- Tests use Node's built-in `node:test` module (no external test framework).
- Backend tests spawn a server on a random port (13000-14000) with a temporary SQLite database that auto-cleans up.
- Frontend tests validate i18n key parity across all 8 locale files — missing or extra keys will fail.

## Version Bump Requirements

> **Every code change must include a version bump.** The admin UI uses the version number to check for updates, so skipping it breaks the update notification system.

### How to bump

1. **Determine the bump type** using [Semantic Versioning](https://semver.org/):
   - **PATCH** (x.y.Z) — Bug fixes, translation fixes, small improvements
   - **MINOR** (x.Y.0) — New features
   - **MAJOR** (X.0.0) — Breaking changes

2. **Update the version in all 3 files** (they must all match):
   - `package.json` — the `"version"` field
   - `package-lock.json` — the `"version"` field in **both** the top-level object and inside `packages[""]`
   - `version.json` — the `"version"` field

3. **Add a CHANGELOG entry** at the top of `CHANGELOG.md`:
   ```markdown
   ## [x.y.z] - YYYY-MM-DD

   ### Added / Changed / Fixed / Removed
   - Description of the change
   ```

### Exception: documentation-only changes

Changes that **only** touch documentation files (`README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `TRANSLATING.md`, `USER_GUIDE.md`, `CHANGELOG.md`, `docs/`, `mkdocs.yml`) do **not** get a version bump. Bumping the version for docs-only changes would create false update notifications for users.

## Internationalization (i18n)

CV Manager supports 8 languages: English, German, French, Dutch, Spanish, Italian, Portuguese, and Chinese. For adding a new language, see [TRANSLATING.md](TRANSLATING.md).

If your code change adds or modifies user-visible strings, follow this checklist:

1. **No hardcoded English in JavaScript** — use `t('key')` for every user-visible string
2. **No hardcoded English in HTML** — use `data-i18n="key"` (text), `data-i18n-title="key"` (title), or `data-i18n-placeholder="key"` (placeholder)
3. **Add the key to `en.json` first** (source of truth), then to **all 7 other locale files** (`de.json`, `fr.json`, `nl.json`, `es.json`, `it.json`, `pt.json`, `zh.json`)
4. **Follow namespace conventions**: `toolbar.*`, `section.*`, `form.*`, `toast.*`, `action.*`, `btn.*`, `modal.*`, `settings.*`, etc.
5. **Use `{{variable}}` syntax** for interpolation

Frontend tests enforce key parity — if any locale file is missing a key, tests will fail.

## Code Conventions

There is no linter or formatter configured. Follow the patterns in the existing codebase:

- **Tech stack**: Vanilla JavaScript and plain CSS only — no frameworks or preprocessors.
- **API responses**: Success returns `{ success: true }` or `{ id: 123 }`. Errors return `{ error: "message" }` with an appropriate HTTP status code.
- **XSS prevention**: Always use `escapeHtml()` from `scripts.js` when inserting user-provided content into HTML.
- **Icons**: Use [Google Material Symbols Outlined](https://fonts.google.com/icons). In JavaScript, use the `materialIcon('icon_name', size)` helper. In HTML, use `<span class="material-symbols-outlined">icon_name</span>`. Brand/social logos (LinkedIn, GitHub, etc.) are an exception and use inline SVGs.
- **Dates**: Store as `YYYY-MM` or `YYYY`. Use `normalizeDate()` when saving and `formatDate()` for display.

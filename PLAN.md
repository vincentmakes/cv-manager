# i18n Localization Plan for CV Manager

## Overview

Add UI-only internationalization to CV Manager. All JSON keys, database content, and user-typed CV content remain untouched in whatever language the user typed them. Only hardcoded UI labels, buttons, tooltips, toast messages, and descriptions get translated.

**Languages:** English (default), German, French, Dutch, Spanish, Italian, Portuguese, Chinese

---

## Architecture

### Approach: Lightweight custom i18n (no external library)

Since the app uses vanilla JS with no framework, a simple translation module is the best fit. No need for `i18next` or similar — the app is small enough that a custom solution keeps things lean and dependency-free.

**Core idea:**
- A `t(key)` function that looks up translations from a JSON object
- Translation files: one JSON file per language in `public/shared/i18n/`
- Language preference stored in the existing `settings` table (key: `language`, value: locale code)
- On load, fetch the saved language preference and load the corresponding translation file
- A language selector added as a new tab in the Settings modal

### What gets translated (UI chrome only):
- Toolbar buttons (`Settings`, `Theme`, `Export`, `Import`, `Print / PDF`, etc.)
- Settings modal (tab names, labels, descriptions, hints)
- Form labels and placeholders in edit/add modals
- Toast/notification messages
- Confirmation dialogs
- Section action buttons (`Add Experience`, `Edit Profile`, etc.)
- Color picker labels (`Theme Color`, `Brightness`, `Reset`, `Apply`)
- Dataset modal labels
- Modal buttons (`Save`, `Cancel`, `Delete`, `Close`)
- Public-readonly page static text (`Preview Mode`, `Back to Admin`, `Print / Save as PDF`)
- Default section display names in `SECTION_DISPLAY_NAMES` (server.js) — these are fallback labels, but users can override them via headline editing, and those overrides stay untranslated

### What does NOT get translated:
- Any user-typed CV content (name, title, bio, experience entries, education, skills, projects, etc.)
- Custom section names and items (user-created)
- User-edited section headlines (overrides stored in DB)
- JSON keys / data structure keys
- Database values

---

## Implementation Steps

### Step 1: Create the translation module (`public/shared/i18n.js`)

Create a lightweight i18n module:

```js
// public/shared/i18n.js
const I18n = {
    locale: 'en',
    translations: {},

    async load(locale) { ... },  // fetch /shared/i18n/{locale}.json
    t(key, params) { ... },      // lookup with fallback to English, supports {{param}} interpolation
    setLocale(locale) { ... },   // save to settings API + reload translations + refresh UI
    init() { ... }               // load saved preference from /api/settings/language
};
```

Key features:
- **Fallback chain:** requested locale → English → raw key
- **Parameter interpolation:** `t('update_available', {latest: '1.7', current: '1.6'})` → `"Update available: v1.7 (you're on v1.6)"`
- **No DOM coupling:** the module just provides `t()`, the UI refresh is handled separately

### Step 2: Create English base translation file (`public/shared/i18n/en.json`)

Extract all ~150+ hardcoded UI strings into a flat JSON structure with descriptive English keys:

```json
{
    "toolbar.settings": "Settings",
    "toolbar.theme": "Theme",
    "toolbar.open": "Open...",
    "toolbar.save_as": "Save As...",
    "toolbar.show_all": "Show All",
    "toolbar.export": "Export",
    "toolbar.import": "Import",
    "toolbar.help": "Help",
    "toolbar.print": "Print / PDF",

    "theme.title": "Theme Color",
    "theme.brightness": "Brightness",
    "theme.reset": "Reset",
    "theme.apply": "Apply",
    "theme.blue": "Blue (Default)",
    ...

    "settings.title": "Settings",
    "settings.tab.sections": "Sections & Headlines",
    "settings.tab.custom": "Custom Sections",
    "settings.tab.print": "Print & Export",
    "settings.tab.advanced": "Advanced",
    "settings.tab.language": "Language",
    ...

    "form.profile.title": "Edit Profile",
    "form.profile.picture": "Profile Picture",
    "form.profile.name": "Name",
    ...

    "toast.saved": "Saved successfully",
    "toast.deleted": "Deleted",
    ...

    "btn.save": "Save",
    "btn.cancel": "Cancel",
    "btn.delete": "Delete",
    "btn.close": "Close",
    ...

    "section.about": "Professional Summary",
    "section.timeline": "Career Timeline",
    "section.experience": "Work Experience",
    ...

    "confirm.delete_item": "Are you sure you want to delete this item?",
    ...
}
```

### Step 3: Create translation files for all 7 additional languages

Create one JSON file per language in `public/shared/i18n/`:
- `de.json` (German)
- `fr.json` (French)
- `nl.json` (Dutch)
- `es.json` (Spanish)
- `it.json` (Italian)
- `pt.json` (Portuguese)
- `zh.json` (Chinese)

Each file has the same keys as `en.json` with translated values. The keys themselves stay in English.

### Step 4: Add language selector to Settings modal

Add a new **"Language"** tab to the settings modal (5th tab):

```
[Sections & Headlines] [Custom Sections] [Print & Export] [Advanced] [Language]
```

The Language tab contains:
- A brief description: "Choose the display language for the CV Manager interface. This does not affect the content of your CV."
- A list/grid of language options with native names + flags/labels:
  - English (English) — default
  - Deutsch (German)
  - Français (French)
  - Nederlands (Dutch)
  - Español (Spanish)
  - Italiano (Italian)
  - Português (Portuguese)
  - 中文 (Chinese)
- The currently active language is highlighted
- Selecting a language saves it immediately and refreshes all UI text

### Step 5: Modify `index.html` — add `data-i18n` attributes to static HTML elements

For elements whose text is set in HTML (not dynamically via JS), add `data-i18n` attributes:

```html
<span data-i18n="toolbar.settings">Settings</span>
<span data-i18n="toolbar.theme">Theme</span>
```

The English text remains as the default content (for SEO, no-JS fallback, and readability). The i18n module's `refreshUI()` function queries all `[data-i18n]` elements and updates their `textContent`.

Also support attributes:
- `data-i18n-title="key"` for `title` attributes
- `data-i18n-placeholder="key"` for `placeholder` attributes

### Step 6: Modify `admin.js` — replace hardcoded strings with `t()` calls

For dynamically generated UI (modals, toasts, confirmations), replace inline strings:

**Before:**
```js
showToast('Saved successfully', 'success');
```

**After:**
```js
showToast(t('toast.saved'), 'success');
```

**Before:**
```js
document.getElementById('customSectionModalTitle').textContent =
    id ? 'Edit Custom Section' : 'Add Custom Section';
```

**After:**
```js
document.getElementById('customSectionModalTitle').textContent =
    id ? t('custom_section.edit_title') : t('custom_section.add_title');
```

This is the largest step — touching ~150+ string occurrences across `admin.js`.

### Step 7: Modify `scripts.js` — translate shared rendering text

The shared scripts file renders section headers and CV content display. Only translate:
- Section header text (the `SECTION_DISPLAY_NAMES` mapping) — but only when the user hasn't set a custom headline
- "Present" text (for ongoing experiences)
- Any other hardcoded display text in shared rendering

### Step 8: Modify `server.js` — serve `SECTION_DISPLAY_NAMES` from translations

The server currently defines `SECTION_DISPLAY_NAMES` as hardcoded English. Two options:

**Chosen approach:** Keep the server's `SECTION_DISPLAY_NAMES` as-is (English defaults). The client-side i18n module overrides these display names using `t('section.about')`, etc., when rendering. The server values serve as fallbacks and are used in the API response, but the client replaces them with translated versions.

This avoids any server-side i18n complexity and keeps the server stateless regarding language.

### Step 9: Modify `public-readonly/index.html` — translate public-facing text

The public-readonly page has minimal UI text:
- "Preview Mode — This is a saved version and not publicly accessible"
- "Back to Admin"
- "Print / Save as PDF" (title attribute)
- "Loading..." placeholder

Load the i18n module in the public page as well, reading the language setting from the API. Apply translations to these few elements.

### Step 10: Include `i18n.js` in HTML files and initialize

Add the script tag to both `public/index.html` and `public-readonly/index.html`:
```html
<script src="/shared/i18n.js"></script>
```

Call `I18n.init()` during page initialization, before rendering the UI.

### Step 11: Add `refreshUI()` function

Create a function that re-applies all translations after a language change:
1. Query all `[data-i18n]` elements and update text
2. Query all `[data-i18n-title]` elements and update title attributes
3. Query all `[data-i18n-placeholder]` elements and update placeholders
4. Re-render any dynamically built UI (settings modal sections list, custom sections list, etc.)

This function is called:
- After initial i18n load
- After language change in settings

---

## File Changes Summary

| File | Change |
|------|--------|
| `public/shared/i18n.js` | **NEW** — i18n module (~80 lines) |
| `public/shared/i18n/en.json` | **NEW** — English base translations (~150+ keys) |
| `public/shared/i18n/de.json` | **NEW** — German translations |
| `public/shared/i18n/fr.json` | **NEW** — French translations |
| `public/shared/i18n/nl.json` | **NEW** — Dutch translations |
| `public/shared/i18n/es.json` | **NEW** — Spanish translations |
| `public/shared/i18n/it.json` | **NEW** — Italian translations |
| `public/shared/i18n/pt.json` | **NEW** — Portuguese translations |
| `public/shared/i18n/zh.json` | **NEW** — Chinese translations |
| `public/index.html` | **MODIFY** — add `data-i18n` attributes, language tab in settings, load i18n.js |
| `public/shared/admin.js` | **MODIFY** — replace ~150 hardcoded strings with `t()` calls, add language tab logic |
| `public/shared/scripts.js` | **MODIFY** — translate section headers and shared display text |
| `public-readonly/index.html` | **MODIFY** — add `data-i18n` attributes, load i18n.js |
| `src/server.js` | **MODIFY** — serve static files from i18n directory (already handled by express.static, no change needed unless directory is outside public/) |

---

## Key Design Decisions

1. **No external dependencies** — keeps the app lean; the translation module is ~80 lines of vanilla JS
2. **Flat key structure** with dot notation — easy to navigate, grep, and maintain
3. **Client-side only** — the server stays language-agnostic; translations are loaded as static JSON files
4. **Fallback to English** — if a key is missing in a translation file, English is shown
5. **Persisted via settings API** — uses the existing `settings` table, no schema changes needed
6. **HTML `lang` attribute updated** — `<html lang="en">` changes to match the selected locale
7. **User content is sacred** — the translation layer only touches UI chrome, never database content
8. **`data-i18n` for static HTML, `t()` for dynamic JS** — two complementary approaches for complete coverage

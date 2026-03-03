# Changelog

All notable changes to CV Manager will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/), versioning follows [Semantic Versioning](https://semver.org/).

## [1.11.1] - 2026-03-02

### Added
- User Guide: documented company logo management (upload, reuse, auto-fill, global propagation)
- User Guide: documented timeline branching for parallel/concurrent job experiences
- User Guide: documented language picker, version display, update notifications
- User Guide: documented profile Languages field, custom section icons, skill category auto-detection

## [1.11.0] - 2026-03-02

### Added
- Version display in Settings modal footer showing the current running version
- Language picker button in toolbar for quick language switching

### Changed
- Removed "Show All" button from toolbar
- Moved language selection from Settings tab to toolbar dropdown

### Fixed
- Update banner text was hardcoded in English instead of using the i18n translation system

## [1.10.6] - 2026-03-02

### Fixed
- Global logo endpoints not syncing `logo_propagate` flag to saved dataset JSON. `POST /api/logos/apply-global` updated `logo_filename` in datasets but never set `logo_propagate = 1`. `POST /api/logos/set-propagate` only updated the live DB, ignoring datasets entirely. Both now sync the flag to all saved datasets, so the toggle persists across dataset loads and server restarts.

## [1.10.5] - 2026-03-02

### Fixed
- Global logo propagation toggle (`logo_propagate`) not persisting across dataset loads and imports. The INSERT statements for experiences in both `POST /api/datasets/:id/load` and `POST /api/import` were missing the `logo_propagate` column, causing it to reset to 0 (default) every time a dataset was loaded — including the automatic default dataset load on page startup.

## [1.10.4] - 2026-03-02

### Fixed
- Branch dot forced onto main line in print: the `#section-timeline .timeline-dot { top: 50% }` print override (specificity 1,2,0) was overriding `.timeline-item.timeline-branch-track .timeline-dot { top: calc(50% - var(--branch-offset-pct)) }` (specificity 0,3,0). Removed `top`/`left`/`transform`/`position` from print dot/flag rules — only size needs overriding.
- Branch card overlapping header: with the dot incorrectly on the main line but the card correctly elevated, the visual disconnect made the card appear to float into the header. Fixed by the dot specificity correction above.
- CSS branch line fallback positioned in wrong reference frame: was appended to `.timeline-container` (padding box) but `top: 50%` needs to reference `.timeline-items` (content box). Moved to `itemsContainer`.
- Increased print padding from 65px to 70px (matching screen) for branch card clearance.

## [1.10.3] - 2026-03-02

### Fixed
- Timeline print layout on Safari iOS: dots misaligned from track, cards overlapping the line, branch curves invisible.
- Root cause for dot/card misalignment: asymmetric padding (`80px top / 50px bottom`) — the track uses `top: 50%` of the padding box while dots/cards reference 50% of the content box, causing a 15px vertical offset. Restored symmetric padding.
- Root cause for invisible branches: Safari iOS doesn't render inline SVGs with `preserveAspectRatio="none"` in print. Added CSS-based branch line elements (`div.timeline-branch-line`) as a print fallback — hidden on screen, shown via `@media print`, positioned using the same percentage coordinates as the SVG.
- Added explicit CSS `stroke` property on SVG branch paths (more reliable than SVG attribute for CSS variable resolution in print).
- Disabled card hover transitions in print.

## [1.10.1] - 2026-03-02

### Fixed
- Server-side `formatDateShort()` fallback used `new Date(dateStr)` which is locale-dependent and could misparse non-ISO date strings. Replaced with a regex year extraction.

## [1.10.0] - 2026-03-02

### Changed
- Logo propagation is now a persistent toggle instead of a one-time checkbox. When enabled, the toggle state is saved on all matching company experiences and automatically pre-enabled on new/existing experiences for the same company.
- Removing a logo with the toggle on removes it from all matching experiences (logo file stays available in the picker).
- Disabling the toggle stops future propagation without affecting logos already applied.
- Toggle uses the same switch UI as other settings for visual consistency.
- Print timeline container uses asymmetric padding so branch-track cards above the line have proper clearance from the section header.

## [1.9.0] - 2026-03-02

### Added
- **Global logo apply**: Toggle in the experience modal to apply a logo to all experiences with the same company name across all CV variants (current + saved datasets).
- **Auto-fill logo**: Typing a company name that already has a logo in any experience or dataset automatically pre-fills the logo preview.
- New API endpoints `POST /api/logos/apply-global` and `GET /api/logos/by-company?name=...`.

## [1.8.0] - 2026-03-02

### Added
- **Logo reuse across CV datasets**: The logo picker now shows all previously uploaded logos (not just those in the current dataset), with company names displayed beneath each thumbnail for easy identification.
- **Delete unused logos**: A delete button appears on logos not referenced by any current experience or saved dataset.

### Changed
- Logo files are no longer deleted when removing or replacing a logo on an experience — files persist on disk for reuse via the logo picker. Only the explicit delete button in the picker removes files.
- Logo in-use check considers all saved datasets, not just current experiences.

## [1.7.0] - 2026-03-02

### Added
- **Timeline branching**: Overlapping experiences now visually fork into parallel tracks with S-curves and merge back, showing concurrent roles side by side. Overlaps shorter than 1 month are ignored as transition noise.
- **Time-scale timeline positioning**: Timeline items are positioned proportionally based on actual dates rather than equally spaced, with automatic card overlap detection and nudging via angled connector lines.
- **Company logo upload**: Upload a logo per experience via the admin form (JPEG, PNG, WebP up to 5MB). Logos replace the company name on timeline cards and appear alongside experience cards.
- **Logo reuse picker**: "Use Existing" button in the experience form shows a grid of previously uploaded logos, so the same logo can be assigned to multiple positions without re-uploading. Shared logo files are only deleted when no other experience references them.
- **Start-date chevrons**: White chevron arrows mark each experience's start date on the timeline track.

### Changed
- After a branch merges, the next card is always placed above the timeline before resuming regular alternation, taking advantage of the visual space created by the S-curve.
- Timeline track lines and branch lines use 5px width with rounded caps for better visual weight.
- Branch-track dots use a proportional CSS variable (`--branch-offset-pct`) instead of hardcoded pixels, staying aligned at any container size including print.
- Admin and public views share a single `renderTimelineItems()` implementation instead of duplicating logic.
- Export/import preserves `logo_filename` per experience; logos work after import as long as files exist in the uploads folder.
- Print layout scales timeline card widths and branch offset down to match reduced print elements.

## [1.6.11] - 2026-03-01

### Fixed
- **Imported custom sections not appearing in admin settings**: Custom sections imported via JSON were displayed in the CV but missing from Settings > Sections, making them impossible to reorder or toggle. All `/api/sections/order` endpoints now auto-repair missing `section_visibility` entries for custom sections
- **Large JSON imports silently failing**: Express default 100KB body limit could silently reject large CV imports. Increased limit to 10MB
- **Import errors not shown to user**: The frontend import flow never checked the API response for errors — it always showed a success toast even when the import failed server-side

## [1.6.10] - 2026-03-01

### Fixed
- **JSON export missing custom sections**: The JSON export (`/api/cv`) did not include custom sections or their items, so exported files lost all custom section data. Export now includes full custom section metadata (name, layout type, icon, visibility) and all items with their fields
- **JSON import not restoring custom sections**: Importing a JSON file did not restore custom sections. Import now re-creates custom sections with their items and section visibility entries, preserving layout type, icons, sort order, and item metadata
- **Dataset load not restoring custom sections**: Loading a saved dataset snapshot did not restore the custom sections that were captured when the dataset was saved. Dataset load now properly restores custom sections alongside all other CV data

## [1.6.9] - 2026-02-25

### Fixed
- **Custom section labels showing raw keys on public site**: Custom sections displayed internal keys (e.g. `custom_1769874871263`) instead of user-defined labels. `gatherCvData()` was not including `name`/`default_name` in dataset snapshots, so the public site's dataset rendering path had no label to display. Also added a fallback name lookup from custom section data for old datasets saved before this fix.

## [1.6.8] - 2026-02-23

### Fixed
- **Cloudflare Insights beacon blocked by CSP**: Added `https://static.cloudflareinsights.com` to `script-src`, `script-src-elem`, and `connect-src` directives so Cloudflare's auto-injected `beacon.min.js` is no longer blocked by Content Security Policy
- **Rate limit too low for normal page loads**: Increased public server rate limit from 60 to 200 requests per minute — a single page load generates ~30+ requests (assets + API calls), so the previous limit could block legitimate visitors

### Changed
- **Bulk settings API for public site**: Added `GET /api/settings` endpoint to the public server and updated the frontend to fetch all settings in a single request instead of ~10 individual `/api/settings/:key` calls, reducing initial page load API traffic

## [1.6.7] - 2026-02-23

### Fixed
- **CSP**: Allow Cloudflare Insights 
- **Rate limit**: 60 → 200 req/min
- **Bulk /api/settings endpoint** 

### Fixed
- **Section headings not translated on public site**: The public-facing template (`public-readonly/index.html`) had hardcoded English section headings without `data-i18n` attributes, so they never updated when a non-English language was selected. Added `data-i18n="section.*"` attributes to all seven built-in section headings, matching the admin template

### Added
- **i8n localization**: the application is now fully localized for 8 languagues: en,fr,de,pt,it,es,zh,nl
- **CLAUDE.md**: Added AI-assisted development guide with project architecture, i18n walkthrough (including step-by-step instructions for adding a new language), versioning policy, and key patterns reference

## [1.6.6] - 2026-02-23

### Added
- **"Present" display for Education**: Education end dates now display "Present" when left empty, matching the existing Experience behavior. Form placeholder updated to indicate "Leave empty for Present". ATS text output also reflects the change

## [1.6.5] - 2026-02-18

### Fixed
- **Google Analytics data collection blocked by CSP**: The CSP extractor only whitelisted domains found in the tracking snippet (e.g., `googletagmanager.com`), but analytics providers make requests to additional companion domains not present in the snippet (e.g., `google-analytics.com`, `region1.google-analytics.com`). Added automatic companion domain detection for Google Analytics, Plausible, and Matomo. Refactored CSP domain extraction into a single shared function used by both server modes

### Changed
- **Tracking code now injected server-side**: Tracking code is now written directly into the HTML response right after `<head>`, instead of being injected client-side via JavaScript. This ensures Google Tag Assistant and other verification tools can detect the tracking snippet in the raw page source. Client-side injection is skipped when server-side injection is present to avoid duplicate scripts

## [1.6.4] - 2026-02-14

### Fixed
- **Tracking code (Google Analytics, etc.)**: Fixed two issues preventing tracking scripts from loading on the public site. The dual-server CSP was hardcoded without tracking domain support, blocking external scripts. Additionally, the dataset rendering path was missing the `loadTrackingCode()` call. Both paths now dynamically extract domains from the tracking snippet and add them to the Content-Security-Policy

## [1.6.3] - 2026-02-13

### Fixed
- **Custom sections on public site**: Custom sections (social links, grids, lists, etc.) were missing from the public site when served from a saved dataset. The `gatherCvData()` snapshot now includes custom sections with their items, and the dataset rendering path now renders them on the public page. Older datasets without custom section data fall back to loading from the live database

## [1.6.2] - 2026-02-13

### Fixed
- **Timeline periods on public site**: Fixed empty year/period text in the career timeline when served from a saved dataset. Legacy date formats (e.g., "Jan 2020") are now automatically migrated to ISO format ("2020-01") in the database and inside saved dataset snapshots on first startup. The `formatTimelinePeriod` function also handles non-ISO dates gracefully as a safety net

## [1.6.1] - 2026-02-13

### Changed
- **Mobile toolbar**: Replaced icon-only buttons with a hamburger menu that opens a full-width dropdown with labeled actions. Print button remains always visible in the toolbar for quick access
- **Mobile modals**: Restructured modal layout so header and footer stay fixed while only the body scrolls, preventing the close button from being clipped by border-radius. Uses `dvh` units for proper sizing on iOS Safari with the bottom address bar

### Fixed
- **Datasets modal legend**: Added visual legend explaining the three controls (radio button, toggle, eye icon) with miniature icon previews
- **Toggle labels**: Public/private toggle in datasets modal now shows an explicit "Shared" / "Private" text label next to the switch
- **Banner opacity**: Active dataset banner background changed from semi-transparent to opaque so content doesn't bleed through when scrolling

## [1.6.0] - 2026-02-11

### Added
- **Default dataset**: Datasets can now be designated as the "default" via a radio button in the Open modal. The default dataset is served at the root URL `/` on the public site, decoupling the public CV from live admin edits
- **Active dataset banner**: Persistent banner below the toolbar shows which dataset is currently being edited, with auto-save status indicator
- **Auto-save**: Every edit (save, delete, reorder, visibility toggle) automatically saves back to the active dataset after a short debounce, eliminating the need for a separate "save to dataset" step
- **Save to dataset**: New `POST /api/datasets/:id/save` endpoint writes the current live CV state back into any existing dataset without creating a new one
- **Auto-migration**: On first startup, a "Default" dataset is automatically created from the current CV data so the Open modal is never empty
- **Dataset state tracking**: Admin tracks which dataset is loaded, updates the banner on load/save/import, and shows "Editing" badge in the datasets modal

### Changed
- **Public page serving**: Root URL `/` now serves from the frozen default dataset JSON instead of live database tables, isolating the public CV from in-progress edits
- **Datasets modal redesign**: Radio button column for default selection, visual badges for "Default" and "Editing" states, slug URLs hidden for default dataset, disabled delete on default
- **Banner stacking**: Update banner and active dataset banner stack dynamically with proper margin calculation
- **CV data gathering**: Extracted `gatherCvData()` helper to eliminate duplicated snapshot logic across save, load, and migration code paths

### Fixed
- **Delete protection**: Default dataset cannot be deleted — server returns a clear error message, delete button is disabled in the UI

## [1.5.0] - 2026-02-11

### Added
- **Show profile picture toggle**: Profile picture can be toggled to be shown or disabled.

## [1.4.0] - 2025-02-11

### Added
- **Versioned URL indexing control**: New "Index Versioned URLs" toggle in Advanced settings. When off (default), public `/v/slug` pages get `noindex, nofollow` to prevent search engine crawling

## [1.3.0] - 2025-02-11

### Added
- **Public versioned CVs**: Datasets can now be toggled as "public" via the Open modal, making them accessible at `/v/{slug}` on the public site with proper OG meta tags and SEO
- **Public toggle in datasets modal**: Toggle switch per dataset to control public visibility, with "Public" badge indicator
- **Public dataset API**: `/api/datasets/slug/:slug` endpoint on public server for public datasets (is_public=1 only)

### Changed
- **Preview banner**: Only shows on admin preview, not on publicly shared versioned URLs
- **Copy URL toast**: Differentiates between "Public URL copied" and "Preview URL copied"

## [1.2.0] - 2025-02-10

### Added
- **Favicon and icons**: Admin and public sites now show distinct favicons and apple-touch-icons (pencil badge for admin, eye badge for public), served via Express routes from repo-root icon files

### Fixed
- **Update banner positioning**: Banner now renders below the fixed toolbar instead of hidden behind it, with dynamic container margin adjustment

## [1.1.0] - 2025-02-09

### Added
- **Custom section layouts**: Bullet list and free-text layout types for custom sections
- **Free-text title support**: Optional title field with hide toggle (hidden by default) for free-text layout items
- **Timeline year-only toggle**: Independent setting to display only years in timeline regardless of global date format
- **Date normalization**: Automatic conversion of various date formats (Jan 2020, 01/2020, etc.) to ISO format on save, with validation errors for unrecognized formats
- **Help button**: Toolbar link to GitHub User Guide documentation
- **Version check**: Non-blocking update notification banner on admin page load, checking against `version.json` on GitHub
- **MMM YY date format**: Added short month-year format option (e.g., "Jan 20")

### Fixed
- **Sort order preservation**: Editing items no longer resets their position — all PUT endpoints now preserve existing `sort_order` and `visible` values when not explicitly provided
- **Section reorder on edit**: Custom sections no longer jump to bottom of page after editing items (DOM reorder extracted into reusable function)
- **Timeline flag logic**: Flags now only appear when multiple countries exist, with first entry showing its flag; removed hardcoded 'ch' default from country code field and all server fallbacks
- **Timeline date display**: Non-ISO dates (e.g., "Jan 1989") no longer show garbled text in timeline — falls back to server-provided period string
- **Theme button height**: Color picker wrapper now uses `display: flex` to match toolbar button heights

## [1.0.0] - 2025-02-08

### Added
- Initial release
- 7 built-in sections: About, Timeline, Experience, Certifications, Education, Skills, Projects
- Custom sections with 5 layout types: grid-2, grid-3, list, cards, social-links
- Dual-server architecture (admin port 3000, public port 3001)
- ATS-optimized HTML output with Schema.org markup
- Print/PDF export with page number support
- Theme color picker with presets
- Dataset save/load for multiple CV versions
- Import/export as JSON
- Profile picture upload
- Docker deployment with Unraid support
- Cloudflare Tunnel compatible

# Changelog

All notable changes to CV Manager will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/), versioning follows [Semantic Versioning](https://semver.org/).

## [1.37.0] - 2026-04-18

### Removed
- The Settings → **Sections & Headlines** tab is gone. Every feature it hosted — reorder, visibility, print-visibility, rename — now lives on the section header of the active dataset (reorder handle, eye icon, printer icon, pencil icon). The Settings modal now opens directly on **Print & Export**. Orphan i18n keys (`settings.tab.sections`, `settings.sections.info`, `settings.sections.click_to_edit`, `settings.sections.reset_default`) and the CSS for the removed list are removed too. User documentation in all 8 locales is rewritten to reflect the inline workflow.

## [1.36.0] - 2026-04-18

### Added
- Granular section renames, triggered from the section itself rather than from Settings. Every built-in section header (timeline, experience, certifications, education, skills, projects) and every custom section header gains a rename pencil icon next to its visibility toggle. The "Professional Summary" section, which already hosts an Edit icon, instead picks up the rename flow as a new "Section heading" field inside the profile modal. Each rename modal includes an "Apply to all datasets in this language" toggle, on by default. Language-wide renames are stored in a new `section_title_overrides` table keyed by `(section_key, language)`; siblings with a different language in the same language group are never affected.

### Changed
- Resolution order for section titles is now **per-dataset override → per-language override → i18n `section.<key>` → built-in default**. `GET /api/sections/order` accepts `?dataset_id=` and/or `?language=` and returns the already-resolved `name`, so the client no longer duplicates the precedence logic.
- Settings → Sections no longer renames; the name input is read-only and points users to the per-section pencil icon on the main page. Existing global `section_visibility.display_name` values are migrated once into the new per-language table for every language present in `saved_datasets`. The ATS PDF export and server-side title rendering now use the same resolution helper.

## [1.35.0] - 2026-04-18

### Added
- Inline print-visibility toggle on every section header of the active dataset. A printer icon sits next to the existing visibility eye on built-in and custom sections, mirroring the control that previously lived only inside Settings > Sections & Headlines. The icon flips to `print_disabled` when the section is excluded from print, and is disabled while the section itself is hidden.

### Fixed
- Hiding a section from print no longer dims it on the admin screen. Previously, "visible=off" and "print=off" both applied the same `.hidden-print` class, so toggling print off made the section look as if it had been hidden entirely. Print-only hiding now shows the section at full opacity with a small "no print" badge on its title; "fully hidden" keeps the existing 50% dashed treatment via the new `.is-hidden` class.

## [1.34.1] - 2026-04-18

### Fixed
- Section reorder overlay: the dashed placeholder now matches the height of the floating pill instead of reading shorter than it. The pill no longer scales up while dragged, so the slot it leaves behind and the slot it returns to line up.
- CV Manager modal on phones: each dataset row now wraps so the action-bearing essentials (radio, language, version, name, LOAD, ⋮) stay on the first line and the state/metadata (EDITING / DEFAULT pill, PUBLIC / MAKE PUBLIC, URL, last-modified date) drops to a second line underneath the name. The `+ New version` and `Add language` buttons in each group header collapse to icon-only, and the redundant "Existing CVs" subtitle is dropped (the modal title already labels the section).
- Active dataset banner in portrait: the dataset name now sits on its own row, with version / language / public-status badges stacked underneath it and the language-variants row below that. The `+ Add language` button collapses to an icon and the "Switch other variants of this CV:" label is dropped on narrow screens.

## [1.34.0] - 2026-04-17

### Added
- Inline custom section creation: a dashed "+ Create custom section" placeholder appears when hovering the gap between two sections (and stays visible below the last section as a discoverability hint). Clicking it opens the creation dialog and inserts the new section directly after the one above it. No more round-trip through Settings.
- Inline rename and delete controls on every custom section header (pencil + trash icons), alongside the existing visibility toggle.

### Removed
- Custom Sections tab in Settings — the inline placeholder and header controls cover every path that tab used to provide.
- Ability to change a custom section's layout type after creation. Layout is chosen once on creation; if a different layout is needed, create a new section and move the items over.

## [1.33.3] - 2026-04-17

### Changed
- Section reorder overlay: when a drag is started from a section-heading handle, the floating pill now snaps under the cursor (centered on the pointer) instead of preserving the pointer→pill offset. The handle can be far from the overlay's center, which previously required dragging the cursor a long way before the pill caught up — painful on small trackpads.

## [1.33.2] - 2026-04-17

### Fixed
- Section reorder overlay: the new order is now also synced into the active dataset snapshot, matching how the Settings → Sections Save button behaves. Without this, the live `section_visibility` table was updated but the active dataset kept the old order, and a page reload restored it — making the reorder appear not to persist.

## [1.33.1] - 2026-04-17

### Fixed
- Section reorder overlay: the drop-position indicator now tracks the floating pill's midpoint instead of the cursor, so grabbing a pill near its top or bottom edge no longer puts the placeholder one slot off from where the pill is actually shown.

## [1.33.0] - 2026-04-17

### Added
- In-place section reorder overlay. A drag handle now appears next to every section heading; activating it opens a floating overlay with each section's title over a dimmed, blurred CV. Drag pills to reorder with animated transitions, then click OK to save or Cancel to revert. Hidden sections appear dimmed so their position can still be adjusted. The Settings → Sections & Headlines panel is unchanged and remains available.

## [1.32.0] - 2026-04-17

### Added
- Profile picture library: upload multiple pictures, reuse any of them from a picker grid, and delete unused entries. Mirrors the company-logo library pattern.
- "Apply this picture to all datasets" toggle in the profile modal (enabled by default). When on, uploading or selecting a picture mirrors the change into every saved dataset snapshot; when off, each dataset keeps its own picture and uploading/selecting/removing a picture while editing a localized dataset also syncs every language sibling in the same `language_group` (unrelated datasets remain untouched).
- New backend endpoints: `GET /api/profile-pictures`, `DELETE /api/profile-pictures/:filename`, `PUT /api/profile/picture/select`, `POST /api/profile-pictures/apply-global`. Each picture mutation accepts an optional `current_dataset_id` so the server can resolve siblings.
- Legacy `uploads/picture.jpeg` is promoted into the new library format on first run so existing installs keep their picture.

### Fixed
- Public site now honors the "Show profile picture" toggle. The picture was previously always rendered on `/`, `/<lang>`, and `/v/<slug>` regardless of the setting. Public `/api/cv`, `/api/profile`, and the dataset-load endpoint now carry the toggle and filename, and the public renderer respects both.
- Turning off "Show profile picture" now truly hides the profile picture circle on both admin and public views, even when "Open to Work" is enabled. The OTW overlay used to force the container visible (which shows the colored gradient circle) to give the badge a host; the badge is now suppressed together with the picture so disabling the picture actually removes the whole header circle.

## [1.31.0] - 2026-04-17

### Added
- Active dataset banner surfaces sibling language variants as right-aligned clickable pill chips with circular flag images, loading the sibling on click.
- Dedicated "Add language" button (filled primary pill) opens a dropdown listing languages not yet present in the group, pre-fills and locks the Save As flow for the chosen language.
- Current-language pill is always visible when a dataset is open, with the same pill shape and circular flag as the sibling chips.
- Version pill shows `v{N}` in a high-contrast amber pill when the dataset has multiple versions in its `version_group`.
- Intro label "Switch other variants of this CV:" precedes the sibling chips when siblings exist.

### Fixed
- Defensive fallback: if a loaded dataset has no `language` value, the current UI locale is used and persisted back to the dataset via the existing language API.

## [1.30.1] - 2026-04-16

### Changed
- Added indexes on `saved_datasets.language_group`, `saved_datasets.version_group`, `saved_datasets.is_default` (partial), and `saved_datasets(slug, language)` to speed up sibling, version, default, and slug lookups on public page loads and dataset opens.
- Tuned SQLite pragmas on the admin connection: `synchronous = NORMAL`, `cache_size = -16000` (16 MB), `temp_store = MEMORY`. Reduces commit latency and eliminates disk-backed temp sorts on the dataset list.

## [1.30.0] - 2026-04-16

### Changed
- Unified CV Manager modal replaces the separate Open and Save As modals. A single "CV Manager" button in the toolbar opens one modal with a save-as form at the top and the full dataset list below.
- Each dataset row now shows: default radio, language badge, version badge, name, URL, date, Load button, and a ⋮ overflow menu for secondary actions (share/private, change language, preview, copy URL, delete).
- Flat row layout per language variant — no intermediate version headers for single-language versions, eliminating redundant name repetition.
- Group headers show base name, "+ New version" button, and version count on one line.
- Compact legend moved to the modal footer.

### Fixed
- "New version" button now correctly passes version_group UUID instead of language_group, fixing version grouping for new versions.
- Startup fixup consolidates orphaned version_groups created by the previous bug.
- Default dataset siblings now hide the public/private toggle and show the correct `/{lang}` URL.
- Language is now included in JSON export/import for proper round-tripping.

### Added
- Per-dataset language editor: clickable language badge on each row opens a picker to reassign a dataset's language.
- `PUT /api/datasets/:id/language` endpoint with conflict validation.

## [1.29.0] - 2026-04-16

### Added
- Proper backend versioning: `version_group` (UUID) and `version` (integer) columns on `saved_datasets`. Version grouping now uses database UUIDs instead of parsing "Name vN" from dataset names, making it resilient to renaming.
- Creating a new version automatically copies all language variants from the previous version.
- New backend tests for version increment, language sibling carry-over, slug sharing across versions, and version fields in API responses.

### Changed
- Frontend dataset hierarchy (`groupDatasetsHierarchy`) now groups by `version_group` from the API instead of regex name parsing. Display names still use the parsed base name for human readability.
- `suggestNextVersion` uses `version_group` and the `version` field to find the max version, falling back to name parsing for legacy datasets.
- "New version" buttons pass `version_group` UUID to the backend instead of `source_group`.

### Fixed
- Active language in the banner language switcher dropdown now has white text on blue background for proper contrast
- "Add language" item in the language switcher dropdown is now clickable and opens the Save As modal pre-filled for adding a new language variant

## [1.28.0] - 2026-04-16

### Added
- Per-dataset CV localization: save language-specific variants of each CV (e.g. English + German) that share the same structure but have independent content. Language variants are linked via a `language_group` and share the same URL slug.
- Public language switcher: visitors can switch between available language variants at `/v/{slug}/{lang}`. A translate button appears on the public site when multiple languages are available (hidden during printing).
- Admin language switcher: when editing a dataset with language siblings, a language switcher in the active-dataset banner lets you quickly switch between variants. New languages are added via the Save As modal.
- Structural propagation: changes to section order, visibility, custom section layout, and item count automatically sync across all language siblings. Content (text, titles, descriptions) stays independent per language.
- Language-specific URL routing: `/v/{slug}/{lang}` for versioned datasets, `/?lang=xx` for the root URL. Single-language datasets continue to work at `/v/{slug}`.
- Group-wide default and public toggles: setting a dataset as default or toggling public visibility applies to all language variants in the group.
- New i18n keys for language management UI in all 8 locale files (en, de, fr, nl, es, it, pt, zh).
- Database migration adds `language` and `language_group` columns to `saved_datasets` with composite unique constraints on `(slug, language)` and `(name, language)`.
- Backend tests for language variant creation, sibling management, structural propagation, and group-wide operations.

## [1.27.0] - 2026-04-15

### Changed
- "Save As…" now opens a rich modal instead of a browser prompt. Existing CVs are shown grouped by base name so sibling versions (`My CV`, `My CV v2`, `My CV v3`) appear visually attached under a shared parent. Clicking a CV in the list pre-fills the name input so overwriting is explicit, and the primary button flips between "Save as new" and "Overwrite" (with a warning color) as you type. Every group has a "+ New version" shortcut that auto-suggests the next free `vN` name. Overwriting an existing CV now requires confirming a dialog.
- The "Open…" modal now uses the same grouped tree view: sibling versions of the same base CV are wrapped under a shared header and indented with tree connectors, each tagged with a small `v1`/`v2`/`v3` badge. All existing controls (default radio, public-share toggle, preview eye, load/reload, delete, slug URL copy) are preserved per row. Standalone CVs with no siblings continue to render as a single row.

### Added
- New `datasets.save_as_title`, `datasets.name_label`, `datasets.name_placeholder`, `datasets.save_as_hint`, `datasets.existing_datasets`, `datasets.no_existing`, `datasets.new_version`, `datasets.versions_count`, `datasets.save_new`, `datasets.save_new_empty`, `datasets.overwrite`, and `confirm.overwrite_dataset` i18n keys in all 8 locale files (`en`, `de`, `fr`, `nl`, `es`, `it`, `pt`, `zh`).

## [1.26.7] - 2026-04-15

### Fixed
- ATS PDF export is now fully localized to the selected UI language. Section headings (Work Experience, Education, Skills, etc.), the "Present" label for current roles, the "Technologies:" prefix in projects, the PDF document language tag, and PDF metadata (Title, Subject) now follow the active locale instead of always appearing in English.

### Added
- Server-side i18n loader that reads the existing `public/shared/i18n/*.json` files so server-generated output can be localized.
- New `ats.technologies_label`, `ats.pdf_title_suffix`, `ats.pdf_subject`, and `ats.name_fallback` i18n keys in all 8 locale files (`en`, `de`, `fr`, `nl`, `es`, `it`, `pt`, `zh`).

## [1.26.6] - 2026-04-15

### Fixed
- Month names in displayed dates now follow the selected UI language (e.g. "Januar 2024" in German, "mars 2024" in French) instead of always appearing in English. Affects Experience, Education, Certification, and Timeline dates in the admin and public views.
- ATS document export now also uses the selected UI language for month names (previously always English).

### Added
- New `month.short.*` and `month.long.*` i18n keys (24 total) in all 8 locale files (`en`, `de`, `fr`, `nl`, `es`, `it`, `pt`, `zh`).

## [1.26.5] - 2026-04-14

### Fixed
- Certification link icon no longer shows an underline on hover/focus
- Certification link icon is hidden in print output (previously it printed as a small rendered box)
- Dataset view (`/v/:slug`) now also renders the certification credential URL as a link icon (only the live `/` public view did before)

## [1.26.4] - 2026-04-14

### Fixed
- Certifications: the credential field is now treated as a URL and renders a link icon (opens in a new tab) on both the admin and public views, matching the Projects section. Previously the value was stored but never rendered, and was stripped from the public API.

### Added
- Client- and server-side URL validation for certification credential URLs (http/https only).
- Renamed the field label to "Credential URL" across all 8 locales and added a URL placeholder.
- New i18n keys: `form.credential_url`, `form.credential_url_placeholder`, `toast.credential_url_invalid`, `view_credential`.

### Changed
- Demo data: sample `credential_id` values in `demo-cv-data.json` are now example verification URLs so fresh installs demonstrate the link-icon feature.

## [1.26.3] - 2026-04-03

### Fixed
- Certification badge logos disappearing on admin page refresh due to missing logo_filename and logo_propagate fields when loading datasets

## [1.26.2] - 2026-03-30

### Fixed
- Security: updated path-to-regexp to 0.1.13 (CVE-2026-4867, ReDoS via multiple route parameters)
- Security: updated brace-expansion to fix process hang vulnerability (GHSA-f886-m6hf-6m8v)

## [1.26.1] - 2026-03-19

### Fixed
- Static site export button now uses proper contrast styling (was white on light background)
- Improved description text explaining the feature's purpose
- Added documentation link in the export section

## [1.26.0] - 2026-03-19

### Added
- Static site export: download your CV as a standalone static website (HTML, CSS, JS, JSON) that can be deployed to GitHub Pages, Cloudflare Pages, Netlify, or any static hosting provider — no server required
- New "Static Site Export" option in Settings → Print & Export with one-click ZIP download
- Documentation with step-by-step deployment guides for GitHub Pages, Cloudflare Pages, and Netlify

## [1.25.1] - 2026-03-18

### Fixed
- Certification and education logos now always display when uploaded, independent of the "Experience: Show Logos" setting
- Reverted "Experience: Show Logos" setting description to its original experience-only scope

## [1.25.0] - 2026-03-18

### Added
- Logo support for certifications — upload, reuse, and propagate logos by provider, using the same modal and features as work experience and education
- Certification card layout updated: date now displays below the title for a cleaner compact grid layout

## [1.24.2] - 2026-03-10

### Fixed
- Improved ATS PDF export to prevent job entry merging by Workday and similar ATS parsers — job title, company name, and dates are now on separate lines instead of combined, and thin separator lines are added between entries for clear boundary detection

## [1.24.1] - 2026-03-07

### Changed
- Increased all modal widths to 900px on desktop for a more spacious editing experience, with responsive fallback to 95vw on mobile

## [1.24.0] - 2026-03-07

### Added
- Optional summary text field for work experiences — a free-text block displayed between location and bullet highlights, useful for brief role descriptions that don't fit the bullet format
- Summary included in ATS text output, PDF generation, dataset save/load, and public CV rendering

## [1.23.0] - 2026-03-06

### Added
- ATS-friendly PDF document generator: generate clean, structured, tagged PDFs (with StructTreeRoot) optimized for Applicant Tracking Systems using pdfkit (no Chromium required)
- ATS Document button visible in mobile hamburger menu
- PDF export modal with live preview, adjustable scale (50%–150%), and paper size selection (A4/Letter)
- New "ATS Document" button in the admin toolbar for quick access
- Translations for ATS export feature in all 8 supported languages

## [1.22.1] - 2026-03-06

### Fixed
- ATS-friendly content block now included in PDF print output (was incorrectly hidden with `display: none`)
- Added `aria-hidden` to decorative icon elements for better screen reader and ATS parser compatibility

## [1.22.0] - 2026-03-05

### Added
- Open to Work badge: toggle in profile editor to display a green "Open to Work" badge on your public CV header (hidden in print)
- Translations for Open to Work feature in all 8 supported languages

### Fixed
- Bluesky social link icon now displays the correct butterfly logo instead of a spade shape
- Open to Work toggle now persists when saving profile
- Moved Open to Work toggle to top of profile modal for better visibility

## [1.21.0] - 2026-03-05

### Added
- Education logos: upload and display institution logos next to education entries, with the same modal and features as experience logos (upload, reuse, propagate across matching institution names)
- Bluesky social link platform option in Social Links custom sections

## [1.20.4] - 2026-03-05

### Fixed
- Fix timeline card click-to-scroll on public page by including experience `id` in the public API response

## [1.20.3] - 2026-03-05

### Fixed
- Fix timeline card click-to-scroll not working on saved dataset previews and public versioned URLs

## [1.20.2] - 2026-03-05

### Changed
- Redesign icon picker as a full-screen overlay popup instead of an inline dropdown to eliminate double scrollbars and cramped layout
- Migrate icon library from Google Material Icons to Google Material Symbols Outlined
- Use `view_column_2` icon for 2-column grid custom section layout

## [1.20.1] - 2026-03-05

### Changed
- Redesign skill category icon picker as a popup dropdown with trigger button instead of embedded grid
- Use `splitscreen` icon for 2-column grid custom section layout (replaces invalid `view_column_2`)

## [1.20.0] - 2026-03-05

### Added
- Visual icon picker grid for skill categories with 30 Material Icons to choose from
- 20 new skill category icons: Security, Web, Mobile, Terminal, API, Analytics, Science, Build, Design, Education, Protection, Performance, Communication, Testing, Health, Music, Photography, Sports, Sustainability, Finance
- Auto-detection mappings for new icon categories based on skill category names

### Fixed
- Toolbar Language and Help buttons not showing icons (btn-icon-only hiding Material Icons spans)
- Custom section 2-column grid using wrong icon (view_column → view_column_2)
- Material Icons being too small in buttons, add-buttons, and modal close buttons
- Mobile toolbar menu not showing text labels alongside icons

## [1.19.0] - 2026-03-05

### Changed
- Migrate all UI icons from inline SVGs to Google Material Icons font
- Add `materialIcon()` helper function for consistent icon rendering in JavaScript
- Update CLAUDE.md with icon library guidelines and usage patterns

## [1.18.0] - 2026-03-05

### Added
- Reorder work experiences with up/down arrow buttons shown on hover
- Experience ordering now uses user-defined sort order (instead of only date-based sorting)
- Experiences included in the generic reorder API endpoint

## [1.17.0] - 2026-03-05

### Added
- Backend endpoints for reusing and removing logos on custom section items (PUT/DELETE)

### Changed
- Renamed "Timeline" layout type to "Additional Experiences" with Material Design WorkHistory icon (briefcase with clock)
- Revamped Additional Experiences item modal to match Work Experience: full logo management with Choose Image, Use Existing, and Remove buttons
- Moved "Show on Career Timeline" toggle from section settings to items management view for easier access
- Extracted shared `renderExperienceCard()` in scripts.js — single source of truth for all experience-style cards (admin/public, experiences/timeline)
- Extracted shared `logoUploadHtml()` — single source of truth for logo upload UI (Experience and Additional Experiences modals)
- Additional Experiences cards now show duration and logos, matching Work Experience behavior
- Additional Experiences logos respect the "Experience: Show Logos" setting
- Increased settings modal width from 560px to 640px and sub-modals from 600px to 680px

### Removed
- Removed unused "Section Icon" dropdown from custom section settings (was stored but never rendered)

## [1.16.0] - 2026-03-05

### Added
- Timeline layout type for custom sections: create experience-like entries (job title, company, dates, location, highlights, logo) in custom sections
- "Show on Career Timeline" toggle: when enabled, timeline custom section items appear on the Career Timeline alongside standard work experiences, including branching support
- Full i18n support for the new timeline layout across all 8 languages

## [1.15.0] - 2026-03-05

### Added
- Work experience logos: optional setting to display company logos alongside experience entries (disabled by default)
- Timeline logos toggle: setting to show/hide company logos in timeline cards (enabled by default)
- Experience duration display: optional setting to show job duration (e.g. "2 yrs 3 mos") next to dates, similar to LinkedIn (disabled by default)
- All three new settings available in Settings > Advanced with full i18n support across all 8 languages

## [1.14.2] - 2026-03-05

### Fixed
- Security: Update multer from 2.1.0 to 2.1.1 to fix high-severity DoS vulnerability via uncontrolled recursion (CVE-2026-3520)

## [1.14.1] - 2026-03-04

### Fixed
- Picture grid column setting lost on dataset save/load — metadata was not included in gatherCvData or the dataset restore INSERT
- Picture grid images no longer stretch beyond their natural size in 1 and 2-column modes (use auto-sized grid columns instead of 1fr)

## [1.14.0] - 2026-03-04

### Added
- Picture Grid layout type for custom sections — upload images displayed in a responsive 3-column grid, centered when fewer than 3 pictures are present
- Full CRUD for picture grid items with file upload, optional captions, and automatic file cleanup on deletion

## [1.13.0] - 2026-03-03

### Added
- Timeline branching toggle in Settings > Advanced — allows disabling the branch visualization for overlapping experiences, rendering a flat timeline instead (enabled by default)

## [1.12.3] - 2026-03-03

### Fixed
- Timeline branches not displaying when printing from iPhone — iOS Safari doesn't render SVGs in print, so restored the CSS fallback branch line that was removed in the revert
- Timeline cards overlapping with the section header on iPhone print — restored CSS-based centering (`left: 50%; transform: translateX(-50%)`) for print since JS-computed inline positioning doesn't apply reliably on iOS Safari's print renderer

## [1.12.1] - 2026-03-03

### Fixed
- Timeline no longer creates visual branches for brief transitional overlaps (e.g. starting a new role a few months before leaving the old one); only genuinely concurrent positions trigger branching

## [1.12.0] - 2026-03-03

### Changed
- Reorganized toolbar button order: Open, Save As, Theme, Settings, Export, Import, Language, Help, Print/PDF
- Language and Help buttons are now icon-only (no text label) to save toolbar space
- Help button now links to the documentation site (docs-cv-manager.verdet.me)

## [1.11.5] - 2026-03-03

### Fixed
- Timeline branches that don't have enough horizontal space for S-curves now collapse gracefully to the main line instead of rendering distorted curves

## [1.11.4] - 2026-03-03

### Fixed
- Item visibility now persists correctly when saving/loading datasets and importing data (strict comparison `!== false` failed for SQLite integer `0`, changed to loose `!= false`)
- `gatherCvData()` now stores `visible` as boolean for all section types, consistent with API responses

## [1.11.3] - 2026-03-03

### Fixed
- Hiding an experience now dynamically removes it from the timeline instead of leaving a dimmed entry
- Timeline is regenerated when experience visibility is toggled, ensuring layout recalculates correctly

## [1.11.2] - 2026-03-03

### Fixed
- Timeline parallel experience detection now checks all overlapping items instead of only the nearest, preventing incorrect track assignments when 3+ jobs overlap
- Timeline overlap threshold uses actual months instead of raw YYYYMM subtraction, with adaptive minimum so short-duration items (e.g. 1-month acting roles) are correctly detected as parallel
- Timeline cards no longer overflow the container — bidirectional clamping keeps cards within bounds
- Timeline container height calculation accounts for full branch offset (28px) instead of partial (8px)
- Timeline chevrons now appear on the branch line for branch-track items (moved into .timeline-items to share coordinate system with dots)
- Timeline chevrons render between branch lines and dots (z-index layering: SVG lines 1 → chevrons 2 → dots/flags 3)
- Timeline card offsets use percentage-based left positioning so they scale correctly across container sizes
- Timeline print: removed double branch line caused by both SVG curves and CSS fallback rendering simultaneously
- Timeline hover no longer breaks card centering (transform now preserves translateX(-50%))

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

# Changelog

All notable changes to CV Manager will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/), versioning follows [Semantic Versioning](https://semver.org/).

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

# Changelog

All notable changes to CV Manager will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/), versioning follows [Semantic Versioning](https://semver.org/).

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

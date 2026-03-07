## Description

<!-- What does this PR do? Why is this change needed? -->

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation (changes to docs only — no version bump needed)
- [ ] Translation (new or updated language files)
- [ ] Refactoring (no functional changes)

## Checklist

### Required for all code changes

- [ ] I have tested my changes locally (`npm test` passes)
- [ ] Version has been bumped in all 3 files (`package.json`, `package-lock.json`, `version.json`)
- [ ] `CHANGELOG.md` has been updated with a new entry under the correct version

### If adding or changing user-visible strings

- [ ] No hardcoded English — all strings use `t('key')` in JS or `data-i18n` in HTML
- [ ] New i18n keys added to `en.json` and all 7 other locale files (`de`, `fr`, `nl`, `es`, `it`, `pt`, `zh`)
- [ ] `escapeHtml()` used for any user-provided content rendered as HTML

### If documentation-only change

- [ ] No version bump included (docs changes must not bump the version)

## Screenshots (if applicable)

<!-- Add screenshots for UI changes -->

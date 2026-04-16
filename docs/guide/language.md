# Language

## Admin Interface Language

Click the **globe icon** in the toolbar to switch the admin interface language. A dropdown grid shows all available languages — click one to apply it immediately.

**Supported languages:** English, German (Deutsch), French (Français), Dutch (Nederlands), Spanish (Español), Italian (Italiano), Portuguese (Português), Chinese (中文).

The language setting only affects the admin interface labels, buttons, and menus. Your preference is saved and persists across sessions.

## CV Content Language

Separately from the interface language, each saved dataset has its own **content language** — this is the language the CV content is written in. The content language is shown as a badge (EN, DE, FR, etc.) on each dataset row in the CV Manager.

When you load a dataset, the admin interface automatically switches to match its content language. This means if you load a German CV, the interface switches to German too, so section headings and form labels are in the same language as the content you're editing.

### Changing a Dataset's Language

To change the language assigned to an existing dataset:

1. Open **CV Manager**
2. Click the **language badge** (e.g., EN) on the dataset row
3. Select the new language from the picker

This reassigns the language code without changing the content itself — useful for datasets that defaulted to English during initial setup.

## Language Variants

You can create **multiple language variants** of the same CV. For example, maintain an English and a German version that share the same structure but have independent content.

See [Datasets & Language Variants](datasets.md#language-variants) for details on creating and managing language variants.

## Public Site Language Switching

When the default dataset has language siblings, visitors can switch languages on the public site:

- The **default language** is served at `/`
- Other languages are available at `/{lang}` (e.g., `/de`, `/fr`)
- A language switcher button appears on the public site for visitors to toggle between available languages

For non-default shared datasets, language variants are served at `/v/slug/{lang}`.

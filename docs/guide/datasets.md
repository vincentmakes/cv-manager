# Datasets & Language Variants

## How Datasets Work

Datasets are saved snapshots of your CV. One dataset is always the **default** — this is the version visitors see at your root URL (`/`). You can create additional datasets for different audiences (e.g., a technical CV, a management CV), in different languages, and share them at their own URLs.

When you first install CV Manager, a "Default" dataset is automatically created from your CV data. All edits you make in the admin are **auto-saved** back to the active dataset — there's no separate "save" step.

## The CV Manager

Click **CV Manager** in the toolbar to open the unified modal for all dataset operations: saving, loading, creating versions, adding languages, setting defaults, and managing visibility.

The modal has two zones:

- A **save-as form** at the top — name field, language selector, and a save button
- A **list of saved CVs** below — grouped by base name, with all management actions

### Saving a New Dataset

The name field is pre-filled with the active dataset's name. The language dropdown defaults to the active language.

- **Type a new name** and click the blue **Save as new "…"** button to create a brand-new dataset
- **Click an existing row** in the list to fill the name field — the button changes to the orange **Overwrite "…"** (with confirmation)

### Dataset List

Each saved CV appears as a **group** with a header showing the base name, a **+ New version** button, and a version/language count badge.

Inside each group, every language variant is a row:

```
○  EN  v2  Full Stack Developer v2     /v/full-stack-dev/en   16/04/2026   [Load]  ⋮
```

- **Radio button** (○) — select which dataset visitors see at `/` (the default)
- **Language badge** (EN) — the content language of this variant
- **Version badge** (v2) — shown when the group has multiple versions
- **Name** — the dataset name
- **URL** — the public URL path (if shared or default)
- **Date** — last modified
- **Load** — switch to editing this dataset
- **⋮** (overflow menu) — additional actions

### Overflow Menu (⋮)

Each row's overflow menu contains:

| Action | Description |
|--------|-------------|
| **Make shared / Make private** | Toggle public visibility at `/v/slug` (hidden for default and its language siblings) |
| **Change language** | Reassign this dataset's language code |
| **Preview** | Open the saved version in a new tab |
| **Copy URL** | Copy the public or preview URL to clipboard |
| **Delete** | Permanently remove (disabled for the default dataset) |

## Versions

Datasets that share the same base name are grouped together. For example, `Frontend Engineer`, `Frontend Engineer v2`, and `Frontend Engineer v3` appear as one block under a shared header.

### Creating a New Version

Click **+ New version** in the group header. The name field auto-fills with the next version number (e.g., `Frontend Engineer v4`). When you save, the new version:

- Gets a proper version badge (v4)
- Shares the same URL slug as its siblings
- Inherits all language variants from the previous version

### Collapsible Older Versions

When a group has multiple versions, only the latest is shown. A **"N older versions"** toggle lets you expand to see all versions. If the dataset you're editing or the default is in an older version, it auto-expands so you can always see it.

!!! tip
    Use the `Base vN` naming convention (e.g., `Frontend Engineer`, `Frontend Engineer v2`) to get automatic version grouping and next-version suggestions.

## Language Variants

Each version of a dataset can have multiple language variants — for example, an English and a German version of the same CV, sharing the same structure but with independent content.

### Adding a Language Variant

1. Open **CV Manager**
2. Click **+ Add language** on the group header (or use the **⋮ → Add language** flow from the save-as form)
3. Select the target language and save

The new variant starts as a copy of the existing content. The admin UI automatically switches to the new language so you can start translating.

### Switching Languages

When editing a dataset that has language siblings, a **language switcher** appears in the active dataset banner below the toolbar. Click a language code to switch — your current work is auto-saved first, then the other variant loads and the UI locale switches to match.

### Structural Sync

Changes to **structure** — section order, visibility, custom section layout, and item count — automatically propagate across all language siblings. **Content** (text, titles, descriptions) stays independent per language, so you can translate freely without worrying about layout drift.

### Changing a Dataset's Language

Click the **language badge** on any row to open a picker and reassign its language code. This is useful for legacy datasets that defaulted to English during setup.

## Setting the Default

The default dataset is the version visitors see at your root URL (`/`). To change it:

1. Open **CV Manager**
2. Click the **radio button** (○) next to the dataset you want as default
3. The change takes effect immediately

Language siblings of the default are automatically accessible at `/{lang}` (e.g., `/de`, `/fr`) — they don't need a separate public toggle.

!!! note
    The public site serves the saved default dataset, not your live edits. You can safely experiment in the admin without affecting what visitors see.

## Public Versioned URLs

Non-default datasets can be shared at their own URLs. Use the **⋮ → Make shared** action to make a dataset public at `/v/slug`. Multiple datasets can be public simultaneously.

- **Default dataset**: served at `/`
- **Default's language siblings**: served at `/{lang}` (e.g., `/fr`)
- **Shared datasets**: served at `/v/slug` or `/v/slug/{lang}`
- **Private datasets**: only previewable from the admin

!!! tip "Copying URLs"
    Click the URL path shown on each row to copy the full public URL to your clipboard.

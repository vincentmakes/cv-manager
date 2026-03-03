# Datasets (Multiple CV Versions)

## How Datasets Work

Datasets are saved snapshots of your CV. One dataset is always the **default** — this is the version visitors see at your root URL (`/`). You can create additional datasets for different audiences (e.g., a technical CV, a management CV) and share them at their own URLs.

When you first install CV Manager, a "Default" dataset is automatically created from your CV data. All edits you make in the admin are **auto-saved** back to the active dataset — there's no separate "save" step.

## The Active Dataset Banner

A banner below the toolbar shows which dataset you're currently editing. It displays:

- The **dataset name** (e.g., "Default", "Technical CV")
- A **"Default" badge** if this dataset is the one served at `/`
- An **auto-save status** — briefly shows "Saving…" then "✓ Saved" after each edit

Every change you make (adding items, editing content, reordering, toggling visibility) is automatically saved to the active dataset after a short delay.

## Saving a New Dataset

Click **Save As...** in the toolbar, enter a name (e.g., "Technical CV", "Marketing Role"), and your current CV state is saved as a new snapshot. The new dataset becomes the active one.

## The Open Modal

Click **Open...** to see all saved datasets. A **legend** at the top explains the three controls:

| Control | Purpose |
|---------|---------|
| **Radio button** | Select which dataset is served at your root URL `/` (the default) |
| **Toggle** | Share other datasets at their own `/v/slug` URL |
| **Eye button** | Preview a saved dataset without making it public |

Each dataset row shows:

- **Name** and last-updated date
- **"Default" badge** — on the dataset selected with the radio button
- **"Editing" badge** — on the dataset currently loaded in the admin
- A **versioned URL** (e.g., `/v/technical-cv-1`) — hidden for the default dataset since it's served at `/`
- **Load** button — switches to this dataset (shows "Reload" if already active)
- **Delete** button — permanently removes the dataset (disabled for the current default)

## Setting the Default Dataset

The default dataset is the version visitors see when they visit your root URL (`/`). To change it:

1. Open the **Open...** modal
2. Click the **radio button** next to the dataset you want as your public CV
3. The change takes effect immediately — the public site now serves that dataset

This decouples your public CV from your editing. You can freely edit content in the admin without visitors seeing work-in-progress changes until you're ready.

## Public Versioned URLs

Each saved dataset (other than the default) gets a unique URL path (e.g., `/v/technical-cv-1`). By default, these are **private** — only accessible from the admin interface for previewing.

To share a specific version publicly:

1. Open the **Open...** modal
2. Find the dataset you want to share
3. Toggle the **switch** next to it — it turns blue and a green **Public** badge appears
4. The `/v/slug` URL is now accessible on the **public site** (port 3001)

This lets you share tailored CV versions with different audiences. For example, you might make a "Technical CV" public for engineering roles while keeping a "Management CV" private until needed.

**Copying the URL**: Click the copy icon next to the slug to copy the full URL to your clipboard. The toast message will tell you whether you copied a public or preview-only URL.

!!! note
    The main public page at `/` always shows the **default dataset** — not your live edits. This means you can safely experiment in the admin without affecting what visitors see.

# Import & Export

## Exporting Your CV

Click **Export** in the toolbar to download your entire CV as a JSON file. This includes all sections, items, settings, and custom sections. Use this for backups or to transfer your CV to another instance.

The exported file is named `cv-data-{lang}.json` (e.g., `cv-data-de.json`) and includes the active dataset's language. This lets you keep track of which language version you exported.

## Importing Data

Click **Import** and select a previously exported JSON file. This replaces your current CV data with the imported data. Custom sections and all settings are included.

If the imported file contains a `language` field, the admin interface automatically switches to that language after import. This means if you import a German CV export, the UI switches to German so you can continue editing in the correct language.

!!! tip
    Export your CV before importing, so you have a backup of the current state.

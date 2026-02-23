# Contributing Translations

Thank you for helping make CV Manager available in more languages! This guide walks you through improving an existing translation or adding a brand-new language — no programming experience required.

## What You'll Be Editing

Translations live in simple text files (JSON format) inside the folder `public/shared/i18n/`. Each language has its own file named with a two-letter code:

```
public/shared/i18n/
  en.json   ← English (the reference file)
  de.json   ← German
  fr.json   ← French
  nl.json   ← Dutch
  es.json   ← Spanish
  it.json   ← Italian
  pt.json   ← Portuguese
  zh.json   ← Chinese
```

Each file contains pairs of a **key** (an identifier the app uses internally) and a **value** (the text shown to users). For example:

```json
{
    "btn.save": "Save",
    "btn.cancel": "Cancel",
    "toolbar.print": "Print / PDF"
}
```

The keys on the left (`btn.save`, `btn.cancel`, etc.) must stay exactly the same across all languages. Only the values on the right side should be translated.

---

## Fix or Improve an Existing Translation

If you spot a typo, an awkward phrasing, or a wrong translation in a language that already exists, here's how to submit a correction.

### Step 1: Get Your Own Copy of the Project

1. Go to the [CV Manager repository](https://github.com/vincentmakes/cv-manager) on GitHub.
2. Click the **Fork** button in the top-right corner. This creates your own personal copy of the project under your GitHub account. Think of it as making a photocopy — you can write on your copy without affecting the original.
3. GitHub will redirect you to your copy (it will say `your-username/cv-manager` at the top).

### Step 2: Open the Translation File

1. In your forked copy, navigate to `public/shared/i18n/`.
2. Click on the file for the language you want to fix (e.g., `fr.json` for French).
3. Click the **pencil icon** (top-right of the file view) to edit the file directly in your browser.

### Step 3: Make Your Changes

- Find the line with the incorrect or improvable text.
- Change only the **value** (the text in quotes on the right side of the colon).
- Do **not** change the key on the left side.
- Make sure every line still ends with a comma (except the very last one).

**Example — fixing a French translation:**
```json
"btn.save": "Sauvegarder",        ← before
"btn.save": "Enregistrer",        ← after (corrected)
```

### Step 4: Save Your Changes

1. Scroll down to the **"Commit changes"** section at the bottom of the page.
2. Write a short description of what you changed, e.g., "Fix French translation for save button".
3. Keep "Commit directly to the main branch" selected.
4. Click **"Commit changes"**.

### Step 5: Submit Your Changes for Review

Now you need to send your improvements back to the original project. This is done through a **Pull Request** (PR) — a request asking the project maintainer to review and accept your changes.

1. Go back to the main page of your forked copy.
2. You should see a banner saying "This branch is 1 commit ahead of vincentmakes/cv-manager". Click **"Contribute"** → **"Open pull request"**.
3. Give your pull request a descriptive title, e.g., "Fix French translations" or "Improve German wording".
4. In the description, briefly explain what you changed and why.
5. Click **"Create pull request"**.

That's it! The maintainer will review your changes and merge them if everything looks good.

---

## Add a New Language

Want to add a language that doesn't exist yet? Great! Here's how.

### Step 1: Fork the Project

Follow the same forking process as described above (Step 1 under "Fix or Improve an Existing Translation").

### Step 2: Create the Translation File

1. In your forked copy, navigate to `public/shared/i18n/`.
2. Click **"Add file"** → **"Create new file"**.
3. Name it using the [two-letter language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) followed by `.json`. For example: `ja.json` for Japanese, `ko.json` for Korean, `ar.json` for Arabic.
4. Copy the entire contents of `en.json` into your new file.
5. Translate every value (the right-hand side of each `:`) into your language. Keep all the keys (left-hand side) exactly as they are.

**Important rules:**
- The file must have the **exact same keys** as `en.json` — don't add, remove, or rename any keys.
- Some values contain `{{placeholders}}` like `{{name}}` or `{{count}}`. Keep these exactly as-is — they get replaced with real data at runtime. Example:
  ```json
  "toast.dataset_loaded": "Loaded: {{name}}"
  →
  "toast.dataset_loaded": "Chargé : {{name}}"
  ```
- Keep special characters like `\n` (line breaks) and `\"` (escaped quotes) intact.

6. Commit the new file (same process as Step 4 above).

### Step 3: Register the Language

1. Navigate to `public/shared/i18n.js`.
2. Click the pencil icon to edit.
3. Find the `languages` list near the top — it looks like this:
   ```js
   languages: [
       { code: 'en', name: 'English', native: 'English' },
       { code: 'de', name: 'German', native: 'Deutsch' },
       ...
   ],
   ```
4. Add a new line for your language at the end of the list (before the closing `],`):
   ```js
       { code: 'ja', name: 'Japanese', native: '日本語' }
   ```
   - `code` — the same two-letter code you used for the filename
   - `name` — the language name in English
   - `native` — the language name written in itself (this is what users see in the language picker)

5. Commit your change.

### Step 4: Submit a Pull Request

Follow the same pull request process as described in Step 5 above. In your description, mention which language you're adding so the maintainer knows what to expect.

---

## Tips for Good Translations

- **Keep it concise.** UI text should be short and clear. Buttons, labels, and menu items often have limited space.
- **Match the tone.** CV Manager uses a professional but friendly tone — not overly formal, not too casual.
- **Use the app to see context.** If you're not sure how a string is used, run the app locally or look at the English version of the interface to understand where the text appears.
- **Don't translate placeholders.** Anything inside `{{double braces}}` is a variable name and must stay in English.
- **Test your changes.** If possible, run the app locally (`npm run dev`) and switch to your language in Settings > Language to verify everything looks correct.

## Questions?

If you're unsure about anything, open a [GitHub Issue](https://github.com/vincentmakes/cv-manager/issues) and describe what you'd like to do. The maintainer will help you get started.

# FAQ

## General

??? question "Is my data stored on any external server?"
    No. Everything runs locally on your server. Your CV data is stored in a SQLite database file in the `/data` directory.

??? question "Can I run CV Manager without Docker?"
    Yes. Install Node.js 18+, run `npm install` in the project directory, then `node src/server.js`. The admin runs on port 3000 and the public site on port 3001.

??? question "Can multiple people use the same instance?"
    CV Manager is designed as a single-user application. Each instance manages one person's CV. For multiple people, run separate containers.

## Editing

??? question "How do I mark a position as 'current'?"
    Leave the **End Date** field empty. It will display as "Present" on the CV.

??? question "Can I reorder items within a section?"
    Yes. Most items support drag-and-drop reordering. The order is saved automatically.

??? question "How do I add bullet points to an experience?"
    Edit the experience and enter highlights in the **Highlights** field — one bullet point per line.

??? question "How do I add a company logo?"
    Edit the experience, scroll to the **Company Logo** section, and click **Choose image** to upload. You can also click **Use existing** to reuse a logo you've already uploaded. Enable the **"Sync logo across all [Company]"** toggle to apply the same logo to all experiences at that company.

??? question "I accidentally deleted something. Can I undo it?"
    There's no undo feature. Since edits are auto-saved to the active dataset, the change is persisted immediately. If you have a previous export or a separate saved dataset, you can restore from that. It's good practice to export your CV regularly as a backup.

## Custom Sections

??? question "How many custom sections can I create?"
    There's no hard limit. Create as many as you need.

??? question "Can I change a custom section's layout type after creating it?"
    Yes. Edit the section and select a different layout. Note that some fields may not carry over between layout types (e.g., switching from cards to social links).

??? question "What's the difference between 'Bullet Points' and 'Free Text' layouts?"
    **Bullet Points** renders each line as a bulleted list item with a group title. **Free Text** renders plain text with preserved line breaks and no title — similar to the About/Bio section.

## Print & PDF

??? question "Why does my PDF look different from the screen?"
    The print output uses dedicated print styles optimized for paper. Some visual effects (hover states, animations, gradients) are simplified. Hidden items and admin controls are automatically removed.

??? question "How do I fit my CV on fewer pages?"
    Try enabling **Allow Section Splits** and **Allow Item Splits** in Print & Export settings. You can also hide less important items or sections, or use more compact custom section layouts. Also scale the print via the print modal from any browser (sometimes a bit hidden).

??? question "Why are some items missing from my printed CV?"
    Check if those items have been toggled to hidden (eye icon). Hidden items are excluded from print output and the public view.

??? question "Page numbers aren't showing up?"
    Make sure **Page Numbers** is enabled in Settings → Print & Export. Some browser PDF viewers may not display CSS-generated page numbers — try downloading the PDF and opening it in a dedicated reader.

## Timeline

??? question "The timeline shows the wrong dates / only years / full dates?"
    The timeline has its own date setting. Go to **Settings → Advanced → Timeline: Years Only** to toggle between year-only display and the full date format.

??? question "Can I add entries to the timeline directly?"
    No. The timeline is automatically generated from your work experiences. Add or edit experiences and the timeline updates accordingly.

??? question "The country flag isn't showing on the timeline?"
    Make sure the **Country Code** field on the experience is set to a valid 2-letter ISO country code (e.g., `us`, `gb`, `ch`, `de`, `fr`). Flags are loaded from an external CDN.

??? question "What happens when I have two jobs at the same time?"
    The timeline automatically detects overlapping positions and renders them as **parallel tracks**. The concurrent job appears on an elevated branch line with S-curve connectors showing the fork and merge points. No configuration needed — it's based entirely on your start/end dates. Overlaps shorter than 1 month are ignored (common during job transitions).

??? question "Why does the timeline show a logo instead of the company name?"
    If you've uploaded a company logo for that experience, the timeline displays the logo image instead of text. If the logo file is missing, it falls back to the company name. To remove a logo from the timeline, edit the experience and click **Remove** in the Company Logo section.

## Language & Updates

??? question "How do I change the admin language?"
    Click the **globe icon** in the toolbar and select a language from the dropdown grid. The change applies immediately and is saved across sessions.

??? question "How do I check what version I'm running?"
    Open **Settings** — the version number is shown in the bottom-left corner of the modal (e.g., `v1.11.0`).

??? question "I don't see the update banner even though a new version is out?"
    The version check is cached for 24 hours. Restart your server (or Docker container) to clear the cache and force a fresh check. Your server also needs outbound internet access to reach `raw.githubusercontent.com`.

## Datasets / Multiple CVs

??? question "What is the 'Default' dataset?"
    The default dataset is the version of your CV that visitors see at your root URL (`/`). On first install, CV Manager automatically creates a "Default" dataset from your CV data. You can change which dataset is the default at any time using the radio button in the Open modal.

??? question "Are my edits saved automatically?"
    Yes. Every change you make in the admin (adding, editing, deleting, reordering, toggling visibility) is automatically saved back to the active dataset after a short delay. The banner shows "Saving…" then "✓ Saved" to confirm.

??? question "What happens when I 'Load' a dataset?"
    Loading a dataset switches your working copy to that dataset. Your previous edits were already auto-saved, so nothing is lost.

??? question "Can visitors see my edits in real time?"
    No. The public site serves the frozen default dataset, not your live edits. Visitors only see changes after auto-save writes them to the default dataset. If you're editing a non-default dataset, visitors won't see those changes at all until you set it as the default.

??? question "Can visitors see my saved datasets?"
    Only if you make them public. Each dataset has a toggle in the Open modal. When set to public, that version becomes accessible at `/v/slug` on the public site (port 3001). Private datasets are only previewable from the admin interface.

??? question "How do I share a specific CV version with someone?"
    Open the **Open...** modal, toggle the dataset to public, then click the copy icon next to the slug URL. Share that link — it works on the public site without exposing your admin interface.

??? question "Can I have multiple public versions at the same time?"
    Yes. You can make as many datasets public as you want. Each gets its own URL (e.g., `/v/technical-cv-1`, `/v/marketing-cv-2`). The main `/` page shows the default dataset.

??? question "Can I delete the default dataset?"
    No. The dataset currently selected as default (via the radio button) cannot be deleted. Set a different dataset as default first, then delete the old one.

??? question "Will search engines index my versioned URLs?"
    By default, no — versioned pages get `noindex, nofollow`. To allow indexing, enable **Index Versioned URLs** in Settings → Advanced.

## Public Site & SEO

??? question "How do I share my CV?"
    Share the URL of your public server (port 3001). If you've set up a domain with Cloudflare Tunnel or a reverse proxy, share that domain. The root URL always shows your default dataset. You can also share specific versions using public versioned URLs (see [Datasets](../guide/datasets.md)).

??? question "Will search engines index my CV?"
    By default, yes — the main public page includes proper meta tags, a sitemap, and robots.txt. To prevent indexing, change the **Search Engine Indexing** setting to "No Index" in Settings → Advanced. Public versioned URLs (`/v/slug`) are **not indexed** by default; enable **Index Versioned URLs** if you want them crawled.

??? question "Can I add Google Analytics to my CV?"
    Yes. Paste your tracking code in **Settings → Advanced → Tracking Code**. It's injected only on the public-facing pages.

## Docker & Infrastructure

??? question "My changes aren't appearing on the public site?"
    The public site serves the **default dataset**, which is updated automatically when you edit in the admin. Try a hard refresh (`Ctrl+Shift+R`) on the public site. If running separate containers, make sure they share the same data volume.

??? question "I'm getting a 'port already in use' error?"
    Change the host port mapping in your Docker configuration. For example, map to `3010:3000` and `3011:3001`. Do **not** change the `PUBLIC_PORT` environment variable — that's the internal container port.

??? question "How do I back up my data?"
    Two options: use the **Export** button in the admin toolbar (exports JSON), or back up the `data/` directory which contains the SQLite database and uploaded images.

??? question "Profile picture isn't showing?"
    Make sure the image was uploaded through the admin interface. The file is stored at `data/uploads/picture.jpeg`. Check file permissions if running on Linux.

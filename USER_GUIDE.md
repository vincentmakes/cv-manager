# CV Manager — User Guide & FAQ

A self-hosted resume/CV management system. Build, customize, and share professional CVs from your own server.

---

## Getting Started

### What is CV Manager?

CV Manager is a web application that runs on your own server (via Docker). It gives you two interfaces:

- **Admin** (default port 3000) — where you build and manage your CV
- **Public** (default port 3001) — a read-only version you can share with recruiters, employers, or anyone

Your data is stored locally in a SQLite database. Nothing is sent to external servers.

### First Steps After Installation

1. Open the admin interface at `http://your-server:3000`
2. Click the **edit icon** on the header to set your name, title, bio, and contact info
3. Add your work experiences, education, certifications, skills, and projects
4. Use the **Theme** button in the toolbar to pick a color that matches your style
5. Hit **Print / PDF** to export, or share the public URL at port 3001

---

## Sections

### Built-in Sections

CV Manager comes with 7 built-in sections:

| Section | Description |
|---------|-------------|
| **About** | Your professional summary / bio. Supports multi-line text. |
| **Timeline** | Auto-generated from your work experiences. Shows a visual timeline with country flags. |
| **Experience** | Work history with job title, company, dates, location, country flag, and bullet-point highlights. |
| **Certifications** | Professional certifications with provider and dates. |
| **Education** | Degrees, institutions, dates, and descriptions. |
| **Skills** | Grouped skill categories with individual skill tags. Each category can have a custom icon. |
| **Projects** | Featured projects with descriptions, technology tags, and external links. |

### Reordering Sections

1. Click **Settings** in the toolbar
2. Go to the **Sections & Headlines** tab
3. Use the **arrow buttons** to move sections up or down
4. Click **Save** — the order applies to both admin and public views

### Renaming Section Headlines

In the same **Sections & Headlines** tab, you can rename any section's display title. For example, rename "Experience" to "Work History" or "Skills" to "Technical Expertise". Clear the custom name to revert to the default.

### Hiding Sections

Each section has a **visibility toggle** (eye icon) in its top-right corner. Toggling it off hides the section from print/PDF output while keeping it visible in the admin for editing.

---

## Editing Content

### Profile / Header

Click the **edit icon** on the header section. You can set:

- **Name** and **Initials** (shown in the avatar circle if no photo is uploaded)
- **Title** (your main role/position)
- **Subtitle** (additional context, e.g., department or specialization)
- **Bio** (professional summary — line breaks are preserved)
- **Location**
- **Email**, **Phone**, **LinkedIn** (shown as contact badges)

### Profile Picture

In the profile edit dialog, you can upload a profile picture (JPEG, PNG, or WebP). The image replaces the initials circle. To remove it, use the delete option in the same dialog.

### Work Experience

Each experience entry includes:

- **Job Title** and **Company Name**
- **Start Date** and **End Date** (leave end date empty for current positions — shows "Present")
- **Location** and **Country Code** (2-letter code like `us`, `ch`, `fr` — used for flag icons on the timeline)
- **Highlights** — bullet points describing your achievements (one per line)

### Certifications

Each certification has a **name**, **provider**, **issue date**, and optional **expiry date** and **credential ID**.

### Education

Each entry has a **degree/title**, **institution**, **start/end dates**, and an optional **description**.

### Skills

Skills are organized into **categories** (e.g., "Programming Languages", "Tools & Platforms"). Each category contains individual skill tags. Categories can have custom icons selected from a preset list.

### Projects

Each project has a **title**, **description**, **technologies** (shown as tags), and an optional **external link**.

### Item Visibility

Every individual item (experience, certification, education entry, etc.) has a **visibility toggle**. Hidden items are excluded from print/PDF and the public view, but remain in the admin for future use.

### Drag & Drop Reordering

Within most sections, items can be reordered by dragging them. The sort order is saved automatically.

---

## Custom Sections

Custom sections let you add any content that doesn't fit the built-in sections.

### Creating a Custom Section

1. Open **Settings** → **Custom Sections** tab
2. Click **Add Custom Section**
3. Enter a section name
4. Choose a layout type (see below)
5. Save — the new section appears in your CV

### Layout Types

| Layout | Best For |
|--------|----------|
| **2-Column Grid** | Paired items like languages & proficiency, tools & experience level |
| **3-Column Grid** | Compact items like awards, publications, or short credentials |
| **Vertical List** | Sequential items with optional links, like volunteer work or memberships |
| **Card Grid** | Rich items with title, subtitle, description, and link — like portfolio pieces |
| **Social Links** | Platform-specific links with icons (LinkedIn, GitHub, Twitter/X, YouTube, Instagram, Dribbble, Behance, Website, Email, Phone, or Custom) |
| **Bullet Points** | Grouped bullet lists, similar to experience highlights — great for key achievements or competencies |
| **Free Text** | Plain text block with preserved line breaks — similar to the About section, useful for cover letters, personal statements, or any freeform content |

### Hide Title Option

For grid, list, card, and bullet layouts, each item has a **"Hide title"** checkbox. When enabled, the item displays without its title heading — useful when the content speaks for itself.

### Managing Custom Section Items

Click **Manage Items** on any custom section to add, edit, reorder, or delete items within that section.

---

## Timeline

The timeline is automatically generated from your work experiences. It displays:

- Company names and job titles
- Date ranges
- Country flags (when the country changes between experiences)

### Timeline Click Navigation

Clicking any item on the timeline scrolls you to the corresponding experience card and highlights it briefly.

### Timeline Date Format

By default, the timeline shows years only (e.g., "2020 - 2023"). You can change this in **Settings → Advanced → Timeline: Years Only**. When disabled, the timeline uses the same date format as the rest of your CV.

---

## Theme & Appearance

### Theme Color

Click the **Theme** button in the toolbar to open the color picker. You can:

- Pick a color from the **color wheel**
- Adjust **brightness** with the slider
- Enter a specific **hex code**
- Choose from **8 preset colors** (Blue, Emerald, Purple, Red, Orange, Cyan, Indigo, Pink)

The theme color affects headings, borders, links, tags, and accent elements throughout the entire CV.

### Date Format

Go to **Settings → Advanced → Date Format** to choose how dates appear on your CV:

| Format | Example |
|--------|---------|
| MMM YYYY | Jan 2020 |
| MMM YY | Jan 20 |
| MMMM YYYY | January 2020 |
| MM/YYYY | 01/2020 |
| MM.YYYY | 01.2020 |
| MM-YYYY | 01-2020 |
| YYYY-MM | 2020-01 |
| YYYY | 2020 (year only) |

---

## Print & PDF Export

### Printing Your CV

Click **Print / PDF** in the toolbar (or press `Ctrl+P` / `Cmd+P`). Use your browser's "Save as PDF" option to create a PDF file. The print output excludes all admin controls, hidden items, and hidden sections.

### Page Numbers

Enable page numbers in **Settings → Print & Export → Page Numbers**. You can configure:

- **Position**: top or bottom of the page
- **Format**: "Page 1 of 3", "1 / 3", "1", or "- 1 -"

### Page Splitting

Two options control how content breaks across pages:

- **Allow Section Splits** — lets a section start on one page and continue on the next (instead of pushing the entire section to a new page)
- **Allow Item Splits** — lets individual items (like an experience card) break across pages

Both are found in **Settings → Print & Export**. If your CV has long sections, enabling these prevents excessive white space.

### Public Print Button

Toggle **Settings → Print & Export → Public Print Button** to show or hide a print button on the public-facing CV. When enabled, visitors can print your CV directly.

### Best Practices for PDF Output

**Scaling**: Most browsers have a **Scale** option in the print dialog (sometimes under "More settings" or "Advanced"). Setting it to **80–90%** often produces a much better result — it tightens spacing and can help fit your CV onto fewer pages without losing readability.

**Margins**: Adjust the print margins to **Minimum** or **None** in your browser's print dialog for maximum content area. The CV has its own internal padding, so removing browser margins won't cause text to touch the edges.

**Tip**: Combine scaling at 85% with minimum margins for the most professional-looking output. Preview the result before saving — small adjustments can make a big difference.

---

## Datasets (Multiple CV Versions)

### Saving a Dataset

Click **Save As...** in the toolbar, enter a name (e.g., "Technical CV", "Marketing Role"), and your current CV state is saved as a snapshot.

### Loading a Dataset

Click **Open...** to see all saved datasets. Each dataset shows:

- Name and last-updated date
- A **versioned URL** (e.g., `/v/technical-cv-1`)
- A **public toggle** — makes this version accessible on the public site
- **Preview** button — opens the saved version in a new tab (admin only)
- **Load** button — replaces your current active CV with this dataset
- **Delete** button — permanently removes the dataset

### Public Versioned URLs

Each saved dataset gets a unique URL path (e.g., `/v/technical-cv-1`). By default, these are **private** — only accessible from the admin interface for previewing.

To share a specific version publicly:

1. Open the **Open...** modal
2. Find the dataset you want to share
3. Toggle the **switch** next to it — it turns blue and a green **Public** badge appears
4. The `/v/slug` URL is now accessible on the **public site** (port 3001)

This lets you share tailored CV versions with different audiences. For example, you might make a "Technical CV" public for engineering roles while keeping a "Management CV" private until needed — all without changing your main live CV.

**Copying the URL**: Click the copy icon next to the slug to copy the full URL to your clipboard. The toast message will tell you whether you copied a public or preview-only URL.

> **Note**: The main public page at `/` always shows your current live CV. Public versioned URLs are additional pages served alongside it.

---

## Import & Export

### Exporting Your CV

Click **Export** in the toolbar to download your entire CV as a JSON file. This includes all sections, items, settings, and custom sections. Use this for backups or to transfer your CV to another instance.

### Importing Data

Click **Import** and select a previously exported JSON file. This replaces your current CV data with the imported data. Custom sections and all settings are included.

> **Tip**: Export your CV before importing, so you have a backup of the current state.

---

## Advanced Settings

### Search Engine Indexing (Robots Meta)

Control how search engines interact with your public CV in **Settings → Advanced → Search Engine Indexing**:

| Option | Effect |
|--------|--------|
| **Index, Follow** | CV appears in search results, search engines follow your links (default) |
| **No Index, Follow** | CV is hidden from search results, but links are followed |
| **Index, No Follow** | CV appears in search results, but outbound links are ignored |
| **No Index, No Follow** | Fully invisible to search engines |

This setting affects both the `<meta name="robots">` tag and the `/robots.txt` file, and is applied server-side for compatibility with all search engine crawlers.

### Versioned URL Indexing

By default, public versioned URLs (`/v/slug`) are **not indexed** by search engines — they get a `noindex, nofollow` meta tag. This is useful if you want to share direct links without those pages appearing in search results.

To allow search engines to crawl versioned URLs, enable **Index Versioned URLs** in **Settings → Advanced**. This setting is independent of the main Search Engine Indexing option above, which only affects the main `/` page.

### Tracking Code

Paste analytics tracking code (Google Analytics, Matomo, Plausible, etc.) in **Settings → Advanced → Tracking Code**. The code is injected into the public CV pages only — not the admin interface.

---

## Security & Privacy

### Protecting the Admin Interface

The admin interface (port 3000) gives full access to edit and delete your CV data. **It should never be exposed directly to the internet.**

**Recommended approaches:**

- **Cloudflare Access** — If you use Cloudflare Tunnel, set up a [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/) policy on your admin hostname. This adds an authentication layer (email OTP, SSO, etc.) before anyone can reach the admin page. Only expose port 3001 (public) without authentication.
- **VPN only** — Keep port 3000 accessible only from your local network or VPN. Never port-forward it to the internet.
- **Reverse proxy with auth** — If using Nginx, Caddy, or Traefik, add HTTP basic auth or an authentication middleware in front of port 3000.

The public site (port 3001) is designed to be internet-facing — it blocks all write operations, enforces rate limiting (60 requests/minute per IP), and includes security headers (CSP, X-Frame-Options, XSS protection).

> **Rule of thumb**: Public port → open to the world. Admin port → behind authentication, always.

---

## ATS Compatibility

CV Manager generates ATS (Applicant Tracking System) friendly output:

- **Schema.org markup** — structured data that ATS systems can parse (Person, OrganizationRole, EducationalOccupationalCredential, etc.)
- **Semantic HTML** — proper heading hierarchy, article elements, and lists
- **Hidden ATS block** — a plain-text version of your CV is embedded in the page for parsers that don't process styled HTML
- **Clean print output** — no visual clutter, proper content hierarchy

No special configuration is needed — ATS optimization is always active.

---

## Deployment

### Docker Compose (Recommended)

```bash
docker-compose up -d --build
```

This starts both the admin (port 3000) and public (port 3001) servers.

### One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/vincentmakes/cv-manager/main/install.sh | bash
```

### Docker Hub

```bash
docker pull vincentmakes/cv-manager:latest
docker run -d -p 3000:3000 -p 3001:3001 -v cv-data:/app/data vincentmakes/cv-manager:latest
```

### Unraid

Install via **Community Applications** — search for "cv-manager". Two templates are available:

- **cv-manager** (Admin) — mapped to port 3000
- **cv-manager-public** (Public) — mapped to port 3001, read-only

Both containers share the same data directory (typically `/mnt/user/appdata/cv-manager`).

### Making Your CV Public with Cloudflare Tunnel

1. Set up a Cloudflare Tunnel pointing to port 3001 (the public server)
2. Use **Cloudflare Access** to protect port 3000 (admin) behind authentication
3. Your CV is now accessible at your domain while the admin stays secured

---

## FAQ

### General

**Q: Is my data stored on any external server?**
No. Everything runs locally on your server. Your CV data is stored in a SQLite database file in the `/data` directory.

**Q: Can I run CV Manager without Docker?**
Yes. Install Node.js 18+, run `npm install` in the project directory, then `node src/server.js`. The admin runs on port 3000 and the public site on port 3001.

**Q: Can multiple people use the same instance?**
CV Manager is designed as a single-user application. Each instance manages one person's CV. For multiple people, run separate containers.

### Editing

**Q: How do I mark a position as "current"?**
Leave the **End Date** field empty. It will display as "Present" on the CV.

**Q: Can I reorder items within a section?**
Yes. Most items support drag-and-drop reordering. The order is saved automatically.

**Q: How do I add bullet points to an experience?**
Edit the experience and enter highlights in the **Highlights** field — one bullet point per line.

**Q: I accidentally deleted something. Can I undo it?**
There's no undo feature. If you have a previous export or saved dataset, you can restore from that. It's good practice to export your CV regularly as a backup.

### Custom Sections

**Q: How many custom sections can I create?**
There's no hard limit. Create as many as you need.

**Q: Can I change a custom section's layout type after creating it?**
Yes. Edit the section and select a different layout. Note that some fields may not carry over between layout types (e.g., switching from cards to social links).

**Q: What's the difference between "Bullet Points" and "Free Text" layouts?**
**Bullet Points** renders each line as a bulleted list item with a group title. **Free Text** renders plain text with preserved line breaks and no title — similar to the About/Bio section.

### Print & PDF

**Q: Why does my PDF look different from the screen?**
The print output uses dedicated print styles optimized for paper. Some visual effects (hover states, animations, gradients) are simplified. Hidden items and admin controls are automatically removed.

**Q: How do I fit my CV on fewer pages?**
Try enabling **Allow Section Splits** and **Allow Item Splits** in Print & Export settings. You can also hide less important items or sections, or use more compact custom section layouts. Also scale the print via the print modal from any browser. (sometimes a bit hidden)

**Q: Why are some items missing from my printed CV?**
Check if those items have been toggled to hidden (eye icon). Hidden items are excluded from print output and the public view.

**Q: Page numbers aren't showing up?**
Make sure **Page Numbers** is enabled in Settings → Print & Export. Some browser PDF viewers may not display CSS-generated page numbers — try downloading the PDF and opening it in a dedicated reader.

### Timeline

**Q: The timeline shows the wrong dates / only years / full dates?**
The timeline has its own date setting. Go to **Settings → Advanced → Timeline: Years Only** to toggle between year-only display and the full date format.

**Q: Can I add entries to the timeline directly?**
No. The timeline is automatically generated from your work experiences. Add or edit experiences and the timeline updates accordingly.

**Q: The country flag isn't showing on the timeline?**
Make sure the **Country Code** field on the experience is set to a valid 2-letter ISO country code (e.g., `us`, `gb`, `ch`, `de`, `fr`). Flags are loaded from an external CDN.

### Datasets / Multiple CVs

**Q: What happens when I "Load" a dataset?**
Loading a dataset replaces your current active CV with the saved snapshot. Your current unsaved changes will be lost — save them first if needed.

**Q: Can visitors see my saved datasets?**
Only if you make them public. Each dataset has a toggle in the Open modal. When set to public, that version becomes accessible at `/v/slug` on the public site (port 3001). Private datasets are only previewable from the admin interface.

**Q: How do I share a specific CV version with someone?**
Open the **Open...** modal, toggle the dataset to public, then click the copy icon next to the slug URL. Share that link — it works on the public site without exposing your admin interface.

**Q: Can I have multiple public versions at the same time?**
Yes. You can make as many datasets public as you want. Each gets its own URL (e.g., `/v/technical-cv-1`, `/v/marketing-cv-2`). The main `/` page continues to show your live CV.

**Q: Can I edit a dataset without loading it?**
No. To edit a dataset, load it first, make changes, then save it again with the same name (it will update the existing dataset).

**Q: Will search engines index my versioned URLs?**
By default, no — versioned pages get `noindex, nofollow`. To allow indexing, enable **Index Versioned URLs** in Settings → Advanced.

### Public Site & SEO

**Q: How do I share my CV?**
Share the URL of your public server (port 3001). If you've set up a domain with Cloudflare Tunnel or a reverse proxy, share that domain. You can also share specific versions using public versioned URLs (see Datasets section above).

**Q: Will search engines index my CV?**
By default, yes — the main public page includes proper meta tags, a sitemap, and robots.txt. To prevent indexing, change the **Search Engine Indexing** setting to "No Index" in Settings → Advanced. Public versioned URLs (`/v/slug`) are **not indexed** by default; enable **Index Versioned URLs** if you want them crawled.

**Q: Can I add Google Analytics to my CV?**
Yes. Paste your tracking code in **Settings → Advanced → Tracking Code**. It's injected only on the public-facing pages.

### Docker & Infrastructure

**Q: My changes aren't appearing on the public site?**
Both servers read the same database. Try a hard refresh (`Ctrl+Shift+R`) on the public site. If running separate containers, make sure they share the same data volume.

**Q: I'm getting a "port already in use" error?**
Change the host port mapping in your Docker configuration. For example, map to `3010:3000` and `3011:3001`. Do **not** change the `PUBLIC_PORT` environment variable — that's the internal container port.

**Q: How do I back up my data?**
Two options: use the **Export** button in the admin toolbar (exports JSON), or back up the `data/` directory which contains the SQLite database and uploaded images.

**Q: Profile picture isn't showing?**
Make sure the image was uploaded through the admin interface. The file is stored at `data/uploads/picture.jpeg`. Check file permissions if running on Linux.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` / `Cmd+P` | Print / Save as PDF |

---

## Support

- **GitHub Issues**: [github.com/vincentmakes/cv-manager/issues](https://github.com/vincentmakes/cv-manager/issues)
- **Support the project**: [ko-fi.com/vincentmakes](https://ko-fi.com/vincentmakes)

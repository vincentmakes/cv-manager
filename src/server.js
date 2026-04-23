const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const archiver = require('archiver');
const { diffLines } = require('diff');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_PORT = process.env.PUBLIC_PORT || 3001;

// Version from package.json
const CURRENT_VERSION = require(path.join(__dirname, '..', 'package.json')).version;

// Cached version check (in-memory only, never persisted)
let versionCache = { latest: null, checkedAt: null, changelog: null };
const VERSION_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const VERSION_URL = 'https://raw.githubusercontent.com/vincentmakes/cv-manager/main/version.json';

async function checkLatestVersion() {
    // Return cached if fresh enough
    if (versionCache.checkedAt && (Date.now() - versionCache.checkedAt) < VERSION_CHECK_INTERVAL) {
        return versionCache;
    }
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
        const res = await fetch(VERSION_URL, { signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
            const data = await res.json();
            versionCache = { latest: data.version || null, checkedAt: Date.now(), changelog: data.changelog || null };
        }
    } catch (err) {
        // Silently fail - no internet, timeout, etc.
        if (!versionCache.checkedAt) {
            versionCache = { latest: null, checkedAt: Date.now(), changelog: null };
        }
    }
    return versionCache;
}

function compareVersions(a, b) {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if ((pa[i] || 0) < (pb[i] || 0)) return -1;
        if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    }
    return 0;
}

// Validate that a string is an http(s) URL. Empty/null values pass (optional fields).
function isValidHttpUrl(v) {
    if (v === null || v === undefined || v === '') return true;
    try {
        const u = new URL(v);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

const DB_PATH = process.env.DB_PATH 
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, '..', 'data', 'cv.db');

const dataDir = path.dirname(DB_PATH);
console.log(`Data directory: ${dataDir}`);
console.log(`Database path: ${DB_PATH}`);

const SECTION_DISPLAY_NAMES = {
    'about': 'Professional Summary',
    'timeline': 'Career Timeline',
    'experience': 'Work Experience',
    'certifications': 'Certifications',
    'education': 'Education',
    'skills': 'Skills & Expertise',
    'projects': 'Featured Projects'
};

const DEFAULT_SECTION_ORDER = ['about', 'timeline', 'experience', 'certifications', 'education', 'skills', 'projects'];

// Server-side i18n: load all translations once at startup so server-generated
// content (e.g., ATS PDF export) can be localized to the user's active language.
const I18N_DIR = path.join(__dirname, '../public/shared/i18n');
const serverTranslations = {};
try {
    if (fs.existsSync(I18N_DIR)) {
        for (const file of fs.readdirSync(I18N_DIR)) {
            if (file.endsWith('.json')) {
                const code = path.basename(file, '.json');
                try {
                    serverTranslations[code] = JSON.parse(fs.readFileSync(path.join(I18N_DIR, file), 'utf8'));
                } catch (e) {
                    console.warn(`Failed to parse translation file ${file}: ${e.message}`);
                }
            }
        }
    }
} catch (e) { console.warn(`Failed to load server translations: ${e.message}`); }

function serverT(key, locale) {
    const loc = serverTranslations[locale] || {};
    const en = serverTranslations['en'] || {};
    return loc[key] || en[key] || key;
}

function resolveLocale(requested) {
    if (requested && serverTranslations[requested]) return requested;
    try {
        const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('language');
        if (row && row.value && serverTranslations[row.value]) return row.value;
    } catch (e) { /* ignore — db may not be ready or settings table may lack the key */ }
    return 'en';
}

// Remove **bold** markers for plain-text contexts (SEO meta, ATS text, etc.).
// Mirrors the client-side regex in escapeHtmlWithBold (scripts.js).
function stripBoldMarkers(text) {
    if (text == null) return '';
    return String(text).replace(/\*\*([^*\n]+?)\*\*/g, '$1');
}

// Split a paragraph into alternating regular/bold runs for rich rendering
// (e.g. PDF). Returns an array of { text, bold } segments. Matches the same
// regex as stripBoldMarkers / escapeHtmlWithBold for a single source of truth.
function splitBoldRuns(text) {
    const s = text == null ? '' : String(text);
    const runs = [];
    const re = /\*\*([^*\n]+?)\*\*/g;
    let last = 0;
    let m;
    while ((m = re.exec(s)) !== null) {
        if (m.index > last) runs.push({ text: s.slice(last, m.index), bold: false });
        runs.push({ text: m[1], bold: true });
        last = m.index + m[0].length;
    }
    if (last < s.length) runs.push({ text: s.slice(last), bold: false });
    if (runs.length === 0) runs.push({ text: s, bold: false });
    return runs;
}

function checkFilesystemAccess(dir) {
    const testFile = path.join(dir, '.write-test-' + process.pid);
    try {
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return { status: 'writable' };
    } catch (err) {
        if (err.code === 'EROFS') return { status: 'readonly' };
        if (err.code === 'EACCES') return { status: 'permission_denied', error: err.message };
        return { status: 'error', error: err.message };
    }
}

let PUBLIC_ONLY = process.env.PUBLIC_ONLY === 'true' || process.env.PUBLIC_ONLY === '1';

try {
    if (!fs.existsSync(dataDir)) {
        if (PUBLIC_ONLY) { console.error(`Data directory does not exist: ${dataDir}`); process.exit(1); }
        try { fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 }); }
        catch (mkdirErr) { if (mkdirErr.code === 'EACCES') { console.error('ERROR: Cannot create data directory'); process.exit(1); } throw mkdirErr; }
    }
    
    if (!PUBLIC_ONLY) {
        const accessCheck = checkFilesystemAccess(dataDir);
        if (accessCheck.status === 'writable') { console.log('Running in ADMIN mode (read-write)'); }
        else if (accessCheck.status === 'readonly') {
            if (fs.existsSync(DB_PATH)) { console.log('Running in PUBLIC-ONLY mode (read-only)'); PUBLIC_ONLY = true; }
            else { console.error('ERROR: Read-only mount but no database found!'); process.exit(1); }
        } else { console.error(`Error: ${accessCheck.error}`); process.exit(1); }
    } else {
        if (!fs.existsSync(DB_PATH)) { console.error(`Database does not exist: ${DB_PATH}`); process.exit(1); }
        console.log('Running in PUBLIC-ONLY mode (read-only)');
    }
} catch (err) { console.error(`Error with data directory: ${err.message}`); process.exit(1); }

let db;
try {
    if (PUBLIC_ONLY) { db = new Database(DB_PATH, { readonly: true }); console.log('Database opened in read-only mode'); }
    else {
        db = new Database(DB_PATH);
        console.log('Database opened successfully');
        db.pragma('journal_mode = WAL');
        db.pragma('synchronous = NORMAL');
        db.pragma('cache_size = -16000');
        db.pragma('temp_store = MEMORY');
    }
} catch (err) { console.error(`Failed to open database: ${err.message}`); process.exit(1); }

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Favicon and icons (admin uses icon.png with pencil badge)
const adminIconPath = path.join(__dirname, '../icon.png');
app.get('/favicon.ico', (req, res) => res.sendFile(adminIconPath));
app.get('/favicon.png', (req, res) => res.sendFile(adminIconPath));
app.get('/apple-touch-icon.png', (req, res) => res.sendFile(adminIconPath));

const uploadsPath = path.join(dataDir, 'uploads');
if (!PUBLIC_ONLY && !fs.existsSync(uploadsPath)) { fs.mkdirSync(uploadsPath, { recursive: true }); }
app.use('/uploads', express.static(uploadsPath));

// Get tracking code from settings for server-side injection
function getTrackingCode() {
    try {
        const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('trackingCode');
        return (setting?.value && setting.value.trim()) ? setting.value.trim() : '';
    } catch (e) { return ''; }
}

// When enabled, the public page must ask visitors for consent before loading the
// tracking snippet. SSR injection is skipped and the snippet value is withheld
// from the public API until the client records an explicit opt-in.
function isTrackingConsentRequired() {
    try {
        const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('trackingConsentRequired');
        return setting?.value === 'true';
    } catch (e) { return false; }
}

function servePublicIndex(req, res) {
    try {
        // Check if a default dataset exists — serve from it instead of live DB
        let defaultDataset = null;
        try {
            // Find THE one default variant
            const primary = db.prepare('SELECT * FROM saved_datasets WHERE is_default = 1').get();
            if (primary) {
                const requestedLang = req.query.lang;
                if (requestedLang && primary.language_group && requestedLang !== primary.language) {
                    // Visitor requested a different language — find sibling in same language group
                    // No is_public check: siblings of the default are always accessible for language switching
                    const sibling = db.prepare('SELECT * FROM saved_datasets WHERE language_group = ? AND language = ?').get(primary.language_group, requestedLang);
                    defaultDataset = sibling || primary;
                } else {
                    defaultDataset = primary;
                }
            }
        } catch (e) { /* is_default column may not exist yet */ }

        if (defaultDataset && defaultDataset.slug) {
            const data = JSON.parse(defaultDataset.data);
            const name = data.profile?.name || defaultDataset.name;
            const bio = data.profile?.bio || 'Professional CV';
            const description = stripBoldMarkers(bio).substring(0, 160).replace(/\n/g, ' ');
            const dsLang = defaultDataset.language || 'en';

            let html = fs.readFileSync(path.join(__dirname, '../public-readonly/index.html'), 'utf8');
            html = html.replace(/<html lang="[^"]*"/, `<html lang="${dsLang}"`);
            html = html.replace(/<title>[^<]*<\/title>/, `<title>${name} - CV</title>`);
            html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`);

            // Inject robots meta from settings
            const robotsSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('robotsMeta');
            const robotsValue = robotsSetting?.value || 'index, follow';
            html = html.replace(/<meta name="robots"[^>]*>/, `<meta name="robots" id="metaRobots" content="${robotsValue}">`);

            const ogTags = `\n    <meta property="og:title" content="${name} - CV">\n    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}">\n    <meta property="og:type" content="profile">`;
            html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">${ogTags}`);

            // Inject tracking code right after <head> (server-side for GA verification)
            const trackingCode = getTrackingCode();
            if (trackingCode && !isTrackingConsentRequired()) {
                html = html.replace('<head>', `<head>\n${trackingCode}`);
            }

            // Inject default dataset ID and language info (no DATASET_PREVIEW = no preview banner)
            const siblings = getDatasetSiblings(defaultDataset);
            const datasetTheme = data.theme || gatherTheme();
            const datasetScript = `<script>window.DATASET_ID = ${defaultDataset.id}; window.DATASET_SLUG = "${defaultDataset.slug}"; window.DATASET_LANG = "${dsLang}"; window.DATASET_IS_DEFAULT = true; window.DATASET_THEME = ${JSON.stringify(datasetTheme)};${siblings.length > 1 ? ` window.DATASET_SIBLINGS = ${JSON.stringify(siblings)};` : ''}</script>`;
            html = html.replace('</head>', `${datasetScript}</head>`);

            return res.type('html').send(html);
        }

        // Fallback: serve from live DB (no default dataset set)
        const profile = db.prepare('SELECT name, title, bio FROM profile WHERE id = 1').get();
        const name = profile?.name || 'CV';
        const bio = profile?.bio || 'Professional CV';
        const description = stripBoldMarkers(bio).substring(0, 160).replace(/\n/g, ' ');

        let html = fs.readFileSync(path.join(__dirname, '../public-readonly/index.html'), 'utf8');
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${name} - CV</title>`);
        html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`);

        // Inject robots meta from settings
        const robotsSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('robotsMeta');
        const robotsValue = robotsSetting?.value || 'index, follow';
        html = html.replace(/<meta name="robots"[^>]*>/, `<meta name="robots" id="metaRobots" content="${robotsValue}">`);

        const ogTags = `\n    <meta property="og:title" content="${name} - CV">\n    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}">\n    <meta property="og:type" content="profile">`;
        html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">${ogTags}`);

        // Inject tracking code right after <head> (server-side for GA verification)
        const trackingCode = getTrackingCode();
        if (trackingCode && !isTrackingConsentRequired()) {
            html = html.replace('<head>', `<head>\n${trackingCode}`);
        }

        // Inject theme so the public page can apply font/gradient before paint
        const fallbackTheme = gatherTheme();
        const themeScript = `<script>window.DATASET_THEME = ${JSON.stringify(fallbackTheme)};</script>`;
        html = html.replace('</head>', `${themeScript}</head>`);

        res.type('html').send(html);
    } catch (err) { res.sendFile(path.join(__dirname, '../public-readonly/index.html')); }
}

// Serve a public dataset page by slug (for /v/:slug on public server)
function serveDatasetPage(req, res, lang) {
    try {
        const dataset = resolveDatasetBySlug(req.params.slug, lang || req.params.lang || req.query.lang, true);
        if (!dataset) return res.status(404).send('Not found');

        const data = JSON.parse(dataset.data);
        const name = data.profile?.name || dataset.name;
        const bio = data.profile?.bio || '';
        const description = stripBoldMarkers(bio).substring(0, 160).replace(/\n/g, ' ');
        const dsLang = dataset.language || 'en';

        let html = fs.readFileSync(path.join(__dirname, '../public-readonly/index.html'), 'utf8');
        html = html.replace(/<html lang="[^"]*"/, `<html lang="${dsLang}"`);
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${name} - CV (${dataset.name})</title>`);
        html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`);

        const ogTags = `\n    <meta property="og:title" content="${name} - CV (${dataset.name})">\n    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}">\n    <meta property="og:type" content="profile">`;
        html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">${ogTags}`);

        // Inject dataset context with language info and exact ID
        const siblings = getDatasetSiblings(dataset);
        const datasetTheme = data.theme || gatherTheme();
        const datasetScript = `<script>window.DATASET_ID = ${dataset.id}; window.DATASET_SLUG = "${dataset.slug}"; window.DATASET_LANG = "${dsLang}"; window.DATASET_THEME = ${JSON.stringify(datasetTheme)};${siblings.length > 1 ? ` window.DATASET_SIBLINGS = ${JSON.stringify(siblings)};` : ''}</script>`;
        html = html.replace('</head>', `${datasetScript}</head>`);

        // Apply noindex if slugsIndex setting is not enabled
        const slugsIndexSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('slugsIndex');
        if (!slugsIndexSetting || slugsIndexSetting.value !== 'true') {
            html = html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" id="metaRobots" content="noindex, nofollow">');
        }

        // Inject tracking code right after <head> (server-side for GA verification)
        const trackingCode = getTrackingCode();
        if (trackingCode && !isTrackingConsentRequired()) {
            html = html.replace('<head>', `<head>\n${trackingCode}`);
        }

        res.type('html').send(html);
    } catch (err) {
        if (err.message?.includes('no such column')) return res.status(404).send('Not found');
        res.status(500).send('Error loading page');
    }
}

// Serve dataset data as JSON for public slug API
// Re-resolve sectionOrder[].name on a parsed dataset blob using the dataset's
// own language. The `.name` field inside saved_datasets.data is a snapshot
// taken at save time, so it can fall out of sync when (a) the admin adds a
// per-language override after the dataset was saved, (b) the i18n translation
// for that section changes, or (c) the visitor switches languages. Calling
// this on read means the public and admin sides always see the effective
// title without having to re-save every dataset.
function refreshDatasetSectionNames(data, language) {
    if (!data || typeof data !== 'object') return data;
    if (!Array.isArray(data.sectionOrder)) return data;
    const customNameMap = {};
    if (Array.isArray(data.customSections)) {
        data.customSections.forEach(cs => { if (cs && cs.section_key) customNameMap[cs.section_key] = cs.name; });
    }
    data.sectionOrder = data.sectionOrder.map(entry => {
        if (!entry || !entry.key) return entry;
        const resolved = resolveSectionTitle(entry.key, {
            datasetOverride: entry.display_name,
            language,
            locale: language,
            customNameFallback: customNameMap[entry.key]
        });
        return { ...entry, name: resolved };
    });
    return data;
}

function serveDatasetData(req, res) {
    try {
        const lang = req.params.lang || req.query.lang;
        const dataset = resolveDatasetBySlug(req.params.slug, lang, true);
        if (!dataset) return res.status(404).json({ error: 'Not found' });
        const data = refreshDatasetSectionNames(JSON.parse(dataset.data), dataset.language);
        const siblings = getDatasetSiblings(dataset);
        res.json({ name: dataset.name, slug: dataset.slug, language: dataset.language, language_group: dataset.language_group, version_group: dataset.version_group, version: dataset.version || 1, siblings, ...data });
    } catch (err) {
        if (err.message?.includes('no such column')) return res.status(404).json({ error: 'Not found' });
        res.status(500).json({ error: err.message });
    }
}

// Serve dataset data by ID (for default dataset and its siblings on public site)
function serveDatasetDataById(req, res) {
    try {
        // Allow access if: public, default, or sibling of the default dataset
        let dataset = db.prepare('SELECT * FROM saved_datasets WHERE id = ? AND (is_public = 1 OR is_default = 1)').get(req.params.id);
        if (!dataset) {
            // Check if this is a sibling of the default dataset (same language_group)
            const candidate = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
            if (candidate && candidate.language_group) {
                const defaultInGroup = db.prepare('SELECT id FROM saved_datasets WHERE language_group = ? AND is_default = 1').get(candidate.language_group);
                if (defaultInGroup) dataset = candidate;
            }
        }
        if (!dataset) return res.status(404).json({ error: 'Not found' });
        const data = refreshDatasetSectionNames(JSON.parse(dataset.data), dataset.language);
        const siblings = getDatasetSiblings(dataset);
        res.json({ name: dataset.name, slug: dataset.slug, language: dataset.language, language_group: dataset.language_group, version_group: dataset.version_group, version: dataset.version || 1, siblings, ...data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Layout types for custom sections
// SVG icons (matching app style)
const SVG_ICONS = {
    link: '<span class="material-symbols-outlined" style="font-size:20px">link</span>',
    grid2: '<span class="material-symbols-outlined" style="font-size:20px">view_column_2</span>',
    grid3: '<span class="material-symbols-outlined" style="font-size:20px">view_week</span>',
    list: '<span class="material-symbols-outlined" style="font-size:20px">format_list_bulleted</span>',
    cards: '<span class="material-symbols-outlined" style="font-size:20px">grid_view</span>',
    linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    github: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    twitter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>',
    instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    youtube: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>',
    globe: '<span class="material-symbols-outlined" style="font-size:16px">language</span>',
    mail: '<span class="material-symbols-outlined" style="font-size:16px">email</span>',
    phone: '<span class="material-symbols-outlined" style="font-size:16px">phone</span>',
    edit: '<span class="material-symbols-outlined" style="font-size:16px">edit</span>',
    dribbble: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>',
    behance: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 7h-7M22 12h-7M16.5 17a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM2 17V7h5a3 3 0 0 1 0 6H2m0 4h5.5a3 3 0 0 0 0-6H2"/></svg>',
    bluesky: '<svg width="16" height="16" viewBox="0 0 600 530" fill="currentColor"><path d="M135.72 44.03C202.216 93.951 273.74 195.401 300 249.98c26.262-54.578 97.784-156.03 164.28-205.95C512.26 8.009 590-19.862 590 68.825c0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.636-175.91-31.518-189.63-71.766-2.514-7.38-3.69-10.832-3.706-7.905-.016-2.927 1.192.525-3.706 7.905-13.72 40.248-67.24 197.402-189.63 71.765-64.444-66.128-34.605-132.256 82.697-152.22-67.106 11.42-142.547-7.45-163.25-81.432C20.155 217.613 10 86.536 10 68.824c0-88.687 77.74-60.816 125.72-24.795z"/></svg>',
    bullets: '<span class="material-symbols-outlined" style="font-size:20px">format_list_bulleted</span>',
    freetext: '<span class="material-symbols-outlined" style="font-size:20px">notes</span>',
    pictureGrid: '<span class="material-symbols-outlined" style="font-size:20px">photo_library</span>',
    timeline: '<span class="material-symbols-outlined" style="font-size:20px">work_history</span>'
};

// Layout types as array for frontend iteration
const LAYOUT_TYPES = [
    { id: 'social-links', name: 'Social Links', icon: SVG_ICONS.link },
    { id: 'grid-2', name: '2-Column Grid', icon: SVG_ICONS.grid2 },
    { id: 'grid-3', name: '3-Column Grid', icon: SVG_ICONS.grid3 },
    { id: 'list', name: 'Vertical List', icon: SVG_ICONS.list },
    { id: 'cards', name: 'Card Grid', icon: SVG_ICONS.cards },
    { id: 'bullet-list', name: 'Bullet Points', icon: SVG_ICONS.bullets },
    { id: 'free-text', name: 'Free Text', icon: SVG_ICONS.freetext },
    { id: 'picture-grid', name: 'Picture Grid', icon: SVG_ICONS.pictureGrid },
    { id: 'timeline', name: 'Additional Experiences', icon: SVG_ICONS.timeline }
];

// Social platform definitions as array for frontend iteration
const SOCIAL_PLATFORMS = [
    { id: 'linkedin', name: 'LinkedIn', icon: SVG_ICONS.linkedin, color: '#0077b5' },
    { id: 'github', name: 'GitHub', icon: SVG_ICONS.github, color: '#333' },
    { id: 'twitter', name: 'Twitter/X', icon: SVG_ICONS.twitter, color: '#1da1f2' },
    { id: 'instagram', name: 'Instagram', icon: SVG_ICONS.instagram, color: '#e4405f' },
    { id: 'youtube', name: 'YouTube', icon: SVG_ICONS.youtube, color: '#ff0000' },
    { id: 'dribbble', name: 'Dribbble', icon: SVG_ICONS.dribbble, color: '#ea4c89' },
    { id: 'behance', name: 'Behance', icon: SVG_ICONS.behance, color: '#1769ff' },
    { id: 'bluesky', name: 'Bluesky', icon: SVG_ICONS.bluesky, color: '#0085ff' },
    { id: 'website', name: 'Website', icon: SVG_ICONS.globe, color: '#0066ff' },
    { id: 'email', name: 'Email', icon: SVG_ICONS.mail, color: '#ea4335' },
    { id: 'phone', name: 'Phone', icon: SVG_ICONS.phone, color: '#34a853' },
    { id: 'custom', name: 'Custom', icon: SVG_ICONS.link, color: '#666' }
];

if (!PUBLIC_ONLY) {
    // Step 1: Create tables (without sort_order in section_visibility for compatibility)
    db.exec(`
        CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY CHECK (id = 1), name TEXT NOT NULL DEFAULT 'Your Name', initials TEXT DEFAULT 'YN', title TEXT DEFAULT 'Your Title', subtitle TEXT DEFAULT '', bio TEXT DEFAULT '', location TEXT DEFAULT '', linkedin TEXT DEFAULT '', email TEXT DEFAULT '', phone TEXT DEFAULT '', languages TEXT DEFAULT '', visible INTEGER DEFAULT 1, profile_picture_enabled INTEGER DEFAULT 1, picture_filename TEXT, picture_propagate INTEGER DEFAULT 1, picture_crop TEXT, open_to_work INTEGER DEFAULT 0, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE IF NOT EXISTS experiences (id INTEGER PRIMARY KEY AUTOINCREMENT, job_title TEXT NOT NULL, company_name TEXT NOT NULL, start_date TEXT, end_date TEXT, location TEXT, country_code TEXT DEFAULT '', highlights TEXT, sort_order INTEGER DEFAULT 0, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS certifications (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, provider TEXT, issue_date TEXT, expiry_date TEXT, credential_id TEXT, sort_order INTEGER DEFAULT 0, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS education (id INTEGER PRIMARY KEY AUTOINCREMENT, degree_title TEXT NOT NULL, institution_name TEXT NOT NULL, start_date TEXT, end_date TEXT, description TEXT, sort_order INTEGER DEFAULT 0, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS skill_categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, icon TEXT DEFAULT 'default', sort_order INTEGER DEFAULT 0, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS skills (id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER NOT NULL, name TEXT NOT NULL, sort_order INTEGER DEFAULT 0, FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE);
        CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, technologies TEXT, link TEXT, sort_order INTEGER DEFAULT 0, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS section_visibility (section_name TEXT PRIMARY KEY, visible INTEGER DEFAULT 1);
        CREATE TABLE IF NOT EXISTS saved_datasets (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, data TEXT NOT NULL, slug TEXT, language TEXT NOT NULL DEFAULT 'en', language_group TEXT, version_group TEXT, version INTEGER DEFAULT 1, is_public INTEGER DEFAULT 0, is_default INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(slug, version, language), UNIQUE(name, language), UNIQUE(version_group, version, language));
        
        -- Custom sections tables
        CREATE TABLE IF NOT EXISTS custom_sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            section_key TEXT UNIQUE NOT NULL,
            layout_type TEXT NOT NULL DEFAULT 'grid-3',
            icon TEXT DEFAULT 'layers',
            sort_order INTEGER DEFAULT 100,
            visible INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS custom_section_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section_id INTEGER NOT NULL,
            title TEXT,
            subtitle TEXT,
            description TEXT,
            link TEXT,
            icon TEXT,
            image TEXT,
            metadata TEXT,
            sort_order INTEGER DEFAULT 0,
            visible INTEGER DEFAULT 1,
            FOREIGN KEY (section_id) REFERENCES custom_sections(id) ON DELETE CASCADE
        );
    `);

    // Step 2: Migration - add sort_order column if missing
    try {
        const tableInfo = db.prepare("PRAGMA table_info(section_visibility)").all();
        const hasSortOrder = tableInfo.some(col => col.name === 'sort_order');
        if (!hasSortOrder) {
            console.log('Migrating section_visibility table: adding sort_order column');
            db.exec('ALTER TABLE section_visibility ADD COLUMN sort_order INTEGER DEFAULT 0');
            // Set default sort order for existing sections
            DEFAULT_SECTION_ORDER.forEach((section, index) => {
                db.prepare('UPDATE section_visibility SET sort_order = ? WHERE section_name = ?').run(index, section);
            });
        }
    } catch (err) { console.log('Migration check:', err.message); }

    // Step 2b: Migration - add slug column to saved_datasets if missing
    try {
        const datasetsInfo = db.prepare("PRAGMA table_info(saved_datasets)").all();
        const hasSlug = datasetsInfo.some(col => col.name === 'slug');
        if (!hasSlug) {
            console.log('Migrating saved_datasets table: adding slug column');
            db.exec('ALTER TABLE saved_datasets ADD COLUMN slug TEXT UNIQUE');
        }
        // Only try to generate slugs if column exists now
        const verifySlug = db.prepare("PRAGMA table_info(saved_datasets)").all();
        if (verifySlug.some(col => col.name === 'slug')) {
            const datasetsWithoutSlug = db.prepare('SELECT id, name FROM saved_datasets WHERE slug IS NULL').all();
            if (datasetsWithoutSlug.length > 0) {
                console.log(`Generating slugs for ${datasetsWithoutSlug.length} datasets`);
                datasetsWithoutSlug.forEach(ds => {
                    const slug = generateSlug(ds.name, ds.id);
                    db.prepare('UPDATE saved_datasets SET slug = ? WHERE id = ?').run(slug, ds.id);
                });
            }
        }
    } catch (err) { 
        console.error('Migration error (saved_datasets slug):', err.message);
        // Force add slug column as last resort
        try {
            db.exec('ALTER TABLE saved_datasets ADD COLUMN slug TEXT');
            console.log('Forced slug column addition');
        } catch (e) { /* column already exists or other error */ }
    }

    // Step 2c: Migration - fix custom_section_items visibility (some may have NULL or 0)
    try {
        db.exec('UPDATE custom_section_items SET visible = 1 WHERE visible IS NULL OR visible = 0');
        console.log('Migration: Fixed custom_section_items visibility');
    } catch (err) { console.log('Migration check (custom_section_items):', err.message); }

    // Step 2c1: Migration - add metadata column to custom_sections if missing
    try {
        const csInfo = db.prepare("PRAGMA table_info(custom_sections)").all();
        if (!csInfo.some(col => col.name === 'metadata')) {
            console.log('Migrating custom_sections table: adding metadata column');
            db.exec('ALTER TABLE custom_sections ADD COLUMN metadata TEXT');
        }
    } catch (err) { console.log('Migration check (custom_sections metadata):', err.message); }

    // Step 2c2: Migration - add is_public column to saved_datasets if missing
    try {
        const dsInfo = db.prepare("PRAGMA table_info(saved_datasets)").all();
        if (!dsInfo.some(col => col.name === 'is_public')) {
            console.log('Migrating saved_datasets table: adding is_public column');
            db.exec('ALTER TABLE saved_datasets ADD COLUMN is_public INTEGER DEFAULT 0');
        }
    } catch (err) { console.log('Migration check (is_public):', err.message); }

    // Step 2d: Migration - add print_visible column to section_visibility if missing
    try {
        const sectionVisInfo = db.prepare("PRAGMA table_info(section_visibility)").all();
        const hasPrintVisible = sectionVisInfo.some(col => col.name === 'print_visible');
        if (!hasPrintVisible) {
            console.log('Migrating section_visibility table: adding print_visible column');
            db.exec('ALTER TABLE section_visibility ADD COLUMN print_visible INTEGER DEFAULT 1');
        }
    } catch (err) { console.log('Migration check (print_visible):', err.message); }

    // Step 2e: Migration - add display_name column to section_visibility if missing
    try {
        const sectionVisInfo2 = db.prepare("PRAGMA table_info(section_visibility)").all();
        const hasDisplayName = sectionVisInfo2.some(col => col.name === 'display_name');
        if (!hasDisplayName) {
            console.log('Migrating section_visibility table: adding display_name column');
            db.exec('ALTER TABLE section_visibility ADD COLUMN display_name TEXT');
        }
    } catch (err) { console.log('Migration check (display_name):', err.message); }

    // Step 2f: Migration - add print_compact column to section_visibility if missing
    try {
        const sectionVisInfo3 = db.prepare("PRAGMA table_info(section_visibility)").all();
        const hasPrintCompact = sectionVisInfo3.some(col => col.name === 'print_compact');
        if (!hasPrintCompact) {
            console.log('Migrating section_visibility table: adding print_compact column');
            db.exec('ALTER TABLE section_visibility ADD COLUMN print_compact INTEGER DEFAULT 0');
        }
    } catch (err) { console.log('Migration check (print_compact):', err.message); }

    // Step 2e2: Create section_title_overrides table (per-language rename storage)
    // and migrate any existing global section_visibility.display_name values into
    // it, seeding one row per section, per language actually present in saved_datasets.
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS section_title_overrides (
                section_key TEXT NOT NULL,
                language TEXT NOT NULL,
                display_name TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (section_key, language)
            );
            CREATE INDEX IF NOT EXISTS idx_section_title_overrides_lang
                ON section_title_overrides(language);
        `);

        const migratedFlag = db.prepare("SELECT value FROM settings WHERE key = ?").get('section_titles_migrated_v1');
        if (!migratedFlag) {
            const languages = new Set(
                db.prepare('SELECT DISTINCT language FROM saved_datasets WHERE language IS NOT NULL').all().map(r => r.language).filter(Boolean)
            );
            if (languages.size === 0) {
                const langSetting = db.prepare("SELECT value FROM settings WHERE key = ?").get('language');
                languages.add((langSetting && langSetting.value) || 'en');
            }

            const renamed = db.prepare("SELECT section_name, display_name FROM section_visibility WHERE display_name IS NOT NULL AND display_name != ''").all();
            const insert = db.prepare('INSERT OR IGNORE INTO section_title_overrides (section_key, language, display_name) VALUES (?, ?, ?)');
            const seed = db.transaction(() => {
                for (const row of renamed) {
                    for (const lang of languages) {
                        insert.run(row.section_name, lang, row.display_name);
                    }
                }
            });
            seed();

            db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('section_titles_migrated_v1', '1');
            if (renamed.length > 0) {
                console.log(`Migrated ${renamed.length} section rename(s) into section_title_overrides for ${languages.size} language(s)`);
            }
        }
    } catch (err) { console.log('Migration check (section_title_overrides):', err.message); }

    // Step 2f: Migration - add profile_picture_enabled column to profile if missing
    try {
        const profilePicEnabledInfo = db.prepare("PRAGMA table_info(profile)").all();
        const hasProfilePicEnabled = profilePicEnabledInfo.some(col => col.name === 'profile_picture_enabled');
        if (!hasProfilePicEnabled) {
            console.log('Migrating profile table: adding profile_picture_enabled');
            db.exec('ALTER TABLE profile ADD COLUMN profile_picture_enabled INTEGER DEFAULT 1');
        }
    } catch (err) { console.log('Migration check (profile_picture_enabled):', err.message); }

    // Step 2f2: Migration - add open_to_work column to profile if missing
    try {
        const profileOpenInfo = db.prepare("PRAGMA table_info(profile)").all();
        if (!profileOpenInfo.some(col => col.name === 'open_to_work')) {
            console.log('Migrating profile table: adding open_to_work');
            db.exec('ALTER TABLE profile ADD COLUMN open_to_work INTEGER DEFAULT 0');
        }
    } catch (err) { console.log('Migration check (open_to_work):', err.message); }

    // Step 2f3: Migration - add picture_filename column to profile if missing
    try {
        const profilePicFileInfo = db.prepare("PRAGMA table_info(profile)").all();
        if (!profilePicFileInfo.some(col => col.name === 'picture_filename')) {
            console.log('Migrating profile table: adding picture_filename');
            db.exec('ALTER TABLE profile ADD COLUMN picture_filename TEXT');
        }
    } catch (err) { console.log('Migration check (picture_filename):', err.message); }

    // Step 2f4: Migration - add picture_propagate column to profile if missing
    try {
        const profilePicPropInfo = db.prepare("PRAGMA table_info(profile)").all();
        if (!profilePicPropInfo.some(col => col.name === 'picture_propagate')) {
            console.log('Migrating profile table: adding picture_propagate');
            db.exec('ALTER TABLE profile ADD COLUMN picture_propagate INTEGER DEFAULT 1');
        }
    } catch (err) { console.log('Migration check (picture_propagate):', err.message); }

    // Step 2f5: Migration - add picture_crop column to profile if missing
    try {
        const profilePicCropInfo = db.prepare("PRAGMA table_info(profile)").all();
        if (!profilePicCropInfo.some(col => col.name === 'picture_crop')) {
            console.log('Migrating profile table: adding picture_crop');
            db.exec('ALTER TABLE profile ADD COLUMN picture_crop TEXT');
        }
    } catch (err) { console.log('Migration check (picture_crop):', err.message); }


    // Step 2g: Migration - add is_default column to saved_datasets if missing
    try {
        const dsDefaultInfo = db.prepare("PRAGMA table_info(saved_datasets)").all();
        if (!dsDefaultInfo.some(col => col.name === 'is_default')) {
            console.log('Migrating saved_datasets table: adding is_default column');
            db.exec('ALTER TABLE saved_datasets ADD COLUMN is_default INTEGER DEFAULT 0');
        }
    } catch (err) { console.log('Migration check (is_default):', err.message); }

    // Step 2i: Migration - add logo_filename column to experiences if missing
    try {
        const expLogoInfo = db.prepare("PRAGMA table_info(experiences)").all();
        if (!expLogoInfo.some(col => col.name === 'logo_filename')) {
            console.log('Migrating experiences table: adding logo_filename column');
            db.exec('ALTER TABLE experiences ADD COLUMN logo_filename TEXT DEFAULT NULL');
        }
    } catch (err) { console.log('Migration check (logo_filename):', err.message); }

    // Step 2j: Migration - add logo_propagate column to experiences if missing
    try {
        const expPropInfo = db.prepare("PRAGMA table_info(experiences)").all();
        if (!expPropInfo.some(col => col.name === 'logo_propagate')) {
            console.log('Migrating experiences table: adding logo_propagate column');
            db.exec('ALTER TABLE experiences ADD COLUMN logo_propagate INTEGER DEFAULT 0');
        }
    } catch (err) { console.log('Migration check (logo_propagate):', err.message); }

    // Step 2k: Migration - add summary column to experiences if missing
    try {
        const expSummaryInfo = db.prepare("PRAGMA table_info(experiences)").all();
        if (!expSummaryInfo.some(col => col.name === 'summary')) {
            console.log('Migrating experiences table: adding summary column');
            db.exec('ALTER TABLE experiences ADD COLUMN summary TEXT DEFAULT NULL');
        }
    } catch (err) { console.log('Migration check (summary):', err.message); }

    // Step 2l: Migration - add logo_filename column to education if missing
    try {
        const eduLogoInfo = db.prepare("PRAGMA table_info(education)").all();
        if (!eduLogoInfo.some(col => col.name === 'logo_filename')) {
            console.log('Migrating education table: adding logo_filename column');
            db.exec('ALTER TABLE education ADD COLUMN logo_filename TEXT DEFAULT NULL');
        }
    } catch (err) { console.log('Migration check (education logo_filename):', err.message); }

    // Step 2l: Migration - add logo_propagate column to education if missing
    try {
        const eduPropInfo = db.prepare("PRAGMA table_info(education)").all();
        if (!eduPropInfo.some(col => col.name === 'logo_propagate')) {
            console.log('Migrating education table: adding logo_propagate column');
            db.exec('ALTER TABLE education ADD COLUMN logo_propagate INTEGER DEFAULT 0');
        }
    } catch (err) { console.log('Migration check (education logo_propagate):', err.message); }

    // Step 2m: Migration - add logo_filename column to certifications if missing
    try {
        const certLogoInfo = db.prepare("PRAGMA table_info(certifications)").all();
        if (!certLogoInfo.some(col => col.name === 'logo_filename')) {
            console.log('Migrating certifications table: adding logo_filename column');
            db.exec('ALTER TABLE certifications ADD COLUMN logo_filename TEXT DEFAULT NULL');
        }
    } catch (err) { console.log('Migration check (certifications logo_filename):', err.message); }

    // Step 2n: Migration - add logo_propagate column to certifications if missing
    try {
        const certPropInfo = db.prepare("PRAGMA table_info(certifications)").all();
        if (!certPropInfo.some(col => col.name === 'logo_propagate')) {
            console.log('Migrating certifications table: adding logo_propagate column');
            db.exec('ALTER TABLE certifications ADD COLUMN logo_propagate INTEGER DEFAULT 0');
        }
    } catch (err) { console.log('Migration check (certifications logo_propagate):', err.message); }

    // Step 2o: Migration - add language and language_group columns to saved_datasets
    // Recreates table to change UNIQUE constraints: name → (name, language), slug → (slug, language)
    try {
        const dsLangInfo = db.prepare("PRAGMA table_info(saved_datasets)").all();
        if (!dsLangInfo.some(col => col.name === 'language')) {
            console.log('Migrating saved_datasets table: adding language support');
            const migrate = db.transaction(() => {
                db.exec(`CREATE TABLE saved_datasets_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    data TEXT NOT NULL,
                    slug TEXT,
                    language TEXT NOT NULL DEFAULT 'en',
                    language_group TEXT,
                    is_public INTEGER DEFAULT 0,
                    is_default INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(slug, language),
                    UNIQUE(name, language)
                )`);
                const existing = db.prepare('SELECT * FROM saved_datasets').all();
                const insertStmt = db.prepare(`INSERT INTO saved_datasets_new
                    (id, name, data, slug, language, language_group, is_public, is_default, created_at, updated_at)
                    VALUES (?, ?, ?, ?, 'en', ?, ?, ?, ?, ?)`);
                for (const row of existing) {
                    const groupId = crypto.randomUUID();
                    insertStmt.run(row.id, row.name, row.data, row.slug || null, groupId,
                        row.is_public || 0, row.is_default || 0, row.created_at, row.updated_at);
                }
                db.exec('DROP TABLE saved_datasets');
                db.exec('ALTER TABLE saved_datasets_new RENAME TO saved_datasets');
            });
            migrate();
            console.log('Migration complete: language support added to saved_datasets');
        }
    } catch (err) { console.error('Migration error (saved_datasets language):', err.message); }

    // Step 2p: Migration - add version_group and version columns to saved_datasets
    // Recreates table to add UNIQUE(version_group, version, language) constraint.
    // Existing rows get version_group and version derived from their name ("Name vN" pattern).
    try {
        const dsVerInfo = db.prepare("PRAGMA table_info(saved_datasets)").all();
        if (!dsVerInfo.some(col => col.name === 'version_group')) {
            console.log('Migrating saved_datasets table: adding version_group and version');
            // Server-side name parser (mirrors the frontend parseDatasetVersion)
            function parseVer(name) {
                const m = /^(.+?)\s+v(\d+)$/i.exec((name || '').trim());
                if (m) return { base: m[1].trim(), version: parseInt(m[2], 10) };
                return { base: (name || '').trim(), version: 1 };
            }
            const migrate = db.transaction(() => {
                db.exec(`CREATE TABLE saved_datasets_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    data TEXT NOT NULL,
                    slug TEXT,
                    language TEXT NOT NULL DEFAULT 'en',
                    language_group TEXT,
                    version_group TEXT,
                    version INTEGER DEFAULT 1,
                    is_public INTEGER DEFAULT 0,
                    is_default INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(slug, version, language),
                    UNIQUE(name, language),
                    UNIQUE(version_group, version, language)
                )`);
                const existing = db.prepare('SELECT * FROM saved_datasets').all();
                // Build base → version_group map so same base name shares a version_group
                const baseToVG = {};
                for (const row of existing) {
                    const { base } = parseVer(row.name);
                    if (!baseToVG[base]) baseToVG[base] = crypto.randomUUID();
                }
                const insertStmt = db.prepare(`INSERT INTO saved_datasets_new
                    (id, name, data, slug, language, language_group, version_group, version, is_public, is_default, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                for (const row of existing) {
                    const { base, version } = parseVer(row.name);
                    insertStmt.run(row.id, row.name, row.data, row.slug || null,
                        row.language || 'en', row.language_group || null,
                        baseToVG[base], version,
                        row.is_public || 0, row.is_default || 0,
                        row.created_at, row.updated_at);
                }
                db.exec('DROP TABLE saved_datasets');
                db.exec('ALTER TABLE saved_datasets_new RENAME TO saved_datasets');
            });
            migrate();
            console.log('Migration complete: version_group and version added to saved_datasets');
        }
    } catch (err) { console.error('Migration error (saved_datasets versioning):', err.message); }

    // Step 2q: Fixup — consolidate orphaned version_groups
    // If the "New version" button previously passed the wrong ID, datasets with
    // the same base name may have ended up in separate version_groups. Re-group
    // them so they share the oldest version_group UUID for that base name.
    try {
        const allDs = db.prepare('SELECT id, name, version_group, version FROM saved_datasets WHERE version_group IS NOT NULL').all();
        if (allDs.length > 0) {
            function parseVerName(name) {
                const m = /^(.+?)\s+v(\d+)$/i.exec((name || '').trim());
                if (m) return { base: m[1].trim(), version: parseInt(m[2], 10) };
                return { base: (name || '').trim(), version: 1 };
            }
            // Map base name → canonical version_group (the first one seen)
            const baseToVG = {};
            const fixes = [];
            // Sort by version so v1 is processed first — its version_group becomes canonical
            allDs.sort((a, b) => (a.version || 1) - (b.version || 1));
            for (const row of allDs) {
                const { base, version } = parseVerName(row.name);
                if (!baseToVG[base]) {
                    baseToVG[base] = row.version_group;
                } else if (row.version_group !== baseToVG[base]) {
                    fixes.push({ id: row.id, newVG: baseToVG[base], version });
                }
            }
            if (fixes.length > 0) {
                const updateStmt = db.prepare('UPDATE saved_datasets SET version_group = ?, version = ? WHERE id = ?');
                const fixup = db.transaction(() => {
                    for (const f of fixes) {
                        // Ensure version doesn't collide within the new group
                        const maxRow = db.prepare('SELECT MAX(version) as maxVer FROM saved_datasets WHERE version_group = ?').get(f.newVG);
                        const nextVer = Math.max(f.version, (maxRow?.maxVer || 0) + 1);
                        updateStmt.run(f.newVG, nextVer, f.id);
                    }
                });
                fixup();
                console.log(`Fixup: consolidated ${fixes.length} dataset(s) into correct version_groups`);
            }
        }
    } catch (err) { console.error('Fixup error (version_group consolidation):', err.message); }

    // Step 2h: Migration - normalize legacy date formats (e.g., "Jan 2020" → "2020-01")
    // Runs once; creates a flag in settings to avoid re-running on every startup
    try {
        const migrated = db.prepare("SELECT value FROM settings WHERE key = 'dates_normalized'").get();
        if (!migrated) {
            console.log('Normalizing legacy date formats...');
            const monthsShort = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

            function normalizeDateValue(d) {
                if (!d || typeof d !== 'string') return d;
                const s = d.trim();
                if (!s) return s;
                // Already ISO
                if (/^\d{4}(-\d{2})?$/.test(s)) return s;
                // "Jan 2020", "January 2020"
                const wordMonth = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
                if (wordMonth) {
                    const idx = monthsShort.indexOf(wordMonth[1].toLowerCase().substring(0, 3));
                    if (idx >= 0) return `${wordMonth[2]}-${String(idx + 1).padStart(2, '0')}`;
                }
                // "01/2020", "01.2020", "01-2020"
                const numMonth = s.match(/^(\d{1,2})[\/.\-](\d{4})$/);
                if (numMonth) {
                    const m = parseInt(numMonth[1]);
                    if (m >= 1 && m <= 12) return `${numMonth[2]}-${String(m).padStart(2, '0')}`;
                }
                // "2020/01", "2020.01"
                const reverseNum = s.match(/^(\d{4})[\/.](\d{1,2})$/);
                if (reverseNum) {
                    const m = parseInt(reverseNum[2]);
                    if (m >= 1 && m <= 12) return `${reverseNum[1]}-${String(m).padStart(2, '0')}`;
                }
                return s; // leave unrecognized formats untouched
            }

            // Normalize experiences table
            let expCount = 0;
            const exps = db.prepare('SELECT id, start_date, end_date FROM experiences').all();
            exps.forEach(e => {
                const ns = normalizeDateValue(e.start_date);
                const ne = normalizeDateValue(e.end_date);
                if (ns !== e.start_date || ne !== e.end_date) {
                    db.prepare('UPDATE experiences SET start_date = ?, end_date = ? WHERE id = ?').run(ns, ne, e.id);
                    expCount++;
                }
            });

            // Normalize education table
            let eduCount = 0;
            const edus = db.prepare('SELECT id, start_date, end_date FROM education').all();
            edus.forEach(e => {
                const ns = normalizeDateValue(e.start_date);
                const ne = normalizeDateValue(e.end_date);
                if (ns !== e.start_date || ne !== e.end_date) {
                    db.prepare('UPDATE education SET start_date = ?, end_date = ? WHERE id = ?').run(ns, ne, e.id);
                    eduCount++;
                }
            });

            // Normalize certifications table
            let certCount = 0;
            const certs = db.prepare('SELECT id, issue_date FROM certifications').all();
            certs.forEach(c => {
                const nd = normalizeDateValue(c.issue_date);
                if (nd !== c.issue_date) {
                    db.prepare('UPDATE certifications SET issue_date = ? WHERE id = ?').run(nd, c.id);
                    certCount++;
                }
            });

            // Normalize dates inside saved dataset JSON blobs
            let dsCount = 0;
            try {
                const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
                datasets.forEach(ds => {
                    try {
                        const data = JSON.parse(ds.data);
                        let changed = false;
                        if (data.experiences) {
                            data.experiences.forEach(e => {
                                const ns = normalizeDateValue(e.start_date);
                                const ne = normalizeDateValue(e.end_date);
                                if (ns !== e.start_date || ne !== e.end_date) { e.start_date = ns; e.end_date = ne; changed = true; }
                            });
                        }
                        if (data.education) {
                            data.education.forEach(e => {
                                const ns = normalizeDateValue(e.start_date);
                                const ne = normalizeDateValue(e.end_date);
                                if (ns !== e.start_date || ne !== e.end_date) { e.start_date = ns; e.end_date = ne; changed = true; }
                            });
                        }
                        if (data.certifications) {
                            data.certifications.forEach(c => {
                                const nd = normalizeDateValue(c.issue_date);
                                if (nd !== c.issue_date) { c.issue_date = nd; changed = true; }
                            });
                        }
                        if (changed) {
                            db.prepare('UPDATE saved_datasets SET data = ? WHERE id = ?').run(JSON.stringify(data), ds.id);
                            dsCount++;
                        }
                    } catch (parseErr) { /* skip unparseable datasets */ }
                });
            } catch (dsErr) { /* saved_datasets table may not exist yet */ }

            db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('dates_normalized', '1')").run();
            console.log(`Date normalization complete: ${expCount} experiences, ${eduCount} education, ${certCount} certifications, ${dsCount} datasets updated`);
        }
    } catch (err) { console.log('Migration check (date normalization):', err.message); }

    // Step 2i: Create indexes on saved_datasets hot-path lookup columns
    try {
        db.exec('CREATE INDEX IF NOT EXISTS idx_ds_lang_group ON saved_datasets(language_group)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_ds_ver_group ON saved_datasets(version_group)');
        db.exec('CREATE INDEX IF NOT EXISTS idx_ds_is_default ON saved_datasets(is_default) WHERE is_default = 1');
        db.exec('CREATE INDEX IF NOT EXISTS idx_ds_slug_lang ON saved_datasets(slug, language)');
    } catch (err) { console.log('Index creation check:', err.message); }

    // Step 3: Insert default data (after migration ensures sort_order exists)
    db.exec(`INSERT OR IGNORE INTO profile (id) VALUES (1)`);
    DEFAULT_SECTION_ORDER.forEach((section, index) => {
        db.prepare('INSERT OR IGNORE INTO section_visibility (section_name, visible, sort_order) VALUES (?, 1, ?)').run(section, index);
    });

    // Step 3b: Promote legacy picture.jpeg into the new library format.
    // Runs after the profile row exists so the UPDATE actually has something to set.
    try {
        const legacyPicPath = path.join(uploadsPath, 'picture.jpeg');
        const current = db.prepare('SELECT picture_filename FROM profile WHERE id = 1').get();
        if ((!current || !current.picture_filename) && fs.existsSync(legacyPicPath)) {
            const legacyName = `profile_${Date.now()}.jpg`;
            const legacyDest = path.join(uploadsPath, legacyName);
            try {
                fs.copyFileSync(legacyPicPath, legacyDest);
                db.prepare('UPDATE profile SET picture_filename = ? WHERE id = 1').run(legacyName);
                console.log(`Migrated legacy picture.jpeg to ${legacyName}`);
            } catch (copyErr) { console.log('Legacy picture migration skipped:', copyErr.message); }
        }
    } catch (err) { console.log('Migration check (legacy picture):', err.message); }

    // Step 4: Auto-create "Default" dataset from live DB if no default exists
    // Runs AFTER Step 3 so that profile and section_visibility rows are guaranteed to exist.
    // Creates a Default dataset on every install (fresh or existing) so the Open modal is never empty.
    try {
        const hasDefault = db.prepare('SELECT id FROM saved_datasets WHERE is_default = 1').get();
        if (!hasDefault) {
            console.log('Auto-creating default dataset from live CV data');
            const cvData = gatherCvData();
            const existingDefault = db.prepare("SELECT id FROM saved_datasets WHERE name = ? AND language = 'en'").get('Default');
            if (existingDefault) {
                // A dataset named "Default" already exists — update it and mark as default
                db.prepare('UPDATE saved_datasets SET data = ?, is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(cvData), existingDefault.id);
                // Ensure it has language_group and version_group
                const ds = db.prepare('SELECT language_group, version_group FROM saved_datasets WHERE id = ?').get(existingDefault.id);
                if (!ds.language_group) {
                    db.prepare('UPDATE saved_datasets SET language_group = ? WHERE id = ?').run(crypto.randomUUID(), existingDefault.id);
                }
                if (!ds.version_group) {
                    db.prepare('UPDATE saved_datasets SET version_group = ? WHERE id = ?').run(crypto.randomUUID(), existingDefault.id);
                }
                console.log(`Updated existing "Default" dataset (id: ${existingDefault.id}) and set as default`);
            } else {
                const groupId = crypto.randomUUID();
                const versionGroupId = crypto.randomUUID();
                const result = db.prepare("INSERT INTO saved_datasets (name, data, language, language_group, version_group, version, is_default, is_public) VALUES (?, ?, 'en', ?, ?, 1, 1, 0)").run('Default', JSON.stringify(cvData), groupId, versionGroupId);
                const newId = result.lastInsertRowid;
                try {
                    const slug = generateSlug('Default', newId);
                    db.prepare('UPDATE saved_datasets SET slug = ? WHERE id = ?').run(slug, newId);
                } catch (slugErr) { console.log('Slug update skipped for auto-created default:', slugErr.message); }
                console.log(`Auto-created default dataset (id: ${newId})`);
            }
        }
    } catch (err) { console.log('Auto-create default dataset:', err.message); }
}

function formatPeriod(startDate, endDate) {
    const start = startDate ? formatDateShort(startDate) : '';
    const end = endDate ? formatDateShort(endDate) : 'Present';
    return `${start} - ${end}`;
}

function formatDateShort(dateStr) {
    if (!dateStr) return '';
    if (dateStr.match(/^\d{4}$/)) return dateStr;
    if (dateStr.match(/^\d{4}-\d{2}$/)) {
        const [y, m] = dateStr.split('-');
        const monthIdx = parseInt(m) - 1;
        const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const monthsFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        
        // Read date format setting from DB, default to MMM YYYY
        let fmt = 'MMM YYYY';
        try {
            const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('dateFormat');
            if (setting?.value) fmt = setting.value;
        } catch { /* use default */ }
        
        switch (fmt) {
            case 'MMMM YYYY': return `${monthsFull[monthIdx]} ${y}`;
            case 'MMM YY': return `${monthsShort[monthIdx]} ${y.slice(-2)}`;
            case 'MM/YYYY': return `${m}/${y}`;
            case 'MM.YYYY': return `${m}.${y}`;
            case 'MM-YYYY': return `${m}-${y}`;
            case 'YYYY-MM': return `${y}-${m}`;
            case 'YYYY': return y;
            case 'MMM YYYY':
            default: return `${monthsShort[monthIdx]} ${y}`;
        }
    }
    const yearMatch = dateStr.match(/(\d{4})/);
    return yearMatch ? yearMatch[1] : dateStr;
}

// Profile picture filenames must either be a library entry (profile_*) or the legacy single file.
function isValidProfilePictureName(filename) {
    if (!filename || typeof filename !== 'string') return false;
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) return false;
    return filename.startsWith('profile_') || filename === 'picture.jpeg';
}

// Clamp + normalize a profile-picture crop payload. Returns a normalized object
// or null when the input is missing/invalid. Values out of range are clamped
// rather than rejected, matching the client-side slider behaviour; only
// non-numeric / missing fields are treated as a hard error.
const DEFAULT_CROP = { offsetX: 0, offsetY: 0, zoom: 1 };
function normalizeCrop(input) {
    if (!input || typeof input !== 'object') return null;
    const num = (v) => (typeof v === 'number' && Number.isFinite(v)) ? v : NaN;
    let ox = num(input.offsetX), oy = num(input.offsetY), z = num(input.zoom);
    if (Number.isNaN(ox) || Number.isNaN(oy) || Number.isNaN(z)) return null;
    if (z < 1) z = 1; else if (z > 4) z = 4;
    if (ox < -100) ox = -100; else if (ox > 100) ox = 100;
    if (oy < -100) oy = -100; else if (oy > 100) oy = 100;
    return {
        offsetX: Math.round(ox * 100) / 100,
        offsetY: Math.round(oy * 100) / 100,
        zoom: Math.round(z * 1000) / 1000
    };
}

// Mirror the live profile picture filename into every saved dataset JSON snapshot.
// Also sets data.profile.picture_propagate = 1 so the flag stays consistent across siblings.
function propagateProfilePictureToDatasets(filename) {
    try {
        const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
        for (const ds of datasets) {
            try {
                const data = JSON.parse(ds.data);
                if (!data.profile) continue;
                const current = data.profile.picture_filename || null;
                const target = filename || null;
                if (current !== target || data.profile.picture_propagate != 1) {
                    data.profile.picture_filename = target;
                    data.profile.picture_propagate = 1;
                    db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                }
            } catch (e) {}
        }
    } catch (e) {}
}

// Mirror the filename into every language sibling of the given dataset (same language_group).
// Used when the user is editing a localized variant: uploading/selecting/removing a picture
// should keep the language siblings in sync even if the global "apply to all datasets" flag is off.
// The current dataset is included so its snapshot reflects the change before the user hits Save.
function propagateProfilePictureToSiblings(filename, datasetId) {
    if (!datasetId) return;
    try {
        const anchor = db.prepare('SELECT id, language_group FROM saved_datasets WHERE id = ?').get(datasetId);
        if (!anchor) return;
        const rows = anchor.language_group
            ? db.prepare('SELECT id, data FROM saved_datasets WHERE language_group = ?').all(anchor.language_group)
            : db.prepare('SELECT id, data FROM saved_datasets WHERE id = ?').all(anchor.id);
        for (const ds of rows) {
            try {
                const data = JSON.parse(ds.data);
                if (!data.profile) continue;
                const target = filename || null;
                if ((data.profile.picture_filename || null) !== target) {
                    data.profile.picture_filename = target;
                    db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                }
            } catch (e) {}
        }
    } catch (e) {}
}

// Mirror the picture_crop JSON string (or null to clear) into every saved dataset.
// Used when the picture-propagate flag is on, or when replacing a picture globally.
function propagateProfileCropToDatasets(cropJson) {
    try {
        const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
        const target = cropJson || null;
        for (const ds of datasets) {
            try {
                const data = JSON.parse(ds.data);
                if (!data.profile) continue;
                if ((data.profile.picture_crop || null) !== target) {
                    data.profile.picture_crop = target;
                    db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                }
            } catch (e) {}
        }
    } catch (e) {}
}

// Mirror the crop into every language sibling of the given dataset (same language_group).
// Parallels propagateProfilePictureToSiblings.
function propagateProfileCropToSiblings(cropJson, datasetId) {
    if (!datasetId) return;
    try {
        const anchor = db.prepare('SELECT id, language_group FROM saved_datasets WHERE id = ?').get(datasetId);
        if (!anchor) return;
        const rows = anchor.language_group
            ? db.prepare('SELECT id, data FROM saved_datasets WHERE language_group = ?').all(anchor.language_group)
            : db.prepare('SELECT id, data FROM saved_datasets WHERE id = ?').all(anchor.id);
        const target = cropJson || null;
        for (const ds of rows) {
            try {
                const data = JSON.parse(ds.data);
                if (!data.profile) continue;
                if ((data.profile.picture_crop || null) !== target) {
                    data.profile.picture_crop = target;
                    db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                }
            } catch (e) {}
        }
    } catch (e) {}
}

// Gather current CV data from live DB into a JSON-serializable snapshot
// Look up a per-language section title override. Returns null when none exists.
function getLanguageSectionOverride(sectionKey, language) {
    if (!language) return null;
    try {
        const row = db.prepare('SELECT display_name FROM section_title_overrides WHERE section_key = ? AND language = ?').get(sectionKey, language);
        return row && row.display_name ? row.display_name : null;
    } catch (err) {
        return null;
    }
}

// Resolve the effective display title for a section. Precedence:
//   1. per-dataset override passed in via `datasetOverride`
//   2. per-language override in section_title_overrides
//   3. translated `section.<key>` for the resolved locale
//   4. built-in English default (SECTION_DISPLAY_NAMES) or custom_sections.name fallback
//   5. the raw section key
function resolveSectionTitle(sectionKey, { datasetOverride, language, locale, customNameFallback } = {}) {
    if (datasetOverride && String(datasetOverride).trim() !== '') return datasetOverride;
    const langOverride = getLanguageSectionOverride(sectionKey, language);
    if (langOverride) return langOverride;
    const loc = resolveLocale(locale || language);
    const translationKey = 'section.' + sectionKey;
    const translated = serverT(translationKey, loc);
    if (translated && translated !== translationKey) return translated;
    if (SECTION_DISPLAY_NAMES[sectionKey]) return SECTION_DISPLAY_NAMES[sectionKey];
    if (customNameFallback) return customNameFallback;
    return sectionKey;
}

// Mutate a parsed dataset JSON blob in-place so the given section's per-dataset
// display_name matches the requested value (null clears). Also keeps the `name`
// field in sync so consumers that read `section.name` without re-resolving still
// see the update immediately. Used by the rename endpoint.
function applyDatasetSectionOverride(data, sectionKey, displayName) {
    if (!data || typeof data !== 'object') return;
    const order = Array.isArray(data.sectionOrder) ? data.sectionOrder : [];
    let entry = order.find(s => s && s.key === sectionKey);
    if (!entry) {
        entry = { key: sectionKey, sort_order: 0, visible: true };
        order.push(entry);
        data.sectionOrder = order;
    }
    entry.display_name = displayName;
    if (displayName) entry.name = displayName;

    // Mirror the override onto customSections[].display_name for parity with the
    // structural propagation that already lives in propagateStructure.
    if (Array.isArray(data.customSections)) {
        const cs = data.customSections.find(c => c && c.section_key === sectionKey);
        if (cs) cs.display_name = displayName;
    }
}

function gatherCvData(options = {}) {
    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    const experiences = db.prepare('SELECT * FROM experiences ORDER BY sort_order ASC, start_date DESC').all();
    const certifications = db.prepare('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC').all();
    const education = db.prepare('SELECT * FROM education ORDER BY sort_order ASC, end_date DESC').all();
    const skillCategories = db.prepare('SELECT * FROM skill_categories ORDER BY sort_order ASC').all();
    const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
    const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all();
    const sections = db.prepare('SELECT * FROM section_visibility ORDER BY sort_order ASC').all();
    const customNameMap = {};
    try {
        db.prepare('SELECT section_key, name FROM custom_sections').all().forEach(cs => { customNameMap[cs.section_key] = cs.name; });
    } catch (err) { /* custom_sections table may not exist yet */ }
    const sectionVisibility = {};
    const sectionOrderData = [];
    const language = options.language || null;
    const locale = options.locale || language || null;
    sections.forEach(s => {
        sectionVisibility[s.section_name] = !!s.visible;
        const defaultName = SECTION_DISPLAY_NAMES[s.section_name] || customNameMap[s.section_name] || s.section_name;
        const resolved = resolveSectionTitle(s.section_name, {
            datasetOverride: s.display_name,
            language,
            locale,
            customNameFallback: customNameMap[s.section_name]
        });
        sectionOrderData.push({ key: s.section_name, sort_order: s.sort_order || 0, visible: !!s.visible, display_name: s.display_name || null, name: resolved, default_name: defaultName });
    });
    // Custom sections with items
    let customSections = [];
    try {
        const csRows = db.prepare('SELECT * FROM custom_sections ORDER BY sort_order ASC').all();
        const csItems = db.prepare('SELECT * FROM custom_section_items ORDER BY sort_order ASC').all();
        customSections = csRows.map(s => ({
            ...s,
            visible: !!s.visible,
            metadata: s.metadata ? JSON.parse(s.metadata) : null,
            items: csItems.filter(i => i.section_id === s.id).map(i => ({
                ...i,
                visible: !!i.visible,
                metadata: i.metadata ? JSON.parse(i.metadata) : null
            }))
        }));
    } catch (err) { /* custom_sections table may not exist yet */ }
    return {
        profile,
        experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [], visible: !!e.visible })),
        certifications: certifications.map(c => ({ ...c, visible: !!c.visible })),
        education: education.map(e => ({ ...e, visible: !!e.visible })),
        skills: skillCategories.map(cat => ({ ...cat, visible: !!cat.visible, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) })),
        projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [], visible: !!p.visible })),
        sectionVisibility,
        sectionOrder: sectionOrderData,
        customSections,
        theme: gatherTheme()
    };
}

// Read the theme settings into a normalized object. Used by gatherCvData (so
// every dataset snapshot embeds its own theme) and by SSR HTML injection when
// no default dataset exists.
// Client-side BULLET_STYLES (in public/shared/admin.js) MUST stay in sync with
// this whitelist — the PUT /api/theme handler rejects unknown style IDs.
const ALLOWED_BULLET_STYLES = new Set([
    'triangle','bullet','hollow_circle','square','small_square','diamond','arrow','dash',
    'check','check_circle','done_all','task_alt','star','kid_star','auto_awesome',
    'bolt','trending_up','insights','analytics','leaderboard','rocket_launch','verified',
    'workspace_premium','emoji_events','military_tech','lightbulb','code','terminal',
    'build','engineering','construction','arrow_forward','arrow_right_alt',
    'double_arrow','chevron_right','north_east','public','language','travel_explore',
    'favorite','thumb_up','school','menu_book','business_center','psychology','flag',
    'bookmark','key','palette','hub','groups','handshake','fact_check',
    'local_fire_department','edit_note'
]);

// Bounds for the section-box corner-radius theme field. Must stay in sync
// with SECTION_RADIUS_MIN/MAX in public/shared/admin.js. Values outside the
// range are rejected by PUT /api/theme; null = use default.
const SECTION_RADIUS_MIN = 0;
const SECTION_RADIUS_MAX = 32;

function gatherTheme() {
    const get = (key) => db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value || null;
    const storedBullet = get('themeBulletStyle');
    const storedSectionTitle = get('themeSectionTitleColor');
    const storedRadius = get('themeSectionRadius');
    const parsedRadius = storedRadius == null ? null : parseInt(storedRadius, 10);
    const sectionRadius = (Number.isFinite(parsedRadius) && parsedRadius >= SECTION_RADIUS_MIN && parsedRadius <= SECTION_RADIUS_MAX) ? parsedRadius : null;
    return {
        primary: get('themeColor') || '#0066ff',
        gradientStart: get('themeGradientStart') || null,
        gradientEnd: get('themeGradientEnd') || null,
        fontFamily: get('themeFontFamily') || 'Inter',
        bulletStyle: (storedBullet && ALLOWED_BULLET_STYLES.has(storedBullet)) ? storedBullet : 'triangle',
        sectionTitleColor: (storedSectionTitle && /^#[0-9a-fA-F]{6}$/.test(storedSectionTitle)) ? storedSectionTitle : null,
        sectionRadius
    };
}

// Generate URL-safe slug from dataset name
function generateSlug(name, id) {
    const base = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
    return base ? `${base}-${id}` : `dataset-${id}`;
}

// Propagate structural changes from a source dataset to its language siblings.
// Structure (section order, visibility, custom section layout) is shared across
// language variants; content (text, descriptions) stays per-language.
function propagateStructure(sourceId) {
    try {
        const source = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(sourceId);
        if (!source || !source.language_group) return;

        const siblings = db.prepare('SELECT * FROM saved_datasets WHERE language_group = ? AND id != ?').all(source.language_group, sourceId);
        if (siblings.length === 0) return;

        const srcData = JSON.parse(source.data);

        // Extract structural snapshot from source
        const srcSectionVis = srcData.sectionVisibility || {};
        const srcSectionOrder = (srcData.sectionOrder || []).map(s => ({
            key: s.key, sort_order: s.sort_order, visible: s.visible
        }));
        const srcCustomStructure = (srcData.customSections || []).map(cs => ({
            section_key: cs.section_key,
            layout_type: cs.layout_type,
            icon: cs.icon,
            sort_order: cs.sort_order,
            visible: cs.visible,
            metadata: cs.metadata,
            items: (cs.items || []).map(item => ({
                sort_order: item.sort_order,
                visible: item.visible,
                icon: item.icon,
                image: item.image
            }))
        }));

        const updateSibling = db.transaction(() => {
            for (const sibling of siblings) {
                const sibData = JSON.parse(sibling.data);

                // 1. Propagate sectionVisibility
                sibData.sectionVisibility = { ...srcSectionVis };

                // 2. Propagate sectionOrder (preserve sibling display_name)
                const sibOrderMap = {};
                (sibData.sectionOrder || []).forEach(s => { sibOrderMap[s.key] = s; });
                sibData.sectionOrder = srcSectionOrder.map(s => {
                    const existing = sibOrderMap[s.key] || {};
                    return {
                        ...existing,
                        key: s.key,
                        sort_order: s.sort_order,
                        visible: s.visible,
                        // Preserve sibling's display_name (content) and name/default_name
                        display_name: existing.display_name !== undefined ? existing.display_name : null,
                        name: existing.name || existing.display_name || s.key,
                        default_name: existing.default_name || s.key
                    };
                });

                // 3. Propagate customSections structure
                const sibCsMap = {};
                (sibData.customSections || []).forEach(cs => { sibCsMap[cs.section_key] = cs; });

                sibData.customSections = srcCustomStructure.map(srcCs => {
                    const sibCs = sibCsMap[srcCs.section_key];

                    // Section content from sibling (or empty if new)
                    const sectionName = sibCs ? sibCs.name : (srcData.customSections.find(c => c.section_key === srcCs.section_key)?.name || srcCs.section_key);
                    const displayName = sibCs ? sibCs.display_name : null;

                    // Sync items by position
                    const sibItems = sibCs ? (sibCs.items || []) : [];
                    const srcItems = srcCs.items || [];
                    const mergedItems = srcItems.map((srcItem, idx) => {
                        const sibItem = sibItems[idx] || {};
                        return {
                            // Content from sibling (or empty placeholder)
                            title: sibItem.title !== undefined ? sibItem.title : '',
                            subtitle: sibItem.subtitle !== undefined ? sibItem.subtitle : '',
                            description: sibItem.description !== undefined ? sibItem.description : '',
                            link: sibItem.link !== undefined ? sibItem.link : '',
                            metadata: sibItem.metadata !== undefined ? sibItem.metadata : null,
                            // Structure from source
                            sort_order: srcItem.sort_order,
                            visible: srcItem.visible,
                            icon: srcItem.icon,
                            image: srcItem.image
                        };
                    });

                    return {
                        // Preserve sibling's id if it existed (not critical for JSON blob)
                        ...(sibCs ? { id: sibCs.id } : {}),
                        name: sectionName,
                        section_key: srcCs.section_key,
                        layout_type: srcCs.layout_type,
                        icon: srcCs.icon,
                        sort_order: srcCs.sort_order,
                        visible: srcCs.visible,
                        metadata: srcCs.metadata,
                        display_name: displayName,
                        items: mergedItems
                    };
                });

                db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                    .run(JSON.stringify(sibData), sibling.id);
            }
        });
        updateSibling();
    } catch (err) {
        console.error('Structural propagation error:', err.message);
    }
}

// Resolve a dataset by slug and optional language, returning the best match
function resolveDatasetBySlug(slug, lang, requirePublic) {
    const publicFilter = requirePublic ? ' AND (is_public = 1 OR is_default = 1)' : '';
    let dataset;
    if (lang) {
        dataset = db.prepare(`SELECT * FROM saved_datasets WHERE slug = ? AND language = ?${publicFilter}`).get(slug, lang);
    }
    if (!dataset) {
        // Prefer the default variant, then most recently updated
        dataset = db.prepare(`SELECT * FROM saved_datasets WHERE slug = ?${publicFilter} ORDER BY is_default DESC, updated_at DESC LIMIT 1`).get(slug);
    }
    return dataset || null;
}

// Get siblings list for injecting into HTML pages.
// If any dataset in the group is default, ALL siblings are included (for language switching).
// Otherwise, only public/default siblings are included.
function getDatasetSiblings(dataset) {
    if (!dataset || !dataset.language_group) return [];
    // Check if any member of this language group is the default
    const hasDefault = db.prepare('SELECT id FROM saved_datasets WHERE language_group = ? AND is_default = 1').get(dataset.language_group);
    if (hasDefault) {
        // Default group: include ALL siblings (language switching always works)
        return db.prepare('SELECT id, language FROM saved_datasets WHERE language_group = ? ORDER BY language ASC').all(dataset.language_group);
    }
    return db.prepare('SELECT id, language FROM saved_datasets WHERE language_group = ? AND (is_public = 1 OR id = ?) ORDER BY language ASC').all(dataset.language_group, dataset.id);
}

// Serve admin dataset preview page with language support
function serveAdminDatasetPage(req, res, lang) {
    try {
        const dataset = resolveDatasetBySlug(req.params.slug, lang, false);
        if (!dataset) return res.status(404).send('Dataset not found');

        const data = JSON.parse(dataset.data);
        const name = data.profile?.name || dataset.name;
        const bio = data.profile?.bio || '';
        const description = stripBoldMarkers(bio).substring(0, 160).replace(/\n/g, ' ');
        const dsLang = dataset.language || 'en';

        let html = fs.readFileSync(path.join(__dirname, '../public-readonly/index.html'), 'utf8');
        html = html.replace(/<html lang="[^"]*"/, `<html lang="${dsLang}"`);
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${name} - CV (${dataset.name})</title>`);
        html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`);

        // Inject dataset context for client
        const siblings = dataset.language_group
            ? db.prepare('SELECT id, language FROM saved_datasets WHERE language_group = ? ORDER BY language ASC').all(dataset.language_group)
            : [{ id: dataset.id, language: dsLang }];
        const datasetScript = `<script>window.DATASET_ID = ${dataset.id}; window.DATASET_SLUG = "${dataset.slug}"; window.DATASET_LANG = "${dsLang}"; window.DATASET_PREVIEW = true; window.DATASET_SIBLINGS = ${JSON.stringify(siblings)};</script>`;
        html = html.replace('</head>', `${datasetScript}</head>`);

        res.type('html').send(html);
    } catch (err) {
        if (err.message?.includes('no such column')) return res.status(404).send('Versioned datasets not available');
        res.status(500).send('Error loading dataset');
    }
}

// Known analytics providers and their required companion domains
// These domains are used internally by the provider scripts for data collection,
// beacons, and API calls but don't appear in the user-pasted snippet
const ANALYTICS_COMPANION_DOMAINS = {
    'www.googletagmanager.com': [
        'https://www.google-analytics.com',
        'https://analytics.google.com',
        'https://region1.google-analytics.com',
        'https://stats.g.doubleclick.net'
    ],
    'www.google-analytics.com': [
        'https://www.googletagmanager.com',
        'https://analytics.google.com',
        'https://region1.google-analytics.com',
        'https://stats.g.doubleclick.net'
    ],
    'plausible.io': [
        'https://plausible.io'
    ],
    'cdn.matomo.cloud': [
        'https://*.matomo.cloud'
    ]
};

// Extract domains from tracking code and add known companion domains
function getTrackingDomains() {
    try {
        const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('trackingCode');
        if (!setting || !setting.value) return [];

        const domains = new Set();
        const srcMatches = setting.value.match(/src\s*=\s*["'](https?:\/\/[^"'\/]+)/gi);
        if (srcMatches) {
            srcMatches.forEach(m => {
                const urlMatch = m.match(/["'](https?:\/\/[^"'\/]+)/i);
                if (urlMatch) domains.add(urlMatch[1]);
            });
        }
        const urlMatches = setting.value.match(/https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}/g);
        if (urlMatches) {
            urlMatches.forEach(url => {
                try { domains.add(new URL(url).origin); } catch (e) { /* skip */ }
            });
        }

        // Add companion domains for known analytics providers
        domains.forEach(d => {
            try {
                const hostname = new URL(d).hostname;
                if (ANALYTICS_COMPANION_DOMAINS[hostname]) {
                    ANALYTICS_COMPANION_DOMAINS[hostname].forEach(cd => domains.add(cd));
                }
            } catch (e) { /* skip */ }
        });

        return Array.from(domains);
    } catch (err) {
        console.error('Error reading tracking domains:', err.message);
        return [];
    }
}

if (PUBLIC_ONLY) {
    const publicApp = express();
    publicApp.use(cors({ methods: ['GET'], credentials: false }));
    publicApp.use((req, res, next) => { if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' }); next(); });
    
    const rateLimit = {};
    publicApp.use((req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        if (!rateLimit[ip]) rateLimit[ip] = { count: 1, start: now };
        else if (now - rateLimit[ip].start > 60000) rateLimit[ip] = { count: 1, start: now };
        else { rateLimit[ip].count++; if (rateLimit[ip].count > 200) return res.status(429).json({ error: 'Too many requests' }); }
        next();
    });

    console.log(`[CSP] Tracking domains detected: ${getTrackingDomains().length > 0 ? getTrackingDomains().join(', ') : '(none)'}`);

    publicApp.use((req, res, next) => {
        const trackingDomains = getTrackingDomains();
        const trackingStr = trackingDomains.length > 0 ? ' ' + trackingDomains.join(' ') : '';
        const cfStr = ' https://static.cloudflareinsights.com';

        const csp = [
            `default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://flagcdn.com`,
            `script-src 'self' 'unsafe-inline'${cfStr}${trackingStr}`,
            `script-src-elem 'self' 'unsafe-inline'${cfStr}${trackingStr}`,
            `worker-src 'self' blob:${trackingStr}`,
            `connect-src 'self'${cfStr}${trackingStr}`,
            `img-src 'self' https://flagcdn.com data:${trackingStr}`
        ].join('; ');

        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Content-Security-Policy', csp);
        next();
    });

    publicApp.get('/sitemap.xml', (req, res) => {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
        res.setHeader('Content-Type', 'application/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${protocol}://${host}/</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>`);
    });

    publicApp.get('/robots.txt', (req, res) => {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
        const robotsMeta = db.prepare('SELECT value FROM settings WHERE key = ?').get('robotsMeta');
        const metaValue = robotsMeta?.value || 'index, follow';
        const isNoIndex = metaValue.includes('noindex');
        res.setHeader('Content-Type', 'text/plain');
        if (isNoIndex) {
            res.send(`User-agent: *\nDisallow: /`);
        } else {
            res.send(`User-agent: *\nAllow: /\nSitemap: ${protocol}://${host}/sitemap.xml\nDisallow: /api/`);
        }
    });

    publicApp.use('/shared', express.static(path.join(__dirname, '../public/shared')));
    // Favicon and icons (public uses icon-public.png with eye badge)
    const publicIconPathA = path.join(__dirname, '../icon-public.png');
    publicApp.get('/favicon.ico', (req, res) => res.sendFile(publicIconPathA));
    publicApp.get('/favicon.png', (req, res) => res.sendFile(publicIconPathA));
    publicApp.get('/apple-touch-icon.png', (req, res) => res.sendFile(publicIconPathA));
    publicApp.get('/', (req, res) => { servePublicIndex(req, res); });
    publicApp.use(express.static(path.join(__dirname, '../public-readonly'), { index: false }));
    publicApp.use('/uploads', express.static(uploadsPath));

    publicApp.get('/api/profile', (req, res) => { res.json(db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages, profile_picture_enabled, picture_filename, picture_crop, open_to_work FROM profile WHERE id = 1').get() || {}); });
    publicApp.get('/api/sections', (req, res) => { const sections = db.prepare('SELECT * FROM section_visibility').all(); const result = {}; sections.forEach(s => { result[s.section_name] = !!s.visible; }); res.json(result); });
    publicApp.get('/api/sections/order', (req, res) => {
        const requestedLang = req.query.language || null;
        const sections = db.prepare('SELECT * FROM section_visibility ORDER BY sort_order ASC').all();
        const customSections = db.prepare('SELECT * FROM custom_sections ORDER BY sort_order ASC').all();
        const customNameMap = {};
        customSections.forEach(cs => { customNameMap[cs.section_key] = cs.name; });
        const sectionKeys = new Set(sections.map(s => s.section_name));
        customSections.forEach(cs => {
            if (!sectionKeys.has(cs.section_key)) {
                sections.push({ section_name: cs.section_key, visible: cs.visible ? 1 : 0, sort_order: cs.sort_order || 0, print_visible: 1, print_compact: 0, display_name: null });
            }
        });
        sections.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const defaultName = (s) => SECTION_DISPLAY_NAMES[s.section_name] || customNameMap[s.section_name] || s.section_name;
        res.json(sections.map(s => ({
            key: s.section_name,
            name: resolveSectionTitle(s.section_name, {
                datasetOverride: null,
                language: requestedLang,
                locale: requestedLang,
                customNameFallback: customNameMap[s.section_name]
            }),
            default_name: defaultName(s),
            visible: !!s.visible,
            print_visible: s.print_visible !== 0,
            print_compact: s.print_compact === 1,
            sort_order: s.sort_order || 0,
            is_custom: !DEFAULT_SECTION_ORDER.includes(s.section_name)
        })));
    });
    publicApp.get('/api/settings', (req, res) => { const settings = db.prepare('SELECT * FROM settings').all(); const result = {}; settings.forEach(s => { result[s.key] = s.value; }); if (isTrackingConsentRequired()) delete result.trackingCode; res.json(result); });
    publicApp.get('/api/settings/trackingCode', (req, res) => { if (isTrackingConsentRequired()) return res.json({ value: null, consentRequired: true }); const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('trackingCode'); res.json({ value: setting?.value || null }); });
    publicApp.get('/api/settings/:key', (req, res) => { const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key); res.json({ value: setting?.value || null }); });
    publicApp.get('/api/experiences', (req, res) => { const experiences = db.prepare('SELECT id, job_title, company_name, start_date, end_date, location, country_code, highlights, summary, logo_filename FROM experiences WHERE visible = 1 ORDER BY sort_order ASC, start_date DESC').all(); res.json(experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [], visible: true }))); });
    publicApp.get('/api/certifications', (req, res) => { res.json(db.prepare('SELECT name, provider, issue_date, expiry_date, credential_id, logo_filename FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all().map(c => ({ ...c, visible: true }))); });
    publicApp.get('/api/education', (req, res) => { res.json(db.prepare('SELECT degree_title, institution_name, start_date, end_date, description FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all().map(e => ({ ...e, visible: true }))); });
    publicApp.get('/api/skills', (req, res) => { const categories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); res.json(categories.map(cat => ({ ...cat, visible: true, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) }))); });
    publicApp.get('/api/projects', (req, res) => { res.json(db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all().map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [], visible: true }))); });
    publicApp.get('/api/timeline', (req, res) => {
        const experiences = db.prepare('SELECT id, company_name, job_title, start_date, end_date, country_code, logo_filename FROM experiences WHERE visible = 1 ORDER BY start_date ASC').all().map(exp => ({ id: exp.id, company: exp.company_name, role: exp.job_title, period: formatPeriod(exp.start_date, exp.end_date), start_date: exp.start_date, end_date: exp.end_date, countryCode: exp.country_code || '', visible: true, logo: exp.logo_filename || null }));
        const timelineSections = db.prepare(`SELECT id, metadata FROM custom_sections WHERE layout_type = 'timeline' AND visible = 1`).all().filter(s => { const meta = s.metadata ? JSON.parse(s.metadata) : {}; return meta.show_on_timeline; });
        const customItems = [];
        for (const section of timelineSections) {
            const items = db.prepare(`SELECT * FROM custom_section_items WHERE section_id = ? AND visible = 1 ORDER BY sort_order ASC`).all(section.id);
            for (const item of items) {
                const meta = item.metadata ? JSON.parse(item.metadata) : {};
                customItems.push({ id: `cs_${item.id}`, company: item.subtitle || '', role: item.title || '', period: formatPeriod(meta.start_date, meta.end_date), start_date: meta.start_date || '', end_date: meta.end_date || '', countryCode: meta.country_code || '', visible: true, logo: item.image || null });
            }
        }
        res.json([...experiences, ...customItems]);
    });
    publicApp.get('/api/custom-sections', (req, res) => {
        const sections = db.prepare('SELECT id, name, section_key, layout_type, icon, sort_order, metadata FROM custom_sections WHERE visible = 1 ORDER BY sort_order ASC').all();
        const items = db.prepare('SELECT * FROM custom_section_items WHERE visible = 1 ORDER BY sort_order ASC').all();
        res.json(sections.map(s => ({ ...s, visible: true, metadata: s.metadata ? JSON.parse(s.metadata) : null, items: items.filter(i => i.section_id === s.id).map(i => ({ ...i, visible: true, metadata: i.metadata ? JSON.parse(i.metadata) : null })) })));
    });
    publicApp.get('/api/layout-types', (req, res) => { res.json(LAYOUT_TYPES); });
    publicApp.get('/api/social-platforms', (req, res) => { res.json(SOCIAL_PLATFORMS); });
    publicApp.get('/api/cv', (req, res) => {
        const profile = db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages, profile_picture_enabled, picture_filename, picture_crop, open_to_work FROM profile WHERE id = 1').get();
        const experiences = db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights, summary, logo_filename FROM experiences WHERE visible = 1 ORDER BY sort_order ASC, start_date DESC').all();
        const certifications = db.prepare('SELECT name, provider, issue_date, expiry_date, credential_id, logo_filename FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all();
        const education = db.prepare('SELECT degree_title, institution_name, start_date, end_date, description, logo_filename FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all();
        const skillCategories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all();
        const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
        const projects = db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all();
        const sectionOrder = db.prepare('SELECT section_name, sort_order FROM section_visibility WHERE visible = 1 ORDER BY sort_order ASC').all();
        res.json({ profile, experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })), certifications, education, skills: skillCategories.map(cat => ({ ...cat, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) })), projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] })), sectionOrder: sectionOrder.map(s => s.section_name) });
    });

    // Public versioned CV routes (language-specific must come before generic)
    publicApp.get('/v/:slug/:lang', (req, res) => { serveDatasetPage(req, res, req.params.lang); });
    publicApp.get('/v/:slug', (req, res) => { serveDatasetPage(req, res); });
    publicApp.get('/api/datasets/slug/:slug/:lang', (req, res) => { serveDatasetData(req, res); });
    publicApp.get('/api/datasets/slug/:slug', (req, res) => { serveDatasetData(req, res); });
    publicApp.get('/api/datasets/id/:id', (req, res) => { serveDatasetDataById(req, res); });
    // Clean language URLs for default dataset: /en, /de, /fr, etc.
    publicApp.get('/:lang([a-z]{2})', (req, res) => { req.query.lang = req.params.lang; servePublicIndex(req, res); });

    publicApp.get('*', (req, res) => { servePublicIndex(req, res); });
    publicApp.listen(PUBLIC_PORT, '0.0.0.0', () => { console.log(`CV Manager (Public Read-Only) running at http://localhost:${PUBLIC_PORT}`); });

} else {
    // ADMIN Mode
    app.get('/api/profile', (req, res) => { res.json(db.prepare('SELECT * FROM profile WHERE id = 1').get()); });
    app.put('/api/profile', (req, res) => {
        const { name, initials, title, subtitle, bio, location, linkedin, email, phone, languages, visible, profile_picture_enabled, picture_propagate, open_to_work } = req.body;
        db.prepare(`UPDATE profile SET name = ?, initials = ?, title = ?, subtitle = ?, bio = ?, location = ?, linkedin = ?, email = ?, phone = ?, languages = ?, visible = ?, profile_picture_enabled = ?, picture_propagate = ?, open_to_work = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`).run(name, initials, title, subtitle, bio, location, linkedin, email, phone, languages, visible ? 1 : 0, profile_picture_enabled ? 1 : 0, picture_propagate === undefined ? 1 : (picture_propagate ? 1 : 0), open_to_work ? 1 : 0);
        res.json({ success: true });
    });

    // Profile picture upload — stores as profile_<timestamp>.<ext> in the library.
    // When profile.picture_propagate is on, the new filename is mirrored into every saved dataset snapshot.
    const pictureStorage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsPath),
        filename: (req, file, cb) => { const ext = path.extname(file.originalname).toLowerCase() || '.jpg'; cb(null, `profile_${Date.now()}${ext}`); }
    });
    const pictureUpload = multer({ storage: pictureStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => { const allowed = ['image/jpeg', 'image/png', 'image/webp']; cb(null, allowed.includes(file.mimetype)); } });
    app.post('/api/profile/picture', pictureUpload.single('picture'), (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const filename = req.file.filename;
        const currentDatasetId = req.body && req.body.current_dataset_id ? Number(req.body.current_dataset_id) : null;
        const runUpdate = db.transaction(() => {
            // New upload invalidates the crop — reset to defaults (NULL means "no crop").
            db.prepare('UPDATE profile SET picture_filename = ?, picture_crop = NULL WHERE id = 1').run(filename);
            const prof = db.prepare('SELECT picture_propagate FROM profile WHERE id = 1').get();
            if (prof && prof.picture_propagate == 1) {
                propagateProfilePictureToDatasets(filename);
                propagateProfileCropToDatasets(null);
            } else {
                propagateProfilePictureToSiblings(filename, currentDatasetId);
                propagateProfileCropToSiblings(null, currentDatasetId);
            }
        });
        try { runUpdate(); } catch (err) { return res.status(500).json({ error: err.message }); }
        res.json({ success: true, filename });
    });
    app.delete('/api/profile/picture', (req, res) => {
        const currentDatasetId = req.query.current_dataset_id ? Number(req.query.current_dataset_id) : null;
        const runUpdate = db.transaction(() => {
            db.prepare('UPDATE profile SET picture_filename = NULL, picture_crop = NULL WHERE id = 1').run();
            const prof = db.prepare('SELECT picture_propagate FROM profile WHERE id = 1').get();
            if (prof && prof.picture_propagate == 1) {
                propagateProfilePictureToDatasets(null);
                propagateProfileCropToDatasets(null);
            } else {
                propagateProfilePictureToSiblings(null, currentDatasetId);
                propagateProfileCropToSiblings(null, currentDatasetId);
            }
        });
        try { runUpdate(); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
    });
    // Reuse an existing picture from the library without re-uploading
    app.put('/api/profile/picture/select', express.json(), (req, res) => {
        const { filename, current_dataset_id } = req.body;
        if (!filename) return res.status(400).json({ error: 'filename is required' });
        if (!isValidProfilePictureName(filename)) return res.status(400).json({ error: 'Invalid filename' });
        if (!fs.existsSync(path.join(uploadsPath, filename))) return res.status(404).json({ error: 'Picture file not found' });
        const currentDatasetId = current_dataset_id ? Number(current_dataset_id) : null;
        const runUpdate = db.transaction(() => {
            db.prepare('UPDATE profile SET picture_filename = ?, picture_crop = NULL WHERE id = 1').run(filename);
            const prof = db.prepare('SELECT picture_propagate FROM profile WHERE id = 1').get();
            if (prof && prof.picture_propagate == 1) {
                propagateProfilePictureToDatasets(filename);
                propagateProfileCropToDatasets(null);
            } else {
                propagateProfilePictureToSiblings(filename, currentDatasetId);
                propagateProfileCropToSiblings(null, currentDatasetId);
            }
        });
        try { runUpdate(); res.json({ success: true, filename }); } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Save the crop framing (LinkedIn-style zoom + pan) for the current profile picture.
    // Expects { offsetX, offsetY, zoom, applyToAll?, current_dataset_id? }. Offsets are
    // percent deltas from centre (-100..100), zoom is a scale factor (1..4). When
    // applyToAll is omitted, falls back to the stored picture_propagate flag so the UI
    // toggle stays authoritative without a redundant DB read on the client.
    app.put('/api/profile/picture/crop', express.json(), (req, res) => {
        const { offsetX, offsetY, zoom, applyToAll, current_dataset_id } = req.body || {};
        const normalized = normalizeCrop({ offsetX, offsetY, zoom });
        if (!normalized) return res.status(400).json({ error: 'Invalid crop payload' });
        const live = db.prepare('SELECT picture_filename, picture_propagate FROM profile WHERE id = 1').get();
        if (!live || !live.picture_filename) return res.status(400).json({ error: 'No profile picture set' });
        const cropJson = JSON.stringify(normalized);
        const ctxId = current_dataset_id ? Number(current_dataset_id) : null;
        const globalApply = (applyToAll !== undefined) ? !!applyToAll : (live.picture_propagate == 1);
        const tx = db.transaction(() => {
            db.prepare('UPDATE profile SET picture_crop = ? WHERE id = 1').run(cropJson);
            if (globalApply) propagateProfileCropToDatasets(cropJson);
            else propagateProfileCropToSiblings(cropJson, ctxId);
        });
        try { tx(); res.json({ success: true, crop: normalized }); }
        catch (err) { res.status(500).json({ error: err.message }); }
    });

    // List all profile pictures available for reuse (scans filesystem + cross-references live + datasets)
    app.get('/api/profile-pictures', (req, res) => {
        let files = [];
        try { files = fs.readdirSync(uploadsPath).filter(f => f.startsWith('profile_')); } catch (e) {}
        const inUseSet = new Set();
        const live = db.prepare('SELECT picture_filename FROM profile WHERE id = 1').get();
        if (live && live.picture_filename) inUseSet.add(live.picture_filename);
        try {
            const datasets = db.prepare('SELECT data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.profile && data.profile.picture_filename) inUseSet.add(data.profile.picture_filename);
                } catch (e) {}
            }
        } catch (e) {}
        res.json(files.map(f => ({ filename: f, in_use: inUseSet.has(f) })));
    });
    // Delete an unused profile picture file
    app.delete('/api/profile-pictures/:filename', (req, res) => {
        const filename = req.params.filename;
        if (!isValidProfilePictureName(filename)) return res.status(400).json({ error: 'Invalid filename' });
        const filePath = path.join(uploadsPath, filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
        const live = db.prepare('SELECT picture_filename FROM profile WHERE id = 1').get();
        if (live && live.picture_filename === filename) return res.status(409).json({ error: 'Picture is in use by the current profile' });
        try {
            const datasets = db.prepare('SELECT data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.profile && data.profile.picture_filename === filename) return res.status(409).json({ error: 'Picture is in use by a saved dataset' });
                } catch (e) {}
            }
        } catch (e) {}
        try { fs.unlinkSync(filePath); } catch (e) { return res.status(500).json({ error: 'Failed to delete file' }); }
        res.json({ success: true });
    });
    // Apply a picture to all saved datasets + enable propagation flag
    app.post('/api/profile-pictures/apply-global', express.json(), (req, res) => {
        const { picture_filename } = req.body;
        if (picture_filename && !isValidProfilePictureName(picture_filename)) return res.status(400).json({ error: 'Invalid filename' });
        if (picture_filename && !fs.existsSync(path.join(uploadsPath, picture_filename))) return res.status(404).json({ error: 'Picture file not found' });
        const runUpdate = db.transaction(() => {
            db.prepare('UPDATE profile SET picture_filename = ?, picture_propagate = 1 WHERE id = 1').run(picture_filename || null);
            propagateProfilePictureToDatasets(picture_filename || null);
        });
        try { runUpdate(); res.json({ success: true, filename: picture_filename || null }); } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Company logo upload
    const logoStorage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsPath), filename: (req, file, cb) => { const ext = path.extname(file.originalname).toLowerCase() || '.jpg'; cb(null, `logo_${req.params.id}_${Date.now()}${ext}`); } });
    const logoUpload = multer({ storage: logoStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => { const allowed = ['image/jpeg', 'image/png', 'image/webp']; cb(null, allowed.includes(file.mimetype)); } });
    app.post('/api/experiences/:id/logo', logoUpload.single('logo'), (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const exp = db.prepare('SELECT logo_filename FROM experiences WHERE id = ?').get(req.params.id);
        if (!exp) return res.status(404).json({ error: 'Experience not found' });
        // Keep old file on disk for reuse via the logo picker
        db.prepare('UPDATE experiences SET logo_filename = ? WHERE id = ?').run(req.file.filename, req.params.id);
        res.json({ success: true, filename: req.file.filename });
    });
    app.delete('/api/experiences/:id/logo', (req, res) => {
        const exp = db.prepare('SELECT logo_filename FROM experiences WHERE id = ?').get(req.params.id);
        if (!exp) return res.status(404).json({ error: 'Experience not found' });
        // Unlink from experience only — file stays on disk for reuse via the logo picker
        db.prepare('UPDATE experiences SET logo_filename = NULL WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    // Reuse an existing logo file for a different experience
    app.put('/api/experiences/:id/logo', express.json(), (req, res) => {
        const { filename } = req.body;
        if (!filename) return res.status(400).json({ error: 'Filename is required' });
        const exp = db.prepare('SELECT logo_filename FROM experiences WHERE id = ?').get(req.params.id);
        if (!exp) return res.status(404).json({ error: 'Experience not found' });
        // Verify the file actually exists in uploads
        if (!fs.existsSync(path.join(uploadsPath, filename))) return res.status(404).json({ error: 'Logo file not found' });
        db.prepare('UPDATE experiences SET logo_filename = ? WHERE id = ?').run(filename, req.params.id);
        res.json({ success: true, filename });
    });

    // List all logos available for reuse (scans filesystem + resolves company names)
    app.get('/api/logos', (req, res) => {
        // Scan uploads dir for all logo files
        let files = [];
        try { files = fs.readdirSync(uploadsPath).filter(f => f.startsWith('logo_')); } catch (e) {}
        if (!files.length) return res.json([]);
        // Build filename → company map and in-use set from current experiences AND saved datasets
        const companyMap = {};
        const inUseSet = new Set();
        db.prepare('SELECT logo_filename, company_name FROM experiences WHERE logo_filename IS NOT NULL').all()
            .forEach(r => { if (r.logo_filename) { inUseSet.add(r.logo_filename); if (r.company_name) companyMap[r.logo_filename] = r.company_name; } });
        db.prepare('SELECT logo_filename, institution_name FROM education WHERE logo_filename IS NOT NULL').all()
            .forEach(r => { if (r.logo_filename) { inUseSet.add(r.logo_filename); if (r.institution_name && !companyMap[r.logo_filename]) companyMap[r.logo_filename] = r.institution_name; } });
        db.prepare('SELECT logo_filename, provider FROM certifications WHERE logo_filename IS NOT NULL').all()
            .forEach(r => { if (r.logo_filename) { inUseSet.add(r.logo_filename); if (r.provider && !companyMap[r.logo_filename]) companyMap[r.logo_filename] = r.provider; } });
        // Also check saved datasets for both usage and company/institution/provider names
        try {
            const datasets = db.prepare('SELECT data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.experiences) {
                        for (const exp of data.experiences) {
                            if (exp.logo_filename) {
                                inUseSet.add(exp.logo_filename);
                                if (exp.company_name && !companyMap[exp.logo_filename]) {
                                    companyMap[exp.logo_filename] = exp.company_name;
                                }
                            }
                        }
                    }
                    if (data.education) {
                        for (const edu of data.education) {
                            if (edu.logo_filename) {
                                inUseSet.add(edu.logo_filename);
                                if (edu.institution_name && !companyMap[edu.logo_filename]) {
                                    companyMap[edu.logo_filename] = edu.institution_name;
                                }
                            }
                        }
                    }
                    if (data.certifications) {
                        for (const cert of data.certifications) {
                            if (cert.logo_filename) {
                                inUseSet.add(cert.logo_filename);
                                if (cert.provider && !companyMap[cert.logo_filename]) {
                                    companyMap[cert.logo_filename] = cert.provider;
                                }
                            }
                        }
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json(files.map(f => ({ filename: f, company: companyMap[f] || null, in_use: inUseSet.has(f) })));
    });

    // Delete an unused logo file
    app.delete('/api/logos/:filename', (req, res) => {
        const filename = req.params.filename;
        if (!filename || !filename.startsWith('logo_')) return res.status(400).json({ error: 'Invalid filename' });
        const filePath = path.join(uploadsPath, filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
        // Check if in use by current experiences/education/certifications or any saved dataset
        const expRef = db.prepare('SELECT COUNT(*) as cnt FROM experiences WHERE logo_filename = ?').get(filename).cnt;
        if (expRef > 0) return res.status(409).json({ error: 'Logo is in use by current experiences' });
        const eduRef = db.prepare('SELECT COUNT(*) as cnt FROM education WHERE logo_filename = ?').get(filename).cnt;
        if (eduRef > 0) return res.status(409).json({ error: 'Logo is in use by current education entries' });
        const certRef = db.prepare('SELECT COUNT(*) as cnt FROM certifications WHERE logo_filename = ?').get(filename).cnt;
        if (certRef > 0) return res.status(409).json({ error: 'Logo is in use by current certifications' });
        try {
            const datasets = db.prepare('SELECT data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.experiences && data.experiences.some(e => e.logo_filename === filename)) {
                        return res.status(409).json({ error: 'Logo is in use by a saved dataset' });
                    }
                    if (data.education && data.education.some(e => e.logo_filename === filename)) {
                        return res.status(409).json({ error: 'Logo is in use by a saved dataset' });
                    }
                    if (data.certifications && data.certifications.some(c => c.logo_filename === filename)) {
                        return res.status(409).json({ error: 'Logo is in use by a saved dataset' });
                    }
                } catch (e) {}
            }
        } catch (e) {}
        try { fs.unlinkSync(filePath); } catch (e) { return res.status(500).json({ error: 'Failed to delete file' }); }
        res.json({ success: true });
    });

    // Apply a logo globally to all experiences with the same company name (current + datasets)
    // Also sets logo_propagate=1 on all matching experiences
    app.post('/api/logos/apply-global', express.json(), (req, res) => {
        const { company_name, logo_filename } = req.body;
        if (!company_name || !logo_filename) return res.status(400).json({ error: 'company_name and logo_filename are required' });
        if (!fs.existsSync(path.join(uploadsPath, logo_filename))) return res.status(404).json({ error: 'Logo file not found' });
        let updatedCurrent = 0;
        let updatedDatasets = 0;
        // Update current experiences — set both logo and propagate flag
        const result = db.prepare('UPDATE experiences SET logo_filename = ?, logo_propagate = 1 WHERE company_name = ?').run(logo_filename, company_name);
        updatedCurrent = result.changes;
        // Update saved datasets — sync both logo_filename and logo_propagate
        try {
            const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.experiences) {
                        let changed = false;
                        for (const exp of data.experiences) {
                            if (exp.company_name === company_name) {
                                if (exp.logo_filename !== logo_filename) {
                                    exp.logo_filename = logo_filename;
                                    changed = true;
                                    updatedDatasets++;
                                }
                                if (!exp.logo_propagate) {
                                    exp.logo_propagate = 1;
                                    changed = true;
                                }
                            }
                        }
                        if (changed) {
                            db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                        }
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ success: true, updated_current: updatedCurrent, updated_datasets: updatedDatasets });
    });

    // Remove a logo globally from all experiences with the same company name (current + datasets)
    // Keeps logo_propagate=1 so future additions will still propagate if re-enabled
    app.post('/api/logos/remove-global', express.json(), (req, res) => {
        const { company_name } = req.body;
        if (!company_name) return res.status(400).json({ error: 'company_name is required' });
        let updatedCurrent = 0;
        let updatedDatasets = 0;
        // Remove logo from current experiences (keep propagate flag)
        const result = db.prepare('UPDATE experiences SET logo_filename = NULL WHERE company_name = ?').run(company_name);
        updatedCurrent = result.changes;
        // Update saved datasets
        try {
            const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.experiences) {
                        let changed = false;
                        for (const exp of data.experiences) {
                            if (exp.company_name === company_name && exp.logo_filename) {
                                exp.logo_filename = null;
                                changed = true;
                                updatedDatasets++;
                            }
                        }
                        if (changed) {
                            db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                        }
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ success: true, updated_current: updatedCurrent, updated_datasets: updatedDatasets });
    });

    // Update logo_propagate flag for all experiences with the same company name (current + datasets)
    app.post('/api/logos/set-propagate', express.json(), (req, res) => {
        const { company_name, propagate } = req.body;
        if (!company_name) return res.status(400).json({ error: 'company_name is required' });
        const flag = propagate ? 1 : 0;
        const result = db.prepare('UPDATE experiences SET logo_propagate = ? WHERE company_name = ?').run(flag, company_name);
        // Sync to saved datasets
        try {
            const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.experiences) {
                        let changed = false;
                        for (const exp of data.experiences) {
                            if (exp.company_name === company_name && (exp.logo_propagate ? 1 : 0) !== flag) {
                                exp.logo_propagate = flag;
                                changed = true;
                            }
                        }
                        if (changed) {
                            db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                        }
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ success: true, updated: result.changes });
    });

    // Look up which logo is used for a given company name (current experiences + datasets)
    app.get('/api/logos/by-company', (req, res) => {
        const name = (req.query.name || '').trim();
        if (!name) return res.json({ logo_filename: null });
        // Check current experiences first
        const exp = db.prepare('SELECT logo_filename, logo_propagate FROM experiences WHERE company_name = ? AND logo_filename IS NOT NULL LIMIT 1').get(name);
        if (exp && exp.logo_filename && fs.existsSync(path.join(uploadsPath, exp.logo_filename))) {
            return res.json({ logo_filename: exp.logo_filename, logo_propagate: !!exp.logo_propagate });
        }
        // Fall back to saved datasets
        try {
            const datasets = db.prepare('SELECT data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.experiences) {
                        const match = data.experiences.find(e => e.company_name === name && e.logo_filename);
                        if (match && fs.existsSync(path.join(uploadsPath, match.logo_filename))) {
                            return res.json({ logo_filename: match.logo_filename });
                        }
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ logo_filename: null });
    });

    app.get('/api/settings', (req, res) => { const settings = db.prepare('SELECT * FROM settings').all(); const result = {}; settings.forEach(s => { result[s.key] = s.value; }); res.json(result); });
    app.get('/api/settings/:key', (req, res) => { const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key); res.json({ value: setting?.value || null }); });
    app.put('/api/settings/:key', (req, res) => { db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(req.params.key, req.body.value); res.json({ success: true }); });

    // Composite theme endpoints. The legacy /api/settings/themeColor still works
    // for backward compatibility, but the picker now uses these to write the
    // three theme fields together and (optionally) propagate to all datasets.
    app.get('/api/theme', (req, res) => {
        try { res.json(gatherTheme()); } catch (err) { res.status(500).json({ error: err.message }); }
    });
    app.put('/api/theme', (req, res) => {
        const { primary, gradientStart, gradientEnd, fontFamily, bulletStyle, sectionTitleColor, sectionRadius, applyToAll, currentDatasetId } = req.body || {};
        if (!primary || !/^#[0-9a-fA-F]{6}$/.test(primary)) return res.status(400).json({ error: 'Invalid primary color' });
        if (gradientStart !== null && gradientStart !== undefined && !/^#[0-9a-fA-F]{6}$/.test(gradientStart)) return res.status(400).json({ error: 'Invalid gradient start color' });
        if (gradientEnd !== null && gradientEnd !== undefined && !/^#[0-9a-fA-F]{6}$/.test(gradientEnd)) return res.status(400).json({ error: 'Invalid gradient end color' });
        if (bulletStyle !== null && bulletStyle !== undefined && !ALLOWED_BULLET_STYLES.has(bulletStyle)) return res.status(400).json({ error: 'Invalid bullet style' });
        if (sectionTitleColor !== null && sectionTitleColor !== undefined && sectionTitleColor !== '' && !/^#[0-9a-fA-F]{6}$/.test(sectionTitleColor)) return res.status(400).json({ error: 'Invalid section title color' });
        if (sectionRadius !== null && sectionRadius !== undefined) {
            const n = typeof sectionRadius === 'number' ? sectionRadius : parseInt(sectionRadius, 10);
            if (!Number.isFinite(n) || !Number.isInteger(n) || n < SECTION_RADIUS_MIN || n > SECTION_RADIUS_MAX) {
                return res.status(400).json({ error: 'Invalid section radius' });
            }
        }
        const font = typeof fontFamily === 'string' && fontFamily.trim() ? fontFamily.trim() : 'Inter';
        const bullet = (bulletStyle && ALLOWED_BULLET_STYLES.has(bulletStyle)) ? bulletStyle : 'triangle';
        const sectionTitle = (sectionTitleColor && /^#[0-9a-fA-F]{6}$/.test(sectionTitleColor)) ? sectionTitleColor : null;
        const radiusNum = (sectionRadius === null || sectionRadius === undefined) ? null : (typeof sectionRadius === 'number' ? sectionRadius : parseInt(sectionRadius, 10));
        const radius = (Number.isInteger(radiusNum) && radiusNum >= SECTION_RADIUS_MIN && radiusNum <= SECTION_RADIUS_MAX) ? radiusNum : null;
        const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        try {
            const writeAll = db.transaction(() => {
                upsert.run('themeColor', primary);
                upsert.run('themeFontFamily', font);
                upsert.run('themeBulletStyle', bullet);
                if (gradientStart) upsert.run('themeGradientStart', gradientStart);
                else db.prepare('DELETE FROM settings WHERE key = ?').run('themeGradientStart');
                if (gradientEnd) upsert.run('themeGradientEnd', gradientEnd);
                else db.prepare('DELETE FROM settings WHERE key = ?').run('themeGradientEnd');
                if (sectionTitle) upsert.run('themeSectionTitleColor', sectionTitle);
                else db.prepare('DELETE FROM settings WHERE key = ?').run('themeSectionTitleColor');
                if (radius !== null) upsert.run('themeSectionRadius', String(radius));
                else db.prepare('DELETE FROM settings WHERE key = ?').run('themeSectionRadius');
                upsert.run('applyThemeToAllDatasets', applyToAll ? 'true' : 'false');
                const themeBlob = { primary, gradientStart: gradientStart || null, gradientEnd: gradientEnd || null, fontFamily: font, bulletStyle: bullet, sectionTitleColor: sectionTitle, sectionRadius: radius };
                const update = db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
                const writeTheme = (id, dataStr) => {
                    try {
                        const parsed = JSON.parse(dataStr);
                        parsed.theme = themeBlob;
                        update.run(JSON.stringify(parsed), id);
                    } catch (e) { /* skip malformed */ }
                };
                if (applyToAll) {
                    db.prepare('SELECT id, data FROM saved_datasets').all().forEach(row => writeTheme(row.id, row.data));
                } else if (currentDatasetId) {
                    // Always include language siblings: a CV's language variants
                    // share visual identity, so a per-dataset theme change should
                    // propagate across the language_group.
                    const current = db.prepare('SELECT id, data, language_group FROM saved_datasets WHERE id = ?').get(currentDatasetId);
                    if (current) {
                        writeTheme(current.id, current.data);
                        if (current.language_group) {
                            db.prepare('SELECT id, data FROM saved_datasets WHERE language_group = ? AND id != ?')
                                .all(current.language_group, current.id)
                                .forEach(row => writeTheme(row.id, row.data));
                        }
                    }
                }
            });
            writeAll();
            res.json({ success: true, theme: gatherTheme() });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Version check endpoint (admin only)
    app.get('/api/version', async (req, res) => {
        const cache = await checkLatestVersion();
        const updateAvailable = cache.latest ? compareVersions(CURRENT_VERSION, cache.latest) < 0 : false;
        res.json({ current: CURRENT_VERSION, latest: cache.latest, updateAvailable, changelog: cache.changelog });
    });

    app.get('/api/sections', (req, res) => { const sections = db.prepare('SELECT * FROM section_visibility').all(); const result = {}; sections.forEach(s => { result[s.section_name] = !!s.visible; }); res.json(result); });
    app.get('/api/sections/order', (req, res) => {
        const requestedLang = req.query.language || null;
        const datasetId = req.query.dataset_id ? parseInt(req.query.dataset_id, 10) : null;
        let datasetLanguage = requestedLang;
        let datasetSectionOverrides = {};
        if (datasetId) {
            try {
                const ds = db.prepare('SELECT language, data FROM saved_datasets WHERE id = ?').get(datasetId);
                if (ds) {
                    if (!datasetLanguage) datasetLanguage = ds.language;
                    try {
                        const parsed = JSON.parse(ds.data);
                        (parsed.sectionOrder || []).forEach(s => {
                            if (s && s.key && s.display_name) datasetSectionOverrides[s.key] = s.display_name;
                        });
                    } catch (e) { /* ignore malformed dataset blob */ }
                }
            } catch (e) { /* dataset lookup failed */ }
        }
        const sections = db.prepare('SELECT * FROM section_visibility ORDER BY sort_order ASC').all();
        const customSections = db.prepare('SELECT * FROM custom_sections ORDER BY sort_order ASC').all();
        const customNameMap = {};
        customSections.forEach(cs => { customNameMap[cs.section_key] = cs.name; });
        // Auto-repair: ensure all custom sections have section_visibility entries
        const sectionKeys = new Set(sections.map(s => s.section_name));
        customSections.forEach(cs => {
            if (!sectionKeys.has(cs.section_key)) {
                db.prepare('INSERT OR IGNORE INTO section_visibility (section_name, visible, sort_order) VALUES (?, ?, ?)').run(cs.section_key, cs.visible ? 1 : 0, cs.sort_order || 0);
                sections.push({ section_name: cs.section_key, visible: cs.visible ? 1 : 0, sort_order: cs.sort_order || 0, print_visible: 1, print_compact: 0, display_name: null });
            }
        });
        sections.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const defaultName = (s) => SECTION_DISPLAY_NAMES[s.section_name] || customNameMap[s.section_name] || s.section_name;
        res.json(sections.map(s => {
            const datasetOverride = datasetSectionOverrides[s.section_name] || null;
            const languageOverride = getLanguageSectionOverride(s.section_name, datasetLanguage);
            const resolved = resolveSectionTitle(s.section_name, {
                datasetOverride,
                language: datasetLanguage,
                locale: datasetLanguage,
                customNameFallback: customNameMap[s.section_name]
            });
            return {
                key: s.section_name,
                name: resolved,
                default_name: defaultName(s),
                dataset_display_name: datasetOverride,
                language_display_name: languageOverride,
                visible: !!s.visible,
                print_visible: s.print_visible !== 0,
                print_compact: s.print_compact === 1,
                sort_order: s.sort_order || 0,
                is_custom: !DEFAULT_SECTION_ORDER.includes(s.section_name)
            };
        }));
    });
    app.put('/api/sections/order', (req, res) => { const { sections } = req.body; if (!sections || !Array.isArray(sections)) return res.status(400).json({ error: 'Invalid sections data' }); const updateOrder = db.transaction(() => { sections.forEach(section => { const existing = db.prepare('SELECT print_compact FROM section_visibility WHERE section_name = ?').get(section.key); const printCompact = section.print_compact !== undefined ? (section.print_compact ? 1 : 0) : (existing ? (existing.print_compact ? 1 : 0) : 0); db.prepare('UPDATE section_visibility SET visible = ?, print_visible = ?, print_compact = ?, sort_order = ? WHERE section_name = ?').run(section.visible ? 1 : 0, section.print_visible != false ? 1 : 0, printCompact, section.sort_order, section.key); if (section.key.startsWith('custom_')) { db.prepare('UPDATE custom_sections SET visible = ?, sort_order = ? WHERE section_key = ?').run(section.visible ? 1 : 0, section.sort_order, section.key); } }); }); try { updateOrder(); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); } });

    // Rename a section title for the active dataset, optionally propagating to
    // every other dataset sharing the same language. Siblings in the same
    // language_group but different language are never touched.
    app.post('/api/sections/rename', (req, res) => {
        const { section_key, new_name, dataset_id, apply_to_language } = req.body || {};
        if (!section_key || typeof section_key !== 'string') {
            return res.status(400).json({ error: 'section_key is required' });
        }
        if (dataset_id === undefined || dataset_id === null) {
            return res.status(400).json({ error: 'dataset_id is required' });
        }
        const dataset = db.prepare('SELECT id, language, data FROM saved_datasets WHERE id = ?').get(dataset_id);
        if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

        const trimmed = typeof new_name === 'string' ? new_name.trim() : '';
        const isReset = trimmed === '';
        const scopeLanguage = dataset.language;

        const run = db.transaction(() => {
            // 1. Update the language-wide override row (toggle ON) or leave it alone (toggle OFF).
            if (apply_to_language) {
                if (isReset) {
                    db.prepare('DELETE FROM section_title_overrides WHERE section_key = ? AND language = ?').run(section_key, scopeLanguage);
                } else {
                    db.prepare(`INSERT INTO section_title_overrides (section_key, language, display_name, updated_at)
                                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                                ON CONFLICT(section_key, language) DO UPDATE SET display_name = excluded.display_name, updated_at = CURRENT_TIMESTAMP`)
                        .run(section_key, scopeLanguage, trimmed);
                }
            }

            // 2. Update the target dataset's per-dataset override.
            const targetData = JSON.parse(dataset.data);
            applyDatasetSectionOverride(targetData, section_key, isReset ? null : trimmed);
            db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(targetData), dataset.id);

            // 3. If applying to the whole language, overwrite every other same-language dataset's
            //    per-dataset override so the language-wide value wins (per the "overwrite them all" rule).
            if (apply_to_language) {
                const others = db.prepare('SELECT id, data FROM saved_datasets WHERE language = ? AND id != ?').all(scopeLanguage, dataset.id);
                for (const other of others) {
                    try {
                        const parsed = JSON.parse(other.data);
                        applyDatasetSectionOverride(parsed, section_key, isReset ? null : trimmed);
                        db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(parsed), other.id);
                    } catch (e) { /* skip datasets with malformed JSON */ }
                }
            }
        });

        try {
            run();
            res.json({ success: true, reset: isReset, applied_to_language: !!apply_to_language });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.put('/api/sections/:name', (req, res) => { const sectionName = req.params.name; const visible = req.body.visible ? 1 : 0; db.prepare('UPDATE section_visibility SET visible = ? WHERE section_name = ?').run(visible, sectionName); if (sectionName.startsWith('custom_')) { db.prepare('UPDATE custom_sections SET visible = ? WHERE section_key = ?').run(visible, sectionName); } res.json({ success: true }); });
    app.put('/api/sections/:name/print', (req, res) => { const sectionName = req.params.name; const printVisible = req.body.print_visible ? 1 : 0; const result = db.prepare('UPDATE section_visibility SET print_visible = ? WHERE section_name = ?').run(printVisible, sectionName); if (result.changes === 0) return res.status(404).json({ error: 'Section not found' }); res.json({ success: true }); });
    app.put('/api/sections/:name/print-compact', (req, res) => { const sectionName = req.params.name; const printCompact = req.body.print_compact ? 1 : 0; const result = db.prepare('UPDATE section_visibility SET print_compact = ? WHERE section_name = ?').run(printCompact, sectionName); if (result.changes === 0) return res.status(404).json({ error: 'Section not found' }); res.json({ success: true }); });

    app.get('/api/experiences', (req, res) => { const experiences = db.prepare('SELECT * FROM experiences ORDER BY sort_order ASC, start_date DESC').all(); res.json(experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [], visible: !!e.visible }))); });
    app.get('/api/experiences/:id', (req, res) => { const exp = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id); if (!exp) return res.status(404).json({ error: 'Not found' }); res.json({ ...exp, highlights: exp.highlights ? JSON.parse(exp.highlights) : [], visible: !!exp.visible }); });
    app.post('/api/experiences', (req, res) => { const { job_title, company_name, start_date, end_date, location, country_code, highlights, summary } = req.body; const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM experiences').get(); const result = db.prepare(`INSERT INTO experiences (job_title, company_name, start_date, end_date, location, country_code, highlights, summary, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(job_title, company_name, start_date, end_date, location, country_code || '', JSON.stringify(highlights || []), summary || null, (maxOrder.max || 0) + 1); res.json({ id: result.lastInsertRowid }); });
    app.put('/api/experiences/:id', (req, res) => { const { job_title, company_name, start_date, end_date, location, country_code, highlights, summary, visible, sort_order } = req.body; const existing = db.prepare('SELECT sort_order, visible FROM experiences WHERE id = ?').get(req.params.id); const newSortOrder = sort_order !== undefined ? sort_order : (existing?.sort_order || 0); const newVisible = visible !== undefined ? (visible ? 1 : 0) : (existing?.visible ?? 1); db.prepare(`UPDATE experiences SET job_title = ?, company_name = ?, start_date = ?, end_date = ?, location = ?, country_code = ?, highlights = ?, summary = ?, visible = ?, sort_order = ? WHERE id = ?`).run(job_title, company_name, start_date, end_date, location, country_code || '', JSON.stringify(highlights || []), summary || null, newVisible, newSortOrder, req.params.id); res.json({ success: true }); });
    app.delete('/api/experiences/:id', (req, res) => { const exp = db.prepare('SELECT logo_filename FROM experiences WHERE id = ?').get(req.params.id); if (exp && exp.logo_filename) { const refCount = db.prepare('SELECT COUNT(*) as cnt FROM experiences WHERE logo_filename = ?').get(exp.logo_filename).cnt; if (refCount <= 1) { const logoPath = path.join(uploadsPath, exp.logo_filename); try { if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath); } catch (e) {} } } db.prepare('DELETE FROM experiences WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    app.get('/api/certifications', (req, res) => { res.json(db.prepare('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC').all().map(c => ({ ...c, visible: !!c.visible }))); });
    app.get('/api/certifications/:id', (req, res) => { const cert = db.prepare('SELECT * FROM certifications WHERE id = ?').get(req.params.id); if (!cert) return res.status(404).json({ error: 'Not found' }); res.json({ ...cert, visible: !!cert.visible }); });
    app.post('/api/certifications', (req, res) => { const { name, provider, issue_date, expiry_date, credential_id } = req.body; if (!isValidHttpUrl(credential_id)) return res.status(400).json({ error: 'credential_id must be a valid http(s) URL' }); const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM certifications').get(); const result = db.prepare(`INSERT INTO certifications (name, provider, issue_date, expiry_date, credential_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)`).run(name, provider, issue_date, expiry_date, credential_id, (maxOrder.max || 0) + 1); res.json({ id: result.lastInsertRowid }); });
    app.put('/api/certifications/:id', (req, res) => { const { name, provider, issue_date, expiry_date, credential_id, visible, sort_order } = req.body; if (!isValidHttpUrl(credential_id)) return res.status(400).json({ error: 'credential_id must be a valid http(s) URL' }); const existing = db.prepare('SELECT sort_order, visible FROM certifications WHERE id = ?').get(req.params.id); const newSortOrder = sort_order !== undefined ? sort_order : (existing?.sort_order || 0); const newVisible = visible !== undefined ? (visible ? 1 : 0) : (existing?.visible ?? 1); db.prepare(`UPDATE certifications SET name = ?, provider = ?, issue_date = ?, expiry_date = ?, credential_id = ?, visible = ?, sort_order = ? WHERE id = ?`).run(name, provider, issue_date, expiry_date, credential_id, newVisible, newSortOrder, req.params.id); res.json({ success: true }); });
    app.delete('/api/certifications/:id', (req, res) => { const cert = db.prepare('SELECT logo_filename FROM certifications WHERE id = ?').get(req.params.id); if (cert && cert.logo_filename) { const refCountExp = db.prepare('SELECT COUNT(*) as cnt FROM experiences WHERE logo_filename = ?').get(cert.logo_filename).cnt; const refCountEdu = db.prepare('SELECT COUNT(*) as cnt FROM education WHERE logo_filename = ?').get(cert.logo_filename).cnt; const refCountCert = db.prepare('SELECT COUNT(*) as cnt FROM certifications WHERE logo_filename = ?').get(cert.logo_filename).cnt; if (refCountExp + refCountEdu + refCountCert <= 1) { const logoPath = path.join(uploadsPath, cert.logo_filename); try { if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath); } catch (e) {} } } db.prepare('DELETE FROM certifications WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    // Certification logo upload
    const certLogoStorage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsPath), filename: (req, file, cb) => { const ext = path.extname(file.originalname).toLowerCase() || '.jpg'; cb(null, `logo_cert_${req.params.id}_${Date.now()}${ext}`); } });
    const certLogoUpload = multer({ storage: certLogoStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => { const allowed = ['image/jpeg', 'image/png', 'image/webp']; cb(null, allowed.includes(file.mimetype)); } });
    app.post('/api/certifications/:id/logo', certLogoUpload.single('logo'), (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const cert = db.prepare('SELECT logo_filename FROM certifications WHERE id = ?').get(req.params.id);
        if (!cert) return res.status(404).json({ error: 'Certification not found' });
        db.prepare('UPDATE certifications SET logo_filename = ? WHERE id = ?').run(req.file.filename, req.params.id);
        res.json({ success: true, filename: req.file.filename });
    });
    app.delete('/api/certifications/:id/logo', (req, res) => {
        const cert = db.prepare('SELECT logo_filename FROM certifications WHERE id = ?').get(req.params.id);
        if (!cert) return res.status(404).json({ error: 'Certification not found' });
        db.prepare('UPDATE certifications SET logo_filename = NULL WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });
    app.put('/api/certifications/:id/logo', express.json(), (req, res) => {
        const { filename } = req.body;
        if (!filename) return res.status(400).json({ error: 'Filename is required' });
        const cert = db.prepare('SELECT logo_filename FROM certifications WHERE id = ?').get(req.params.id);
        if (!cert) return res.status(404).json({ error: 'Certification not found' });
        if (!fs.existsSync(path.join(uploadsPath, filename))) return res.status(404).json({ error: 'Logo file not found' });
        db.prepare('UPDATE certifications SET logo_filename = ? WHERE id = ?').run(filename, req.params.id);
        res.json({ success: true, filename });
    });

    // Certification logo propagation endpoints
    app.post('/api/cert-logos/apply-global', express.json(), (req, res) => {
        const { provider, logo_filename } = req.body;
        if (!provider || !logo_filename) return res.status(400).json({ error: 'provider and logo_filename are required' });
        if (!fs.existsSync(path.join(uploadsPath, logo_filename))) return res.status(404).json({ error: 'Logo file not found' });
        let updatedCurrent = 0; let updatedDatasets = 0;
        const result = db.prepare('UPDATE certifications SET logo_filename = ?, logo_propagate = 1 WHERE provider = ?').run(logo_filename, provider);
        updatedCurrent = result.changes;
        try {
            const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.certifications) {
                        let changed = false;
                        for (const cert of data.certifications) {
                            if (cert.provider === provider) {
                                if (cert.logo_filename !== logo_filename) { cert.logo_filename = logo_filename; changed = true; updatedDatasets++; }
                                if (!cert.logo_propagate) { cert.logo_propagate = 1; changed = true; }
                            }
                        }
                        if (changed) db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ success: true, updated_current: updatedCurrent, updated_datasets: updatedDatasets });
    });
    app.post('/api/cert-logos/remove-global', express.json(), (req, res) => {
        const { provider } = req.body;
        if (!provider) return res.status(400).json({ error: 'provider is required' });
        let updatedCurrent = 0; let updatedDatasets = 0;
        const result = db.prepare('UPDATE certifications SET logo_filename = NULL WHERE provider = ?').run(provider);
        updatedCurrent = result.changes;
        try {
            const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.certifications) {
                        let changed = false;
                        for (const cert of data.certifications) {
                            if (cert.provider === provider && cert.logo_filename) { cert.logo_filename = null; changed = true; updatedDatasets++; }
                        }
                        if (changed) db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ success: true, updated_current: updatedCurrent, updated_datasets: updatedDatasets });
    });
    app.post('/api/cert-logos/set-propagate', express.json(), (req, res) => {
        const { provider, propagate } = req.body;
        if (!provider) return res.status(400).json({ error: 'provider is required' });
        const flag = propagate ? 1 : 0;
        const result = db.prepare('UPDATE certifications SET logo_propagate = ? WHERE provider = ?').run(flag, provider);
        try {
            const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.certifications) {
                        let changed = false;
                        for (const cert of data.certifications) {
                            if (cert.provider === provider && (cert.logo_propagate ? 1 : 0) !== flag) { cert.logo_propagate = flag; changed = true; }
                        }
                        if (changed) db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ success: true, updated: result.changes });
    });
    app.get('/api/logos/by-provider', (req, res) => {
        const name = (req.query.name || '').trim();
        if (!name) return res.json({ logo_filename: null });
        const cert = db.prepare('SELECT logo_filename, logo_propagate FROM certifications WHERE provider = ? AND logo_filename IS NOT NULL LIMIT 1').get(name);
        if (cert && cert.logo_filename && fs.existsSync(path.join(uploadsPath, cert.logo_filename))) {
            return res.json({ logo_filename: cert.logo_filename, logo_propagate: !!cert.logo_propagate });
        }
        try {
            const datasets = db.prepare('SELECT data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.certifications) {
                        const match = data.certifications.find(c => c.provider === name && c.logo_filename);
                        if (match && fs.existsSync(path.join(uploadsPath, match.logo_filename))) {
                            return res.json({ logo_filename: match.logo_filename, logo_propagate: !!match.logo_propagate });
                        }
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ logo_filename: null });
    });

    app.get('/api/education', (req, res) => { res.json(db.prepare('SELECT * FROM education ORDER BY sort_order ASC, end_date DESC').all().map(e => ({ ...e, visible: !!e.visible }))); });
    app.get('/api/education/:id', (req, res) => { const edu = db.prepare('SELECT * FROM education WHERE id = ?').get(req.params.id); if (!edu) return res.status(404).json({ error: 'Not found' }); res.json({ ...edu, visible: !!edu.visible }); });
    app.post('/api/education', (req, res) => { const { degree_title, institution_name, start_date, end_date, description } = req.body; const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM education').get(); const result = db.prepare(`INSERT INTO education (degree_title, institution_name, start_date, end_date, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)`).run(degree_title, institution_name, start_date, end_date, description, (maxOrder.max || 0) + 1); res.json({ id: result.lastInsertRowid }); });
    app.put('/api/education/:id', (req, res) => { const { degree_title, institution_name, start_date, end_date, description, visible, sort_order } = req.body; const existing = db.prepare('SELECT sort_order, visible FROM education WHERE id = ?').get(req.params.id); const newSortOrder = sort_order !== undefined ? sort_order : (existing?.sort_order || 0); const newVisible = visible !== undefined ? (visible ? 1 : 0) : (existing?.visible ?? 1); db.prepare(`UPDATE education SET degree_title = ?, institution_name = ?, start_date = ?, end_date = ?, description = ?, visible = ?, sort_order = ? WHERE id = ?`).run(degree_title, institution_name, start_date, end_date, description, newVisible, newSortOrder, req.params.id); res.json({ success: true }); });
    app.delete('/api/education/:id', (req, res) => { const edu = db.prepare('SELECT logo_filename FROM education WHERE id = ?').get(req.params.id); if (edu && edu.logo_filename) { const refCountExp = db.prepare('SELECT COUNT(*) as cnt FROM experiences WHERE logo_filename = ?').get(edu.logo_filename).cnt; const refCountEdu = db.prepare('SELECT COUNT(*) as cnt FROM education WHERE logo_filename = ?').get(edu.logo_filename).cnt; if (refCountExp + refCountEdu <= 1) { const logoPath = path.join(uploadsPath, edu.logo_filename); try { if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath); } catch (e) {} } } db.prepare('DELETE FROM education WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    // Education logo upload
    const eduLogoStorage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsPath), filename: (req, file, cb) => { const ext = path.extname(file.originalname).toLowerCase() || '.jpg'; cb(null, `logo_edu_${req.params.id}_${Date.now()}${ext}`); } });
    const eduLogoUpload = multer({ storage: eduLogoStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => { const allowed = ['image/jpeg', 'image/png', 'image/webp']; cb(null, allowed.includes(file.mimetype)); } });
    app.post('/api/education/:id/logo', eduLogoUpload.single('logo'), (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const edu = db.prepare('SELECT logo_filename FROM education WHERE id = ?').get(req.params.id);
        if (!edu) return res.status(404).json({ error: 'Education not found' });
        db.prepare('UPDATE education SET logo_filename = ? WHERE id = ?').run(req.file.filename, req.params.id);
        res.json({ success: true, filename: req.file.filename });
    });
    app.delete('/api/education/:id/logo', (req, res) => {
        const edu = db.prepare('SELECT logo_filename FROM education WHERE id = ?').get(req.params.id);
        if (!edu) return res.status(404).json({ error: 'Education not found' });
        db.prepare('UPDATE education SET logo_filename = NULL WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });
    app.put('/api/education/:id/logo', express.json(), (req, res) => {
        const { filename } = req.body;
        if (!filename) return res.status(400).json({ error: 'Filename is required' });
        const edu = db.prepare('SELECT logo_filename FROM education WHERE id = ?').get(req.params.id);
        if (!edu) return res.status(404).json({ error: 'Education not found' });
        if (!fs.existsSync(path.join(uploadsPath, filename))) return res.status(404).json({ error: 'Logo file not found' });
        db.prepare('UPDATE education SET logo_filename = ? WHERE id = ?').run(filename, req.params.id);
        res.json({ success: true, filename });
    });

    // Education logo propagation endpoints
    app.post('/api/edu-logos/apply-global', express.json(), (req, res) => {
        const { institution_name, logo_filename } = req.body;
        if (!institution_name || !logo_filename) return res.status(400).json({ error: 'institution_name and logo_filename are required' });
        if (!fs.existsSync(path.join(uploadsPath, logo_filename))) return res.status(404).json({ error: 'Logo file not found' });
        let updatedCurrent = 0; let updatedDatasets = 0;
        const result = db.prepare('UPDATE education SET logo_filename = ?, logo_propagate = 1 WHERE institution_name = ?').run(logo_filename, institution_name);
        updatedCurrent = result.changes;
        try {
            const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.education) {
                        let changed = false;
                        for (const edu of data.education) {
                            if (edu.institution_name === institution_name) {
                                if (edu.logo_filename !== logo_filename) { edu.logo_filename = logo_filename; changed = true; updatedDatasets++; }
                                if (!edu.logo_propagate) { edu.logo_propagate = 1; changed = true; }
                            }
                        }
                        if (changed) db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ success: true, updated_current: updatedCurrent, updated_datasets: updatedDatasets });
    });
    app.post('/api/edu-logos/remove-global', express.json(), (req, res) => {
        const { institution_name } = req.body;
        if (!institution_name) return res.status(400).json({ error: 'institution_name is required' });
        let updatedCurrent = 0; let updatedDatasets = 0;
        const result = db.prepare('UPDATE education SET logo_filename = NULL WHERE institution_name = ?').run(institution_name);
        updatedCurrent = result.changes;
        try {
            const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.education) {
                        let changed = false;
                        for (const edu of data.education) {
                            if (edu.institution_name === institution_name && edu.logo_filename) { edu.logo_filename = null; changed = true; updatedDatasets++; }
                        }
                        if (changed) db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ success: true, updated_current: updatedCurrent, updated_datasets: updatedDatasets });
    });
    app.post('/api/edu-logos/set-propagate', express.json(), (req, res) => {
        const { institution_name, propagate } = req.body;
        if (!institution_name) return res.status(400).json({ error: 'institution_name is required' });
        const flag = propagate ? 1 : 0;
        const result = db.prepare('UPDATE education SET logo_propagate = ? WHERE institution_name = ?').run(flag, institution_name);
        try {
            const datasets = db.prepare('SELECT id, data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.education) {
                        let changed = false;
                        for (const edu of data.education) {
                            if (edu.institution_name === institution_name && (edu.logo_propagate ? 1 : 0) !== flag) { edu.logo_propagate = flag; changed = true; }
                        }
                        if (changed) db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(data), ds.id);
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ success: true, updated: result.changes });
    });
    app.get('/api/logos/by-institution', (req, res) => {
        const name = (req.query.name || '').trim();
        if (!name) return res.json({ logo_filename: null });
        const edu = db.prepare('SELECT logo_filename, logo_propagate FROM education WHERE institution_name = ? AND logo_filename IS NOT NULL LIMIT 1').get(name);
        if (edu && edu.logo_filename && fs.existsSync(path.join(uploadsPath, edu.logo_filename))) {
            return res.json({ logo_filename: edu.logo_filename, logo_propagate: !!edu.logo_propagate });
        }
        try {
            const datasets = db.prepare('SELECT data FROM saved_datasets').all();
            for (const ds of datasets) {
                try {
                    const data = JSON.parse(ds.data);
                    if (data.education) {
                        const match = data.education.find(e => e.institution_name === name && e.logo_filename);
                        if (match && fs.existsSync(path.join(uploadsPath, match.logo_filename))) {
                            return res.json({ logo_filename: match.logo_filename });
                        }
                    }
                } catch (e) {}
            }
        } catch (e) {}
        res.json({ logo_filename: null });
    });

    app.get('/api/skills', (req, res) => { const categories = db.prepare('SELECT * FROM skill_categories ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); res.json(categories.map(cat => ({ ...cat, visible: !!cat.visible, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) }))); });
    app.get('/api/skills/:id', (req, res) => { const cat = db.prepare('SELECT * FROM skill_categories WHERE id = ?').get(req.params.id); if (!cat) return res.status(404).json({ error: 'Not found' }); const skills = db.prepare('SELECT name FROM skills WHERE category_id = ? ORDER BY sort_order ASC').all(req.params.id); res.json({ ...cat, visible: !!cat.visible, skills: skills.map(s => s.name) }); });
    app.post('/api/skills', (req, res) => { const { name, icon, skills } = req.body; const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM skill_categories').get(); const result = db.prepare('INSERT INTO skill_categories (name, icon, sort_order) VALUES (?, ?, ?)').run(name, icon || 'default', (maxOrder.max || 0) + 1); const categoryId = result.lastInsertRowid; if (skills && skills.length > 0) { const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)'); skills.forEach((skill, idx) => { skillStmt.run(categoryId, skill, idx); }); } res.json({ id: categoryId }); });
    app.put('/api/skills/:id', (req, res) => { const { name, icon, skills, visible, sort_order } = req.body; const categoryId = req.params.id; const existing = db.prepare('SELECT sort_order, visible FROM skill_categories WHERE id = ?').get(categoryId); const newSortOrder = sort_order !== undefined ? sort_order : (existing?.sort_order || 0); const newVisible = visible !== undefined ? (visible ? 1 : 0) : (existing?.visible ?? 1); db.prepare('UPDATE skill_categories SET name = ?, icon = ?, visible = ?, sort_order = ? WHERE id = ?').run(name, icon || 'default', newVisible, newSortOrder, categoryId); db.prepare('DELETE FROM skills WHERE category_id = ?').run(categoryId); if (skills && skills.length > 0) { const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)'); skills.forEach((skill, idx) => { skillStmt.run(categoryId, skill, idx); }); } res.json({ success: true }); });
    app.delete('/api/skills/:id', (req, res) => { db.prepare('DELETE FROM skills WHERE category_id = ?').run(req.params.id); db.prepare('DELETE FROM skill_categories WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    app.get('/api/projects', (req, res) => { res.json(db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all().map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [], visible: !!p.visible }))); });
    app.get('/api/projects/:id', (req, res) => { const proj = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id); if (!proj) return res.status(404).json({ error: 'Not found' }); res.json({ ...proj, technologies: proj.technologies ? JSON.parse(proj.technologies) : [], visible: !!proj.visible }); });
    app.post('/api/projects', (req, res) => { const { title, description, technologies, link } = req.body; const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM projects').get(); const result = db.prepare(`INSERT INTO projects (title, description, technologies, link, sort_order) VALUES (?, ?, ?, ?, ?)`).run(title, description, JSON.stringify(technologies || []), link, (maxOrder.max || 0) + 1); res.json({ id: result.lastInsertRowid }); });
    app.put('/api/projects/:id', (req, res) => { const { title, description, technologies, link, visible, sort_order } = req.body; const existing = db.prepare('SELECT sort_order, visible FROM projects WHERE id = ?').get(req.params.id); const newSortOrder = sort_order !== undefined ? sort_order : (existing?.sort_order || 0); const newVisible = visible !== undefined ? (visible ? 1 : 0) : (existing?.visible ?? 1); db.prepare(`UPDATE projects SET title = ?, description = ?, technologies = ?, link = ?, visible = ?, sort_order = ? WHERE id = ?`).run(title, description, JSON.stringify(technologies || []), link, newVisible, newSortOrder, req.params.id); res.json({ success: true }); });
    app.delete('/api/projects/:id', (req, res) => { db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    // Generic reorder endpoint for items within sections
    app.put('/api/reorder/:type', (req, res) => {
        const { type } = req.params;
        const { items } = req.body;
        if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Invalid items data' });
        
        const tableMap = {
            'experiences': 'experiences',
            'certifications': 'certifications',
            'education': 'education',
            'skills': 'skill_categories',
            'projects': 'projects',
            'custom-items': 'custom_section_items'
        };
        
        const table = tableMap[type];
        if (!table) return res.status(400).json({ error: 'Invalid type' });
        
        try {
            const updateOrder = db.transaction(() => {
                items.forEach(item => {
                    db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`).run(item.sort_order, item.id);
                });
            });
            updateOrder();
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/datasets', (req, res) => { 
        try {
            // Use SELECT * to avoid errors if slug column doesn't exist
            const datasets = db.prepare('SELECT * FROM saved_datasets ORDER BY updated_at DESC').all();
            res.json(datasets.map(d => ({ id: d.id, name: d.name, slug: d.slug || null, language: d.language || 'en', language_group: d.language_group || null, version_group: d.version_group || null, version: d.version || 1, is_public: !!d.is_public, is_default: !!d.is_default, created_at: d.created_at, updated_at: d.updated_at })));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.post('/api/datasets', (req, res) => {
        const { name, language: reqLang, language_group: reqGroup, version_group: reqVersionGroup } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
        const language = (reqLang || 'en').trim().toLowerCase();
        const cvData = gatherCvData();
        try {
            // Early check: if a language_group is provided, reject duplicate language
            if (reqGroup) {
                const dupLang = db.prepare('SELECT id FROM saved_datasets WHERE language_group = ? AND language = ?').get(reqGroup, language);
                if (dupLang) return res.status(400).json({ error: 'This language already exists in the group' });
            }
            const existing = db.prepare('SELECT id FROM saved_datasets WHERE name = ? AND language = ?').get(name.trim(), language);
            if (existing) {
                db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(cvData), existing.id);
                const ds = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(existing.id);
                propagateStructure(existing.id);
                res.json({ success: true, id: existing.id, slug: ds.slug || null, language: ds.language, language_group: ds.language_group, version_group: ds.version_group, version: ds.version || 1, is_default: !!ds.is_default, updated: true });
            } else {
                let languageGroup = reqGroup || null;
                let versionGroup = reqVersionGroup || null;
                let version = 1;
                let slug = null;

                if (reqVersionGroup) {
                    // Creating a new version of an existing dataset
                    const maxRow = db.prepare('SELECT MAX(version) as maxVer FROM saved_datasets WHERE version_group = ?').get(reqVersionGroup);
                    const maxVer = maxRow?.maxVer || 0;
                    version = maxVer + 1;
                    // Reuse slug from version group
                    const existingMember = db.prepare('SELECT slug FROM saved_datasets WHERE version_group = ? AND slug IS NOT NULL LIMIT 1').get(reqVersionGroup);
                    if (existingMember) slug = existingMember.slug;
                    // New language_group for new version
                    languageGroup = crypto.randomUUID();
                } else if (reqGroup) {
                    // Adding a language variant to an existing version
                    const sibling = db.prepare('SELECT * FROM saved_datasets WHERE language_group = ? LIMIT 1').get(reqGroup);
                    if (!sibling) return res.status(400).json({ error: 'Language group not found' });
                    slug = sibling.slug;
                    versionGroup = sibling.version_group;
                    version = sibling.version || 1;
                } else {
                    // Brand new dataset
                    languageGroup = crypto.randomUUID();
                    versionGroup = crypto.randomUUID();
                }

                const result = db.prepare('INSERT INTO saved_datasets (name, data, language, language_group, version_group, version, is_public, is_default) VALUES (?, ?, ?, ?, ?, ?, 0, 0)')
                    .run(name.trim(), JSON.stringify(cvData), language, languageGroup, versionGroup, version);
                const newId = result.lastInsertRowid;
                if (!slug) {
                    try {
                        slug = generateSlug(name.trim(), newId);
                        db.prepare('UPDATE saved_datasets SET slug = ? WHERE id = ?').run(slug, newId);
                    } catch (slugErr) { console.log('Slug update skipped:', slugErr.message); }
                } else {
                    db.prepare('UPDATE saved_datasets SET slug = ? WHERE id = ?').run(slug, newId);
                }

                // If creating a new version, copy language siblings from the latest version
                if (reqVersionGroup && !reqGroup) {
                    const maxRow2 = db.prepare('SELECT MAX(version) as maxVer FROM saved_datasets WHERE version_group = ? AND version < ?').get(reqVersionGroup, version);
                    const prevVer = maxRow2?.maxVer;
                    if (prevVer) {
                        const prevLangGroup = db.prepare('SELECT language_group FROM saved_datasets WHERE version_group = ? AND version = ? LIMIT 1').get(reqVersionGroup, prevVer);
                        if (prevLangGroup) {
                            const siblings = db.prepare('SELECT * FROM saved_datasets WHERE language_group = ? AND language != ?').all(prevLangGroup.language_group, language);
                            // src.data is copied verbatim, so new language siblings inherit
                            // profile.picture_filename, picture_propagate, and profile_picture_enabled.
                            for (const src of siblings) {
                                try {
                                    db.prepare('INSERT INTO saved_datasets (name, data, language, language_group, version_group, version, slug, is_public, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)')
                                        .run(name.trim(), src.data, src.language, languageGroup, versionGroup, version, slug);
                                } catch (sibErr) { console.log('Sibling copy skipped:', sibErr.message); }
                            }
                        }
                    }
                }

                propagateStructure(newId);
                res.json({ success: true, id: newId, slug, language, language_group: languageGroup, version_group: versionGroup, version, is_default: false, created: true });
            }
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Set a dataset as the default (public at /) — sets this ONE specific variant
    app.put('/api/datasets/:id/default', (req, res) => {
        try {
            const dataset = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
            if (!dataset) return res.status(404).json({ error: 'Dataset not found' });

            const setDefault = db.transaction(() => {
                db.prepare('UPDATE saved_datasets SET is_default = 0 WHERE is_default = 1').run();
                db.prepare('UPDATE saved_datasets SET is_default = 1 WHERE id = ?').run(req.params.id);
            });
            setDefault();

            const updated = db.prepare('SELECT id, name, slug, is_public, is_default FROM saved_datasets WHERE id = ?').get(req.params.id);
            res.json({ success: true, id: updated.id, name: updated.name, slug: updated.slug, is_default: !!updated.is_default });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Get the current default dataset info
    app.get('/api/datasets/default', (req, res) => {
        try {
            const dataset = db.prepare('SELECT * FROM saved_datasets WHERE is_default = 1 LIMIT 1').get();
            if (!dataset) return res.json({ exists: false });
            res.json({ exists: true, id: dataset.id, name: dataset.name, slug: dataset.slug, language: dataset.language || 'en', language_group: dataset.language_group, version_group: dataset.version_group, version: dataset.version || 1, is_public: !!dataset.is_public, updated_at: dataset.updated_at });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Save current live CV data back into an existing dataset (explicit save)
    app.post('/api/datasets/:id/save', (req, res) => {
        try {
            const dataset = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
            if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
            const cvData = gatherCvData();
            db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(cvData), req.params.id);
            propagateStructure(req.params.id);
            res.json({ success: true, id: dataset.id, name: dataset.name, language: dataset.language || 'en', language_group: dataset.language_group, version_group: dataset.version_group, version: dataset.version || 1, is_default: !!dataset.is_default, is_public: !!dataset.is_public });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Copy a single section from the live CV into another saved dataset.
    // The live DB is never mutated — only the target dataset's stored JSON blob.
    // For custom sections, match on section_key first, then case-insensitive name;
    // otherwise append a new entry. Timeline has no content of its own and is rejected.
    const BUILTIN_COPYABLE_SECTIONS = new Set(['about', 'experience', 'certifications', 'education', 'skills', 'projects']);

    // Produce a stable, human-readable plain-text snapshot of a single section
    // extracted from a CV data blob. Used as input to diffLines() so the copy-
    // section preview shows meaningful added/removed rows instead of JSON noise.
    function serializeSection(data, sectionKey) {
        if (!data) return '';
        const join = (parts) => parts.filter(p => p != null && String(p).trim() !== '').join(' · ');
        const dateRange = (s, e) => {
            const a = formatDateShort(s || '');
            const b = e ? formatDateShort(e) : 'Present';
            if (!a && !b) return '';
            if (!a) return b;
            return `${a} – ${b}`;
        };
        const lines = [];
        if (sectionKey === 'about') {
            const p = data.profile || {};
            lines.push(`Name: ${p.name || ''}`);
            if (p.initials) lines.push(`Initials: ${p.initials}`);
            if (p.title) lines.push(`Title: ${p.title}`);
            if (p.subtitle) lines.push(`Subtitle: ${p.subtitle}`);
            if (p.location) lines.push(`Location: ${p.location}`);
            if (p.email) lines.push(`Email: ${p.email}`);
            if (p.phone) lines.push(`Phone: ${p.phone}`);
            if (p.linkedin) lines.push(`LinkedIn: ${p.linkedin}`);
            if (p.languages) lines.push(`Languages: ${p.languages}`);
            if (p.bio) {
                lines.push('Bio:');
                String(p.bio).split(/\r?\n/).forEach(b => lines.push(`  ${b}`));
            }
        } else if (sectionKey === 'experience') {
            (data.experiences || []).forEach(e => {
                lines.push(`• ${e.job_title || ''} — ${e.company_name || ''}`);
                const meta = join([dateRange(e.start_date, e.end_date), e.location, e.country_code]);
                if (meta) lines.push(`  ${meta}`);
                if (e.summary) lines.push(`  ${e.summary}`);
                (e.highlights || []).forEach(h => lines.push(`  - ${h}`));
                lines.push('');
            });
        } else if (sectionKey === 'certifications') {
            (data.certifications || []).forEach(c => {
                lines.push(`• ${c.name || ''} — ${c.provider || ''}`);
                const meta = join([
                    c.issue_date ? `Issued ${formatDateShort(c.issue_date)}` : '',
                    c.expiry_date ? `Expires ${formatDateShort(c.expiry_date)}` : '',
                    c.credential_id ? `ID ${c.credential_id}` : ''
                ]);
                if (meta) lines.push(`  ${meta}`);
                lines.push('');
            });
        } else if (sectionKey === 'education') {
            (data.education || []).forEach(e => {
                lines.push(`• ${e.degree_title || ''} — ${e.institution_name || ''}`);
                const meta = dateRange(e.start_date, e.end_date);
                if (meta) lines.push(`  ${meta}`);
                if (e.description) {
                    String(e.description).split(/\r?\n/).forEach(l => lines.push(`  ${l}`));
                }
                lines.push('');
            });
        } else if (sectionKey === 'skills') {
            (data.skills || []).forEach(cat => {
                const items = (cat.skills || []).join(', ');
                lines.push(`• ${cat.name || ''}${cat.icon && cat.icon !== 'default' ? ` (${cat.icon})` : ''}`);
                if (items) lines.push(`  ${items}`);
                lines.push('');
            });
        } else if (sectionKey === 'projects') {
            (data.projects || []).forEach(p => {
                lines.push(`• ${p.title || ''}`);
                if (p.description) lines.push(`  ${p.description}`);
                const techs = Array.isArray(p.technologies) ? p.technologies.join(', ') : '';
                if (techs) lines.push(`  Tech: ${techs}`);
                if (p.link) lines.push(`  Link: ${p.link}`);
                lines.push('');
            });
        } else if (sectionKey.startsWith('custom_')) {
            const cs = (data.customSections || []).find(s => s && s.section_key === sectionKey);
            if (cs) {
                lines.push(`${cs.name || ''} [${cs.layout_type || 'custom'}]`);
                if (cs.icon) lines.push(`Icon: ${cs.icon}`);
                lines.push('');
                (cs.items || []).forEach(it => {
                    if (it.title) lines.push(`• ${it.title}`);
                    else lines.push('•');
                    if (it.subtitle) lines.push(`  ${it.subtitle}`);
                    if (it.description) {
                        String(it.description).split(/\r?\n/).forEach(l => lines.push(`  ${l}`));
                    }
                    if (it.link) lines.push(`  Link: ${it.link}`);
                    if (it.icon) lines.push(`  Icon: ${it.icon}`);
                    lines.push('');
                });
            }
        }
        return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
    }

    // Build the before/after snapshots and a line-level diff the client can
    // render so the user previews exactly which rows will change before
    // committing to the overwrite.
    app.post('/api/datasets/:id/copy-section-diff', (req, res) => {
        const { sectionKey } = req.body || {};
        if (!sectionKey || typeof sectionKey !== 'string') {
            return res.status(400).json({ error: 'sectionKey is required' });
        }
        const isBuiltin = BUILTIN_COPYABLE_SECTIONS.has(sectionKey);
        const isCustom = sectionKey.startsWith('custom_');
        if (!isBuiltin && !isCustom) {
            return res.status(400).json({ error: 'Invalid or non-copyable sectionKey' });
        }
        try {
            const dataset = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
            if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
            let targetData;
            try { targetData = JSON.parse(dataset.data); }
            catch { return res.status(500).json({ error: 'Target dataset data is corrupted' }); }
            const liveData = gatherCvData();
            const before = serializeSection(targetData, sectionKey);
            const after = serializeSection(liveData, sectionKey);
            const parts = diffLines(before + '\n', after + '\n');
            res.json({ before, after, parts, unchanged: before === after });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Batch summary: for every saved dataset, compute how many lines would be
    // added/removed if the given section were copied from live into that dataset.
    // Powers the per-row +N / -M chips in the copy-section picker so the user
    // sees the impact of each target at a glance before clicking.
    app.post('/api/datasets/copy-section-diff-summary', (req, res) => {
        const { sectionKey } = req.body || {};
        if (!sectionKey || typeof sectionKey !== 'string') {
            return res.status(400).json({ error: 'sectionKey is required' });
        }
        const isBuiltin = BUILTIN_COPYABLE_SECTIONS.has(sectionKey);
        const isCustom = sectionKey.startsWith('custom_');
        if (!isBuiltin && !isCustom) {
            return res.status(400).json({ error: 'Invalid or non-copyable sectionKey' });
        }
        try {
            const liveData = gatherCvData();
            const after = serializeSection(liveData, sectionKey);
            const rows = db.prepare('SELECT id, data FROM saved_datasets').all();
            const summaries = rows.map(row => {
                let before = '';
                try { before = serializeSection(JSON.parse(row.data), sectionKey); }
                catch { return { id: row.id, error: 'corrupted' }; }
                if (before === after) return { id: row.id, added: 0, removed: 0, unchanged: true };
                let added = 0, removed = 0;
                diffLines(before + '\n', after + '\n').forEach(part => {
                    if (part.added) added += part.count || 0;
                    else if (part.removed) removed += part.count || 0;
                });
                return { id: row.id, added, removed, unchanged: false };
            });
            res.json({ summaries });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Mutate `targetData` (a parsed saved_dataset.data blob) in place so that
    // the given section's content matches `liveData`. Throws an Error with a
    // .status property when validation fails so callers can surface HTTP codes.
    // Shared by the single-target and bulk copy endpoints.
    function applyCopyToTargetData(targetData, sectionKey, liveData) {
        const isBuiltin = BUILTIN_COPYABLE_SECTIONS.has(sectionKey);
        const isCustom = sectionKey.startsWith('custom_');
        if (!isBuiltin && !isCustom) {
            const err = new Error('Invalid or non-copyable sectionKey');
            err.status = 400;
            throw err;
        }
        if (isBuiltin) {
            switch (sectionKey) {
                case 'about': targetData.profile = liveData.profile; break;
                case 'experience': targetData.experiences = liveData.experiences; break;
                case 'certifications': targetData.certifications = liveData.certifications; break;
                case 'education': targetData.education = liveData.education; break;
                case 'skills': targetData.skills = liveData.skills; break;
                case 'projects': targetData.projects = liveData.projects; break;
            }
            return;
        }
        const liveCustomSections = Array.isArray(liveData.customSections) ? liveData.customSections : [];
        const source = liveCustomSections.find(cs => cs && cs.section_key === sectionKey);
        if (!source) {
            const err = new Error('Source custom section not found');
            err.status = 404;
            throw err;
        }
        if (!Array.isArray(targetData.customSections)) targetData.customSections = [];
        const targetCustoms = targetData.customSections;
        let existingIdx = targetCustoms.findIndex(cs => cs && cs.section_key === source.section_key);
        if (existingIdx === -1 && source.name) {
            const srcNameLower = String(source.name).toLowerCase();
            existingIdx = targetCustoms.findIndex(cs => cs && typeof cs.name === 'string' && cs.name.toLowerCase() === srcNameLower);
        }
        if (existingIdx !== -1) {
            const preservedSortOrder = targetCustoms[existingIdx].sort_order;
            targetCustoms[existingIdx] = {
                ...targetCustoms[existingIdx],
                section_key: source.section_key,
                name: source.name,
                layout_type: source.layout_type,
                icon: source.icon,
                metadata: source.metadata,
                visible: source.visible,
                items: Array.isArray(source.items) ? source.items.map(i => ({ ...i })) : [],
                sort_order: preservedSortOrder != null ? preservedSortOrder : source.sort_order
            };
        } else {
            const maxOrder = targetCustoms.reduce((m, cs) => Math.max(m, cs && typeof cs.sort_order === 'number' ? cs.sort_order : 0), 0);
            targetCustoms.push({
                section_key: source.section_key,
                name: source.name,
                layout_type: source.layout_type,
                icon: source.icon,
                metadata: source.metadata,
                visible: source.visible,
                items: Array.isArray(source.items) ? source.items.map(i => ({ ...i })) : [],
                sort_order: maxOrder + 1,
                display_name: null
            });
        }
        if (!targetData.sectionVisibility || typeof targetData.sectionVisibility !== 'object') {
            targetData.sectionVisibility = {};
        }
        targetData.sectionVisibility[source.section_key] = !!source.visible;
        if (!Array.isArray(targetData.sectionOrder)) targetData.sectionOrder = [];
        const existingOrderIdx = targetData.sectionOrder.findIndex(e => e && e.key === source.section_key);
        if (existingOrderIdx === -1) {
            const maxOrder = targetData.sectionOrder.reduce((m, e) => Math.max(m, e && typeof e.sort_order === 'number' ? e.sort_order : 0), 0);
            targetData.sectionOrder.push({
                key: source.section_key,
                sort_order: maxOrder + 1,
                visible: !!source.visible,
                display_name: null,
                name: source.name,
                default_name: source.name
            });
        } else {
            const entry = targetData.sectionOrder[existingOrderIdx];
            entry.visible = !!source.visible;
            if (!entry.display_name) {
                entry.name = source.name;
                entry.default_name = entry.default_name || source.name;
            }
        }
    }

    app.post('/api/datasets/:id/copy-section-from-live', (req, res) => {
        const { sectionKey } = req.body || {};
        if (!sectionKey || typeof sectionKey !== 'string') {
            return res.status(400).json({ error: 'sectionKey is required' });
        }
        const isBuiltin = BUILTIN_COPYABLE_SECTIONS.has(sectionKey);
        const isCustom = sectionKey.startsWith('custom_');
        if (!isBuiltin && !isCustom) {
            return res.status(400).json({ error: 'Invalid or non-copyable sectionKey' });
        }
        try {
            const dataset = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
            if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
            let targetData;
            try { targetData = JSON.parse(dataset.data); }
            catch { return res.status(500).json({ error: 'Target dataset data is corrupted' }); }
            const liveData = gatherCvData();
            try {
                applyCopyToTargetData(targetData, sectionKey, liveData);
            } catch (e) {
                return res.status(e.status || 500).json({ error: e.message });
            }
            db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                .run(JSON.stringify(targetData), req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Bulk overwrite: copy the same section from live into every target in one
    // shot so users can "sync this section across these 5 CVs" without clicking
    // through five times. Per-target errors are reported individually so one
    // corrupt row doesn't block the rest.
    app.post('/api/datasets/copy-section-bulk', (req, res) => {
        const { sectionKey, targetIds } = req.body || {};
        if (!sectionKey || typeof sectionKey !== 'string') {
            return res.status(400).json({ error: 'sectionKey is required' });
        }
        const isBuiltin = BUILTIN_COPYABLE_SECTIONS.has(sectionKey);
        const isCustom = sectionKey.startsWith('custom_');
        if (!isBuiltin && !isCustom) {
            return res.status(400).json({ error: 'Invalid or non-copyable sectionKey' });
        }
        if (!Array.isArray(targetIds) || targetIds.length === 0) {
            return res.status(400).json({ error: 'targetIds must be a non-empty array' });
        }
        try {
            const liveData = gatherCvData();
            const updateStmt = db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
            const selectStmt = db.prepare('SELECT id, data FROM saved_datasets WHERE id = ?');
            const run = db.transaction(() => {
                const results = [];
                for (const rawId of targetIds) {
                    const id = parseInt(rawId, 10);
                    if (!Number.isFinite(id)) { results.push({ id: rawId, ok: false, error: 'invalid id' }); continue; }
                    const row = selectStmt.get(id);
                    if (!row) { results.push({ id, ok: false, error: 'not found' }); continue; }
                    let targetData;
                    try { targetData = JSON.parse(row.data); }
                    catch { results.push({ id, ok: false, error: 'corrupted' }); continue; }
                    try {
                        applyCopyToTargetData(targetData, sectionKey, liveData);
                    } catch (e) {
                        results.push({ id, ok: false, error: e.message });
                        continue;
                    }
                    updateStmt.run(JSON.stringify(targetData), id);
                    results.push({ id, ok: true });
                }
                return results;
            });
            const results = run();
            const okCount = results.filter(r => r.ok).length;
            res.json({ success: okCount > 0, okCount, failCount: results.length - okCount, results });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.post('/api/datasets/:id/load', (req, res) => { const dataset = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id); if (!dataset) return res.status(404).json({ error: 'Dataset not found' }); try { const data = JSON.parse(dataset.data); const importData = db.transaction(() => { if (data.theme && typeof data.theme === 'object') { const t = data.theme; const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'); if (t.primary && /^#[0-9a-fA-F]{6}$/.test(t.primary)) upsert.run('themeColor', t.primary); if (t.fontFamily) upsert.run('themeFontFamily', t.fontFamily); if (t.bulletStyle && ALLOWED_BULLET_STYLES.has(t.bulletStyle)) upsert.run('themeBulletStyle', t.bulletStyle); if (t.gradientStart && /^#[0-9a-fA-F]{6}$/.test(t.gradientStart)) upsert.run('themeGradientStart', t.gradientStart); else db.prepare('DELETE FROM settings WHERE key = ?').run('themeGradientStart'); if (t.gradientEnd && /^#[0-9a-fA-F]{6}$/.test(t.gradientEnd)) upsert.run('themeGradientEnd', t.gradientEnd); else db.prepare('DELETE FROM settings WHERE key = ?').run('themeGradientEnd'); if (t.sectionTitleColor && /^#[0-9a-fA-F]{6}$/.test(t.sectionTitleColor)) upsert.run('themeSectionTitleColor', t.sectionTitleColor); else db.prepare('DELETE FROM settings WHERE key = ?').run('themeSectionTitleColor'); if (Number.isInteger(t.sectionRadius) && t.sectionRadius >= SECTION_RADIUS_MIN && t.sectionRadius <= SECTION_RADIUS_MAX) upsert.run('themeSectionRadius', String(t.sectionRadius)); else db.prepare('DELETE FROM settings WHERE key = ?').run('themeSectionRadius'); } if (data.profile) { const p = data.profile; const cropValue = p.picture_crop ? (typeof p.picture_crop === 'string' ? p.picture_crop : JSON.stringify(p.picture_crop)) : null; db.prepare(`UPDATE profile SET name = ?, initials = ?, title = ?, subtitle = ?, bio = ?, location = ?, linkedin = ?, email = ?, phone = ?, languages = ?, profile_picture_enabled = ?, picture_filename = ?, picture_propagate = ?, picture_crop = ? WHERE id = 1`).run(p.name, p.initials, p.title, p.subtitle, p.bio, p.location, p.linkedin, p.email, p.phone, p.languages, p.profile_picture_enabled == null ? 1 : (p.profile_picture_enabled ? 1 : 0), p.picture_filename || null, p.picture_propagate == null ? 1 : (p.picture_propagate ? 1 : 0), cropValue); } if (data.experiences) { db.prepare('DELETE FROM experiences').run(); const stmt = db.prepare(`INSERT INTO experiences (job_title, company_name, start_date, end_date, location, country_code, highlights, summary, sort_order, visible, logo_filename, logo_propagate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`); data.experiences.forEach((e, idx) => { stmt.run(e.job_title, e.company_name, e.start_date, e.end_date, e.location, e.country_code || '', JSON.stringify(e.highlights || []), e.summary || null, idx, e.visible != false ? 1 : 0, e.logo_filename || null, e.logo_propagate ? 1 : 0); }); } if (data.certifications) { db.prepare('DELETE FROM certifications').run(); const stmt = db.prepare(`INSERT INTO certifications (name, provider, issue_date, expiry_date, credential_id, sort_order, visible, logo_filename, logo_propagate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`); data.certifications.forEach((c, idx) => { stmt.run(c.name, c.provider, c.issue_date, c.expiry_date, c.credential_id, idx, c.visible != false ? 1 : 0, c.logo_filename || null, c.logo_propagate ? 1 : 0); }); } if (data.education) { db.prepare('DELETE FROM education').run(); const stmt = db.prepare(`INSERT INTO education (degree_title, institution_name, start_date, end_date, description, sort_order, visible, logo_filename, logo_propagate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`); data.education.forEach((e, idx) => { stmt.run(e.degree_title, e.institution_name, e.start_date, e.end_date, e.description, idx, e.visible != false ? 1 : 0, e.logo_filename || null, e.logo_propagate ? 1 : 0); }); } if (data.skills) { db.prepare('DELETE FROM skills').run(); db.prepare('DELETE FROM skill_categories').run(); const catStmt = db.prepare('INSERT INTO skill_categories (name, icon, sort_order, visible) VALUES (?, ?, ?, ?)'); const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)'); data.skills.forEach((cat, catIdx) => { const result = catStmt.run(cat.name, cat.icon || 'default', catIdx, cat.visible != false ? 1 : 0); const categoryId = result.lastInsertRowid; if (cat.skills) { cat.skills.forEach((skill, skillIdx) => { skillStmt.run(categoryId, skill, skillIdx); }); } }); } if (data.projects) { db.prepare('DELETE FROM projects').run(); const stmt = db.prepare(`INSERT INTO projects (title, description, technologies, link, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?)`); data.projects.forEach((p, idx) => { stmt.run(p.title, p.description, JSON.stringify(p.technologies || []), p.link, idx, p.visible != false ? 1 : 0); }); } if (data.customSections && Array.isArray(data.customSections)) { db.prepare('DELETE FROM custom_section_items').run(); db.prepare('DELETE FROM custom_sections').run(); db.prepare("DELETE FROM section_visibility WHERE section_name LIKE 'custom_%'").run(); const sectionStmt = db.prepare(`INSERT INTO custom_sections (name, section_key, layout_type, icon, sort_order, visible, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`); const itemStmt = db.prepare(`INSERT INTO custom_section_items (section_id, title, subtitle, description, link, icon, image, metadata, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`); data.customSections.forEach((s, idx) => { const sectionKey = s.section_key || `custom_${Date.now()}_${idx}`; const sectionMetadata = s.metadata ? (typeof s.metadata === 'string' ? s.metadata : JSON.stringify(s.metadata)) : null; const result = sectionStmt.run(s.name, sectionKey, s.layout_type || 'grid-3', s.icon || 'layers', s.sort_order !== undefined ? s.sort_order : idx, s.visible != false ? 1 : 0, sectionMetadata); const sectionId = result.lastInsertRowid; db.prepare('INSERT OR REPLACE INTO section_visibility (section_name, visible, sort_order, display_name) VALUES (?, ?, ?, ?)').run(sectionKey, s.visible != false ? 1 : 0, s.sort_order !== undefined ? s.sort_order : idx, s.display_name || null); if (s.items && Array.isArray(s.items)) { s.items.forEach((item, itemIdx) => { itemStmt.run(sectionId, item.title || null, item.subtitle || null, item.description || null, item.link || null, item.icon || null, item.image || null, item.metadata ? (typeof item.metadata === 'string' ? item.metadata : JSON.stringify(item.metadata)) : null, item.sort_order !== undefined ? item.sort_order : itemIdx, item.visible != false ? 1 : 0); }); } }); } if (data.sectionOrder && Array.isArray(data.sectionOrder)) { data.sectionOrder.forEach(s => { db.prepare('UPDATE section_visibility SET visible = ?, sort_order = ?, display_name = ? WHERE section_name = ?').run(s.visible != false ? 1 : 0, s.sort_order || 0, s.display_name || null, s.key); }); } else if (data.sectionVisibility) { for (const [section, visible] of Object.entries(data.sectionVisibility)) { db.prepare('UPDATE section_visibility SET visible = ? WHERE section_name = ?').run(visible ? 1 : 0, section); } } }); importData(); res.json({ success: true, id: dataset.id, name: dataset.name, language: dataset.language || 'en', language_group: dataset.language_group, version_group: dataset.version_group, version: dataset.version || 1, is_default: !!dataset.is_default, is_public: !!dataset.is_public, theme: data.theme || null }); } catch (err) { res.status(500).json({ error: err.message }); } });
    app.delete('/api/datasets/:id', (req, res) => {
        try {
            const ds = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
            if (!ds) return res.status(404).json({ error: 'Dataset not found' });
            if (ds.is_default) return res.status(400).json({ error: 'Cannot delete the default dataset. Set another dataset as default first.' });
            db.prepare('DELETE FROM saved_datasets WHERE id = ?').run(req.params.id);
            res.json({ success: true });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Toggle dataset public visibility — per individual language variant
    app.put('/api/datasets/:id/public', (req, res) => {
        const { is_public } = req.body;
        try {
            const ds = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
            if (!ds) return res.status(404).json({ error: 'Dataset not found' });
            db.prepare('UPDATE saved_datasets SET is_public = ? WHERE id = ?').run(is_public ? 1 : 0, req.params.id);
            const updated = db.prepare('SELECT id, name, slug, is_public, is_default FROM saved_datasets WHERE id = ?').get(req.params.id);
            res.json({ success: true, id: updated.id, slug: updated.slug, is_public: !!updated.is_public, is_default: !!updated.is_default });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Change the language of a single dataset. Rejects the change if it would
    // create a conflict with a sibling in the same language_group or version_group.
    app.put('/api/datasets/:id/language', (req, res) => {
        const { language } = req.body;
        if (!language || !serverTranslations[language]) {
            return res.status(400).json({ error: 'Invalid or unsupported language' });
        }
        try {
            const ds = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
            if (!ds) return res.status(404).json({ error: 'Dataset not found' });
            if (ds.language === language) return res.json({ success: true, id: ds.id, language });
            // Conflict checks
            if (ds.language_group) {
                const conflict = db.prepare('SELECT id FROM saved_datasets WHERE language_group = ? AND language = ? AND id != ?').get(ds.language_group, language, ds.id);
                if (conflict) return res.status(409).json({ error: 'Another variant in this dataset already uses that language' });
            }
            if (ds.version_group) {
                const conflict = db.prepare('SELECT id FROM saved_datasets WHERE version_group = ? AND version = ? AND language = ? AND id != ?').get(ds.version_group, ds.version || 1, language, ds.id);
                if (conflict) return res.status(409).json({ error: 'Another dataset with the same version already uses that language' });
            }
            const nameConflict = db.prepare('SELECT id FROM saved_datasets WHERE name = ? AND language = ? AND id != ?').get(ds.name, language, ds.id);
            if (nameConflict) return res.status(409).json({ error: 'Another dataset with the same name already uses that language' });
            if (ds.slug) {
                const slugConflict = db.prepare('SELECT id FROM saved_datasets WHERE slug = ? AND version = ? AND language = ? AND id != ?').get(ds.slug, ds.version || 1, language, ds.id);
                if (slugConflict) return res.status(409).json({ error: 'URL conflict with another dataset in that language' });
            }
            db.prepare('UPDATE saved_datasets SET language = ? WHERE id = ?').run(language, req.params.id);
            res.json({ success: true, id: ds.id, language });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Get all siblings of a dataset (same language_group)
    app.get('/api/datasets/:id/siblings', (req, res) => {
        try {
            const dataset = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
            if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
            if (!dataset.language_group) return res.json([]);
            const siblings = db.prepare('SELECT id, name, language, slug, version, is_default, is_public, updated_at FROM saved_datasets WHERE language_group = ? ORDER BY language ASC').all(dataset.language_group);
            res.json(siblings.map(s => ({ ...s, is_default: !!s.is_default, is_public: !!s.is_public })));
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Dataset preview API - returns CV data for a specific dataset (admin only)
    // Language-specific: /api/datasets/slug/:slug/:lang
    app.get('/api/datasets/slug/:slug/:lang', (req, res) => {
        try {
            const dataset = db.prepare('SELECT * FROM saved_datasets WHERE slug = ? AND language = ?').get(req.params.slug, req.params.lang);
            if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
            const data = refreshDatasetSectionNames(JSON.parse(dataset.data), dataset.language);
            const siblings = dataset.language_group
                ? db.prepare('SELECT id, language FROM saved_datasets WHERE language_group = ? ORDER BY language ASC').all(dataset.language_group)
                : [{ id: dataset.id, language: dataset.language || 'en' }];
            res.json({ name: dataset.name, slug: dataset.slug, language: dataset.language, language_group: dataset.language_group, version_group: dataset.version_group, version: dataset.version || 1, siblings, ...data });
        } catch (err) {
            if (err.message?.includes('no such column')) return res.status(404).json({ error: 'Versioned datasets not available' });
            res.status(500).json({ error: err.message });
        }
    });
    // Fallback (no lang): return first available variant (prefer 'en')
    app.get('/api/datasets/slug/:slug', (req, res) => {
        try {
            const lang = req.query.lang;
            let dataset;
            if (lang) {
                dataset = db.prepare('SELECT * FROM saved_datasets WHERE slug = ? AND language = ?').get(req.params.slug, lang);
            }
            if (!dataset) {
                dataset = db.prepare('SELECT * FROM saved_datasets WHERE slug = ? ORDER BY CASE WHEN language = \'en\' THEN 0 ELSE 1 END, language ASC LIMIT 1').get(req.params.slug);
            }
            if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
            const data = refreshDatasetSectionNames(JSON.parse(dataset.data), dataset.language);
            const siblings = dataset.language_group
                ? db.prepare('SELECT id, language FROM saved_datasets WHERE language_group = ? ORDER BY language ASC').all(dataset.language_group)
                : [{ id: dataset.id, language: dataset.language || 'en' }];
            res.json({ name: dataset.name, slug: dataset.slug, language: dataset.language, language_group: dataset.language_group, version_group: dataset.version_group, version: dataset.version || 1, siblings, ...data });
        } catch (err) {
            if (err.message?.includes('no such column')) return res.status(404).json({ error: 'Versioned datasets not available' });
            res.status(500).json({ error: err.message });
        }
    });

    // Dataset preview page route (admin only) — language-specific
    app.get('/v/:slug/:lang', (req, res) => { serveAdminDatasetPage(req, res, req.params.lang); });
    app.get('/v/:slug', (req, res) => { serveAdminDatasetPage(req, res, req.query.lang); });

    // Dataset data API routes for admin preview (no visibility checks — admin can preview any dataset)
    app.get('/api/datasets/slug/:slug/:lang', (req, res) => {
        try {
            const dataset = resolveDatasetBySlug(req.params.slug, req.params.lang, false);
            if (!dataset) return res.status(404).json({ error: 'Not found' });
            const data = refreshDatasetSectionNames(JSON.parse(dataset.data), dataset.language);
            const siblings = getDatasetSiblings(dataset);
            res.json({ name: dataset.name, slug: dataset.slug, language: dataset.language, language_group: dataset.language_group, version_group: dataset.version_group, version: dataset.version || 1, siblings, ...data });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
    app.get('/api/datasets/slug/:slug', (req, res) => {
        try {
            const dataset = resolveDatasetBySlug(req.params.slug, null, false);
            if (!dataset) return res.status(404).json({ error: 'Not found' });
            const data = refreshDatasetSectionNames(JSON.parse(dataset.data), dataset.language);
            const siblings = getDatasetSiblings(dataset);
            res.json({ name: dataset.name, slug: dataset.slug, language: dataset.language, language_group: dataset.language_group, version_group: dataset.version_group, version: dataset.version || 1, siblings, ...data });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });
    app.get('/api/datasets/id/:id', (req, res) => {
        try {
            const dataset = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
            if (!dataset) return res.status(404).json({ error: 'Not found' });
            const data = refreshDatasetSectionNames(JSON.parse(dataset.data), dataset.language);
            const siblings = getDatasetSiblings(dataset);
            res.json({ name: dataset.name, slug: dataset.slug, language: dataset.language, language_group: dataset.language_group, version_group: dataset.version_group, version: dataset.version || 1, siblings, ...data });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // Custom Sections API
    app.get('/api/custom-sections', (req, res) => {
        const sections = db.prepare('SELECT * FROM custom_sections ORDER BY sort_order ASC').all();
        const items = db.prepare('SELECT * FROM custom_section_items ORDER BY sort_order ASC').all();
        res.json(sections.map(s => ({
            ...s,
            visible: !!s.visible,
            metadata: s.metadata ? JSON.parse(s.metadata) : null,
            items: items.filter(i => i.section_id === s.id).map(i => ({
                ...i,
                visible: !!i.visible,
                metadata: i.metadata ? JSON.parse(i.metadata) : null
            }))
        })));
    });

    app.get('/api/custom-sections/:id', (req, res) => {
        const section = db.prepare('SELECT * FROM custom_sections WHERE id = ?').get(req.params.id);
        if (!section) return res.status(404).json({ error: 'Not found' });
        const items = db.prepare('SELECT * FROM custom_section_items WHERE section_id = ? ORDER BY sort_order ASC').all(req.params.id);
        res.json({
            ...section,
            visible: !!section.visible,
            metadata: section.metadata ? JSON.parse(section.metadata) : null,
            items: items.map(i => ({ ...i, visible: !!i.visible, metadata: i.metadata ? JSON.parse(i.metadata) : null }))
        });
    });

    app.post('/api/custom-sections', (req, res) => {
        const { name, layout_type, icon, metadata } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });

        // Generate unique section_key
        const existing = db.prepare('SELECT COUNT(*) as count FROM custom_sections').get();
        const section_key = `custom_${Date.now()}`;

        // Get max sort_order from both tables
        const maxBuiltin = db.prepare('SELECT MAX(sort_order) as max FROM section_visibility').get();
        const maxCustom = db.prepare('SELECT MAX(sort_order) as max FROM custom_sections').get();
        const sort_order = Math.max(maxBuiltin.max || 0, maxCustom.max || 0) + 1;

        try {
            const result = db.prepare(`INSERT INTO custom_sections (name, section_key, layout_type, icon, sort_order, visible, metadata) VALUES (?, ?, ?, ?, ?, 1, ?)`).run(name.trim(), section_key, layout_type || 'grid-3', icon || 'layers', sort_order, metadata ? JSON.stringify(metadata) : null);
            
            // Also add to section_visibility for unified ordering
            db.prepare('INSERT OR REPLACE INTO section_visibility (section_name, visible, sort_order) VALUES (?, 1, ?)').run(section_key, sort_order);
            
            res.json({ id: result.lastInsertRowid, section_key });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.put('/api/custom-sections/:id', (req, res) => {
        const { name, layout_type, icon, visible, sort_order, metadata } = req.body;
        const section = db.prepare('SELECT * FROM custom_sections WHERE id = ?').get(req.params.id);
        if (!section) return res.status(404).json({ error: 'Not found' });

        // Preserve existing values when not provided in request
        const newVisible = visible !== undefined ? (visible ? 1 : 0) : section.visible;
        const newSortOrder = sort_order !== undefined ? sort_order : section.sort_order;
        const newMetadata = metadata !== undefined ? JSON.stringify(metadata) : section.metadata;

        db.prepare(`UPDATE custom_sections SET name = ?, layout_type = ?, icon = ?, visible = ?, sort_order = ?, metadata = ? WHERE id = ?`).run(name || section.name, layout_type || section.layout_type, icon || section.icon, newVisible, newSortOrder, newMetadata, req.params.id);
        
        // Update section_visibility too
        db.prepare('UPDATE section_visibility SET visible = ?, sort_order = ? WHERE section_name = ?').run(newVisible, newSortOrder, section.section_key);
        
        res.json({ success: true });
    });

    app.delete('/api/custom-sections/:id', (req, res) => {
        const section = db.prepare('SELECT section_key FROM custom_sections WHERE id = ?').get(req.params.id);
        if (section) {
            db.prepare('DELETE FROM section_visibility WHERE section_name = ?').run(section.section_key);
            db.prepare('DELETE FROM section_title_overrides WHERE section_key = ?').run(section.section_key);
        }
        // Clean up picture files for all items in this section
        const items = db.prepare('SELECT image FROM custom_section_items WHERE section_id = ? AND image IS NOT NULL').all(req.params.id);
        items.forEach(item => {
            if (item.image) {
                const imgPath = path.join(uploadsPath, item.image);
                try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
            }
        });
        db.prepare('DELETE FROM custom_section_items WHERE section_id = ?').run(req.params.id);
        db.prepare('DELETE FROM custom_sections WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    // Custom Section Items API
    app.get('/api/custom-sections/:id/items', (req, res) => {
        const items = db.prepare('SELECT * FROM custom_section_items WHERE section_id = ? ORDER BY sort_order ASC').all(req.params.id);
        res.json(items.map(i => ({ ...i, visible: !!i.visible, metadata: i.metadata ? JSON.parse(i.metadata) : null })));
    });

    app.post('/api/custom-sections/:id/items', (req, res) => {
        const { title, subtitle, description, link, icon, image, metadata } = req.body;
        const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM custom_section_items WHERE section_id = ?').get(req.params.id);
        const result = db.prepare(`INSERT INTO custom_section_items (section_id, title, subtitle, description, link, icon, image, metadata, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`).run(req.params.id, title, subtitle, description, link, icon, image, metadata ? JSON.stringify(metadata) : null, (maxOrder.max || 0) + 1);
        res.json({ id: result.lastInsertRowid });
    });

    app.put('/api/custom-sections/:id/items/:itemId', (req, res) => {
        const { title, subtitle, description, link, icon, image, metadata, sort_order } = req.body;
        // Preserve existing sort_order when not provided
        let newSortOrder = sort_order;
        if (newSortOrder === undefined) {
            const existing = db.prepare('SELECT sort_order FROM custom_section_items WHERE id = ? AND section_id = ?').get(req.params.itemId, req.params.id);
            newSortOrder = existing ? existing.sort_order : 0;
        }
        db.prepare(`UPDATE custom_section_items SET title = ?, subtitle = ?, description = ?, link = ?, icon = ?, image = ?, metadata = ?, visible = 1, sort_order = ? WHERE id = ? AND section_id = ?`).run(title, subtitle, description, link, icon, image, metadata ? JSON.stringify(metadata) : null, newSortOrder, req.params.itemId, req.params.id);
        res.json({ success: true });
    });

    app.delete('/api/custom-sections/:id/items/:itemId', (req, res) => {
        const item = db.prepare('SELECT image FROM custom_section_items WHERE id = ? AND section_id = ?').get(req.params.itemId, req.params.id);
        if (item && item.image) {
            const imgPath = path.join(uploadsPath, item.image);
            try { if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); } catch (e) {}
        }
        db.prepare('DELETE FROM custom_section_items WHERE id = ? AND section_id = ?').run(req.params.itemId, req.params.id);
        res.json({ success: true });
    });

    // Custom section item: reuse existing logo
    app.put('/api/custom-sections/:id/items/:itemId/picture', (req, res) => {
        const { filename } = req.body;
        if (!filename) return res.status(400).json({ error: 'No filename provided' });
        db.prepare('UPDATE custom_section_items SET image = ? WHERE id = ? AND section_id = ?').run(filename, req.params.itemId, req.params.id);
        res.json({ success: true });
    });

    // Custom section item: remove picture
    app.delete('/api/custom-sections/:id/items/:itemId/picture', (req, res) => {
        db.prepare('UPDATE custom_section_items SET image = NULL WHERE id = ? AND section_id = ?').run(req.params.itemId, req.params.id);
        res.json({ success: true });
    });

    // Custom section item picture upload
    const csItemPicStorage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsPath), filename: (req, file, cb) => { const ext = path.extname(file.originalname).toLowerCase() || '.jpg'; cb(null, `cs_${req.params.id}_${req.params.itemId}_${Date.now()}${ext}`); } });
    const csItemPicUpload = multer({ storage: csItemPicStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => { const allowed = ['image/jpeg', 'image/png', 'image/webp']; cb(null, allowed.includes(file.mimetype)); } });
    app.post('/api/custom-sections/:id/items/:itemId/picture', csItemPicUpload.single('picture'), (req, res) => {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        // Delete old picture if exists
        const item = db.prepare('SELECT image FROM custom_section_items WHERE id = ? AND section_id = ?').get(req.params.itemId, req.params.id);
        if (item && item.image) {
            const oldPath = path.join(uploadsPath, item.image);
            try { if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); } catch (e) {}
        }
        db.prepare('UPDATE custom_section_items SET image = ? WHERE id = ? AND section_id = ?').run(req.file.filename, req.params.itemId, req.params.id);
        res.json({ success: true, filename: req.file.filename });
    });

    // Layout types and social platforms metadata
    app.get('/api/layout-types', (req, res) => { res.json(LAYOUT_TYPES); });
    app.get('/api/social-platforms', (req, res) => { res.json(SOCIAL_PLATFORMS); });

    app.get('/api/timeline', (req, res) => {
        const experiences = db.prepare(`SELECT id, company_name, job_title, start_date, end_date, country_code, visible, logo_filename FROM experiences ORDER BY start_date ASC`).all().map(exp => ({ id: exp.id, company: exp.company_name, role: exp.job_title, period: formatPeriod(exp.start_date, exp.end_date), start_date: exp.start_date, end_date: exp.end_date, countryCode: exp.country_code || '', visible: !!exp.visible, logo: exp.logo_filename || null }));
        const timelineSections = db.prepare(`SELECT id, metadata FROM custom_sections WHERE layout_type = 'timeline' AND visible = 1`).all().filter(s => { const meta = s.metadata ? JSON.parse(s.metadata) : {}; return meta.show_on_timeline; });
        const customItems = [];
        for (const section of timelineSections) {
            const items = db.prepare(`SELECT * FROM custom_section_items WHERE section_id = ? ORDER BY sort_order ASC`).all(section.id);
            for (const item of items) {
                const meta = item.metadata ? JSON.parse(item.metadata) : {};
                customItems.push({ id: `cs_${item.id}`, company: item.subtitle || '', role: item.title || '', period: formatPeriod(meta.start_date, meta.end_date), start_date: meta.start_date || '', end_date: meta.end_date || '', countryCode: meta.country_code || '', visible: !!item.visible, logo: item.image || null });
            }
        }
        res.json([...experiences, ...customItems]);
    });

    app.get('/api/cv', (req, res) => { const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get(); const experiences = db.prepare('SELECT * FROM experiences ORDER BY sort_order ASC, start_date DESC').all(); const certifications = db.prepare('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC').all(); const education = db.prepare('SELECT * FROM education ORDER BY sort_order ASC, end_date DESC').all(); const skillCategories = db.prepare('SELECT * FROM skill_categories ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all(); const sections = db.prepare('SELECT * FROM section_visibility ORDER BY sort_order ASC').all(); const sectionVisibility = {}; const sectionOrderData = []; sections.forEach(s => { sectionVisibility[s.section_name] = !!s.visible; sectionOrderData.push({ key: s.section_name, sort_order: s.sort_order || 0, visible: !!s.visible, display_name: s.display_name || null }); }); const customSections = db.prepare('SELECT * FROM custom_sections ORDER BY sort_order ASC').all(); const customItems = db.prepare('SELECT * FROM custom_section_items ORDER BY sort_order ASC').all(); const customSectionsData = customSections.map(s => ({ ...s, visible: !!s.visible, metadata: s.metadata ? JSON.parse(s.metadata) : null, items: customItems.filter(i => i.section_id === s.id).map(i => ({ ...i, visible: !!i.visible, metadata: i.metadata ? JSON.parse(i.metadata) : null })) })); res.json({ profile, experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })), certifications, education, skills: skillCategories.map(cat => ({ ...cat, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) })), projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] })), sectionVisibility, sectionOrder: sectionOrderData, customSections: customSectionsData }); });

    app.post('/api/import', (req, res) => { const data = req.body; const importData = db.transaction(() => { if (data.profile) { const p = data.profile; db.prepare(`UPDATE profile SET name = ?, initials = ?, title = ?, subtitle = ?, bio = ?, location = ?, linkedin = ?, email = ?, phone = ?, languages = ? WHERE id = 1`).run(p.name, p.initials, p.title, p.subtitle, p.bio, p.location, p.linkedin, p.email, p.phone, p.languages); } if (data.experiences) { db.prepare('DELETE FROM experiences').run(); const stmt = db.prepare(`INSERT INTO experiences (job_title, company_name, start_date, end_date, location, country_code, highlights, summary, sort_order, visible, logo_filename, logo_propagate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`); data.experiences.forEach((e, idx) => { stmt.run(e.job_title, e.company_name, e.start_date, e.end_date, e.location, e.country_code || '', JSON.stringify(e.highlights || []), e.summary || null, idx, e.visible != false ? 1 : 0, e.logo_filename || null, e.logo_propagate ? 1 : 0); }); } if (data.certifications) { db.prepare('DELETE FROM certifications').run(); const stmt = db.prepare(`INSERT INTO certifications (name, provider, issue_date, expiry_date, credential_id, sort_order, visible, logo_filename, logo_propagate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`); data.certifications.forEach((c, idx) => { stmt.run(c.name, c.provider, c.issue_date, c.expiry_date, c.credential_id, idx, c.visible != false ? 1 : 0, c.logo_filename || null, c.logo_propagate ? 1 : 0); }); } if (data.education) { db.prepare('DELETE FROM education').run(); const stmt = db.prepare(`INSERT INTO education (degree_title, institution_name, start_date, end_date, description, sort_order, visible, logo_filename, logo_propagate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`); data.education.forEach((e, idx) => { stmt.run(e.degree_title, e.institution_name, e.start_date, e.end_date, e.description, idx, e.visible != false ? 1 : 0, e.logo_filename || null, e.logo_propagate ? 1 : 0); }); } if (data.skills) { db.prepare('DELETE FROM skills').run(); db.prepare('DELETE FROM skill_categories').run(); const catStmt = db.prepare('INSERT INTO skill_categories (name, icon, sort_order, visible) VALUES (?, ?, ?, ?)'); const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)'); data.skills.forEach((cat, catIdx) => { const result = catStmt.run(cat.name, cat.icon || 'default', catIdx, cat.visible != false ? 1 : 0); const categoryId = result.lastInsertRowid; if (cat.skills) { cat.skills.forEach((skill, skillIdx) => { skillStmt.run(categoryId, skill, skillIdx); }); } }); } if (data.projects) { db.prepare('DELETE FROM projects').run(); const stmt = db.prepare(`INSERT INTO projects (title, description, technologies, link, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?)`); data.projects.forEach((p, idx) => { stmt.run(p.title, p.description, JSON.stringify(p.technologies || []), p.link, idx, p.visible != false ? 1 : 0); }); } if (data.customSections && Array.isArray(data.customSections)) { db.prepare('DELETE FROM custom_section_items').run(); db.prepare('DELETE FROM custom_sections').run(); db.prepare("DELETE FROM section_visibility WHERE section_name LIKE 'custom_%'").run(); const sectionStmt = db.prepare(`INSERT INTO custom_sections (name, section_key, layout_type, icon, sort_order, visible, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)`); const itemStmt = db.prepare(`INSERT INTO custom_section_items (section_id, title, subtitle, description, link, icon, image, metadata, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`); data.customSections.forEach((s, idx) => { const sectionKey = s.section_key || `custom_${Date.now()}_${idx}`; const sectionMetadata = s.metadata ? (typeof s.metadata === 'string' ? s.metadata : JSON.stringify(s.metadata)) : null; const result = sectionStmt.run(s.name, sectionKey, s.layout_type || 'grid-3', s.icon || 'layers', s.sort_order !== undefined ? s.sort_order : idx, s.visible != false ? 1 : 0, sectionMetadata); const sectionId = result.lastInsertRowid; db.prepare('INSERT OR REPLACE INTO section_visibility (section_name, visible, sort_order, display_name) VALUES (?, ?, ?, ?)').run(sectionKey, s.visible != false ? 1 : 0, s.sort_order !== undefined ? s.sort_order : idx, s.display_name || null); if (s.items && Array.isArray(s.items)) { s.items.forEach((item, itemIdx) => { itemStmt.run(sectionId, item.title || null, item.subtitle || null, item.description || null, item.link || null, item.icon || null, item.image || null, item.metadata ? (typeof item.metadata === 'string' ? item.metadata : JSON.stringify(item.metadata)) : null, item.sort_order !== undefined ? item.sort_order : itemIdx, item.visible != false ? 1 : 0); }); } }); } if (data.sectionOrder && Array.isArray(data.sectionOrder)) { data.sectionOrder.forEach(s => { db.prepare('UPDATE section_visibility SET visible = ?, sort_order = ?, display_name = ? WHERE section_name = ?').run(s.visible != false ? 1 : 0, s.sort_order || 0, s.display_name || null, s.key); }); } }); try { importData(); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); } });

    // ATS-friendly tagged PDF export (admin only)
    // Uses pdfkit directly for StructTreeRoot / tagged PDF support
    app.post('/api/export/ats-pdf', async (req, res) => {
        try {
            const { scale = 1, paperSize = 'A4', locale: reqLocale, forceEnglishHeaders } = req.body || {};
            const s = Math.max(0.5, Math.min(1.5, parseFloat(scale) || 1));
            const locale = resolveLocale(reqLocale);
            const t = (key) => serverT(key, locale);
            const tHeader = forceEnglishHeaders ? (key) => serverT(key, 'en') : t;

            const cvData = gatherCvData();
            const p = cvData.profile || {};
            const sectionOrder = cvData.sectionOrder || [];

            const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
            function fmtDate(dateStr) {
                if (!dateStr) return '';
                if (/^\d{4}$/.test(dateStr)) return dateStr;
                if (/^\d{4}-\d{2}$/.test(dateStr)) {
                    const [y, m] = dateStr.split('-');
                    return `${t('month.short.' + MONTH_KEYS[parseInt(m) - 1])} ${y}`;
                }
                return dateStr;
            }

            function getSectionName(key) {
                const orderEntry = sectionOrder.find(s => s.key === key);
                const cs = (cvData.customSections || []).find(s => s.section_key === key);
                if (forceEnglishHeaders) {
                    if (SECTION_DISPLAY_NAMES[key]) return SECTION_DISPLAY_NAMES[key];
                    if (cs && cs.name) return cs.name;
                    return key;
                }
                return resolveSectionTitle(key, {
                    datasetOverride: orderEntry ? orderEntry.display_name : null,
                    language: locale,
                    locale,
                    customNameFallback: cs ? cs.name : null
                });
            }

            const sz = (base) => Math.round(base * s * 10) / 10;
            const pageW = paperSize === 'LETTER' ? 612 : 595.28;
            const pageH = paperSize === 'LETTER' ? 792 : 841.89;
            const margin = 40;
            const contentW = pageW - margin * 2;
            const accentColor = '#2563eb';

            const doc = new PDFDocument({
                tagged: true,
                displayTitle: true,
                size: [pageW, pageH],
                margins: { top: margin, bottom: margin, left: margin, right: margin },
                info: {
                    Title: `${p.name || 'CV'} - ${t('ats.pdf_title_suffix')}`,
                    Author: p.name || '',
                    Subject: t('ats.pdf_subject'),
                    Keywords: (cvData.skills || []).flatMap(c => c.skills || []).join(', ')
                },
                lang: locale,
                font: 'Helvetica'
            });

            // Collect PDF into buffer
            const chunks = [];
            doc.on('data', c => chunks.push(c));
            const pdfReady = new Promise((resolve, reject) => {
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
            });

            // Structure tree
            const docStruct = doc.struct('Document');
            doc.addStructure(docStruct);

            // Track Y position for page breaks
            let y = margin;
            function ensureSpace(needed) {
                if (y + needed > pageH - margin) {
                    doc.addPage();
                    y = margin;
                }
            }
            function advanceY(amount) { y += amount; }

            // --- Tagged helper functions ---
            function addHeading(tag, text, fontSize, options = {}) {
                const { color = '#000', bold = true } = options;
                const lineH = fontSize * 1.3;
                ensureSpace(lineH + 4);
                const heading = doc.struct(tag);
                docStruct.add(heading);
                heading.add(doc.struct('Span', {}, () => {
                    doc.fontSize(fontSize).font(bold ? 'Helvetica-Bold' : 'Helvetica').fillColor(color);
                    doc.text(text, margin, y, { width: contentW });
                }));
                heading.end();
                advanceY(doc.heightOfString(text, { width: contentW, fontSize }) + 4);
            }

            function addParagraph(text, fontSize, options = {}) {
                const { color = '#000', font = 'Helvetica', indent = 0 } = options;
                const w = contentW - indent;
                const runs = splitBoldRuns(text);
                const stripped = runs.map(r => r.text).join('');
                // Base font already bold → treat **…** as no-op (text is already bold).
                const baseIsBold = font === 'Helvetica-Bold';
                const boldFont = baseIsBold ? font : 'Helvetica-Bold';
                const h = doc.fontSize(fontSize).font(font).heightOfString(stripped, { width: w });
                ensureSpace(h + 2);
                const para = doc.struct('P');
                docStruct.add(para);
                para.add(doc.struct('Span', {}, () => {
                    doc.fontSize(fontSize).fillColor(color);
                    if (runs.length === 1 || baseIsBold) {
                        doc.font(font).text(stripped, margin + indent, y, { width: w });
                    } else {
                        runs.forEach((r, i) => {
                            doc.font(r.bold ? boldFont : font);
                            const opts = { width: w, continued: i < runs.length - 1 };
                            if (i === 0) {
                                doc.text(r.text, margin + indent, y, opts);
                            } else {
                                doc.text(r.text, opts);
                            }
                        });
                    }
                }));
                para.end();
                advanceY(h + 2);
            }

            function addSectionHeading(text) {
                ensureSpace(sz(13) * 1.3 + 8);
                advanceY(4);
                addHeading('H2', text, sz(13), { color: accentColor });
            }

            function addBulletList(items, fontSize) {
                const listStruct = doc.struct('L');
                docStruct.add(listStruct);
                items.forEach(item => {
                    if (!item || !item.trim()) return;
                    const w = contentW - 20;
                    const runs = splitBoldRuns(item);
                    const stripped = runs.map(r => r.text).join('');
                    const h = doc.fontSize(fontSize).font('Helvetica').heightOfString(stripped, { width: w });
                    ensureSpace(h + 2);
                    const li = doc.struct('LI');
                    listStruct.add(li);
                    li.add(doc.struct('Lbl', {}, () => {
                        doc.fontSize(fontSize).font('Helvetica').fillColor('#000');
                        doc.text('•', margin + 8, y, { continued: false, width: 12 });
                    }));
                    li.add(doc.struct('LBody', {}, () => {
                        doc.fontSize(fontSize).fillColor('#000');
                        if (runs.length === 1) {
                            doc.font('Helvetica').text(stripped, margin + 20, y, { width: w });
                        } else {
                            runs.forEach((r, i) => {
                                doc.font(r.bold ? 'Helvetica-Bold' : 'Helvetica');
                                const opts = { width: w, continued: i < runs.length - 1 };
                                if (i === 0) {
                                    doc.text(r.text, margin + 20, y, opts);
                                } else {
                                    doc.text(r.text, opts);
                                }
                            });
                        }
                    }));
                    li.end();
                    advanceY(h + 2);
                });
                listStruct.end();
            }

            // --- Header ---
            addHeading('H1', p.name || t('ats.name_fallback'), sz(22));
            if (p.title) addParagraph(p.title, sz(12), { color: '#444' });
            if (p.subtitle) addParagraph(p.subtitle, sz(10), { color: '#666' });

            const contactParts = [];
            if (p.email) contactParts.push(p.email);
            if (p.phone) contactParts.push(p.phone);
            if (p.location) contactParts.push(p.location);
            if (p.linkedin) contactParts.push(p.linkedin);
            if (p.languages) contactParts.push(p.languages);
            if (contactParts.length > 0) {
                addParagraph(contactParts.join('  |  '), sz(9), { color: '#555' });
            }

            // Separator
            ensureSpace(8);
            doc.moveTo(margin, y).lineTo(margin + contentW, y).lineWidth(0.5).strokeColor('#ddd').stroke();
            advanceY(8);

            // --- Section renderers ---
            const sectionRenderers = {
                about: () => {
                    if (!p.bio) return;
                    addSectionHeading(getSectionName('about'));
                    addParagraph(p.bio.replace(/\n+/g, ' ').trim(), sz(9.5));
                    advanceY(4);
                },
                experience: () => {
                    const items = (cvData.experiences || []).filter(e => e.visible !== false && e.visible !== 0);
                    if (items.length === 0) return;
                    addSectionHeading(getSectionName('experience'));
                    items.forEach((exp, idx) => {
                        if (idx > 0) {
                            // Clear separator line between entries for ATS parsers
                            ensureSpace(12);
                            advanceY(3);
                            doc.moveTo(margin, y).lineTo(margin + contentW, y).lineWidth(0.25).strokeColor('#e0e0e0').stroke();
                            advanceY(6);
                        }
                        const title = exp.job_title || '';
                        const dateStr = `${fmtDate(exp.start_date)} – ${exp.end_date ? fmtDate(exp.end_date) : t('present')}`;

                        // Job title on its own line as H3
                        ensureSpace(sz(10) * 1.3 + 4);
                        const h3 = doc.struct('H3');
                        docStruct.add(h3);
                        h3.add(doc.struct('Span', {}, () => {
                            doc.fontSize(sz(10)).font('Helvetica-Bold').fillColor('#000');
                            doc.text(title, margin, y, { width: contentW, continued: false });
                        }));
                        h3.end();
                        advanceY(doc.fontSize(sz(10)).font('Helvetica-Bold').heightOfString(title, { width: contentW }) + 2);

                        // Company name on its own line
                        if (exp.company_name) {
                            addParagraph(exp.company_name, sz(9.5), { color: '#333', font: 'Helvetica-Bold' });
                        }

                        // Date on its own line
                        addParagraph(dateStr, sz(9), { color: '#666' });

                        if (exp.location) {
                            addParagraph(exp.location, sz(8.5), { color: '#777' });
                        }
                        if (exp.summary) {
                            addParagraph(exp.summary, sz(9), { color: '#333' });
                        }
                        if (exp.highlights && exp.highlights.length > 0) {
                            const bullets = exp.highlights.filter(h => h && h.trim());
                            if (bullets.length > 0) addBulletList(bullets, sz(9));
                        }
                    });
                    advanceY(4);
                },
                education: () => {
                    const items = (cvData.education || []).filter(e => e.visible !== false && e.visible !== 0);
                    if (items.length === 0) return;
                    addSectionHeading(getSectionName('education'));
                    items.forEach((edu, idx) => {
                        if (idx > 0) {
                            ensureSpace(12);
                            advanceY(3);
                            doc.moveTo(margin, y).lineTo(margin + contentW, y).lineWidth(0.25).strokeColor('#e0e0e0').stroke();
                            advanceY(6);
                        }
                        const title = edu.degree_title || '';
                        const dateStr = `${fmtDate(edu.start_date)} – ${edu.end_date ? fmtDate(edu.end_date) : t('present')}`;

                        // Degree on its own line as H3
                        ensureSpace(sz(10) * 1.3 + 4);
                        const h3 = doc.struct('H3');
                        docStruct.add(h3);
                        h3.add(doc.struct('Span', {}, () => {
                            doc.fontSize(sz(10)).font('Helvetica-Bold').fillColor('#000');
                            doc.text(title, margin, y, { width: contentW, continued: false });
                        }));
                        h3.end();
                        advanceY(doc.fontSize(sz(10)).font('Helvetica-Bold').heightOfString(title, { width: contentW }) + 2);

                        // Institution on its own line
                        if (edu.institution_name) {
                            addParagraph(edu.institution_name, sz(9.5), { color: '#333', font: 'Helvetica-Bold' });
                        }

                        // Date on its own line
                        addParagraph(dateStr, sz(9), { color: '#666' });

                        if (edu.description) addParagraph(edu.description, sz(9), { color: '#555' });
                    });
                    advanceY(4);
                },
                skills: () => {
                    const cats = (cvData.skills || []).filter(c => c.visible !== false && c.visible !== 0);
                    if (cats.length === 0) return;
                    addSectionHeading(getSectionName('skills'));
                    cats.forEach(cat => {
                        if (cat.skills && cat.skills.length > 0) {
                            const text = `${cat.name}: ${cat.skills.join(', ')}`;
                            const w = contentW;
                            const h = doc.fontSize(sz(9.5)).font('Helvetica').heightOfString(text, { width: w });
                            ensureSpace(h + 2);
                            const para = doc.struct('P');
                            docStruct.add(para);
                            para.add(doc.struct('Span', {}, () => {
                                doc.fontSize(sz(9.5)).font('Helvetica-Bold').fillColor('#000');
                                doc.text(`${cat.name}: `, margin, y, { continued: true, width: w });
                                doc.font('Helvetica').text(cat.skills.join(', '), { continued: false });
                            }));
                            para.end();
                            advanceY(h + 2);
                        }
                    });
                    advanceY(4);
                },
                certifications: () => {
                    const items = (cvData.certifications || []).filter(c => c.visible !== false && c.visible !== 0);
                    if (items.length === 0) return;
                    addSectionHeading(getSectionName('certifications'));
                    items.forEach(cert => {
                        let line = cert.name || '';
                        if (cert.provider) line += ` – ${cert.provider}`;
                        if (cert.issue_date) line += ` (${fmtDate(cert.issue_date)})`;
                        addParagraph(line, sz(9.5));
                    });
                    advanceY(4);
                },
                projects: () => {
                    const items = (cvData.projects || []).filter(pr => pr.visible !== false && pr.visible !== 0);
                    if (items.length === 0) return;
                    addSectionHeading(getSectionName('projects'));
                    items.forEach((proj, idx) => {
                        if (idx > 0) {
                            ensureSpace(12);
                            advanceY(3);
                            doc.moveTo(margin, y).lineTo(margin + contentW, y).lineWidth(0.25).strokeColor('#e0e0e0').stroke();
                            advanceY(6);
                        }
                        const titleText = proj.title || '';
                        ensureSpace(sz(10) * 1.3 + 4);
                        const h3 = doc.struct('H3');
                        docStruct.add(h3);
                        h3.add(doc.struct('Span', {}, () => {
                            doc.fontSize(sz(10)).font('Helvetica-Bold').fillColor('#000');
                            doc.text(titleText, margin, y, { width: contentW, continued: false });
                        }));
                        h3.end();
                        advanceY(doc.heightOfString(titleText, { width: contentW, fontSize: sz(10) }) + 2);

                        if (proj.description) addParagraph(proj.description, sz(9));
                        if (proj.technologies && proj.technologies.length > 0) {
                            addParagraph(`${t('ats.technologies_label')}: ${proj.technologies.join(', ')}`, sz(8.5), { color: '#666', font: 'Helvetica-Oblique' });
                        }
                        if (proj.link) addParagraph(proj.link, sz(8), { color: accentColor });
                    });
                    advanceY(4);
                }
            };

            // Custom section renderer
            function renderCustomSection(sectionKey) {
                const cs = (cvData.customSections || []).find(s => s.section_key === sectionKey && s.visible);
                if (!cs || !cs.items || cs.items.length === 0) return;
                const visibleItems = cs.items.filter(i => i.visible !== false && i.visible !== 0);
                if (visibleItems.length === 0) return;

                addSectionHeading(getSectionName(sectionKey) || cs.name);
                visibleItems.forEach(item => {
                    if (item.title) {
                        ensureSpace(sz(10) * 1.3 + 4);
                        const h3 = doc.struct('H3');
                        docStruct.add(h3);
                        h3.add(doc.struct('Span', {}, () => {
                            doc.fontSize(sz(10)).font('Helvetica-Bold').fillColor('#000');
                            doc.text(item.title, margin, y, { width: contentW, continued: false });
                        }));
                        h3.end();
                        advanceY(doc.heightOfString(item.title, { width: contentW, fontSize: sz(10) }) + 2);
                    }
                    if (item.subtitle) addParagraph(item.subtitle, sz(9), { color: '#666' });
                    if (item.description) addParagraph(item.description, sz(9));
                    if (item.link) addParagraph(item.link, sz(8), { color: accentColor });
                });
                advanceY(4);
            }

            // Render sections in configured order
            const sortedSections = [...sectionOrder].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
            for (const section of sortedSections) {
                if (!section.visible) continue;
                if (section.key === 'timeline') continue;
                if (sectionRenderers[section.key]) {
                    sectionRenderers[section.key]();
                } else if (section.key.startsWith('custom_')) {
                    renderCustomSection(section.key);
                }
            }

            docStruct.end();
            doc.end();

            const buffer = await pdfReady;
            const filename = `${(p.name || 'cv').replace(/[^a-zA-Z0-9]/g, '_')}_ATS_Resume.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', buffer.length);
            res.end(buffer);
        } catch (err) {
            console.error('ATS PDF export error:', err);
            res.status(500).json({ error: 'Failed to generate PDF' });
        }
    });

    // Static site export (admin only) - generates a ZIP with HTML, CSS, JS, JSON data
    app.get('/api/export/static-site', (req, res) => {
        try {
            const cvData = gatherCvData();

            // Filter sensitive data from profile
            const profile = { ...cvData.profile };
            delete profile.email;
            delete profile.phone;
            delete profile.id;
            delete profile.updated_at;

            // Certifications: credential_id is a public verification URL, no filtering needed
            const certifications = cvData.certifications;

            // Gather all settings
            const settingsRows = db.prepare('SELECT * FROM settings').all();
            const settings = {};
            settingsRows.forEach(s => { settings[s.key] = s.value; });

            // Gather timeline data
            const timelineExperiences = db.prepare('SELECT id, company_name, job_title, start_date, end_date, country_code, logo_filename FROM experiences WHERE visible = 1 ORDER BY start_date ASC').all().map(exp => ({ id: exp.id, company: exp.company_name, role: exp.job_title, period: formatPeriod(exp.start_date, exp.end_date), start_date: exp.start_date, end_date: exp.end_date, countryCode: exp.country_code || '', visible: true, logo: exp.logo_filename || null }));
            const timelineSections = db.prepare(`SELECT id, metadata FROM custom_sections WHERE layout_type = 'timeline' AND visible = 1`).all().filter(s => { const meta = s.metadata ? JSON.parse(s.metadata) : {}; return meta.show_on_timeline; });
            const timelineCustomItems = [];
            for (const section of timelineSections) {
                const items = db.prepare(`SELECT * FROM custom_section_items WHERE section_id = ? AND visible = 1 ORDER BY sort_order ASC`).all(section.id);
                for (const item of items) {
                    const meta = item.metadata ? JSON.parse(item.metadata) : {};
                    timelineCustomItems.push({ id: `cs_${item.id}`, company: item.subtitle || '', role: item.title || '', period: formatPeriod(meta.start_date, meta.end_date), start_date: meta.start_date || '', end_date: meta.end_date || '', countryCode: meta.country_code || '', visible: true, logo: item.image || null });
                }
            }

            const staticData = {
                profile,
                experiences: cvData.experiences,
                certifications,
                education: cvData.education,
                skills: cvData.skills,
                projects: cvData.projects,
                sectionVisibility: cvData.sectionVisibility,
                sectionOrder: cvData.sectionOrder,
                customSections: cvData.customSections,
                settings,
                layoutTypes: LAYOUT_TYPES,
                socialPlatforms: SOCIAL_PLATFORMS,
                timeline: [...timelineExperiences, ...timelineCustomItems]
            };

            // Prepare HTML
            let html = fs.readFileSync(path.join(__dirname, '../public-readonly/index.html'), 'utf8');

            // Inject meta tags
            const name = profile.name || 'CV';
            const bio = profile.bio || 'Professional CV';
            const description = stripBoldMarkers(bio).substring(0, 160).replace(/\n/g, ' ');
            html = html.replace(/<title>[^<]*<\/title>/, `<title>${name} - CV</title>`);
            html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`);

            // Inject OG tags
            const ogTags = `\n    <meta property="og:title" content="${name} - CV">\n    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}">\n    <meta property="og:type" content="profile">`;
            html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">${ogTags}`);

            // Inject robots meta
            const robotsValue = settings.robotsMeta || 'index, follow';
            html = html.replace(/<meta name="robots"[^>]*>/, `<meta name="robots" id="metaRobots" content="${robotsValue}">`);

            // Inject tracking code if configured
            const trackingCode = getTrackingCode();
            if (trackingCode && !isTrackingConsentRequired()) {
                html = html.replace('<head>', `<head>\n${trackingCode}`);
            }

            // Inject static site flag
            html = html.replace('</head>', `<script>window.STATIC_SITE = true;</script>\n</head>`);

            // Convert absolute paths to relative
            html = html.replace(/href="\/shared\//g, 'href="./shared/');
            html = html.replace(/src="\/shared\//g, 'src="./shared/');
            html = html.replace(/href="\/favicon/g, 'href="./favicon');
            html = html.replace(/href="\/apple-touch-icon/g, 'href="./apple-touch-icon');

            // Fix image paths in the inline JS to use relative paths
            html = html.replace(/src="\/uploads\//g, 'src="./uploads/');
            html = html.replace(/fetch\('\/shared\//g, "fetch('./shared/");

            // Create ZIP
            const archive = archiver('zip', { zlib: { level: 9 } });

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${(name).replace(/[^a-zA-Z0-9]/g, '_')}_static_site.zip"`);

            archive.pipe(res);

            // Add HTML
            archive.append(html, { name: 'index.html' });

            // Add data JSON
            archive.append(JSON.stringify(staticData, null, 2), { name: 'data.json' });

            // Add CSS (with relative path fix for background images)
            const cssPath = path.join(__dirname, '../public/shared/styles.css');
            if (fs.existsSync(cssPath)) {
                let css = fs.readFileSync(cssPath, 'utf8');
                css = css.replace(/url\('\/shared\//g, "url('./");
                archive.append(css, { name: 'shared/styles.css' });
            }

            // Add JS
            const jsPath = path.join(__dirname, '../public/shared/scripts.js');
            if (fs.existsSync(jsPath)) archive.file(jsPath, { name: 'shared/scripts.js' });

            // Add i18n module and translation files
            const i18nJsPath = path.join(__dirname, '../public/shared/i18n.js');
            if (fs.existsSync(i18nJsPath)) archive.file(i18nJsPath, { name: 'shared/i18n.js' });

            const i18nDir = path.join(__dirname, '../public/shared/i18n');
            if (fs.existsSync(i18nDir)) {
                const i18nFiles = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json'));
                for (const file of i18nFiles) {
                    archive.file(path.join(i18nDir, file), { name: `shared/i18n/${file}` });
                }
            }

            // Add favicon and icons
            const iconPath = path.join(__dirname, '../icon.png');
            if (fs.existsSync(iconPath)) {
                archive.file(iconPath, { name: 'favicon.png' });
                archive.file(iconPath, { name: 'favicon.ico' });
                archive.file(iconPath, { name: 'apple-touch-icon.png' });
            }

            // Add open-to-work overlay image
            const otwPath = path.join(__dirname, '../public/shared/open-to-work.png');
            if (fs.existsSync(otwPath)) archive.file(otwPath, { name: 'shared/open-to-work.png' });

            // Add uploaded files (profile picture, logos)
            if (fs.existsSync(uploadsPath)) {
                const uploadFiles = fs.readdirSync(uploadsPath);
                for (const file of uploadFiles) {
                    archive.file(path.join(uploadsPath, file), { name: `uploads/${file}` });
                }
            }

            archive.finalize();
        } catch (err) {
            console.error('Static site export error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to generate static site' });
            }
        }
    });

    app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '../public/index.html')); });

    // Public Read-Only Server (Port 3001)
    const publicApp = express();
    publicApp.use(cors({ methods: ['GET'], credentials: false }));
    publicApp.use((req, res, next) => { if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' }); next(); });
    const rateLimit = {};
    publicApp.use((req, res, next) => { const ip = req.ip || req.connection.remoteAddress; const now = Date.now(); if (!rateLimit[ip]) rateLimit[ip] = { count: 1, start: now }; else if (now - rateLimit[ip].start > 60000) rateLimit[ip] = { count: 1, start: now }; else { rateLimit[ip].count++; if (rateLimit[ip].count > 200) return res.status(429).json({ error: 'Too many requests' }); } next(); });

    publicApp.use((req, res, next) => {
        const trackingDomains = getTrackingDomains();
        const trackingStr = trackingDomains.length > 0 ? ' ' + trackingDomains.join(' ') : '';
        const cfStr = ' https://static.cloudflareinsights.com';
        const csp = [
            `default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://flagcdn.com`,
            `script-src 'self' 'unsafe-inline'${cfStr}${trackingStr}`,
            `script-src-elem 'self' 'unsafe-inline'${cfStr}${trackingStr}`,
            `worker-src 'self' blob:${trackingStr}`,
            `connect-src 'self'${cfStr}${trackingStr}`,
            `img-src 'self' https://flagcdn.com data:${trackingStr}`
        ].join('; ');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Content-Security-Policy', csp);
        next();
    });
    publicApp.get('/sitemap.xml', (req, res) => { const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https'; const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'; res.setHeader('Content-Type', 'application/xml'); res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${protocol}://${host}/</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>`); });
    publicApp.get('/robots.txt', (req, res) => { const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https'; const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'; const robotsMeta = db.prepare('SELECT value FROM settings WHERE key = ?').get('robotsMeta'); const metaValue = robotsMeta?.value || 'index, follow'; const isNoIndex = metaValue.includes('noindex'); res.setHeader('Content-Type', 'text/plain'); if (isNoIndex) { res.send(`User-agent: *\nDisallow: /`); } else { res.send(`User-agent: *\nAllow: /\nSitemap: ${protocol}://${host}/sitemap.xml\nDisallow: /api/`); } });
    publicApp.use('/shared', express.static(path.join(__dirname, '../public/shared')));
    // Favicon and icons (public uses icon-public.png with eye badge)
    const publicIconPathB = path.join(__dirname, '../icon-public.png');
    publicApp.get('/favicon.ico', (req, res) => res.sendFile(publicIconPathB));
    publicApp.get('/favicon.png', (req, res) => res.sendFile(publicIconPathB));
    publicApp.get('/apple-touch-icon.png', (req, res) => res.sendFile(publicIconPathB));
    publicApp.get('/', (req, res) => { servePublicIndex(req, res); });
    publicApp.use(express.static(path.join(__dirname, '../public-readonly'), { index: false }));
    publicApp.use('/uploads', express.static(uploadsPath));
    publicApp.get('/api/profile', (req, res) => { res.json(db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages, profile_picture_enabled, picture_filename, picture_crop, open_to_work FROM profile WHERE id = 1').get() || {}); });
    publicApp.get('/api/sections', (req, res) => { const sections = db.prepare('SELECT * FROM section_visibility').all(); const result = {}; sections.forEach(s => { result[s.section_name] = !!s.visible; }); res.json(result); });
    publicApp.get('/api/sections/order', (req, res) => {
        const requestedLang = req.query.language || null;
        const sections = db.prepare('SELECT * FROM section_visibility ORDER BY sort_order ASC').all();
        const customSections = db.prepare('SELECT * FROM custom_sections ORDER BY sort_order ASC').all();
        const customNameMap = {};
        customSections.forEach(cs => { customNameMap[cs.section_key] = cs.name; });
        const sectionKeys = new Set(sections.map(s => s.section_name));
        customSections.forEach(cs => {
            if (!sectionKeys.has(cs.section_key)) {
                sections.push({ section_name: cs.section_key, visible: cs.visible ? 1 : 0, sort_order: cs.sort_order || 0, print_visible: 1, print_compact: 0, display_name: null });
            }
        });
        sections.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        const defaultName = (s) => SECTION_DISPLAY_NAMES[s.section_name] || customNameMap[s.section_name] || s.section_name;
        res.json(sections.map(s => ({
            key: s.section_name,
            name: resolveSectionTitle(s.section_name, {
                datasetOverride: null,
                language: requestedLang,
                locale: requestedLang,
                customNameFallback: customNameMap[s.section_name]
            }),
            default_name: defaultName(s),
            visible: !!s.visible,
            print_visible: s.print_visible !== 0,
            print_compact: s.print_compact === 1,
            sort_order: s.sort_order || 0,
            is_custom: !DEFAULT_SECTION_ORDER.includes(s.section_name)
        })));
    });
    publicApp.get('/api/settings', (req, res) => { const settings = db.prepare('SELECT * FROM settings').all(); const result = {}; settings.forEach(s => { result[s.key] = s.value; }); if (isTrackingConsentRequired()) delete result.trackingCode; res.json(result); });
    publicApp.get('/api/settings/trackingCode', (req, res) => { if (isTrackingConsentRequired()) return res.json({ value: null, consentRequired: true }); const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('trackingCode'); res.json({ value: setting?.value || null }); });
    publicApp.get('/api/settings/:key', (req, res) => { const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key); res.json({ value: setting?.value || null }); });
    publicApp.get('/api/experiences', (req, res) => { res.json(db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights, logo_filename FROM experiences WHERE visible = 1 ORDER BY sort_order ASC, start_date DESC').all().map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [], visible: true }))); });
    publicApp.get('/api/certifications', (req, res) => { res.json(db.prepare('SELECT name, provider, issue_date, expiry_date, credential_id, logo_filename FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all().map(c => ({ ...c, visible: true }))); });
    publicApp.get('/api/education', (req, res) => { res.json(db.prepare('SELECT degree_title, institution_name, start_date, end_date, description FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all().map(e => ({ ...e, visible: true }))); });
    publicApp.get('/api/skills', (req, res) => { const categories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); res.json(categories.map(cat => ({ ...cat, visible: true, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) }))); });
    publicApp.get('/api/projects', (req, res) => { res.json(db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all().map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [], visible: true }))); });
    publicApp.get('/api/timeline', (req, res) => {
        const experiences = db.prepare('SELECT id, company_name, job_title, start_date, end_date, country_code, logo_filename FROM experiences WHERE visible = 1 ORDER BY start_date ASC').all().map(exp => ({ id: exp.id, company: exp.company_name, role: exp.job_title, period: formatPeriod(exp.start_date, exp.end_date), start_date: exp.start_date, end_date: exp.end_date, countryCode: exp.country_code || '', visible: true, logo: exp.logo_filename || null }));
        const timelineSections = db.prepare(`SELECT id, metadata FROM custom_sections WHERE layout_type = 'timeline' AND visible = 1`).all().filter(s => { const meta = s.metadata ? JSON.parse(s.metadata) : {}; return meta.show_on_timeline; });
        const customItems = [];
        for (const section of timelineSections) {
            const items = db.prepare(`SELECT * FROM custom_section_items WHERE section_id = ? AND visible = 1 ORDER BY sort_order ASC`).all(section.id);
            for (const item of items) {
                const meta = item.metadata ? JSON.parse(item.metadata) : {};
                customItems.push({ id: `cs_${item.id}`, company: item.subtitle || '', role: item.title || '', period: formatPeriod(meta.start_date, meta.end_date), start_date: meta.start_date || '', end_date: meta.end_date || '', countryCode: meta.country_code || '', visible: true, logo: item.image || null });
            }
        }
        res.json([...experiences, ...customItems]);
    });
    publicApp.get('/api/custom-sections', (req, res) => {
        const sections = db.prepare('SELECT id, name, section_key, layout_type, icon, sort_order, metadata FROM custom_sections WHERE visible = 1 ORDER BY sort_order ASC').all();
        const items = db.prepare('SELECT * FROM custom_section_items WHERE visible = 1 ORDER BY sort_order ASC').all();
        res.json(sections.map(s => ({ ...s, visible: true, metadata: s.metadata ? JSON.parse(s.metadata) : null, items: items.filter(i => i.section_id === s.id).map(i => ({ ...i, visible: true, metadata: i.metadata ? JSON.parse(i.metadata) : null })) })));
    });
    publicApp.get('/api/layout-types', (req, res) => { res.json(LAYOUT_TYPES); });
    publicApp.get('/api/social-platforms', (req, res) => { res.json(SOCIAL_PLATFORMS); });
    publicApp.get('/api/cv', (req, res) => { const profile = db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages, profile_picture_enabled, picture_filename, picture_crop, open_to_work FROM profile WHERE id = 1').get(); const experiences = db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights, logo_filename FROM experiences WHERE visible = 1 ORDER BY sort_order ASC, start_date DESC').all(); const certifications = db.prepare('SELECT name, provider, issue_date, expiry_date, credential_id, logo_filename FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all(); const education = db.prepare('SELECT degree_title, institution_name, start_date, end_date, description, logo_filename FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all(); const skillCategories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); const projects = db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all(); const sectionOrder = db.prepare('SELECT section_name, sort_order FROM section_visibility WHERE visible = 1 ORDER BY sort_order ASC').all(); res.json({ profile, experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })), certifications, education, skills: skillCategories.map(cat => ({ ...cat, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) })), projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] })), sectionOrder: sectionOrder.map(s => s.section_name) }); });
    // Public versioned CV routes (language-specific must come before generic)
    publicApp.get('/v/:slug/:lang', (req, res) => { serveDatasetPage(req, res, req.params.lang); });
    publicApp.get('/v/:slug', (req, res) => { serveDatasetPage(req, res); });
    publicApp.get('/api/datasets/slug/:slug/:lang', (req, res) => { serveDatasetData(req, res); });
    publicApp.get('/api/datasets/slug/:slug', (req, res) => { serveDatasetData(req, res); });
    publicApp.get('/api/datasets/id/:id', (req, res) => { serveDatasetDataById(req, res); });
    // Clean language URLs for default dataset: /en, /de, /fr, etc.
    publicApp.get('/:lang([a-z]{2})', (req, res) => { req.query.lang = req.params.lang; servePublicIndex(req, res); });
    publicApp.get('*', (req, res) => { servePublicIndex(req, res); });

    app.listen(PORT, '0.0.0.0', () => { console.log(`CV Manager v${CURRENT_VERSION} (Admin) running at http://localhost:${PORT}`); });
    publicApp.listen(PUBLIC_PORT, '0.0.0.0', () => { console.log(`CV Manager (Public Read-Only) running at http://localhost:${PUBLIC_PORT}`); });
}

process.on('SIGINT', () => { db.close(); process.exit(0); });
process.on('SIGTERM', () => { db.close(); process.exit(0); });

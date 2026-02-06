const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_PORT = process.env.PUBLIC_PORT || 3001;

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
    else { db = new Database(DB_PATH); console.log('Database opened successfully'); db.pragma('journal_mode = WAL'); }
} catch (err) { console.error(`Failed to open database: ${err.message}`); process.exit(1); }

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const uploadsPath = path.join(dataDir, 'uploads');
if (!PUBLIC_ONLY && !fs.existsSync(uploadsPath)) { fs.mkdirSync(uploadsPath, { recursive: true }); }
app.use('/uploads', express.static(uploadsPath));

function servePublicIndex(req, res) {
    try {
        const profile = db.prepare('SELECT name, title, bio FROM profile WHERE id = 1').get();
        const name = profile?.name || 'CV';
        const bio = profile?.bio || 'Professional CV';
        const description = bio.substring(0, 160).replace(/\n/g, ' ');
        
        let html = fs.readFileSync(path.join(__dirname, '../public-readonly/index.html'), 'utf8');
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${name} - CV</title>`);
        html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`);
        
        const ogTags = `\n    <meta property="og:title" content="${name} - CV">\n    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}">\n    <meta property="og:type" content="profile">`;
        html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">${ogTags}`);
        
        res.type('html').send(html);
    } catch (err) { res.sendFile(path.join(__dirname, '../public-readonly/index.html')); }
}

// Layout types for custom sections
// SVG icons (matching app style)
const SVG_ICONS = {
    link: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    grid2: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>',
    grid3: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="5" height="18" rx="1"/></svg>',
    list: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    cards: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    github: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    twitter: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>',
    instagram: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    youtube: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>',
    globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    mail: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    dribbble: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>',
    behance: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 7h-7M22 12h-7M16.5 17a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM2 17V7h5a3 3 0 0 1 0 6H2m0 4h5.5a3 3 0 0 0 0-6H2"/></svg>',
    bullets: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l11 0M9 12l11 0M9 18l11 0"/><path d="M5 6l0 .01M5 12l0 .01M5 18l0 .01" stroke-linecap="round"/></svg>'
};

// Layout types as array for frontend iteration
const LAYOUT_TYPES = [
    { id: 'social-links', name: 'Social Links', icon: SVG_ICONS.link },
    { id: 'grid-2', name: '2-Column Grid', icon: SVG_ICONS.grid2 },
    { id: 'grid-3', name: '3-Column Grid', icon: SVG_ICONS.grid3 },
    { id: 'list', name: 'Vertical List', icon: SVG_ICONS.list },
    { id: 'cards', name: 'Card Grid', icon: SVG_ICONS.cards },
    { id: 'bullet-list', name: 'Bullet Points', icon: SVG_ICONS.bullets }
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
    { id: 'website', name: 'Website', icon: SVG_ICONS.globe, color: '#0066ff' },
    { id: 'email', name: 'Email', icon: SVG_ICONS.mail, color: '#ea4335' },
    { id: 'phone', name: 'Phone', icon: SVG_ICONS.phone, color: '#34a853' },
    { id: 'custom', name: 'Custom', icon: SVG_ICONS.link, color: '#666' }
];

if (!PUBLIC_ONLY) {
    // Step 1: Create tables (without sort_order in section_visibility for compatibility)
    db.exec(`
        CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY CHECK (id = 1), name TEXT NOT NULL DEFAULT 'Your Name', initials TEXT DEFAULT 'YN', title TEXT DEFAULT 'Your Title', subtitle TEXT DEFAULT '', bio TEXT DEFAULT '', location TEXT DEFAULT '', linkedin TEXT DEFAULT '', email TEXT DEFAULT '', phone TEXT DEFAULT '', languages TEXT DEFAULT '', visible INTEGER DEFAULT 1, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE IF NOT EXISTS experiences (id INTEGER PRIMARY KEY AUTOINCREMENT, job_title TEXT NOT NULL, company_name TEXT NOT NULL, start_date TEXT, end_date TEXT, location TEXT, country_code TEXT DEFAULT 'ch', highlights TEXT, sort_order INTEGER DEFAULT 0, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS certifications (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, provider TEXT, issue_date TEXT, expiry_date TEXT, credential_id TEXT, sort_order INTEGER DEFAULT 0, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS education (id INTEGER PRIMARY KEY AUTOINCREMENT, degree_title TEXT NOT NULL, institution_name TEXT NOT NULL, start_date TEXT, end_date TEXT, description TEXT, sort_order INTEGER DEFAULT 0, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS skill_categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, icon TEXT DEFAULT 'default', sort_order INTEGER DEFAULT 0, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS skills (id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER NOT NULL, name TEXT NOT NULL, sort_order INTEGER DEFAULT 0, FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE);
        CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, technologies TEXT, link TEXT, sort_order INTEGER DEFAULT 0, visible INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS section_visibility (section_name TEXT PRIMARY KEY, visible INTEGER DEFAULT 1);
        CREATE TABLE IF NOT EXISTS saved_datasets (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, data TEXT NOT NULL, slug TEXT UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
        
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

    // Step 3: Insert default data (after migration ensures sort_order exists)
    db.exec(`INSERT OR IGNORE INTO profile (id) VALUES (1)`);
    DEFAULT_SECTION_ORDER.forEach((section, index) => {
        db.prepare('INSERT OR IGNORE INTO section_visibility (section_name, visible, sort_order) VALUES (?, 1, ?)').run(section, index);
    });
}

function formatPeriod(startDate, endDate) {
    const start = startDate ? formatDateShort(startDate) : '';
    const end = endDate ? formatDateShort(endDate) : 'Present';
    return `${start} - ${end}`;
}

function formatDateShort(dateStr) {
    if (!dateStr) return '';
    if (dateStr.match(/^\d{4}$/)) return dateStr;
    if (dateStr.match(/^\d{4}-\d{2}$/)) return dateStr.split('-')[0];
    try { return new Date(dateStr).getFullYear().toString(); } catch { return dateStr; }
}

// Generate URL-safe slug from dataset name
function generateSlug(name, id) {
    const base = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
    return base ? `${base}-${id}` : `dataset-${id}`;
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
        else { rateLimit[ip].count++; if (rateLimit[ip].count > 60) return res.status(429).json({ error: 'Too many requests' }); }
        next();
    });

    // Dynamic CSP: extract domains from tracking code to allow them
    function getTrackingDomainsPublicOnly() {
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
                    try {
                        const origin = new URL(url).origin;
                        domains.add(origin);
                    } catch (e) { /* skip invalid URLs */ }
                });
            }
            return Array.from(domains);
        } catch (err) {
            console.error('Error reading tracking domains:', err.message);
            return [];
        }
    }

    console.log(`[CSP] Tracking domains detected: ${getTrackingDomainsPublicOnly().length > 0 ? getTrackingDomainsPublicOnly().join(', ') : '(none)'}`);

    publicApp.use((req, res, next) => {
        const trackingDomains = getTrackingDomainsPublicOnly();
        const trackingStr = trackingDomains.length > 0 ? ' ' + trackingDomains.join(' ') : '';
        
        const csp = [
            `default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://flagcdn.com`,
            `script-src 'self' 'unsafe-inline'${trackingStr}`,
            `script-src-elem 'self' 'unsafe-inline'${trackingStr}`,
            `worker-src 'self' blob:${trackingStr}`,
            `connect-src 'self'${trackingStr}`,
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
        res.setHeader('Content-Type', 'text/plain');
        res.send(`User-agent: *\nAllow: /\nSitemap: ${protocol}://${host}/sitemap.xml\nDisallow: /api/`);
    });

    publicApp.use('/shared', express.static(path.join(__dirname, '../public/shared')));
    publicApp.use(express.static(path.join(__dirname, '../public-readonly')));
    publicApp.use('/uploads', express.static(uploadsPath));

    publicApp.get('/api/profile', (req, res) => { res.json(db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages FROM profile WHERE id = 1').get() || {}); });
    publicApp.get('/api/sections', (req, res) => { const sections = db.prepare('SELECT * FROM section_visibility').all(); const result = {}; sections.forEach(s => { result[s.section_name] = !!s.visible; }); res.json(result); });
    publicApp.get('/api/sections/order', (req, res) => { 
        const sections = db.prepare('SELECT * FROM section_visibility ORDER BY sort_order ASC').all(); 
        const customSections = db.prepare('SELECT section_key, name FROM custom_sections').all();
        const customNameMap = {};
        customSections.forEach(cs => { customNameMap[cs.section_key] = cs.name; });
        const defaultName = (s) => SECTION_DISPLAY_NAMES[s.section_name] || customNameMap[s.section_name] || s.section_name;
        res.json(sections.map(s => ({ 
            key: s.section_name, 
            name: s.display_name || defaultName(s),
            default_name: defaultName(s),
            visible: !!s.visible,
            print_visible: s.print_visible !== 0,
            sort_order: s.sort_order || 0, 
            is_custom: !DEFAULT_SECTION_ORDER.includes(s.section_name) 
        }))); 
    });
    publicApp.get('/api/settings/:key', (req, res) => { const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key); res.json({ value: setting?.value || null }); });
    publicApp.get('/api/experiences', (req, res) => { const experiences = db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights FROM experiences WHERE visible = 1 ORDER BY start_date DESC, sort_order ASC').all(); res.json(experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [], visible: true }))); });
    publicApp.get('/api/certifications', (req, res) => { res.json(db.prepare('SELECT name, provider, issue_date FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all().map(c => ({ ...c, visible: true }))); });
    publicApp.get('/api/education', (req, res) => { res.json(db.prepare('SELECT degree_title, institution_name, start_date, end_date, description FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all().map(e => ({ ...e, visible: true }))); });
    publicApp.get('/api/skills', (req, res) => { const categories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); res.json(categories.map(cat => ({ ...cat, visible: true, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) }))); });
    publicApp.get('/api/projects', (req, res) => { res.json(db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all().map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [], visible: true }))); });
    publicApp.get('/api/timeline', (req, res) => { res.json(db.prepare('SELECT id, company_name, job_title, start_date, end_date, country_code FROM experiences WHERE visible = 1 ORDER BY start_date ASC').all().map(exp => ({ id: exp.id, company: exp.company_name, role: exp.job_title, period: formatPeriod(exp.start_date, exp.end_date), start_date: exp.start_date, end_date: exp.end_date, countryCode: exp.country_code || 'ch', visible: true }))); });
    publicApp.get('/api/custom-sections', (req, res) => {
        const sections = db.prepare('SELECT id, name, section_key, layout_type, icon, sort_order FROM custom_sections WHERE visible = 1 ORDER BY sort_order ASC').all();
        const items = db.prepare('SELECT * FROM custom_section_items WHERE visible = 1 ORDER BY sort_order ASC').all();
        res.json(sections.map(s => ({ ...s, visible: true, items: items.filter(i => i.section_id === s.id).map(i => ({ ...i, visible: true, metadata: i.metadata ? JSON.parse(i.metadata) : null })) })));
    });
    publicApp.get('/api/layout-types', (req, res) => { res.json(LAYOUT_TYPES); });
    publicApp.get('/api/social-platforms', (req, res) => { res.json(SOCIAL_PLATFORMS); });
    publicApp.get('/api/cv', (req, res) => {
        const profile = db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages FROM profile WHERE id = 1').get();
        const experiences = db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights FROM experiences WHERE visible = 1 ORDER BY start_date DESC, sort_order ASC').all();
        const certifications = db.prepare('SELECT name, provider, issue_date FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all();
        const education = db.prepare('SELECT degree_title, institution_name, start_date, end_date, description FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all();
        const skillCategories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all();
        const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
        const projects = db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all();
        const sectionOrder = db.prepare('SELECT section_name, sort_order FROM section_visibility WHERE visible = 1 ORDER BY sort_order ASC').all();
        res.json({ profile, experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })), certifications, education, skills: skillCategories.map(cat => ({ ...cat, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) })), projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] })), sectionOrder: sectionOrder.map(s => s.section_name) });
    });
    
    publicApp.get('*', (req, res) => { servePublicIndex(req, res); });
    publicApp.listen(PUBLIC_PORT, '0.0.0.0', () => { console.log(`CV Manager (Public Read-Only) running at http://localhost:${PUBLIC_PORT}`); });

} else {
    // ADMIN Mode
    app.get('/api/profile', (req, res) => { res.json(db.prepare('SELECT * FROM profile WHERE id = 1').get()); });
    app.put('/api/profile', (req, res) => { const { name, initials, title, subtitle, bio, location, linkedin, email, phone, languages, visible } = req.body; db.prepare(`UPDATE profile SET name = ?, initials = ?, title = ?, subtitle = ?, bio = ?, location = ?, linkedin = ?, email = ?, phone = ?, languages = ?, visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`).run(name, initials, title, subtitle, bio, location, linkedin, email, phone, languages, visible ? 1 : 0); res.json({ success: true }); });

    const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsPath), filename: (req, file, cb) => cb(null, 'picture.jpeg') });
    const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => { const allowed = ['image/jpeg', 'image/png', 'image/webp']; cb(null, allowed.includes(file.mimetype)); } });
    app.post('/api/profile/picture', upload.single('picture'), (req, res) => { if (!req.file) return res.status(400).json({ error: 'No file uploaded' }); res.json({ success: true, filename: req.file.filename }); });
    app.delete('/api/profile/picture', (req, res) => { const picturePath = path.join(uploadsPath, 'picture.jpeg'); try { if (fs.existsSync(picturePath)) fs.unlinkSync(picturePath); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); } });

    app.get('/api/settings', (req, res) => { const settings = db.prepare('SELECT * FROM settings').all(); const result = {}; settings.forEach(s => { result[s.key] = s.value; }); res.json(result); });
    app.get('/api/settings/:key', (req, res) => { const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key); res.json({ value: setting?.value || null }); });
    app.put('/api/settings/:key', (req, res) => { db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(req.params.key, req.body.value); res.json({ success: true }); });

    app.get('/api/sections', (req, res) => { const sections = db.prepare('SELECT * FROM section_visibility').all(); const result = {}; sections.forEach(s => { result[s.section_name] = !!s.visible; }); res.json(result); });
    app.get('/api/sections/order', (req, res) => { 
        const sections = db.prepare('SELECT * FROM section_visibility ORDER BY sort_order ASC').all(); 
        const customSections = db.prepare('SELECT section_key, name FROM custom_sections').all();
        const customNameMap = {};
        customSections.forEach(cs => { customNameMap[cs.section_key] = cs.name; });
        const defaultName = (s) => SECTION_DISPLAY_NAMES[s.section_name] || customNameMap[s.section_name] || s.section_name;
        res.json(sections.map(s => ({ 
            key: s.section_name, 
            name: s.display_name || defaultName(s),
            default_name: defaultName(s),
            visible: !!s.visible,
            print_visible: s.print_visible !== 0,
            sort_order: s.sort_order || 0, 
            is_custom: !DEFAULT_SECTION_ORDER.includes(s.section_name) 
        }))); 
    });
    app.put('/api/sections/order', (req, res) => { const { sections } = req.body; if (!sections || !Array.isArray(sections)) return res.status(400).json({ error: 'Invalid sections data' }); const updateOrder = db.transaction(() => { sections.forEach(section => { const displayName = section.display_name || null; db.prepare('UPDATE section_visibility SET visible = ?, print_visible = ?, sort_order = ?, display_name = ? WHERE section_name = ?').run(section.visible ? 1 : 0, section.print_visible !== false ? 1 : 0, section.sort_order, displayName, section.key); if (section.key.startsWith('custom_')) { db.prepare('UPDATE custom_sections SET visible = ?, sort_order = ? WHERE section_key = ?').run(section.visible ? 1 : 0, section.sort_order, section.key); } }); }); try { updateOrder(); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); } });
    app.put('/api/sections/:name', (req, res) => { const sectionName = req.params.name; const visible = req.body.visible ? 1 : 0; db.prepare('UPDATE section_visibility SET visible = ? WHERE section_name = ?').run(visible, sectionName); if (sectionName.startsWith('custom_')) { db.prepare('UPDATE custom_sections SET visible = ? WHERE section_key = ?').run(visible, sectionName); } res.json({ success: true }); });

    app.get('/api/experiences', (req, res) => { const experiences = db.prepare('SELECT * FROM experiences ORDER BY start_date DESC, sort_order ASC').all(); res.json(experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [], visible: !!e.visible }))); });
    app.get('/api/experiences/:id', (req, res) => { const exp = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id); if (!exp) return res.status(404).json({ error: 'Not found' }); res.json({ ...exp, highlights: exp.highlights ? JSON.parse(exp.highlights) : [], visible: !!exp.visible }); });
    app.post('/api/experiences', (req, res) => { const { job_title, company_name, start_date, end_date, location, country_code, highlights } = req.body; const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM experiences').get(); const result = db.prepare(`INSERT INTO experiences (job_title, company_name, start_date, end_date, location, country_code, highlights, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(job_title, company_name, start_date, end_date, location, country_code || 'ch', JSON.stringify(highlights || []), (maxOrder.max || 0) + 1); res.json({ id: result.lastInsertRowid }); });
    app.put('/api/experiences/:id', (req, res) => { const { job_title, company_name, start_date, end_date, location, country_code, highlights, visible, sort_order } = req.body; db.prepare(`UPDATE experiences SET job_title = ?, company_name = ?, start_date = ?, end_date = ?, location = ?, country_code = ?, highlights = ?, visible = ?, sort_order = ? WHERE id = ?`).run(job_title, company_name, start_date, end_date, location, country_code || 'ch', JSON.stringify(highlights || []), visible ? 1 : 0, sort_order || 0, req.params.id); res.json({ success: true }); });
    app.delete('/api/experiences/:id', (req, res) => { db.prepare('DELETE FROM experiences WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    app.get('/api/certifications', (req, res) => { res.json(db.prepare('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC').all().map(c => ({ ...c, visible: !!c.visible }))); });
    app.get('/api/certifications/:id', (req, res) => { const cert = db.prepare('SELECT * FROM certifications WHERE id = ?').get(req.params.id); if (!cert) return res.status(404).json({ error: 'Not found' }); res.json({ ...cert, visible: !!cert.visible }); });
    app.post('/api/certifications', (req, res) => { const { name, provider, issue_date, expiry_date, credential_id } = req.body; const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM certifications').get(); const result = db.prepare(`INSERT INTO certifications (name, provider, issue_date, expiry_date, credential_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)`).run(name, provider, issue_date, expiry_date, credential_id, (maxOrder.max || 0) + 1); res.json({ id: result.lastInsertRowid }); });
    app.put('/api/certifications/:id', (req, res) => { const { name, provider, issue_date, expiry_date, credential_id, visible, sort_order } = req.body; db.prepare(`UPDATE certifications SET name = ?, provider = ?, issue_date = ?, expiry_date = ?, credential_id = ?, visible = ?, sort_order = ? WHERE id = ?`).run(name, provider, issue_date, expiry_date, credential_id, visible ? 1 : 0, sort_order || 0, req.params.id); res.json({ success: true }); });
    app.delete('/api/certifications/:id', (req, res) => { db.prepare('DELETE FROM certifications WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    app.get('/api/education', (req, res) => { res.json(db.prepare('SELECT * FROM education ORDER BY sort_order ASC, end_date DESC').all().map(e => ({ ...e, visible: !!e.visible }))); });
    app.get('/api/education/:id', (req, res) => { const edu = db.prepare('SELECT * FROM education WHERE id = ?').get(req.params.id); if (!edu) return res.status(404).json({ error: 'Not found' }); res.json({ ...edu, visible: !!edu.visible }); });
    app.post('/api/education', (req, res) => { const { degree_title, institution_name, start_date, end_date, description } = req.body; const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM education').get(); const result = db.prepare(`INSERT INTO education (degree_title, institution_name, start_date, end_date, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)`).run(degree_title, institution_name, start_date, end_date, description, (maxOrder.max || 0) + 1); res.json({ id: result.lastInsertRowid }); });
    app.put('/api/education/:id', (req, res) => { const { degree_title, institution_name, start_date, end_date, description, visible, sort_order } = req.body; db.prepare(`UPDATE education SET degree_title = ?, institution_name = ?, start_date = ?, end_date = ?, description = ?, visible = ?, sort_order = ? WHERE id = ?`).run(degree_title, institution_name, start_date, end_date, description, visible ? 1 : 0, sort_order || 0, req.params.id); res.json({ success: true }); });
    app.delete('/api/education/:id', (req, res) => { db.prepare('DELETE FROM education WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    app.get('/api/skills', (req, res) => { const categories = db.prepare('SELECT * FROM skill_categories ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); res.json(categories.map(cat => ({ ...cat, visible: !!cat.visible, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) }))); });
    app.get('/api/skills/:id', (req, res) => { const cat = db.prepare('SELECT * FROM skill_categories WHERE id = ?').get(req.params.id); if (!cat) return res.status(404).json({ error: 'Not found' }); const skills = db.prepare('SELECT name FROM skills WHERE category_id = ? ORDER BY sort_order ASC').all(req.params.id); res.json({ ...cat, visible: !!cat.visible, skills: skills.map(s => s.name) }); });
    app.post('/api/skills', (req, res) => { const { name, icon, skills } = req.body; const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM skill_categories').get(); const result = db.prepare('INSERT INTO skill_categories (name, icon, sort_order) VALUES (?, ?, ?)').run(name, icon || 'default', (maxOrder.max || 0) + 1); const categoryId = result.lastInsertRowid; if (skills && skills.length > 0) { const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)'); skills.forEach((skill, idx) => { skillStmt.run(categoryId, skill, idx); }); } res.json({ id: categoryId }); });
    app.put('/api/skills/:id', (req, res) => { const { name, icon, skills, visible, sort_order } = req.body; const categoryId = req.params.id; db.prepare('UPDATE skill_categories SET name = ?, icon = ?, visible = ?, sort_order = ? WHERE id = ?').run(name, icon || 'default', visible ? 1 : 0, sort_order || 0, categoryId); db.prepare('DELETE FROM skills WHERE category_id = ?').run(categoryId); if (skills && skills.length > 0) { const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)'); skills.forEach((skill, idx) => { skillStmt.run(categoryId, skill, idx); }); } res.json({ success: true }); });
    app.delete('/api/skills/:id', (req, res) => { db.prepare('DELETE FROM skills WHERE category_id = ?').run(req.params.id); db.prepare('DELETE FROM skill_categories WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    app.get('/api/projects', (req, res) => { res.json(db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all().map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [], visible: !!p.visible }))); });
    app.get('/api/projects/:id', (req, res) => { const proj = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id); if (!proj) return res.status(404).json({ error: 'Not found' }); res.json({ ...proj, technologies: proj.technologies ? JSON.parse(proj.technologies) : [], visible: !!proj.visible }); });
    app.post('/api/projects', (req, res) => { const { title, description, technologies, link } = req.body; const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM projects').get(); const result = db.prepare(`INSERT INTO projects (title, description, technologies, link, sort_order) VALUES (?, ?, ?, ?, ?)`).run(title, description, JSON.stringify(technologies || []), link, (maxOrder.max || 0) + 1); res.json({ id: result.lastInsertRowid }); });
    app.put('/api/projects/:id', (req, res) => { const { title, description, technologies, link, visible, sort_order } = req.body; db.prepare(`UPDATE projects SET title = ?, description = ?, technologies = ?, link = ?, visible = ?, sort_order = ? WHERE id = ?`).run(title, description, JSON.stringify(technologies || []), link, visible ? 1 : 0, sort_order || 0, req.params.id); res.json({ success: true }); });
    app.delete('/api/projects/:id', (req, res) => { db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    // Generic reorder endpoint for items within sections
    app.put('/api/reorder/:type', (req, res) => {
        const { type } = req.params;
        const { items } = req.body;
        if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Invalid items data' });
        
        const tableMap = {
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
            res.json(datasets.map(d => ({ id: d.id, name: d.name, slug: d.slug || null, created_at: d.created_at, updated_at: d.updated_at })));
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.post('/api/datasets', (req, res) => { const { name } = req.body; if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' }); const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get(); const experiences = db.prepare('SELECT * FROM experiences ORDER BY start_date DESC, sort_order ASC').all(); const certifications = db.prepare('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC').all(); const education = db.prepare('SELECT * FROM education ORDER BY sort_order ASC, end_date DESC').all(); const skillCategories = db.prepare('SELECT * FROM skill_categories ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all(); const sections = db.prepare('SELECT * FROM section_visibility ORDER BY sort_order ASC').all(); const sectionVisibility = {}; const sectionOrderData = []; sections.forEach(s => { sectionVisibility[s.section_name] = !!s.visible; sectionOrderData.push({ key: s.section_name, sort_order: s.sort_order || 0, visible: !!s.visible, display_name: s.display_name || null }); }); const cvData = { profile, experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })), certifications, education, skills: skillCategories.map(cat => ({ ...cat, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) })), projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] })), sectionVisibility, sectionOrder: sectionOrderData }; try { const existing = db.prepare('SELECT id FROM saved_datasets WHERE name = ?').get(name.trim()); if (existing) { db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(JSON.stringify(cvData), existing.id); const ds = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(existing.id); res.json({ success: true, id: existing.id, slug: ds.slug || null, updated: true }); } else { const result = db.prepare('INSERT INTO saved_datasets (name, data) VALUES (?, ?)').run(name.trim(), JSON.stringify(cvData)); const newId = result.lastInsertRowid; let slug = null; try { slug = generateSlug(name.trim(), newId); db.prepare('UPDATE saved_datasets SET slug = ? WHERE id = ?').run(slug, newId); } catch (slugErr) { console.log('Slug update skipped (column may not exist):', slugErr.message); } res.json({ success: true, id: newId, slug, created: true }); } } catch (err) { res.status(500).json({ error: err.message }); } });
    app.post('/api/datasets/:id/load', (req, res) => { const dataset = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id); if (!dataset) return res.status(404).json({ error: 'Dataset not found' }); try { const data = JSON.parse(dataset.data); const importData = db.transaction(() => { if (data.profile) { const p = data.profile; db.prepare(`UPDATE profile SET name = ?, initials = ?, title = ?, subtitle = ?, bio = ?, location = ?, linkedin = ?, email = ?, phone = ?, languages = ? WHERE id = 1`).run(p.name, p.initials, p.title, p.subtitle, p.bio, p.location, p.linkedin, p.email, p.phone, p.languages); } if (data.experiences) { db.prepare('DELETE FROM experiences').run(); const stmt = db.prepare(`INSERT INTO experiences (job_title, company_name, start_date, end_date, location, country_code, highlights, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`); data.experiences.forEach((e, idx) => { stmt.run(e.job_title, e.company_name, e.start_date, e.end_date, e.location, e.country_code || 'ch', JSON.stringify(e.highlights || []), idx, e.visible !== false ? 1 : 0); }); } if (data.certifications) { db.prepare('DELETE FROM certifications').run(); const stmt = db.prepare(`INSERT INTO certifications (name, provider, issue_date, expiry_date, credential_id, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?)`); data.certifications.forEach((c, idx) => { stmt.run(c.name, c.provider, c.issue_date, c.expiry_date, c.credential_id, idx, c.visible !== false ? 1 : 0); }); } if (data.education) { db.prepare('DELETE FROM education').run(); const stmt = db.prepare(`INSERT INTO education (degree_title, institution_name, start_date, end_date, description, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?)`); data.education.forEach((e, idx) => { stmt.run(e.degree_title, e.institution_name, e.start_date, e.end_date, e.description, idx, e.visible !== false ? 1 : 0); }); } if (data.skills) { db.prepare('DELETE FROM skills').run(); db.prepare('DELETE FROM skill_categories').run(); const catStmt = db.prepare('INSERT INTO skill_categories (name, icon, sort_order, visible) VALUES (?, ?, ?, ?)'); const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)'); data.skills.forEach((cat, catIdx) => { const result = catStmt.run(cat.name, cat.icon || 'default', catIdx, cat.visible !== false ? 1 : 0); const categoryId = result.lastInsertRowid; if (cat.skills) { cat.skills.forEach((skill, skillIdx) => { skillStmt.run(categoryId, skill, skillIdx); }); } }); } if (data.projects) { db.prepare('DELETE FROM projects').run(); const stmt = db.prepare(`INSERT INTO projects (title, description, technologies, link, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?)`); data.projects.forEach((p, idx) => { stmt.run(p.title, p.description, JSON.stringify(p.technologies || []), p.link, idx, p.visible !== false ? 1 : 0); }); } if (data.sectionOrder && Array.isArray(data.sectionOrder)) { data.sectionOrder.forEach(s => { db.prepare('UPDATE section_visibility SET visible = ?, sort_order = ?, display_name = ? WHERE section_name = ?').run(s.visible !== false ? 1 : 0, s.sort_order || 0, s.display_name || null, s.key); }); } else if (data.sectionVisibility) { for (const [section, visible] of Object.entries(data.sectionVisibility)) { db.prepare('UPDATE section_visibility SET visible = ? WHERE section_name = ?').run(visible ? 1 : 0, section); } } }); importData(); res.json({ success: true, name: dataset.name }); } catch (err) { res.status(500).json({ error: err.message }); } });
    app.delete('/api/datasets/:id', (req, res) => { db.prepare('DELETE FROM saved_datasets WHERE id = ?').run(req.params.id); res.json({ success: true }); });

    // Dataset preview API - returns CV data for a specific dataset (admin only)
    app.get('/api/datasets/slug/:slug', (req, res) => {
        try {
            const dataset = db.prepare('SELECT * FROM saved_datasets WHERE slug = ?').get(req.params.slug);
            if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
            const data = JSON.parse(dataset.data);
            res.json({ name: dataset.name, slug: dataset.slug, ...data });
        } catch (err) { 
            // If slug column doesn't exist, return 404
            if (err.message.includes('no such column')) {
                return res.status(404).json({ error: 'Versioned datasets not available' });
            }
            res.status(500).json({ error: err.message }); 
        }
    });

    // Dataset preview page route (admin only) - serves the public-readonly template with dataset context
    app.get('/v/:slug', (req, res) => {
        try {
            const dataset = db.prepare('SELECT * FROM saved_datasets WHERE slug = ?').get(req.params.slug);
            if (!dataset) return res.status(404).send('Dataset not found');
            
            const data = JSON.parse(dataset.data);
            const name = data.profile?.name || dataset.name;
            const bio = data.profile?.bio || '';
            const description = bio.substring(0, 160).replace(/\n/g, ' ');
            
            let html = fs.readFileSync(path.join(__dirname, '../public-readonly/index.html'), 'utf8');
            html = html.replace(/<title>[^<]*<\/title>/, `<title>${name} - CV (${dataset.name})</title>`);
            html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description.replace(/"/g, '&quot;')}">`);
            
            // Inject script to load dataset data instead of live data
            const datasetScript = `<script>window.DATASET_SLUG = "${dataset.slug}";</script>`;
            html = html.replace('</head>', `${datasetScript}</head>`);
            
            res.type('html').send(html);
        } catch (err) { 
            // If slug column doesn't exist, return 404
            if (err.message.includes('no such column')) {
                return res.status(404).send('Versioned datasets not available');
            }
            res.status(500).send('Error loading dataset'); 
        }
    });

    // Custom Sections API
    app.get('/api/custom-sections', (req, res) => {
        const sections = db.prepare('SELECT * FROM custom_sections ORDER BY sort_order ASC').all();
        const items = db.prepare('SELECT * FROM custom_section_items ORDER BY sort_order ASC').all();
        res.json(sections.map(s => ({
            ...s,
            visible: !!s.visible,
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
            items: items.map(i => ({ ...i, visible: !!i.visible, metadata: i.metadata ? JSON.parse(i.metadata) : null }))
        });
    });

    app.post('/api/custom-sections', (req, res) => {
        const { name, layout_type, icon } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
        
        // Generate unique section_key
        const existing = db.prepare('SELECT COUNT(*) as count FROM custom_sections').get();
        const section_key = `custom_${Date.now()}`;
        
        // Get max sort_order from both tables
        const maxBuiltin = db.prepare('SELECT MAX(sort_order) as max FROM section_visibility').get();
        const maxCustom = db.prepare('SELECT MAX(sort_order) as max FROM custom_sections').get();
        const sort_order = Math.max(maxBuiltin.max || 0, maxCustom.max || 0) + 1;
        
        try {
            const result = db.prepare(`INSERT INTO custom_sections (name, section_key, layout_type, icon, sort_order, visible) VALUES (?, ?, ?, ?, ?, 1)`).run(name.trim(), section_key, layout_type || 'grid-3', icon || 'layers', sort_order);
            
            // Also add to section_visibility for unified ordering
            db.prepare('INSERT OR REPLACE INTO section_visibility (section_name, visible, sort_order) VALUES (?, 1, ?)').run(section_key, sort_order);
            
            res.json({ id: result.lastInsertRowid, section_key });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.put('/api/custom-sections/:id', (req, res) => {
        const { name, layout_type, icon, visible, sort_order } = req.body;
        const section = db.prepare('SELECT section_key FROM custom_sections WHERE id = ?').get(req.params.id);
        if (!section) return res.status(404).json({ error: 'Not found' });
        
        db.prepare(`UPDATE custom_sections SET name = ?, layout_type = ?, icon = ?, visible = ?, sort_order = ? WHERE id = ?`).run(name, layout_type || 'grid-3', icon || 'layers', visible ? 1 : 0, sort_order || 0, req.params.id);
        
        // Update section_visibility too
        db.prepare('UPDATE section_visibility SET visible = ?, sort_order = ? WHERE section_name = ?').run(visible ? 1 : 0, sort_order || 0, section.section_key);
        
        res.json({ success: true });
    });

    app.delete('/api/custom-sections/:id', (req, res) => {
        const section = db.prepare('SELECT section_key FROM custom_sections WHERE id = ?').get(req.params.id);
        if (section) {
            db.prepare('DELETE FROM section_visibility WHERE section_name = ?').run(section.section_key);
        }
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
        const { title, subtitle, description, link, icon, image, metadata, visible, sort_order } = req.body;
        db.prepare(`UPDATE custom_section_items SET title = ?, subtitle = ?, description = ?, link = ?, icon = ?, image = ?, metadata = ?, visible = ?, sort_order = ? WHERE id = ? AND section_id = ?`).run(title, subtitle, description, link, icon, image, metadata ? JSON.stringify(metadata) : null, visible ? 1 : 0, sort_order || 0, req.params.itemId, req.params.id);
        res.json({ success: true });
    });

    app.delete('/api/custom-sections/:id/items/:itemId', (req, res) => {
        db.prepare('DELETE FROM custom_section_items WHERE id = ? AND section_id = ?').run(req.params.itemId, req.params.id);
        res.json({ success: true });
    });

    // Layout types and social platforms metadata
    app.get('/api/layout-types', (req, res) => { res.json(LAYOUT_TYPES); });
    app.get('/api/social-platforms', (req, res) => { res.json(SOCIAL_PLATFORMS); });

    app.get('/api/timeline', (req, res) => { res.json(db.prepare(`SELECT id, company_name, job_title, start_date, end_date, country_code, visible FROM experiences ORDER BY start_date ASC`).all().map(exp => ({ id: exp.id, company: exp.company_name, role: exp.job_title, period: formatPeriod(exp.start_date, exp.end_date), start_date: exp.start_date, end_date: exp.end_date, countryCode: exp.country_code || 'ch', visible: !!exp.visible }))); });

    app.get('/api/cv', (req, res) => { const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get(); const experiences = db.prepare('SELECT * FROM experiences ORDER BY start_date DESC, sort_order ASC').all(); const certifications = db.prepare('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC').all(); const education = db.prepare('SELECT * FROM education ORDER BY sort_order ASC, end_date DESC').all(); const skillCategories = db.prepare('SELECT * FROM skill_categories ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all(); const sections = db.prepare('SELECT * FROM section_visibility ORDER BY sort_order ASC').all(); const sectionVisibility = {}; const sectionOrderData = []; sections.forEach(s => { sectionVisibility[s.section_name] = !!s.visible; sectionOrderData.push({ key: s.section_name, sort_order: s.sort_order || 0, visible: !!s.visible, display_name: s.display_name || null }); }); res.json({ profile, experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })), certifications, education, skills: skillCategories.map(cat => ({ ...cat, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) })), projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] })), sectionVisibility, sectionOrder: sectionOrderData }); });

    app.post('/api/import', (req, res) => { const data = req.body; const importData = db.transaction(() => { if (data.profile) { const p = data.profile; db.prepare(`UPDATE profile SET name = ?, initials = ?, title = ?, subtitle = ?, bio = ?, location = ?, linkedin = ?, email = ?, phone = ?, languages = ? WHERE id = 1`).run(p.name, p.initials, p.title, p.subtitle, p.bio, p.location, p.linkedin, p.email, p.phone, p.languages); } if (data.experiences) { db.prepare('DELETE FROM experiences').run(); const stmt = db.prepare(`INSERT INTO experiences (job_title, company_name, start_date, end_date, location, country_code, highlights, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`); data.experiences.forEach((e, idx) => { stmt.run(e.job_title, e.company_name, e.start_date, e.end_date, e.location, e.country_code || 'ch', JSON.stringify(e.highlights || []), idx, e.visible !== false ? 1 : 0); }); } if (data.certifications) { db.prepare('DELETE FROM certifications').run(); const stmt = db.prepare(`INSERT INTO certifications (name, provider, issue_date, expiry_date, credential_id, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?)`); data.certifications.forEach((c, idx) => { stmt.run(c.name, c.provider, c.issue_date, c.expiry_date, c.credential_id, idx, c.visible !== false ? 1 : 0); }); } if (data.education) { db.prepare('DELETE FROM education').run(); const stmt = db.prepare(`INSERT INTO education (degree_title, institution_name, start_date, end_date, description, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?, ?)`); data.education.forEach((e, idx) => { stmt.run(e.degree_title, e.institution_name, e.start_date, e.end_date, e.description, idx, e.visible !== false ? 1 : 0); }); } if (data.skills) { db.prepare('DELETE FROM skills').run(); db.prepare('DELETE FROM skill_categories').run(); const catStmt = db.prepare('INSERT INTO skill_categories (name, icon, sort_order, visible) VALUES (?, ?, ?, ?)'); const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)'); data.skills.forEach((cat, catIdx) => { const result = catStmt.run(cat.name, cat.icon || 'default', catIdx, cat.visible !== false ? 1 : 0); const categoryId = result.lastInsertRowid; if (cat.skills) { cat.skills.forEach((skill, skillIdx) => { skillStmt.run(categoryId, skill, skillIdx); }); } }); } if (data.projects) { db.prepare('DELETE FROM projects').run(); const stmt = db.prepare(`INSERT INTO projects (title, description, technologies, link, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?)`); data.projects.forEach((p, idx) => { stmt.run(p.title, p.description, JSON.stringify(p.technologies || []), p.link, idx, p.visible !== false ? 1 : 0); }); } if (data.sectionOrder && Array.isArray(data.sectionOrder)) { data.sectionOrder.forEach(s => { db.prepare('UPDATE section_visibility SET visible = ?, sort_order = ?, display_name = ? WHERE section_name = ?').run(s.visible !== false ? 1 : 0, s.sort_order || 0, s.display_name || null, s.key); }); } }); try { importData(); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); } });

    app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '../public/index.html')); });

    // Public Read-Only Server (Port 3001)
    const publicApp = express();
    publicApp.use(cors({ methods: ['GET'], credentials: false }));
    publicApp.use((req, res, next) => { if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' }); next(); });
    const rateLimit = {};
    publicApp.use((req, res, next) => { const ip = req.ip || req.connection.remoteAddress; const now = Date.now(); if (!rateLimit[ip]) rateLimit[ip] = { count: 1, start: now }; else if (now - rateLimit[ip].start > 60000) rateLimit[ip] = { count: 1, start: now }; else { rateLimit[ip].count++; if (rateLimit[ip].count > 60) return res.status(429).json({ error: 'Too many requests' }); } next(); });
    publicApp.use((req, res, next) => { res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('X-Frame-Options', 'DENY'); res.setHeader('X-XSS-Protection', '1; mode=block'); res.setHeader('Referrer-Policy', 'no-referrer'); res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://flagcdn.com; img-src 'self' https://flagcdn.com data:"); next(); });
    publicApp.get('/sitemap.xml', (req, res) => { const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https'; const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'; res.setHeader('Content-Type', 'application/xml'); res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${protocol}://${host}/</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>`); });
    publicApp.get('/robots.txt', (req, res) => { const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https'; const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'; res.setHeader('Content-Type', 'text/plain'); res.send(`User-agent: *\nAllow: /\nSitemap: ${protocol}://${host}/sitemap.xml\nDisallow: /api/`); });
    publicApp.use('/shared', express.static(path.join(__dirname, '../public/shared')));
    publicApp.use(express.static(path.join(__dirname, '../public-readonly')));
    publicApp.use('/uploads', express.static(uploadsPath));
    publicApp.get('/api/profile', (req, res) => { res.json(db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages FROM profile WHERE id = 1').get() || {}); });
    publicApp.get('/api/sections', (req, res) => { const sections = db.prepare('SELECT * FROM section_visibility').all(); const result = {}; sections.forEach(s => { result[s.section_name] = !!s.visible; }); res.json(result); });
    publicApp.get('/api/sections/order', (req, res) => { 
        const sections = db.prepare('SELECT * FROM section_visibility ORDER BY sort_order ASC').all(); 
        const customSections = db.prepare('SELECT section_key, name FROM custom_sections').all();
        const customNameMap = {};
        customSections.forEach(cs => { customNameMap[cs.section_key] = cs.name; });
        const defaultName = (s) => SECTION_DISPLAY_NAMES[s.section_name] || customNameMap[s.section_name] || s.section_name;
        res.json(sections.map(s => ({ 
            key: s.section_name, 
            name: s.display_name || defaultName(s),
            default_name: defaultName(s),
            visible: !!s.visible,
            print_visible: s.print_visible !== 0,
            sort_order: s.sort_order || 0, 
            is_custom: !DEFAULT_SECTION_ORDER.includes(s.section_name) 
        }))); 
    });
    publicApp.get('/api/settings/:key', (req, res) => { const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key); res.json({ value: setting?.value || null }); });
    publicApp.get('/api/experiences', (req, res) => { res.json(db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights FROM experiences WHERE visible = 1 ORDER BY start_date DESC, sort_order ASC').all().map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [], visible: true }))); });
    publicApp.get('/api/certifications', (req, res) => { res.json(db.prepare('SELECT name, provider, issue_date FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all().map(c => ({ ...c, visible: true }))); });
    publicApp.get('/api/education', (req, res) => { res.json(db.prepare('SELECT degree_title, institution_name, start_date, end_date, description FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all().map(e => ({ ...e, visible: true }))); });
    publicApp.get('/api/skills', (req, res) => { const categories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); res.json(categories.map(cat => ({ ...cat, visible: true, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) }))); });
    publicApp.get('/api/projects', (req, res) => { res.json(db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all().map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [], visible: true }))); });
    publicApp.get('/api/timeline', (req, res) => { res.json(db.prepare('SELECT id, company_name, job_title, start_date, end_date, country_code FROM experiences WHERE visible = 1 ORDER BY start_date ASC').all().map(exp => ({ id: exp.id, company: exp.company_name, role: exp.job_title, period: formatPeriod(exp.start_date, exp.end_date), start_date: exp.start_date, end_date: exp.end_date, countryCode: exp.country_code || 'ch', visible: true }))); });
    publicApp.get('/api/custom-sections', (req, res) => {
        const sections = db.prepare('SELECT id, name, section_key, layout_type, icon, sort_order FROM custom_sections WHERE visible = 1 ORDER BY sort_order ASC').all();
        const items = db.prepare('SELECT * FROM custom_section_items WHERE visible = 1 ORDER BY sort_order ASC').all();
        res.json(sections.map(s => ({ ...s, visible: true, items: items.filter(i => i.section_id === s.id).map(i => ({ ...i, visible: true, metadata: i.metadata ? JSON.parse(i.metadata) : null })) })));
    });
    publicApp.get('/api/layout-types', (req, res) => { res.json(LAYOUT_TYPES); });
    publicApp.get('/api/social-platforms', (req, res) => { res.json(SOCIAL_PLATFORMS); });
    publicApp.get('/api/cv', (req, res) => { const profile = db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages FROM profile WHERE id = 1').get(); const experiences = db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights FROM experiences WHERE visible = 1 ORDER BY start_date DESC, sort_order ASC').all(); const certifications = db.prepare('SELECT name, provider, issue_date FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all(); const education = db.prepare('SELECT degree_title, institution_name, start_date, end_date, description FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all(); const skillCategories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all(); const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all(); const projects = db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all(); const sectionOrder = db.prepare('SELECT section_name, sort_order FROM section_visibility WHERE visible = 1 ORDER BY sort_order ASC').all(); res.json({ profile, experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })), certifications, education, skills: skillCategories.map(cat => ({ ...cat, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) })), projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] })), sectionOrder: sectionOrder.map(s => s.section_name) }); });
    publicApp.get('*', (req, res) => { servePublicIndex(req, res); });

    app.listen(PORT, '0.0.0.0', () => { console.log(`CV Manager (Admin) running at http://localhost:${PORT}`); });
    publicApp.listen(PUBLIC_PORT, '0.0.0.0', () => { console.log(`CV Manager (Public Read-Only) running at http://localhost:${PUBLIC_PORT}`); });
}

process.on('SIGINT', () => { db.close(); process.exit(0); });
process.on('SIGTERM', () => { db.close(); process.exit(0); });

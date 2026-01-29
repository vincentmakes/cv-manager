const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_PORT = process.env.PUBLIC_PORT || 3001;

// Resolve database path - use absolute path
const DB_PATH = process.env.DB_PATH 
    ? path.resolve(process.env.DB_PATH)
    : path.join(__dirname, '..', 'data', 'cv.db');

const dataDir = path.dirname(DB_PATH);
console.log(`Data directory: ${dataDir}`);
console.log(`Database path: ${DB_PATH}`);

// Auto-detect read-only mode by trying to write a test file
// Returns: { status: 'writable' | 'readonly' | 'permission_denied', error?: string }
function checkFilesystemAccess(dir) {
    const testFile = path.join(dir, '.write-test-' + process.pid);
    try {
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        return { status: 'writable' };
    } catch (err) {
        if (err.code === 'EROFS') {
            return { status: 'readonly' }; // Intentional read-only mount
        }
        if (err.code === 'EACCES') {
            return { status: 'permission_denied', error: err.message };
        }
        return { status: 'error', error: err.message };
    }
}

// Check if explicitly set via env, otherwise auto-detect
let PUBLIC_ONLY = process.env.PUBLIC_ONLY === 'true' || process.env.PUBLIC_ONLY === '1';

try {
    // Create data directory if it doesn't exist (only possible in admin mode)
    if (!fs.existsSync(dataDir)) {
        if (PUBLIC_ONLY) {
            console.error(`Data directory does not exist: ${dataDir}`);
            console.error('In public-only mode, the admin container must be running first.');
            process.exit(1);
        }
        try {
            console.log(`Creating data directory: ${dataDir}`);
            fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
        } catch (mkdirErr) {
            if (mkdirErr.code === 'EACCES') {
                console.error('');
                console.error('='.repeat(60));
                console.error('ERROR: Cannot create data directory - permission denied!');
                console.error('='.repeat(60));
                console.error('');
                console.error('Please create the directory on the host first:');
                console.error('');
                console.error('  mkdir -p /mnt/user/appdata/cv-manager/data');
                console.error('  chmod 777 /mnt/user/appdata/cv-manager/data');
                console.error('');
                console.error('='.repeat(60));
                process.exit(1);
            }
            throw mkdirErr;
        }
    }
    
    // Auto-detect read-only mode if not explicitly set
    if (!PUBLIC_ONLY) {
        const accessCheck = checkFilesystemAccess(dataDir);
        
        if (accessCheck.status === 'writable') {
            console.log('Running in ADMIN mode (read-write)');
        } else if (accessCheck.status === 'readonly') {
            // True read-only mount (EROFS) - check if database exists for public mode
            if (fs.existsSync(DB_PATH)) {
                console.log('Auto-detected read-only mount with existing database');
                console.log('Running in PUBLIC-ONLY mode (read-only)');
                PUBLIC_ONLY = true;
            } else {
                console.error('');
                console.error('='.repeat(60));
                console.error('ERROR: Read-only mount but no database found!');
                console.error('='.repeat(60));
                console.error('');
                console.error('If this is the PUBLIC container:');
                console.error('  Install and run the ADMIN container first to create the database.');
                console.error('');
                console.error('If this is the ADMIN container:');
                console.error('  Change the volume mount from read-only (ro) to read-write (rw).');
                console.error('');
                console.error('='.repeat(60));
                process.exit(1);
            }
        } else if (accessCheck.status === 'permission_denied') {
            // Permission issue - not a read-only mount, just can't write
            console.error('');
            console.error('='.repeat(60));
            console.error('ERROR: Permission denied writing to data directory!');
            console.error('='.repeat(60));
            console.error('');
            console.error(`Directory: ${dataDir}`);
            console.error('');
            console.error('Please fix permissions on the host:');
            console.error('');
            console.error('  chmod -R 777 /mnt/user/appdata/cv-manager');
            console.error('');
            console.error('Or create the directory with correct ownership:');
            console.error('');
            console.error('  mkdir -p /mnt/user/appdata/cv-manager/data');
            console.error('  chown -R 1001:1001 /mnt/user/appdata/cv-manager');
            console.error('');
            console.error('='.repeat(60));
            process.exit(1);
        } else {
            console.error(`Error checking filesystem access: ${accessCheck.error}`);
            process.exit(1);
        }
    } else {
        // Explicit PUBLIC_ONLY mode
        if (!fs.existsSync(DB_PATH)) {
            console.error(`Database does not exist: ${DB_PATH}`);
            console.error('In public-only mode, the admin container must create the database first.');
            process.exit(1);
        }
        console.log('Running in PUBLIC-ONLY mode (read-only)');
    }
} catch (err) {
    console.error(`Error with data directory: ${err.message}`);
    process.exit(1);
}

// Initialize database
console.log('Initializing database...');
let db;
try {
    if (PUBLIC_ONLY) {
        // Open database in read-only mode for public container
        db = new Database(DB_PATH, { readonly: true });
        console.log('Database opened in read-only mode');
    } else {
        db = new Database(DB_PATH);
        console.log('Database opened successfully');
        db.pragma('journal_mode = WAL');
    }
} catch (err) {
    console.error(`Failed to open database: ${err.message}`);
    process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve uploads from data directory (for profile picture)
const uploadsPath = path.join(dataDir, 'uploads');
if (!PUBLIC_ONLY) {
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
    }
}
app.use('/uploads', express.static(uploadsPath));

// ===========================
// Database Schema (only run if not public-only)
// ===========================

if (!PUBLIC_ONLY) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS profile (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            name TEXT NOT NULL DEFAULT 'Your Name',
            initials TEXT DEFAULT 'YN',
            title TEXT DEFAULT 'Your Title',
            subtitle TEXT DEFAULT '',
            bio TEXT DEFAULT '',
            location TEXT DEFAULT '',
            linkedin TEXT DEFAULT '',
            email TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            languages TEXT DEFAULT '',
            visible INTEGER DEFAULT 1,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE TABLE IF NOT EXISTS experiences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_title TEXT NOT NULL,
            company_name TEXT NOT NULL,
            start_date TEXT,
            end_date TEXT,
            location TEXT,
            country_code TEXT DEFAULT 'ch',
            highlights TEXT,
            sort_order INTEGER DEFAULT 0,
            visible INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS certifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            provider TEXT,
            issue_date TEXT,
            expiry_date TEXT,
            credential_id TEXT,
            sort_order INTEGER DEFAULT 0,
            visible INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS education (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            degree_title TEXT NOT NULL,
            institution_name TEXT NOT NULL,
            start_date TEXT,
            end_date TEXT,
            description TEXT,
            sort_order INTEGER DEFAULT 0,
            visible INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS skill_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            icon TEXT DEFAULT '💡',
            sort_order INTEGER DEFAULT 0,
            visible INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            technologies TEXT,
            link TEXT,
            sort_order INTEGER DEFAULT 0,
            visible INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS section_visibility (
            section_name TEXT PRIMARY KEY,
            visible INTEGER DEFAULT 1
        );

        -- Initialize profile if empty
        INSERT OR IGNORE INTO profile (id) VALUES (1);

        -- Initialize section visibility
        INSERT OR IGNORE INTO section_visibility (section_name, visible) VALUES 
            ('about', 1),
            ('timeline', 1),
            ('experience', 1),
            ('certifications', 1),
            ('education', 1),
            ('skills', 1),
            ('projects', 1);

        -- Saved datasets for Save As / Open functionality
        CREATE TABLE IF NOT EXISTS saved_datasets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

// ===========================
// Helper Functions
// ===========================

function formatPeriod(startDate, endDate) {
    const start = startDate ? formatDateShort(startDate) : '';
    const end = endDate ? formatDateShort(endDate) : 'Present';
    return `${start} - ${end}`;
}

function formatDateShort(dateStr) {
    if (!dateStr) return '';
    if (dateStr.match(/^\d{4}$/)) return dateStr;
    if (dateStr.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = dateStr.split('-');
        return `${year}`;
    }
    try {
        const date = new Date(dateStr);
        return date.getFullYear().toString();
    } catch {
        return dateStr;
    }
}

// ===========================
// PUBLIC_ONLY Mode - Only serve read-only public endpoints
// ===========================

if (PUBLIC_ONLY) {
    const publicApp = express();

    // Security: Strict CORS - no credentials, limited methods
    publicApp.use(cors({
        methods: ['GET'],
        credentials: false
    }));

    // Security: Reject any non-GET requests
    publicApp.use((req, res, next) => {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        next();
    });

    // Rate limiting (simple in-memory)
    const rateLimit = {};
    const RATE_LIMIT_WINDOW = 60000;
    const RATE_LIMIT_MAX = 60;

    publicApp.use((req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!rateLimit[ip]) {
            rateLimit[ip] = { count: 1, start: now };
        } else if (now - rateLimit[ip].start > RATE_LIMIT_WINDOW) {
            rateLimit[ip] = { count: 1, start: now };
        } else {
            rateLimit[ip].count++;
            if (rateLimit[ip].count > RATE_LIMIT_MAX) {
                return res.status(429).json({ error: 'Too many requests' });
            }
        }
        next();
    });

    // Security headers
    publicApp.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://flagcdn.com; img-src 'self' https://flagcdn.com data:");
        next();
    });

    // Dynamic sitemap.xml
    publicApp.get('/sitemap.xml', (req, res) => {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
        const baseUrl = `${protocol}://${host}`;
        const lastmod = new Date().toISOString().split('T')[0];
        
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
        
        res.setHeader('Content-Type', 'application/xml');
        res.send(sitemap);
    });

    // Dynamic robots.txt
    publicApp.get('/robots.txt', (req, res) => {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
        const baseUrl = `${protocol}://${host}`;
        
        const robots = `# Robots.txt for CV Public Site
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

Disallow: /api/
`;
        
        res.setHeader('Content-Type', 'text/plain');
        res.send(robots);
    });

    // Serve static files
    publicApp.use('/shared', express.static(path.join(__dirname, '../public/shared')));
    publicApp.use(express.static(path.join(__dirname, '../public-readonly')));
    publicApp.use('/uploads', express.static(uploadsPath));

    // Read-only API endpoints
    publicApp.get('/api/profile', (req, res) => {
        const profile = db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages FROM profile WHERE id = 1').get();
        res.json(profile || {});
    });

    publicApp.get('/api/sections', (req, res) => {
        const sections = db.prepare('SELECT * FROM section_visibility').all();
        const result = {};
        sections.forEach(s => { result[s.section_name] = !!s.visible; });
        res.json(result);
    });

    publicApp.get('/api/settings/:key', (req, res) => {
        const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key);
        res.json({ value: setting?.value || null });
    });

    publicApp.get('/api/experiences', (req, res) => {
        const experiences = db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights FROM experiences WHERE visible = 1 ORDER BY start_date DESC, sort_order ASC').all();
        res.json(experiences.map(e => ({
            ...e,
            highlights: e.highlights ? JSON.parse(e.highlights) : [],
            visible: true
        })));
    });

    publicApp.get('/api/certifications', (req, res) => {
        const certs = db.prepare('SELECT name, provider, issue_date FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all();
        res.json(certs.map(c => ({ ...c, visible: true })));
    });

    publicApp.get('/api/education', (req, res) => {
        const education = db.prepare('SELECT degree_title, institution_name, start_date, end_date, description FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all();
        res.json(education.map(e => ({ ...e, visible: true })));
    });

    publicApp.get('/api/skills', (req, res) => {
        const categories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all();
        const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
        
        const result = categories.map(cat => ({
            ...cat,
            visible: true,
            skills: skills.filter(s => s.category_id === cat.id).map(s => s.name)
        }));
        
        res.json(result);
    });

    publicApp.get('/api/projects', (req, res) => {
        const projects = db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all();
        res.json(projects.map(p => ({
            ...p,
            technologies: p.technologies ? JSON.parse(p.technologies) : [],
            visible: true
        })));
    });

    publicApp.get('/api/timeline', (req, res) => {
        const experiences = db.prepare(`
            SELECT company_name, job_title, start_date, end_date, country_code 
            FROM experiences 
            WHERE visible = 1
            ORDER BY start_date ASC
        `).all();
        
        const timeline = experiences.map(exp => ({
            company: exp.company_name,
            role: exp.job_title,
            period: formatPeriod(exp.start_date, exp.end_date),
            countryCode: exp.country_code || 'ch',
            visible: true
        }));
        
        res.json(timeline);
    });

    publicApp.get('/api/cv', (req, res) => {
        const profile = db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages FROM profile WHERE id = 1').get();
        const experiences = db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights FROM experiences WHERE visible = 1 ORDER BY start_date DESC, sort_order ASC').all();
        const certifications = db.prepare('SELECT name, provider, issue_date FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all();
        const education = db.prepare('SELECT degree_title, institution_name, start_date, end_date, description FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all();
        const skillCategories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all();
        const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
        const projects = db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all();
        
        res.json({
            profile,
            experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })),
            certifications,
            education,
            skills: skillCategories.map(cat => ({
                ...cat,
                skills: skills.filter(s => s.category_id === cat.id).map(s => s.name)
            })),
            projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] }))
        });
    });

    // Catch-all for public SPA
    publicApp.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public-readonly/index.html'));
    });

    // Start public-only server on PUBLIC_PORT
    publicApp.listen(PUBLIC_PORT, '0.0.0.0', () => {
        console.log(`CV Manager (Public Read-Only) running at http://localhost:${PUBLIC_PORT}`);
    });

} else {
    // ===========================
    // ADMIN Mode - Full CRUD access
    // ===========================

    // API Routes - Profile
    app.get('/api/profile', (req, res) => {
        const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
        res.json(profile);
    });

    app.put('/api/profile', (req, res) => {
        const { name, initials, title, subtitle, bio, location, linkedin, email, phone, languages, visible } = req.body;
        
        const stmt = db.prepare(`
            UPDATE profile SET 
                name = ?, initials = ?, title = ?, subtitle = ?, bio = ?,
                location = ?, linkedin = ?, email = ?, phone = ?, languages = ?,
                visible = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `);
        
        stmt.run(name, initials, title, subtitle, bio, location, linkedin, email, phone, languages, visible ? 1 : 0);
        res.json({ success: true });
    });

    // Profile Picture Upload
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadsPath);
        },
        filename: function (req, file, cb) {
            cb(null, 'picture.jpeg');
        }
    });

    const upload = multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: function (req, file, cb) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
            }
        }
    });

    app.post('/api/profile/picture', upload.single('picture'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({ success: true, filename: req.file.filename });
    });

    app.delete('/api/profile/picture', (req, res) => {
        const picturePath = path.join(uploadsPath, 'picture.jpeg');
        try {
            if (fs.existsSync(picturePath)) {
                fs.unlinkSync(picturePath);
            }
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // API Routes - Settings
    app.get('/api/settings', (req, res) => {
        const settings = db.prepare('SELECT * FROM settings').all();
        const result = {};
        settings.forEach(s => { result[s.key] = s.value; });
        res.json(result);
    });

    app.get('/api/settings/:key', (req, res) => {
        const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key);
        res.json({ value: setting?.value || null });
    });

    app.put('/api/settings/:key', (req, res) => {
        const { value } = req.body;
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(req.params.key, value);
        res.json({ success: true });
    });

    // API Routes - Experiences
    app.get('/api/experiences', (req, res) => {
        const experiences = db.prepare('SELECT * FROM experiences ORDER BY start_date DESC, sort_order ASC').all();
        res.json(experiences.map(e => ({
            ...e,
            highlights: e.highlights ? JSON.parse(e.highlights) : [],
            visible: !!e.visible
        })));
    });

    app.get('/api/experiences/:id', (req, res) => {
        const exp = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id);
        if (!exp) return res.status(404).json({ error: 'Not found' });
        res.json({
            ...exp,
            highlights: exp.highlights ? JSON.parse(exp.highlights) : [],
            visible: !!exp.visible
        });
    });

    app.post('/api/experiences', (req, res) => {
        const { job_title, company_name, start_date, end_date, location, country_code, highlights } = req.body;
        
        const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM experiences').get();
        const sort_order = (maxOrder.max || 0) + 1;
        
        const stmt = db.prepare(`
            INSERT INTO experiences (job_title, company_name, start_date, end_date, location, country_code, highlights, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(job_title, company_name, start_date, end_date, location, country_code || 'ch', 
            JSON.stringify(highlights || []), sort_order);
        
        res.json({ id: result.lastInsertRowid });
    });

    app.put('/api/experiences/:id', (req, res) => {
        const { job_title, company_name, start_date, end_date, location, country_code, highlights, visible, sort_order } = req.body;
        
        const stmt = db.prepare(`
            UPDATE experiences SET 
                job_title = ?, company_name = ?, start_date = ?, end_date = ?, 
                location = ?, country_code = ?, highlights = ?, visible = ?, sort_order = ?
            WHERE id = ?
        `);
        
        stmt.run(job_title, company_name, start_date, end_date, location, country_code || 'ch',
            JSON.stringify(highlights || []), visible ? 1 : 0, sort_order || 0, req.params.id);
        
        res.json({ success: true });
    });

    app.delete('/api/experiences/:id', (req, res) => {
        db.prepare('DELETE FROM experiences WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    // API Routes - Certifications
    app.get('/api/certifications', (req, res) => {
        const certs = db.prepare('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC').all();
        res.json(certs.map(c => ({ ...c, visible: !!c.visible })));
    });

    app.get('/api/certifications/:id', (req, res) => {
        const cert = db.prepare('SELECT * FROM certifications WHERE id = ?').get(req.params.id);
        if (!cert) return res.status(404).json({ error: 'Not found' });
        res.json({ ...cert, visible: !!cert.visible });
    });

    app.post('/api/certifications', (req, res) => {
        const { name, provider, issue_date, expiry_date, credential_id } = req.body;
        
        const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM certifications').get();
        const sort_order = (maxOrder.max || 0) + 1;
        
        const stmt = db.prepare(`
            INSERT INTO certifications (name, provider, issue_date, expiry_date, credential_id, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(name, provider, issue_date, expiry_date, credential_id, sort_order);
        res.json({ id: result.lastInsertRowid });
    });

    app.put('/api/certifications/:id', (req, res) => {
        const { name, provider, issue_date, expiry_date, credential_id, visible, sort_order } = req.body;
        
        const stmt = db.prepare(`
            UPDATE certifications SET 
                name = ?, provider = ?, issue_date = ?, expiry_date = ?, 
                credential_id = ?, visible = ?, sort_order = ?
            WHERE id = ?
        `);
        
        stmt.run(name, provider, issue_date, expiry_date, credential_id, visible ? 1 : 0, sort_order || 0, req.params.id);
        res.json({ success: true });
    });

    app.delete('/api/certifications/:id', (req, res) => {
        db.prepare('DELETE FROM certifications WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    // API Routes - Education
    app.get('/api/education', (req, res) => {
        const education = db.prepare('SELECT * FROM education ORDER BY sort_order ASC, end_date DESC').all();
        res.json(education.map(e => ({ ...e, visible: !!e.visible })));
    });

    app.get('/api/education/:id', (req, res) => {
        const edu = db.prepare('SELECT * FROM education WHERE id = ?').get(req.params.id);
        if (!edu) return res.status(404).json({ error: 'Not found' });
        res.json({ ...edu, visible: !!edu.visible });
    });

    app.post('/api/education', (req, res) => {
        const { degree_title, institution_name, start_date, end_date, description } = req.body;
        
        const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM education').get();
        const sort_order = (maxOrder.max || 0) + 1;
        
        const stmt = db.prepare(`
            INSERT INTO education (degree_title, institution_name, start_date, end_date, description, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(degree_title, institution_name, start_date, end_date, description, sort_order);
        res.json({ id: result.lastInsertRowid });
    });

    app.put('/api/education/:id', (req, res) => {
        const { degree_title, institution_name, start_date, end_date, description, visible, sort_order } = req.body;
        
        const stmt = db.prepare(`
            UPDATE education SET 
                degree_title = ?, institution_name = ?, start_date = ?, end_date = ?, 
                description = ?, visible = ?, sort_order = ?
            WHERE id = ?
        `);
        
        stmt.run(degree_title, institution_name, start_date, end_date, description, visible ? 1 : 0, sort_order || 0, req.params.id);
        res.json({ success: true });
    });

    app.delete('/api/education/:id', (req, res) => {
        db.prepare('DELETE FROM education WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    // API Routes - Skills
    app.get('/api/skills', (req, res) => {
        const categories = db.prepare('SELECT * FROM skill_categories ORDER BY sort_order ASC').all();
        const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
        
        const result = categories.map(cat => ({
            ...cat,
            visible: !!cat.visible,
            skills: skills.filter(s => s.category_id === cat.id).map(s => s.name)
        }));
        
        res.json(result);
    });

    app.get('/api/skills/:id', (req, res) => {
        const cat = db.prepare('SELECT * FROM skill_categories WHERE id = ?').get(req.params.id);
        if (!cat) return res.status(404).json({ error: 'Not found' });
        const skills = db.prepare('SELECT name FROM skills WHERE category_id = ? ORDER BY sort_order ASC').all(req.params.id);
        res.json({
            ...cat,
            visible: !!cat.visible,
            skills: skills.map(s => s.name)
        });
    });

    app.post('/api/skills', (req, res) => {
        const { name, icon, skills } = req.body;
        
        const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM skill_categories').get();
        const sort_order = (maxOrder.max || 0) + 1;
        
        const catStmt = db.prepare('INSERT INTO skill_categories (name, icon, sort_order) VALUES (?, ?, ?)');
        const result = catStmt.run(name, icon || '💡', sort_order);
        const categoryId = result.lastInsertRowid;
        
        if (skills && skills.length > 0) {
            const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)');
            skills.forEach((skill, idx) => {
                skillStmt.run(categoryId, skill, idx);
            });
        }
        
        res.json({ id: categoryId });
    });

    app.put('/api/skills/:id', (req, res) => {
        const { name, icon, skills, visible, sort_order } = req.body;
        const categoryId = req.params.id;
        
        const catStmt = db.prepare('UPDATE skill_categories SET name = ?, icon = ?, visible = ?, sort_order = ? WHERE id = ?');
        catStmt.run(name, icon || '💡', visible ? 1 : 0, sort_order || 0, categoryId);
        
        db.prepare('DELETE FROM skills WHERE category_id = ?').run(categoryId);
        
        if (skills && skills.length > 0) {
            const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)');
            skills.forEach((skill, idx) => {
                skillStmt.run(categoryId, skill, idx);
            });
        }
        
        res.json({ success: true });
    });

    app.delete('/api/skills/:id', (req, res) => {
        db.prepare('DELETE FROM skills WHERE category_id = ?').run(req.params.id);
        db.prepare('DELETE FROM skill_categories WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    // API Routes - Projects
    app.get('/api/projects', (req, res) => {
        const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all();
        res.json(projects.map(p => ({
            ...p,
            technologies: p.technologies ? JSON.parse(p.technologies) : [],
            visible: !!p.visible
        })));
    });

    app.get('/api/projects/:id', (req, res) => {
        const proj = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
        if (!proj) return res.status(404).json({ error: 'Not found' });
        res.json({
            ...proj,
            technologies: proj.technologies ? JSON.parse(proj.technologies) : [],
            visible: !!proj.visible
        });
    });

    app.post('/api/projects', (req, res) => {
        const { title, description, technologies, link } = req.body;
        
        const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM projects').get();
        const sort_order = (maxOrder.max || 0) + 1;
        
        const stmt = db.prepare(`
            INSERT INTO projects (title, description, technologies, link, sort_order)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(title, description, JSON.stringify(technologies || []), link, sort_order);
        res.json({ id: result.lastInsertRowid });
    });

    app.put('/api/projects/:id', (req, res) => {
        const { title, description, technologies, link, visible, sort_order } = req.body;
        
        const stmt = db.prepare(`
            UPDATE projects SET 
                title = ?, description = ?, technologies = ?, link = ?, visible = ?, sort_order = ?
            WHERE id = ?
        `);
        
        stmt.run(title, description, JSON.stringify(technologies || []), link, visible ? 1 : 0, sort_order || 0, req.params.id);
        res.json({ success: true });
    });

    app.delete('/api/projects/:id', (req, res) => {
        db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    // API Routes - Section Visibility
    app.get('/api/sections', (req, res) => {
        const sections = db.prepare('SELECT * FROM section_visibility').all();
        const result = {};
        sections.forEach(s => { result[s.section_name] = !!s.visible; });
        res.json(result);
    });

    app.put('/api/sections/:name', (req, res) => {
        const { visible } = req.body;
        db.prepare('UPDATE section_visibility SET visible = ? WHERE section_name = ?').run(visible ? 1 : 0, req.params.name);
        res.json({ success: true });
    });

    // API Routes - Saved Datasets
    app.get('/api/datasets', (req, res) => {
        const datasets = db.prepare('SELECT id, name, created_at, updated_at FROM saved_datasets ORDER BY updated_at DESC').all();
        res.json(datasets);
    });

    app.post('/api/datasets', (req, res) => {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }
        
        const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
        const experiences = db.prepare('SELECT * FROM experiences ORDER BY start_date DESC, sort_order ASC').all();
        const certifications = db.prepare('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC').all();
        const education = db.prepare('SELECT * FROM education ORDER BY sort_order ASC, end_date DESC').all();
        const skillCategories = db.prepare('SELECT * FROM skill_categories ORDER BY sort_order ASC').all();
        const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
        const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all();
        const sections = db.prepare('SELECT * FROM section_visibility').all();
        
        const sectionVisibility = {};
        sections.forEach(s => { sectionVisibility[s.section_name] = !!s.visible; });
        
        const cvData = {
            profile,
            experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })),
            certifications,
            education,
            skills: skillCategories.map(cat => ({
                ...cat,
                skills: skills.filter(s => s.category_id === cat.id).map(s => s.name)
            })),
            projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] })),
            sectionVisibility
        };
        
        try {
            const existing = db.prepare('SELECT id FROM saved_datasets WHERE name = ?').get(name.trim());
            if (existing) {
                db.prepare('UPDATE saved_datasets SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                    .run(JSON.stringify(cvData), existing.id);
                res.json({ success: true, id: existing.id, updated: true });
            } else {
                const result = db.prepare('INSERT INTO saved_datasets (name, data) VALUES (?, ?)')
                    .run(name.trim(), JSON.stringify(cvData));
                res.json({ success: true, id: result.lastInsertRowid, created: true });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/datasets/:id/load', (req, res) => {
        const dataset = db.prepare('SELECT * FROM saved_datasets WHERE id = ?').get(req.params.id);
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }
        
        try {
            const data = JSON.parse(dataset.data);
            
            const importData = db.transaction(() => {
                if (data.profile) {
                    const p = data.profile;
                    db.prepare(`
                        UPDATE profile SET 
                            name = ?, initials = ?, title = ?, subtitle = ?, bio = ?,
                            location = ?, linkedin = ?, email = ?, phone = ?, languages = ?
                        WHERE id = 1
                    `).run(p.name, p.initials, p.title, p.subtitle, p.bio, p.location, p.linkedin, p.email, p.phone, p.languages);
                }
                
                if (data.experiences) {
                    db.prepare('DELETE FROM experiences').run();
                    const stmt = db.prepare(`
                        INSERT INTO experiences (job_title, company_name, start_date, end_date, location, country_code, highlights, sort_order, visible)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `);
                    data.experiences.forEach((e, idx) => {
                        stmt.run(e.job_title, e.company_name, e.start_date, e.end_date, e.location, e.country_code || 'ch',
                            JSON.stringify(e.highlights || []), idx, e.visible !== false ? 1 : 0);
                    });
                }
                
                if (data.certifications) {
                    db.prepare('DELETE FROM certifications').run();
                    const stmt = db.prepare(`
                        INSERT INTO certifications (name, provider, issue_date, expiry_date, credential_id, sort_order, visible)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `);
                    data.certifications.forEach((c, idx) => {
                        stmt.run(c.name, c.provider, c.issue_date, c.expiry_date, c.credential_id, idx, c.visible !== false ? 1 : 0);
                    });
                }
                
                if (data.education) {
                    db.prepare('DELETE FROM education').run();
                    const stmt = db.prepare(`
                        INSERT INTO education (degree_title, institution_name, start_date, end_date, description, sort_order, visible)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `);
                    data.education.forEach((e, idx) => {
                        stmt.run(e.degree_title, e.institution_name, e.start_date, e.end_date, e.description, idx, e.visible !== false ? 1 : 0);
                    });
                }
                
                if (data.skills) {
                    db.prepare('DELETE FROM skills').run();
                    db.prepare('DELETE FROM skill_categories').run();
                    
                    const catStmt = db.prepare('INSERT INTO skill_categories (name, icon, sort_order, visible) VALUES (?, ?, ?, ?)');
                    const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)');
                    
                    data.skills.forEach((cat, catIdx) => {
                        const result = catStmt.run(cat.name, cat.icon || 'default', catIdx, cat.visible !== false ? 1 : 0);
                        const categoryId = result.lastInsertRowid;
                        
                        if (cat.skills) {
                            cat.skills.forEach((skill, skillIdx) => {
                                skillStmt.run(categoryId, skill, skillIdx);
                            });
                        }
                    });
                }
                
                if (data.projects) {
                    db.prepare('DELETE FROM projects').run();
                    const stmt = db.prepare(`
                        INSERT INTO projects (title, description, technologies, link, sort_order, visible)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `);
                    data.projects.forEach((p, idx) => {
                        stmt.run(p.title, p.description, JSON.stringify(p.technologies || []), p.link, idx, p.visible !== false ? 1 : 0);
                    });
                }
                
                if (data.sectionVisibility) {
                    for (const [section, visible] of Object.entries(data.sectionVisibility)) {
                        db.prepare('UPDATE section_visibility SET visible = ? WHERE section_name = ?').run(visible ? 1 : 0, section);
                    }
                }
            });
            
            importData();
            res.json({ success: true, name: dataset.name });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.delete('/api/datasets/:id', (req, res) => {
        db.prepare('DELETE FROM saved_datasets WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    });

    // API Routes - Timeline
    app.get('/api/timeline', (req, res) => {
        const experiences = db.prepare(`
            SELECT id, company_name, job_title, start_date, end_date, country_code, visible 
            FROM experiences 
            ORDER BY start_date ASC
        `).all();
        
        const timeline = experiences.map(exp => ({
            id: exp.id,
            company: exp.company_name,
            role: exp.job_title,
            period: formatPeriod(exp.start_date, exp.end_date),
            countryCode: exp.country_code || 'ch',
            visible: !!exp.visible
        }));
        
        res.json(timeline);
    });

    // API Routes - Full CV Data (for export)
    app.get('/api/cv', (req, res) => {
        const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
        const experiences = db.prepare('SELECT * FROM experiences ORDER BY start_date DESC, sort_order ASC').all();
        const certifications = db.prepare('SELECT * FROM certifications ORDER BY sort_order ASC, issue_date DESC').all();
        const education = db.prepare('SELECT * FROM education ORDER BY sort_order ASC, end_date DESC').all();
        const skillCategories = db.prepare('SELECT * FROM skill_categories ORDER BY sort_order ASC').all();
        const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
        const projects = db.prepare('SELECT * FROM projects ORDER BY sort_order ASC').all();
        const sections = db.prepare('SELECT * FROM section_visibility').all();
        
        const sectionVisibility = {};
        sections.forEach(s => { sectionVisibility[s.section_name] = !!s.visible; });
        
        res.json({
            profile,
            experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })),
            certifications,
            education,
            skills: skillCategories.map(cat => ({
                ...cat,
                skills: skills.filter(s => s.category_id === cat.id).map(s => s.name)
            })),
            projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] })),
            sectionVisibility
        });
    });

    // API Routes - Import Data
    app.post('/api/import', (req, res) => {
        const data = req.body;
        
        const importData = db.transaction(() => {
            if (data.profile) {
                const p = data.profile;
                db.prepare(`
                    UPDATE profile SET 
                        name = ?, initials = ?, title = ?, subtitle = ?, bio = ?,
                        location = ?, linkedin = ?, email = ?, phone = ?, languages = ?
                    WHERE id = 1
                `).run(p.name, p.initials, p.title, p.subtitle, p.bio, p.location, p.linkedin, p.email, p.phone, p.languages);
            }
            
            if (data.experiences) {
                db.prepare('DELETE FROM experiences').run();
                const stmt = db.prepare(`
                    INSERT INTO experiences (job_title, company_name, start_date, end_date, location, country_code, highlights, sort_order, visible)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);
                data.experiences.forEach((e, idx) => {
                    stmt.run(e.job_title, e.company_name, e.start_date, e.end_date, e.location, e.country_code || 'ch',
                        JSON.stringify(e.highlights || []), idx, e.visible !== false ? 1 : 0);
                });
            }
            
            if (data.certifications) {
                db.prepare('DELETE FROM certifications').run();
                const stmt = db.prepare(`
                    INSERT INTO certifications (name, provider, issue_date, expiry_date, credential_id, sort_order, visible)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);
                data.certifications.forEach((c, idx) => {
                    stmt.run(c.name, c.provider, c.issue_date, c.expiry_date, c.credential_id, idx, c.visible !== false ? 1 : 0);
                });
            }
            
            if (data.education) {
                db.prepare('DELETE FROM education').run();
                const stmt = db.prepare(`
                    INSERT INTO education (degree_title, institution_name, start_date, end_date, description, sort_order, visible)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);
                data.education.forEach((e, idx) => {
                    stmt.run(e.degree_title, e.institution_name, e.start_date, e.end_date, e.description, idx, e.visible !== false ? 1 : 0);
                });
            }
            
            if (data.skills) {
                db.prepare('DELETE FROM skills').run();
                db.prepare('DELETE FROM skill_categories').run();
                
                const catStmt = db.prepare('INSERT INTO skill_categories (name, icon, sort_order, visible) VALUES (?, ?, ?, ?)');
                const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)');
                
                data.skills.forEach((cat, catIdx) => {
                    const result = catStmt.run(cat.name, cat.icon || '💡', catIdx, cat.visible !== false ? 1 : 0);
                    const categoryId = result.lastInsertRowid;
                    
                    if (cat.skills) {
                        cat.skills.forEach((skill, skillIdx) => {
                            skillStmt.run(categoryId, skill, skillIdx);
                        });
                    }
                });
            }
            
            if (data.projects) {
                db.prepare('DELETE FROM projects').run();
                const stmt = db.prepare(`
                    INSERT INTO projects (title, description, technologies, link, sort_order, visible)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                data.projects.forEach((p, idx) => {
                    stmt.run(p.title, p.description, JSON.stringify(p.technologies || []), p.link, idx, p.visible !== false ? 1 : 0);
                });
            }
        });
        
        try {
            importData();
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    // Catch-all for SPA
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // ===========================
    // Public Read-Only Server (Port 3001) - runs alongside admin
    // ===========================

    const publicApp = express();

    publicApp.use(cors({ methods: ['GET'], credentials: false }));

    publicApp.use((req, res, next) => {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        next();
    });

    const rateLimit = {};
    publicApp.use((req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        if (!rateLimit[ip]) {
            rateLimit[ip] = { count: 1, start: now };
        } else if (now - rateLimit[ip].start > 60000) {
            rateLimit[ip] = { count: 1, start: now };
        } else {
            rateLimit[ip].count++;
            if (rateLimit[ip].count > 60) {
                return res.status(429).json({ error: 'Too many requests' });
            }
        }
        next();
    });

    publicApp.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://flagcdn.com; img-src 'self' https://flagcdn.com data:");
        next();
    });

    publicApp.get('/sitemap.xml', (req, res) => {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
        const baseUrl = `${protocol}://${host}`;
        const lastmod = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}/</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url></urlset>`);
    });

    publicApp.get('/robots.txt', (req, res) => {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
        const baseUrl = `${protocol}://${host}`;
        res.setHeader('Content-Type', 'text/plain');
        res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\nDisallow: /api/`);
    });

    publicApp.use('/shared', express.static(path.join(__dirname, '../public/shared')));
    publicApp.use(express.static(path.join(__dirname, '../public-readonly')));
    publicApp.use('/uploads', express.static(uploadsPath));

    publicApp.get('/api/profile', (req, res) => {
        const profile = db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages FROM profile WHERE id = 1').get();
        res.json(profile || {});
    });

    publicApp.get('/api/sections', (req, res) => {
        const sections = db.prepare('SELECT * FROM section_visibility').all();
        const result = {};
        sections.forEach(s => { result[s.section_name] = !!s.visible; });
        res.json(result);
    });

    publicApp.get('/api/settings/:key', (req, res) => {
        const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key);
        res.json({ value: setting?.value || null });
    });

    publicApp.get('/api/experiences', (req, res) => {
        const experiences = db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights FROM experiences WHERE visible = 1 ORDER BY start_date DESC, sort_order ASC').all();
        res.json(experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [], visible: true })));
    });

    publicApp.get('/api/certifications', (req, res) => {
        const certs = db.prepare('SELECT name, provider, issue_date FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all();
        res.json(certs.map(c => ({ ...c, visible: true })));
    });

    publicApp.get('/api/education', (req, res) => {
        const education = db.prepare('SELECT degree_title, institution_name, start_date, end_date, description FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all();
        res.json(education.map(e => ({ ...e, visible: true })));
    });

    publicApp.get('/api/skills', (req, res) => {
        const categories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all();
        const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
        res.json(categories.map(cat => ({ ...cat, visible: true, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) })));
    });

    publicApp.get('/api/projects', (req, res) => {
        const projects = db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all();
        res.json(projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [], visible: true })));
    });

    publicApp.get('/api/timeline', (req, res) => {
        const experiences = db.prepare('SELECT company_name, job_title, start_date, end_date, country_code FROM experiences WHERE visible = 1 ORDER BY start_date ASC').all();
        res.json(experiences.map(exp => ({ company: exp.company_name, role: exp.job_title, period: formatPeriod(exp.start_date, exp.end_date), countryCode: exp.country_code || 'ch', visible: true })));
    });

    publicApp.get('/api/cv', (req, res) => {
        const profile = db.prepare('SELECT name, initials, title, subtitle, bio, location, linkedin, languages FROM profile WHERE id = 1').get();
        const experiences = db.prepare('SELECT job_title, company_name, start_date, end_date, location, country_code, highlights FROM experiences WHERE visible = 1 ORDER BY start_date DESC, sort_order ASC').all();
        const certifications = db.prepare('SELECT name, provider, issue_date FROM certifications WHERE visible = 1 ORDER BY sort_order ASC, issue_date DESC').all();
        const education = db.prepare('SELECT degree_title, institution_name, start_date, end_date, description FROM education WHERE visible = 1 ORDER BY sort_order ASC, end_date DESC').all();
        const skillCategories = db.prepare('SELECT id, name, icon FROM skill_categories WHERE visible = 1 ORDER BY sort_order ASC').all();
        const skills = db.prepare('SELECT * FROM skills ORDER BY sort_order ASC').all();
        const projects = db.prepare('SELECT title, description, technologies, link FROM projects WHERE visible = 1 ORDER BY sort_order ASC').all();
        res.json({
            profile,
            experiences: experiences.map(e => ({ ...e, highlights: e.highlights ? JSON.parse(e.highlights) : [] })),
            certifications,
            education,
            skills: skillCategories.map(cat => ({ ...cat, skills: skills.filter(s => s.category_id === cat.id).map(s => s.name) })),
            projects: projects.map(p => ({ ...p, technologies: p.technologies ? JSON.parse(p.technologies) : [] }))
        });
    });

    publicApp.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../public-readonly/index.html'));
    });

    // Start both servers
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`CV Manager (Admin) running at http://localhost:${PORT}`);
    });

    publicApp.listen(PUBLIC_PORT, '0.0.0.0', () => {
        console.log(`CV Manager (Public Read-Only) running at http://localhost:${PUBLIC_PORT}`);
    });
}

// Graceful shutdown
process.on('SIGINT', () => {
    db.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    db.close();
    process.exit(0);
});

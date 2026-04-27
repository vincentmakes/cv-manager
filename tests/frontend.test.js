const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

describe('Frontend files', () => {
    describe('Admin interface', () => {
        it('index.html exists and is valid HTML', () => {
            const file = path.join(ROOT, 'public', 'index.html');
            assert.ok(fs.existsSync(file), 'public/index.html should exist');
            const content = fs.readFileSync(file, 'utf8');
            assert.ok(content.includes('<!DOCTYPE html>'), 'should have DOCTYPE');
            assert.ok(content.includes('<html'), 'should have html tag');
            assert.ok(content.includes('</html>'), 'should have closing html tag');
            assert.ok(content.includes('<head>'), 'should have head section');
            assert.ok(content.includes('<body>'), 'should have body section');
        });

        it('loads required CSS files', () => {
            const file = path.join(ROOT, 'public', 'index.html');
            const content = fs.readFileSync(file, 'utf8');
            assert.ok(content.includes('styles.css'), 'should reference styles.css');
            assert.ok(content.includes('admin.css'), 'should reference admin.css');
        });

        it('loads required JS files', () => {
            const file = path.join(ROOT, 'public', 'index.html');
            const content = fs.readFileSync(file, 'utf8');
            assert.ok(content.includes('scripts.js'), 'should reference scripts.js');
            assert.ok(content.includes('admin.js'), 'should reference admin.js');
        });

        it('shared scripts.js exists', () => {
            const file = path.join(ROOT, 'public', 'shared', 'scripts.js');
            assert.ok(fs.existsSync(file), 'public/shared/scripts.js should exist');
        });

        it('shared admin.js exists', () => {
            const file = path.join(ROOT, 'public', 'shared', 'admin.js');
            assert.ok(fs.existsSync(file), 'public/shared/admin.js should exist');
        });

        it('shared styles.css exists', () => {
            const file = path.join(ROOT, 'public', 'shared', 'styles.css');
            assert.ok(fs.existsSync(file), 'public/shared/styles.css should exist');
        });

        it('shared admin.css exists', () => {
            const file = path.join(ROOT, 'public', 'shared', 'admin.css');
            assert.ok(fs.existsSync(file), 'public/shared/admin.css should exist');
        });

        it('Undo/Redo toolbar buttons exist in admin index.html', () => {
            const file = path.join(ROOT, 'public', 'index.html');
            const content = fs.readFileSync(file, 'utf8');
            assert.ok(content.includes('id="undoBtn"'), 'should have #undoBtn');
            assert.ok(content.includes('id="redoBtn"'), 'should have #redoBtn');
            assert.ok(content.includes('onclick="undoAction()"'), 'undo button should call undoAction()');
            assert.ok(content.includes('onclick="redoAction()"'), 'redo button should call redoAction()');
        });

        it('toast element has no-print class so it is excluded from printed output', () => {
            const file = path.join(ROOT, 'public', 'index.html');
            const content = fs.readFileSync(file, 'utf8');
            const m = content.match(/<div[^>]*id="toast"[^>]*>/);
            assert.ok(m, 'should have a #toast element');
            assert.ok(/class="[^"]*\bno-print\b/.test(m[0]), '#toast should include the no-print class');
        });

        it('@media print block in admin.css hides .toast', () => {
            const file = path.join(ROOT, 'public', 'shared', 'admin.css');
            const content = fs.readFileSync(file, 'utf8');
            // Look for .toast hide rule inside the print block; print block may
            // appear more than once, so just verify the rule exists somewhere
            // and that an @media print block exists.
            assert.ok(/@media\s+print\s*\{/.test(content), 'admin.css should contain @media print block');
            assert.ok(/\.toast\s*\{\s*display:\s*none\s*!important/.test(content),
                'admin.css should hide .toast with display:none !important inside print styles');
        });

        it('UndoManager symbol is defined in shared/scripts.js', () => {
            const file = path.join(ROOT, 'public', 'shared', 'scripts.js');
            const content = fs.readFileSync(file, 'utf8');
            assert.ok(/\bUndoManager\b/.test(content), 'scripts.js should declare UndoManager');
            assert.ok(/function\s+undoAction\s*\(/.test(content), 'scripts.js should expose undoAction()');
            assert.ok(/function\s+redoAction\s*\(/.test(content), 'scripts.js should expose redoAction()');
        });
    });

    describe('Public interface', () => {
        it('index.html exists and is valid HTML', () => {
            const file = path.join(ROOT, 'public-readonly', 'index.html');
            assert.ok(fs.existsSync(file), 'public-readonly/index.html should exist');
            const content = fs.readFileSync(file, 'utf8');
            assert.ok(content.includes('<!DOCTYPE html>'), 'should have DOCTYPE');
            assert.ok(content.includes('<html'), 'should have html tag');
            assert.ok(content.includes('</html>'), 'should have closing html tag');
            assert.ok(content.includes('<meta name="description"'), 'should have meta description');
            assert.ok(content.includes('<meta name="robots"'), 'should have robots meta');
        });

        it('loads shared styles', () => {
            const file = path.join(ROOT, 'public-readonly', 'index.html');
            const content = fs.readFileSync(file, 'utf8');
            assert.ok(content.includes('styles.css'), 'should reference styles.css');
        });

        it('robots.txt exists', () => {
            const file = path.join(ROOT, 'public-readonly', 'robots.txt');
            assert.ok(fs.existsSync(file), 'public-readonly/robots.txt should exist');
        });

        it('sitemap.xml exists', () => {
            const file = path.join(ROOT, 'public-readonly', 'sitemap.xml');
            assert.ok(fs.existsSync(file), 'public-readonly/sitemap.xml should exist');
        });
    });

    describe('Server entry point', () => {
        it('server.js exists', () => {
            const file = path.join(ROOT, 'src', 'server.js');
            assert.ok(fs.existsSync(file), 'src/server.js should exist');
        });

        it('package.json has required fields', () => {
            const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
            assert.ok(pkg.name, 'should have name');
            assert.ok(pkg.version, 'should have version');
            assert.ok(pkg.main, 'should have main entry');
            assert.ok(pkg.scripts?.start, 'should have start script');
        });

        it('Dockerfile exists', () => {
            const file = path.join(ROOT, 'Dockerfile');
            assert.ok(fs.existsSync(file), 'Dockerfile should exist');
        });
    });

    describe('i18n translation files', () => {
        const i18nDir = path.join(ROOT, 'public', 'shared', 'i18n');
        const enFile = path.join(i18nDir, 'en.json');

        it('en.json exists and is valid JSON', () => {
            assert.ok(fs.existsSync(enFile), 'en.json should exist');
            const data = JSON.parse(fs.readFileSync(enFile, 'utf8'));
            assert.ok(Object.keys(data).length > 0, 'en.json should have keys');
        });

        it('i18n.js registers languages that have matching JSON files', () => {
            const i18nJs = fs.readFileSync(path.join(ROOT, 'public', 'shared', 'i18n.js'), 'utf8');
            const codeMatches = i18nJs.match(/code:\s*'([a-z]{2})'/g) || [];
            const registeredCodes = codeMatches.map(m => m.match(/'([a-z]{2})'/)[1]);
            assert.ok(registeredCodes.length >= 2, 'should have at least 2 registered languages');
            for (const code of registeredCodes) {
                const file = path.join(i18nDir, `${code}.json`);
                assert.ok(fs.existsSync(file), `${code}.json should exist for registered language '${code}'`);
            }
        });

        it('all locale files have the exact same keys as en.json', () => {
            const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
            const enKeys = Object.keys(en).sort();
            const localeFiles = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json') && f !== 'en.json');

            assert.ok(localeFiles.length > 0, 'should have at least one non-English locale');

            for (const file of localeFiles) {
                const locale = file.replace('.json', '');
                const data = JSON.parse(fs.readFileSync(path.join(i18nDir, file), 'utf8'));
                const localeKeys = Object.keys(data).sort();

                const missingKeys = enKeys.filter(k => !localeKeys.includes(k));
                const extraKeys = localeKeys.filter(k => !enKeys.includes(k));

                assert.deepStrictEqual(
                    missingKeys, [],
                    `${locale}.json is missing keys: ${missingKeys.join(', ')}`
                );
                assert.deepStrictEqual(
                    extraKeys, [],
                    `${locale}.json has extra keys not in en.json: ${extraKeys.join(', ')}`
                );
            }
        });

        it('no translation values are empty strings', () => {
            const localeFiles = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json'));
            for (const file of localeFiles) {
                const locale = file.replace('.json', '');
                const data = JSON.parse(fs.readFileSync(path.join(i18nDir, file), 'utf8'));
                const emptyKeys = Object.entries(data)
                    .filter(([, v]) => typeof v === 'string' && v.trim() === '')
                    .map(([k]) => k);
                assert.deepStrictEqual(
                    emptyKeys, [],
                    `${locale}.json has empty values for: ${emptyKeys.join(', ')}`
                );
            }
        });

        it('interpolation placeholders match between en.json and all locales', () => {
            const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
            const placeholderRe = /\{\{(\w+)\}\}/g;

            const getPlaceholders = (str) => {
                const matches = [];
                let m;
                while ((m = placeholderRe.exec(str)) !== null) matches.push(m[1]);
                return matches.sort();
            };

            const localeFiles = fs.readdirSync(i18nDir).filter(f => f.endsWith('.json') && f !== 'en.json');
            for (const file of localeFiles) {
                const locale = file.replace('.json', '');
                const data = JSON.parse(fs.readFileSync(path.join(i18nDir, file), 'utf8'));
                for (const key of Object.keys(en)) {
                    if (!data[key]) continue;
                    const enPlaceholders = getPlaceholders(en[key]);
                    if (enPlaceholders.length === 0) continue;
                    const localePlaceholders = getPlaceholders(data[key]);
                    assert.deepStrictEqual(
                        localePlaceholders, enPlaceholders,
                        `${locale}.json key "${key}" has mismatched placeholders: expected {{${enPlaceholders.join('}}, {{')}}} but got {{${localePlaceholders.join('}}, {{')}}}`
                    );
                }
            }
        });
    });

    describe('Front/back sync', () => {
        it('version matches across package.json, version.json, and package-lock.json', () => {
            const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
            const ver = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));
            const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf8'));

            assert.strictEqual(pkg.version, ver.version,
                `package.json version (${pkg.version}) !== version.json version (${ver.version})`);
            assert.strictEqual(pkg.version, lock.version,
                `package.json version (${pkg.version}) !== package-lock.json top-level version (${lock.version})`);
            assert.strictEqual(pkg.version, lock.packages?.['']?.version,
                `package.json version (${pkg.version}) !== package-lock.json packages[""] version (${lock.packages?.['']?.version})`);
        });

        it('DEFAULT_SECTION_ORDER sections have corresponding i18n keys', () => {
            const serverJs = fs.readFileSync(path.join(ROOT, 'src', 'server.js'), 'utf8');
            const match = serverJs.match(/DEFAULT_SECTION_ORDER\s*=\s*\[([^\]]+)\]/);
            assert.ok(match, 'Should find DEFAULT_SECTION_ORDER in server.js');

            const sections = match[1].match(/'([^']+)'/g).map(s => s.replace(/'/g, ''));
            const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'shared', 'i18n', 'en.json'), 'utf8'));

            for (const section of sections) {
                const key = `section.${section}`;
                assert.ok(en[key] !== undefined,
                    `Section "${section}" from DEFAULT_SECTION_ORDER has no i18n key "${key}" in en.json`);
            }
        });

        it('data-i18n attributes in HTML files reference valid en.json keys', () => {
            const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'shared', 'i18n', 'en.json'), 'utf8'));
            const enKeys = new Set(Object.keys(en));
            const htmlFiles = [
                path.join(ROOT, 'public', 'index.html'),
                path.join(ROOT, 'public-readonly', 'index.html'),
            ];
            const attrRe = /data-i18n(?:-title|-placeholder)?="([^"]+)"/g;

            for (const htmlFile of htmlFiles) {
                const content = fs.readFileSync(htmlFile, 'utf8');
                let m;
                const missing = [];
                while ((m = attrRe.exec(content)) !== null) {
                    if (!enKeys.has(m[1])) {
                        missing.push(m[1]);
                    }
                }
                const basename = path.basename(path.dirname(htmlFile)) + '/' + path.basename(htmlFile);
                assert.deepStrictEqual(missing, [],
                    `${basename} has data-i18n attributes referencing missing en.json keys: ${missing.join(', ')}`);
            }
        });

        it('brand SVG icons in server.js SVG_ICONS are internally consistent', () => {
            const serverJs = fs.readFileSync(path.join(ROOT, 'src', 'server.js'), 'utf8');

            // Extract SVG_ICONS keys from server.js
            const svgIconsMatch = serverJs.match(/const SVG_ICONS\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
            assert.ok(svgIconsMatch, 'Should find SVG_ICONS in server.js');
            const serverIconKeys = (svgIconsMatch[1].match(/(\w+)\s*:/g) || []).map(k => k.replace(':', '').trim());

            // Extract SOCIAL_PLATFORMS icon references from server.js
            const platformIconRe = /icon:\s*SVG_ICONS\.(\w+)/g;
            let m;
            const referencedIcons = [];
            while ((m = platformIconRe.exec(serverJs)) !== null) {
                referencedIcons.push(m[1]);
            }

            // Every referenced SVG_ICONS.xxx must have a key in SVG_ICONS
            const missing = referencedIcons.filter(icon => !serverIconKeys.includes(icon));
            assert.deepStrictEqual(missing, [],
                `SVG_ICONS references icons that don't exist: ${missing.join(', ')}`);
        });

        it('SOCIAL_PLATFORMS and LAYOUT_TYPES reference valid SVG_ICONS keys', () => {
            const serverJs = fs.readFileSync(path.join(ROOT, 'src', 'server.js'), 'utf8');

            // Extract SVG_ICONS keys
            const svgIconsMatch = serverJs.match(/const SVG_ICONS\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
            assert.ok(svgIconsMatch, 'Should find SVG_ICONS in server.js');
            const iconKeys = new Set((svgIconsMatch[1].match(/(\w+)\s*:/g) || []).map(k => k.replace(':', '').trim()));

            // Find all SVG_ICONS.xxx references
            const refRe = /SVG_ICONS\.(\w+)/g;
            let m;
            const missing = [];
            while ((m = refRe.exec(serverJs)) !== null) {
                if (!iconKeys.has(m[1])) {
                    missing.push(m[1]);
                }
            }
            assert.deepStrictEqual(missing, [],
                `References to undefined SVG_ICONS keys: ${missing.join(', ')}`);
        });

        it('frontend API calls reference endpoints that exist in server.js', () => {
            const serverJs = fs.readFileSync(path.join(ROOT, 'src', 'server.js'), 'utf8');
            const adminJs = fs.readFileSync(path.join(ROOT, 'public', 'shared', 'admin.js'), 'utf8');
            const scriptsJs = fs.readFileSync(path.join(ROOT, 'public', 'shared', 'scripts.js'), 'utf8');

            // Extract server route definitions (admin app routes)
            const routeRe = /app\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
            const serverRoutes = new Set();
            let m;
            while ((m = routeRe.exec(serverJs)) !== null) {
                const route = m[2];
                // Skip catch-all routes like '*'
                if (route === '*' || !route.startsWith('/')) continue;
                // Normalize parameterized routes: /api/experiences/:id -> /api/experiences/:param
                serverRoutes.add(route.replace(/:\w+/g, ':param'));
            }

            // Extract frontend API calls — look for api('/endpoint') or api(`/endpoint`)
            const apiCallRe = /\bapi\s*\(\s*['"`]([^'"`$]+)['"`]/g;
            const apiCallTemplateRe = /\bapi\s*\(\s*`([^`]+)`/g;
            const frontendCalls = new Set();
            for (const content of [adminJs, scriptsJs]) {
                while ((m = apiCallRe.exec(content)) !== null) {
                    let endpoint = m[1].startsWith('/') ? m[1] : `/api/${m[1]}`;
                    endpoint = endpoint.split('?')[0];
                    endpoint = endpoint.replace(/\$\{[^}]+\}/g, ':param');
                    frontendCalls.add(endpoint);
                }
                while ((m = apiCallTemplateRe.exec(content)) !== null) {
                    let endpoint = m[1].startsWith('/') ? m[1] : `/api/${m[1]}`;
                    endpoint = endpoint.split('?')[0];
                    endpoint = endpoint.replace(/\$\{[^}]+\}/g, ':param');
                    frontendCalls.add(endpoint);
                }
            }

            // Check that frontend calls have matching server routes
            const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const unmatched = [];
            for (const call of frontendCalls) {
                // Skip fully-dynamic paths (e.g. /api/:param/:param) — these are generic
                // utility calls that build endpoints dynamically and can't be statically checked
                if (/^\/api(\/(:param))+$/.test(call)) continue;

                const normalized = call.replace(/\/\d+/g, '/:param');
                const hasMatch = serverRoutes.has(call) || serverRoutes.has(normalized) ||
                    [...serverRoutes].some(route => {
                        const parts = route.split(':param');
                        const pattern = parts.map(escapeRegex).join('[^/]+');
                        try {
                            const re = new RegExp(`^${pattern}$`);
                            return re.test(call) || re.test(normalized);
                        } catch {
                            return false;
                        }
                    });
                if (!hasMatch) {
                    unmatched.push(call);
                }
            }

            assert.deepStrictEqual(unmatched, [],
                `Frontend calls API endpoints not found in server.js routes: ${unmatched.join(', ')}`);
        });
    });

    describe('Pure function unit tests (scripts.js)', () => {
        // Extract pure functions from scripts.js for unit testing in Node.js
        // We parse and eval the function definitions to test them without a browser

        let normalizeDate, formatDate, formatDateATS, parseDateForSort, materialIcon, getSkillIcon;

        it('can extract and load pure functions from scripts.js', () => {
            const scriptsContent = fs.readFileSync(path.join(ROOT, 'public', 'shared', 'scripts.js'), 'utf8');

            // Extract normalizeDate function
            const normalizeDateMatch = scriptsContent.match(/function normalizeDate\(dateStr\)\s*\{[\s\S]*?^}/m);
            assert.ok(normalizeDateMatch, 'Should find normalizeDate function');
            normalizeDate = new Function('dateStr', normalizeDateMatch[0].replace(/^function normalizeDate\(dateStr\)\s*\{/, '').replace(/\}$/, ''));

            // Extract formatDate function (needs dateFormatSetting global)
            const formatDateMatch = scriptsContent.match(/function formatDate\(dateStr\)\s*\{[\s\S]*?^}/m);
            assert.ok(formatDateMatch, 'Should find formatDate function');

            // Extract formatDateATS function (also calls t('month.long.*') for localization)
            const formatDateATSMatch = scriptsContent.match(/function formatDateATS\(dateStr\)\s*\{[\s\S]*?^}/m);
            assert.ok(formatDateATSMatch, 'Should find formatDateATS function');

            // Extract parseDateForSort function
            const parseDateForSortMatch = scriptsContent.match(/function parseDateForSort\(dateStr\)\s*\{[\s\S]*?^}/m);
            assert.ok(parseDateForSortMatch, 'Should find parseDateForSort function');
            parseDateForSort = new Function('dateStr', parseDateForSortMatch[0].replace(/^function parseDateForSort\(dateStr\)\s*\{/, '').replace(/\}$/, ''));

            // Extract materialIcon function
            const materialIconMatch = scriptsContent.match(/function materialIcon\(name, size = 16\)\s*\{[\s\S]*?\n\}/);
            assert.ok(materialIconMatch, 'Should find materialIcon function');
            materialIcon = new Function('name', 'size', `size = size || 16; ${materialIconMatch[0].replace(/^function materialIcon\(name, size = 16\)\s*\{/, '').replace(/\}$/, '')}`);

            // For formatDate / formatDateATS, create a closure with dateFormatSetting and an
            // injected `t` function. Both call t('month.short.*') / t('month.long.*') — by default
            // we load en.json so behavior matches the English UI; pass `translations` to simulate
            // another locale.
            const enTranslations = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'shared', 'i18n', 'en.json'), 'utf8'));
            const createFormatDate = (setting, translations = enTranslations) => {
                const body = formatDateMatch[0].replace(/^function formatDate\(dateStr\)\s*\{/, '').replace(/\}$/, '');
                const tFn = (key) => (translations[key] !== undefined ? translations[key] : key);
                const impl = new Function('dateStr', 't', `const dateFormatSetting = ${JSON.stringify(setting)}; ${body}`);
                return (dateStr) => impl(dateStr, tFn);
            };
            formatDate = createFormatDate; // Store factory function

            // formatDateATS: ATS export uses long month names from active locale
            const createFormatDateATS = (translations = enTranslations) => {
                const body = formatDateATSMatch[0].replace(/^function formatDateATS\(dateStr\)\s*\{/, '').replace(/\}$/, '');
                const tFn = (key) => (translations[key] !== undefined ? translations[key] : key);
                const impl = new Function('dateStr', 't', body);
                return (dateStr) => impl(dateStr, tFn);
            };
            formatDateATS = createFormatDateATS(); // default English instance for existing tests
            formatDateATS.withLocale = createFormatDateATS; // expose factory for localization tests

            // Extract getSkillIcon (needs icons object)
            const getSkillIconMatch = scriptsContent.match(/function getSkillIcon\(iconHint, categoryName\)\s*\{[\s\S]*?^}/m);
            assert.ok(getSkillIconMatch, 'Should find getSkillIcon function');
        });

        // --- normalizeDate tests ---
        it('normalizeDate: returns empty value for empty/null/undefined input', () => {
            assert.deepStrictEqual(normalizeDate(''), { value: '' });
            assert.deepStrictEqual(normalizeDate(null), { value: '' });
            assert.deepStrictEqual(normalizeDate(undefined), { value: '' });
            assert.deepStrictEqual(normalizeDate('   '), { value: '' });
        });

        it('normalizeDate: passes through valid ISO YYYY-MM format', () => {
            assert.deepStrictEqual(normalizeDate('2024-01'), { value: '2024-01' });
            assert.deepStrictEqual(normalizeDate('2020-12'), { value: '2020-12' });
        });

        it('normalizeDate: passes through year-only format', () => {
            assert.deepStrictEqual(normalizeDate('2024'), { value: '2024' });
            assert.deepStrictEqual(normalizeDate('1999'), { value: '1999' });
        });

        it('normalizeDate: parses short month name + year (MMM YYYY)', () => {
            assert.deepStrictEqual(normalizeDate('Jan 2020'), { value: '2020-01' });
            assert.deepStrictEqual(normalizeDate('Dec 2024'), { value: '2024-12' });
            assert.deepStrictEqual(normalizeDate('Mar 2019'), { value: '2019-03' });
        });

        it('normalizeDate: parses full month name + year (MMMM YYYY)', () => {
            assert.deepStrictEqual(normalizeDate('January 2020'), { value: '2020-01' });
            assert.deepStrictEqual(normalizeDate('December 2024'), { value: '2024-12' });
            assert.deepStrictEqual(normalizeDate('September 2019'), { value: '2019-09' });
        });

        it('normalizeDate: parses MM/YYYY format', () => {
            assert.deepStrictEqual(normalizeDate('01/2020'), { value: '2020-01' });
            assert.deepStrictEqual(normalizeDate('12/2024'), { value: '2024-12' });
        });

        it('normalizeDate: parses MM.YYYY and MM-YYYY formats', () => {
            assert.deepStrictEqual(normalizeDate('01.2020'), { value: '2020-01' });
            assert.deepStrictEqual(normalizeDate('06-2023'), { value: '2023-06' });
        });

        it('normalizeDate: parses YYYY/MM and YYYY.MM formats', () => {
            assert.deepStrictEqual(normalizeDate('2020/01'), { value: '2020-01' });
            assert.deepStrictEqual(normalizeDate('2023.06'), { value: '2023-06' });
        });

        it('normalizeDate: returns error for invalid month in ISO format', () => {
            const result = normalizeDate('2024-13');
            assert.ok(result.error, 'Should return error for month 13');
        });

        it('normalizeDate: returns error for invalid month number', () => {
            const result = normalizeDate('13/2024');
            assert.ok(result.error, 'Should return error for month 13');
        });

        it('normalizeDate: returns error for unrecognized format', () => {
            const result = normalizeDate('not-a-date');
            assert.ok(result.error, 'Should return error for unrecognized format');
        });

        it('normalizeDate: returns error for unrecognized month name', () => {
            const result = normalizeDate('Xyz 2024');
            assert.ok(result.error, 'Should return error for fake month name');
        });

        // --- formatDate tests ---
        it('formatDate: returns empty string for empty input', () => {
            const fn = formatDate('MMM YYYY');
            assert.strictEqual(fn(''), '');
            assert.strictEqual(fn(null), '');
            assert.strictEqual(fn(undefined), '');
        });

        it('formatDate: returns year-only input as-is', () => {
            const fn = formatDate('MMM YYYY');
            assert.strictEqual(fn('2024'), '2024');
        });

        it('formatDate: formats YYYY-MM as MMM YYYY (default)', () => {
            const fn = formatDate('MMM YYYY');
            assert.strictEqual(fn('2024-01'), 'Jan 2024');
            assert.strictEqual(fn('2020-12'), 'Dec 2020');
        });

        it('formatDate: formats YYYY-MM as MMMM YYYY', () => {
            const fn = formatDate('MMMM YYYY');
            assert.strictEqual(fn('2024-01'), 'January 2024');
        });

        it('formatDate: formats YYYY-MM as MM/YYYY', () => {
            const fn = formatDate('MM/YYYY');
            assert.strictEqual(fn('2024-01'), '01/2024');
        });

        it('formatDate: formats YYYY-MM as MMM YY', () => {
            const fn = formatDate('MMM YY');
            assert.strictEqual(fn('2024-01'), 'Jan 24');
        });

        it('formatDate: formats YYYY-MM as YYYY-MM', () => {
            const fn = formatDate('YYYY-MM');
            assert.strictEqual(fn('2024-01'), '2024-01');
        });

        it('formatDate: formats YYYY-MM as YYYY (year only)', () => {
            const fn = formatDate('YYYY');
            assert.strictEqual(fn('2024-01'), '2024');
        });

        // --- formatDate localization tests ---
        it('formatDate: uses translated long month names from the active locale', () => {
            const de = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'shared', 'i18n', 'de.json'), 'utf8'));
            const fn = formatDate('MMMM YYYY', de);
            assert.strictEqual(fn('2024-01'), 'Januar 2024');
            assert.strictEqual(fn('2024-03'), 'März 2024');
        });

        it('formatDate: uses translated short month names from the active locale', () => {
            const fr = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'shared', 'i18n', 'fr.json'), 'utf8'));
            const fn = formatDate('MMM YYYY', fr);
            assert.strictEqual(fn('2024-03'), 'Mars 2024');
            assert.strictEqual(fn('2024-12'), 'Déc. 2024');
        });

        it('formatDate: numeric-only formats are unaffected by locale', () => {
            const de = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'shared', 'i18n', 'de.json'), 'utf8'));
            assert.strictEqual(formatDate('MM/YYYY', de)('2024-01'), '01/2024');
            assert.strictEqual(formatDate('YYYY-MM', de)('2024-01'), '2024-01');
            assert.strictEqual(formatDate('YYYY', de)('2024-01'), '2024');
        });

        // --- formatDateATS tests ---
        it('formatDateATS: returns empty string for empty input', () => {
            assert.strictEqual(formatDateATS(''), '');
            assert.strictEqual(formatDateATS(null), '');
        });

        it('formatDateATS: returns year-only as-is', () => {
            assert.strictEqual(formatDateATS('2024'), '2024');
        });

        it('formatDateATS: formats YYYY-MM as Month YYYY', () => {
            assert.strictEqual(formatDateATS('2024-01'), 'January 2024');
            assert.strictEqual(formatDateATS('2020-06'), 'June 2020');
        });

        it('formatDateATS: returns unrecognized formats as-is', () => {
            assert.strictEqual(formatDateATS('Present'), 'Present');
        });

        it('formatDateATS: uses long month names from the active locale', () => {
            const de = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'shared', 'i18n', 'de.json'), 'utf8'));
            const fr = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'shared', 'i18n', 'fr.json'), 'utf8'));
            assert.strictEqual(formatDateATS.withLocale(de)('2024-01'), 'Januar 2024');
            assert.strictEqual(formatDateATS.withLocale(de)('2024-03'), 'März 2024');
            assert.strictEqual(formatDateATS.withLocale(fr)('2020-06'), 'Juin 2020');
        });

        // --- parseDateForSort tests ---
        it('parseDateForSort: returns 0 for empty/null/undefined', () => {
            assert.strictEqual(parseDateForSort(''), 0);
            assert.strictEqual(parseDateForSort(null), 0);
            assert.strictEqual(parseDateForSort(undefined), 0);
        });

        it('parseDateForSort: handles year-only format', () => {
            assert.strictEqual(parseDateForSort('2020'), 202000);
            assert.strictEqual(parseDateForSort('2024'), 202400);
        });

        it('parseDateForSort: handles YYYY-MM format', () => {
            assert.strictEqual(parseDateForSort('2020-03'), 202003);
            assert.strictEqual(parseDateForSort('2024-12'), 202412);
        });

        it('parseDateForSort: handles Mon YYYY format', () => {
            assert.strictEqual(parseDateForSort('Jan 2020'), 202001);
            assert.strictEqual(parseDateForSort('Dec 2024'), 202412);
        });

        it('parseDateForSort: extracts year from unrecognized format', () => {
            assert.strictEqual(parseDateForSort('Q1 2020'), 202000);
        });

        // --- materialIcon tests ---
        it('materialIcon: generates correct HTML with default size', () => {
            const result = materialIcon('edit');
            assert.ok(result.includes('material-symbols-outlined'), 'Should contain class');
            assert.ok(result.includes('edit'), 'Should contain icon name');
            assert.ok(result.includes('font-size:16px'), 'Should use default 16px size');
        });

        it('materialIcon: generates correct HTML with custom size', () => {
            const result = materialIcon('delete', 24);
            assert.ok(result.includes('font-size:24px'), 'Should use custom 24px size');
            assert.ok(result.includes('delete'), 'Should contain icon name');
        });

        // --- renderMarkdown / escapeHtmlWithBold tests ---
        // Helper: extract renderMarkdown + escapeHtmlWithBold from scripts.js and
        // run them in an isolated VM with a minimal escapeHtml polyfill.
        function loadMarkdownRenderer() {
            const scriptsContent = fs.readFileSync(path.join(ROOT, 'public', 'shared', 'scripts.js'), 'utf8');
            const renderMatch = scriptsContent.match(/function renderMarkdown\(text, options\)\s*\{[\s\S]*?\n\}/);
            const aliasMatch = scriptsContent.match(/function escapeHtmlWithBold\(text\)\s*\{[\s\S]*?\n\}/);
            assert.ok(renderMatch, 'Should find renderMarkdown function');
            assert.ok(aliasMatch, 'Should find escapeHtmlWithBold function');

            const fakeDocument = {
                createElement: () => {
                    let _text = '';
                    return {
                        set textContent(v) { _text = v == null ? '' : String(v); },
                        get innerHTML() {
                            return _text
                                .replace(/&/g, '&amp;')
                                .replace(/</g, '&lt;')
                                .replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;')
                                .replace(/'/g, '&#39;');
                        }
                    };
                }
            };
            const helper = `function escapeHtml(text) {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }`;
            const factory = new Function('document', `${helper}\n${renderMatch[0]}\n${aliasMatch[0]}\nreturn { renderMarkdown, escapeHtmlWithBold };`);
            return factory(fakeDocument);
        }

        it('escapeHtmlWithBold: bold + XSS safety + edge cases', () => {
            const { escapeHtmlWithBold: fn } = loadMarkdownRenderer();

            assert.strictEqual(fn('hello **world**'), 'hello <strong>world</strong>');
            assert.strictEqual(fn('**a** and **b**'), '<strong>a</strong> and <strong>b</strong>');
            assert.strictEqual(
                fn('<script>**x**</script>'),
                '&lt;script&gt;<strong>x</strong>&lt;/script&gt;'
            );
            assert.strictEqual(fn('a ** b'), 'a ** b');
            assert.strictEqual(fn('a **\nb**'), 'a **\nb**');
            assert.strictEqual(fn(''), '');
            assert.strictEqual(fn(null), '');
            assert.strictEqual(fn(undefined), '');
            assert.strictEqual(fn('just plain'), 'just plain');
            assert.strictEqual(fn('5 < 10'), '5 &lt; 10');
        });

        it('renderMarkdown: italic via *…* and _…_', () => {
            const { renderMarkdown } = loadMarkdownRenderer();
            const inline = (s) => renderMarkdown(s, { mode: 'inline' });

            assert.strictEqual(inline('hello *world*'), 'hello <em>world</em>');
            assert.strictEqual(inline('a _word_ here'), 'a <em>word</em> here');
            // Underscore must not split snake_case identifiers.
            assert.strictEqual(inline('use foo_bar_baz here'), 'use foo_bar_baz here');
            // Whitespace-adjacent asterisks don't trigger italic.
            assert.strictEqual(inline('a * b * c'), 'a * b * c');
            // Bold runs first and is not re-parsed as italic.
            assert.strictEqual(inline('**bold**'), '<strong>bold</strong>');
            // Italic doesn't eat into a following ** sequence.
            assert.strictEqual(inline('*x* **y**'), '<em>x</em> <strong>y</strong>');
        });

        it('renderMarkdown: inline mode strips a leading bullet marker', () => {
            const { renderMarkdown } = loadMarkdownRenderer();
            const inline = (s) => renderMarkdown(s, { mode: 'inline' });

            // Strip "- " / "* " / "• " so line-split lists don't double-bullet.
            assert.strictEqual(inline('- led migration'), 'led migration');
            assert.strictEqual(inline('* second item'), 'second item');
            assert.strictEqual(inline('• unicode bullet'), 'unicode bullet');
            // Only a single leading marker is stripped.
            assert.strictEqual(inline('- - still dashed'), '- still dashed');
            // Inline bold/italic still work after the strip.
            assert.strictEqual(inline('- **bold** start'), '<strong>bold</strong> start');
        });

        it('renderMarkdown: block mode turns newlines into <br>', () => {
            const { renderMarkdown } = loadMarkdownRenderer();
            const block = (s) => renderMarkdown(s, { mode: 'block' });

            assert.strictEqual(block('a\nb'), 'a<br>b');
            assert.strictEqual(block('a\n\nb'), 'a<br><br>b');
            assert.strictEqual(block('first **bold** line\nsecond *italic* line'),
                'first <strong>bold</strong> line<br>second <em>italic</em> line');
            // XSS still escaped in block mode.
            assert.strictEqual(block('<b>hi</b>\nthere'), '&lt;b&gt;hi&lt;/b&gt;<br>there');
            // Block mode does NOT strip a leading bullet marker — descriptions
            // that happen to start with "- " keep the dash as visible content.
            assert.strictEqual(block('- not stripped'), '- not stripped');
        });

        it('materialIcon: includes aria-hidden for accessibility', () => {
            const result = materialIcon('check');
            assert.ok(result.includes('aria-hidden="true"'), 'Should include aria-hidden');
        });
    });

    describe('Markdown hint i18n', () => {
        it('every locale defines form.markdown_hint and no longer defines form.bold_hint', () => {
            const localesDir = path.join(ROOT, 'public', 'shared', 'i18n');
            const codes = ['en', 'de', 'fr', 'nl', 'es', 'it', 'pt', 'zh'];
            for (const code of codes) {
                const data = JSON.parse(fs.readFileSync(path.join(localesDir, `${code}.json`), 'utf8'));
                assert.ok(typeof data['form.markdown_hint'] === 'string' && data['form.markdown_hint'].length > 0,
                    `${code}.json should define form.markdown_hint`);
                assert.ok(!('form.bold_hint' in data),
                    `${code}.json must not still define form.bold_hint`);
            }
        });
    });

    describe('Profile picture cropper (LinkedIn-style adjustment)', () => {
        it('index.html loads Cropper.js CDN', () => {
            const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
            assert.ok(html.includes('cropper.min.css'), 'should link cropper.min.css');
            assert.ok(html.includes('cropper.min.js'), 'should script cropper.min.js');
        });

        it('index.html has the cropper modal markup', () => {
            const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
            assert.ok(html.includes('id="cropperModal"'), 'should have #cropperModal');
            assert.ok(html.includes('id="cropperImage"'), 'should have #cropperImage');
            assert.ok(html.includes('id="cropperZoom"'), 'should have #cropperZoom slider');
        });

        it('public-readonly/index.html does NOT load Cropper.js (display-only)', () => {
            const html = fs.readFileSync(path.join(ROOT, 'public-readonly', 'index.html'), 'utf8');
            assert.ok(!html.includes('cropper.min.js'), 'public page must not include Cropper.js');
        });

        it('admin.js references cropper controller functions', () => {
            const js = fs.readFileSync(path.join(ROOT, 'public', 'shared', 'admin.js'), 'utf8');
            assert.ok(js.includes('openCropperForExisting'), 'admin.js should define openCropperForExisting');
            assert.ok(js.includes('openCropperForNewUpload'), 'admin.js should define openCropperForNewUpload');
            assert.ok(js.includes('saveCropperCrop'), 'admin.js should define saveCropperCrop');
            assert.ok(js.includes('readCropFromCropper'), 'admin.js should define readCropFromCropper');
        });

        it('scripts.js exposes applyProfilePictureCrop helper', () => {
            const js = fs.readFileSync(path.join(ROOT, 'public', 'shared', 'scripts.js'), 'utf8');
            assert.ok(/function\s+applyProfilePictureCrop\s*\(/.test(js),
                'scripts.js should define applyProfilePictureCrop');
        });

        it('readCropFromCropper ↔ cropToCropperData round-trip preserves the crop', () => {
            // Extract the two pure math helpers from admin.js and evaluate them in a
            // sandboxed Function so the test doesn't need a browser or Cropper.js.
            const js = fs.readFileSync(path.join(ROOT, 'public', 'shared', 'admin.js'), 'utf8');
            const readMatch = js.match(/function readCropFromCropper\(cropperData, naturalSize\)\s*\{[\s\S]*?^\}/m);
            const toMatch = js.match(/function cropToCropperData\(crop, naturalSize\)\s*\{[\s\S]*?^\}/m);
            assert.ok(readMatch, 'readCropFromCropper should exist');
            assert.ok(toMatch, 'cropToCropperData should exist');
            const readFn = new Function('cropperData', 'naturalSize', readMatch[0]
                .replace(/^function readCropFromCropper\(cropperData, naturalSize\)\s*\{/, '')
                .replace(/\}$/, '') + '\nreturn readCropFromCropper(cropperData, naturalSize);');
            // Evil eval: the body uses DEFAULT_CROP — inline it.
            const readBody = readMatch[0]
                .replace(/^function readCropFromCropper\(cropperData, naturalSize\)\s*\{/, '')
                .replace(/\}$/, '')
                .replace(/\{\s*\.\.\.DEFAULT_CROP\s*\}/g, '{ offsetX: 0, offsetY: 0, zoom: 1 }');
            const readImpl = new Function('cropperData', 'naturalSize', readBody);
            const toBody = toMatch[0]
                .replace(/^function cropToCropperData\(crop, naturalSize\)\s*\{/, '')
                .replace(/\}$/, '');
            const toImpl = new Function('crop', 'naturalSize', toBody);

            const cases = [
                { W: 1000, H: 800,  crop: { offsetX: 0,   offsetY: 0,   zoom: 1 } },   // landscape, centered
                { W: 600,  H: 900,  crop: { offsetX: -15, offsetY: 10,  zoom: 1.5 } }, // portrait, off-centre
                { W: 500,  H: 500,  crop: { offsetX: 20,  offsetY: -8,  zoom: 2 } },   // square
                { W: 1200, H: 600,  crop: { offsetX: 0,   offsetY: 0,   zoom: 3 } },   // wide, heavy zoom
            ];
            for (const { W, H, crop } of cases) {
                const size = { w: W, h: H };
                const data = toImpl(crop, size);
                const round = readImpl(data, size);
                const near = (a, b) => Math.abs(a - b) < 0.01;
                assert.ok(near(round.offsetX, crop.offsetX),
                    `offsetX round-trip for ${W}x${H}: got ${round.offsetX}, expected ${crop.offsetX}`);
                assert.ok(near(round.offsetY, crop.offsetY),
                    `offsetY round-trip for ${W}x${H}: got ${round.offsetY}, expected ${crop.offsetY}`);
                assert.ok(near(round.zoom, crop.zoom),
                    `zoom round-trip for ${W}x${H}: got ${round.zoom}, expected ${crop.zoom}`);
            }
        });

        // Extract applyProfilePictureCrop from scripts.js and run it against a
        // stubbed <img>. The geometry contract: for a stored crop (offsetX%,
        // offsetY%, zoom) the helper must write
        //   transform: translate(tx%, ty%) scale(z)
        // where tx% = -z·(W/L)·offsetX, ty% = -z·(H/L)·offsetY and L = min(W,H).
        // This guarantees the crop centre lands at the container centre after
        // object-fit:cover, regardless of image aspect ratio.
        function loadApplyProfilePictureCrop() {
            const js = fs.readFileSync(path.join(ROOT, 'public', 'shared', 'scripts.js'), 'utf8');
            const m = js.match(/function applyProfilePictureCrop\(imgEl, crop\)\s*\{[\s\S]*?^\}/m);
            assert.ok(m, 'applyProfilePictureCrop should exist in scripts.js');
            // Keep the declaration intact so the deferred-load path can self-reference
            // via its own name (addEventListener → applyProfilePictureCrop(imgEl, crop)).
            const loader = new Function(`${m[0]}\nreturn applyProfilePictureCrop;`);
            return loader();
        }

        function stubImg(W, H, { complete = true } = {}) {
            const listeners = [];
            return {
                naturalWidth: complete ? W : 0,
                naturalHeight: complete ? H : 0,
                complete,
                style: {
                    objectPosition: 'X',
                    transform: 'X',
                    transformOrigin: 'X'
                },
                addEventListener(type, cb) { if (type === 'load') listeners.push(cb); },
                _fireLoad() { listeners.splice(0).forEach(cb => cb()); }
            };
        }

        function parseTransform(str) {
            const m = /translate\(([-\d.]+)%, ([-\d.]+)%\) scale\(([-\d.]+)\)/.exec(str || '');
            if (!m) return null;
            return { tx: parseFloat(m[1]), ty: parseFloat(m[2]), z: parseFloat(m[3]) };
        }

        it('applyProfilePictureCrop: null/invalid crop clears inline styles', () => {
            const apply = loadApplyProfilePictureCrop();
            const img = stubImg(1000, 1000);
            apply(img, null);
            assert.strictEqual(img.style.objectPosition, '');
            assert.strictEqual(img.style.transform, '');
            assert.strictEqual(img.style.transformOrigin, '');
        });

        it('applyProfilePictureCrop: identity crop (offsets 0, zoom 1) clears styles', () => {
            const apply = loadApplyProfilePictureCrop();
            const img = stubImg(1200, 800);
            apply(img, { offsetX: 0, offsetY: 0, zoom: 1 });
            assert.strictEqual(img.style.objectPosition, '');
            assert.strictEqual(img.style.transform, '');
            assert.strictEqual(img.style.transformOrigin, '');
        });

        it('applyProfilePictureCrop: centered crop with zoom > 1 is a pure scale', () => {
            const apply = loadApplyProfilePictureCrop();
            const img = stubImg(2000, 1000);
            apply(img, { offsetX: 0, offsetY: 0, zoom: 1.5 });
            const t = parseTransform(img.style.transform);
            assert.ok(t, `expected translate/scale, got: ${img.style.transform}`);
            const near = (a, b) => Math.abs(a - b) < 1e-6;
            assert.ok(near(t.tx, 0), `tx=${t.tx}`);
            assert.ok(near(t.ty, 0), `ty=${t.ty}`);
            assert.ok(near(t.z, 1.5), `z=${t.z}`);
            assert.strictEqual(img.style.objectPosition, '');
            assert.strictEqual(img.style.transformOrigin, '');
        });

        it('applyProfilePictureCrop: landscape off-centre crop uses W/L factor on tx', () => {
            const apply = loadApplyProfilePictureCrop();
            const W = 2000, H = 1000;                // L = 1000, W/L = 2
            const img = stubImg(W, H);
            const crop = { offsetX: -25, offsetY: 0, zoom: 1.25 };
            apply(img, crop);
            const t = parseTransform(img.style.transform);
            assert.ok(t, `expected translate/scale, got: ${img.style.transform}`);
            // tx% = -z·(W/L)·offsetX = -1.25 · 2 · (-25) = 62.5
            const near = (a, b) => Math.abs(a - b) < 1e-6;
            assert.ok(near(t.tx, 62.5), `tx=${t.tx} expected 62.5`);
            assert.ok(near(t.ty, 0), `ty=${t.ty} expected 0`);
            assert.ok(near(t.z, 1.25), `z=${t.z} expected 1.25`);
        });

        it('applyProfilePictureCrop: portrait off-centre crop uses H/L factor on ty', () => {
            const apply = loadApplyProfilePictureCrop();
            const W = 600, H = 900;                  // L = 600, H/L = 1.5
            const img = stubImg(W, H);
            const crop = { offsetX: 0, offsetY: 10, zoom: 1.5 };
            apply(img, crop);
            const t = parseTransform(img.style.transform);
            assert.ok(t, `expected translate/scale, got: ${img.style.transform}`);
            // ty% = -z·(H/L)·offsetY = -1.5 · 1.5 · 10 = -22.5
            const near = (a, b) => Math.abs(a - b) < 1e-6;
            assert.ok(near(t.tx, 0), `tx=${t.tx} expected 0`);
            assert.ok(near(t.ty, -22.5), `ty=${t.ty} expected -22.5`);
            assert.ok(near(t.z, 1.5), `z=${t.z} expected 1.5`);
        });

        it('applyProfilePictureCrop: square image off-centre both axes', () => {
            const apply = loadApplyProfilePictureCrop();
            const img = stubImg(1000, 1000);          // W = H = L, W/L = H/L = 1
            const crop = { offsetX: 25, offsetY: -10, zoom: 2 };
            apply(img, crop);
            const t = parseTransform(img.style.transform);
            assert.ok(t, `expected translate/scale, got: ${img.style.transform}`);
            // tx% = -2·1·25 = -50 ; ty% = -2·1·(-10) = 20
            const near = (a, b) => Math.abs(a - b) < 1e-6;
            assert.ok(near(t.tx, -50), `tx=${t.tx} expected -50`);
            assert.ok(near(t.ty, 20), `ty=${t.ty} expected 20`);
            assert.ok(near(t.z, 2), `z=${t.z} expected 2`);
        });

        it('applyProfilePictureCrop: defers when image not yet loaded, applies on load', () => {
            const apply = loadApplyProfilePictureCrop();
            const img = stubImg(2000, 1000, { complete: false });
            const crop = { offsetX: -25, offsetY: 0, zoom: 1.25 };
            apply(img, crop);
            // Nothing written synchronously because natural dims are unknown.
            assert.strictEqual(img.style.transform, 'X', 'must not write transform before load');
            // Simulate the image finishing load and expose naturalWidth/Height.
            img.naturalWidth = 2000;
            img.naturalHeight = 1000;
            img.complete = true;
            img._fireLoad();
            const t = parseTransform(img.style.transform);
            assert.ok(t, `expected translate/scale after load, got: ${img.style.transform}`);
            const near = (a, b) => Math.abs(a - b) < 1e-6;
            assert.ok(near(t.tx, 62.5), `tx=${t.tx} expected 62.5`);
            assert.ok(near(t.z, 1.25), `z=${t.z} expected 1.25`);
        });
    });

    describe('Code quality', () => {
        it('no console.log in frontend JavaScript files (except error handling)', () => {
            const files = [
                { name: 'admin.js', path: path.join(ROOT, 'public', 'shared', 'admin.js') },
                { name: 'scripts.js', path: path.join(ROOT, 'public', 'shared', 'scripts.js') },
                { name: 'i18n.js', path: path.join(ROOT, 'public', 'shared', 'i18n.js') },
            ];

            for (const { name, path: filePath } of files) {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                const logLines = [];
                lines.forEach((line, i) => {
                    if (!/\bconsole\.log\b/.test(line)) return;
                    if (line.trim().startsWith('//')) return;
                    // Allow console.log that references error variables (error handling in catch blocks)
                    if (/\berr(or)?\b/.test(line)) return;
                    logLines.push(i + 1);
                });
                assert.deepStrictEqual(logLines, [],
                    `${name} has console.log on lines: ${logLines.join(', ')} — use console.error/warn or remove`);
            }
        });

        it('no hardcoded localhost URLs in production code', () => {
            const files = [
                { name: 'admin.js', path: path.join(ROOT, 'public', 'shared', 'admin.js') },
                { name: 'scripts.js', path: path.join(ROOT, 'public', 'shared', 'scripts.js') },
                { name: 'server.js', path: path.join(ROOT, 'src', 'server.js') },
            ];

            for (const { name, path: filePath } of files) {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                const localhostLines = [];
                lines.forEach((line, i) => {
                    // Match http://localhost or https://localhost but not in comments
                    if (/https?:\/\/localhost/.test(line) && !line.trim().startsWith('//')) {
                        // Allow console.log/error messages that mention localhost for logging
                        if (!/console\.(log|error|warn)/.test(line)) {
                            localhostLines.push(i + 1);
                        }
                    }
                });
                assert.deepStrictEqual(localhostLines, [],
                    `${name} has hardcoded localhost URLs on lines: ${localhostLines.join(', ')}`);
            }
        });

        it('innerHTML assignments in frontend code use escapeHtml for dynamic content', () => {
            const files = [
                { name: 'admin.js', path: path.join(ROOT, 'public', 'shared', 'admin.js') },
                { name: 'scripts.js', path: path.join(ROOT, 'public', 'shared', 'scripts.js') },
            ];

            for (const { name, path: filePath } of files) {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                const suspectLines = [];
                lines.forEach((line, i) => {
                    if (line.trim().startsWith('//')) return;
                    // Look for innerHTML assignments with template literals containing variables
                    // but not using escapeHtml
                    if (/\.innerHTML\s*[\+]?=/.test(line) && /\$\{/.test(line) && !/escapeHtml/.test(line)) {
                        // Allow lines that only use known safe variables (materialIcon, icons, t(), etc.)
                        const templateVars = line.match(/\$\{([^}]+)\}/g) || [];
                        const hasSuspectVar = templateVars.some(v => {
                            const expr = v.slice(2, -1).trim();
                            // Safe patterns: materialIcon(), icons.*, t(), ?.icon, ?.id, index/i, known constants
                            return !/^(materialIcon|icons\.|t\(|.*\.icon|.*\.id\b|.*\.length|.*\.name|i\b|index|.*Icon|.*\.type|.*\.key|.*\.code|.*\.native|.*Color|parseInt|JSON\.stringify)/.test(expr)
                                && !/^['"`]/.test(expr) // string literals
                                && !/^\d/.test(expr); // numeric literals
                        });
                        if (hasSuspectVar) {
                            suspectLines.push(i + 1);
                        }
                    }
                });
                // This is a heuristic check — flag lines that look suspicious
                // A few false positives are acceptable; zero is ideal
                assert.ok(suspectLines.length <= 5,
                    `${name} has ${suspectLines.length} innerHTML assignments with un-escaped variables on lines: ${suspectLines.join(', ')}. Consider using escapeHtml().`);
            }
        });
    });
});

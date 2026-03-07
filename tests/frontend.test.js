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

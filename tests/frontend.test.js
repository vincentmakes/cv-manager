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
});

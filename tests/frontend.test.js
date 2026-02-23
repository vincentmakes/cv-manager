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
});

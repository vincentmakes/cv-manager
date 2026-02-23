const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');

const PORT = 13000 + Math.floor(Math.random() * 1000);
const PUBLIC_PORT = PORT + 1;
const BASE_URL = `http://localhost:${PORT}`;
const PUBLIC_URL = `http://localhost:${PUBLIC_PORT}`;

let serverProcess;

async function waitForServer(url, timeoutMs = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(`${url}/api/profile`);
            if (res.ok || res.status === 200) return;
        } catch {
            // Server not ready yet
        }
        await new Promise(r => setTimeout(r, 200));
    }
    throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

describe('Backend API', () => {
    before(async () => {
        const dbPath = path.join(__dirname, '..', 'data', 'test-cv.db');
        const fs = require('fs');

        // Clean up any previous test database
        try { fs.unlinkSync(dbPath); } catch { /* ignore */ }

        serverProcess = spawn('node', [path.join(__dirname, '..', 'src', 'server.js')], {
            env: {
                ...process.env,
                PORT: String(PORT),
                PUBLIC_PORT: String(PUBLIC_PORT),
                DB_PATH: dbPath,
                NODE_ENV: 'test',
            },
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        serverProcess.stderr.on('data', (data) => {
            const msg = data.toString();
            if (!msg.includes('ExperimentalWarning')) {
                process.stderr.write(`[server] ${msg}`);
            }
        });

        await waitForServer(BASE_URL);
    });

    after(async () => {
        if (serverProcess) {
            serverProcess.kill('SIGTERM');
            await new Promise(r => setTimeout(r, 500));
        }
        // Clean up test database
        const fs = require('fs');
        const dbPath = path.join(__dirname, '..', 'data', 'test-cv.db');
        try { fs.unlinkSync(dbPath); } catch { /* ignore */ }
    });

    describe('Admin API (port)', () => {
        it('GET /api/profile returns 200', async () => {
            const res = await fetch(`${BASE_URL}/api/profile`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(typeof data, 'object');
        });

        it('GET /api/experiences returns array', async () => {
            const res = await fetch(`${BASE_URL}/api/experiences`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('GET /api/certifications returns array', async () => {
            const res = await fetch(`${BASE_URL}/api/certifications`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('GET /api/education returns array', async () => {
            const res = await fetch(`${BASE_URL}/api/education`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('GET /api/skills returns array', async () => {
            const res = await fetch(`${BASE_URL}/api/skills`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('GET /api/projects returns array', async () => {
            const res = await fetch(`${BASE_URL}/api/projects`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('GET /api/sections returns object', async () => {
            const res = await fetch(`${BASE_URL}/api/sections`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(typeof data, 'object');
        });

        it('GET /api/sections/order returns array', async () => {
            const res = await fetch(`${BASE_URL}/api/sections/order`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('PUT /api/profile updates profile', async () => {
            const res = await fetch(`${BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test User', title: 'Developer' }),
            });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/profile`);
            const data = await getRes.json();
            assert.strictEqual(data.name, 'Test User');
            assert.strictEqual(data.title, 'Developer');
        });

        it('POST /api/experiences creates an experience', async () => {
            const res = await fetch(`${BASE_URL}/api/experiences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_title: 'Engineer',
                    company_name: 'TestCo',
                    start_date: '2024-01',
                    end_date: '',
                    location: 'Remote',
                    highlights: ['Built things'],
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.id);
        });

        it('serves admin HTML at root', async () => {
            const res = await fetch(BASE_URL);
            assert.strictEqual(res.status, 200);
            const text = await res.text();
            assert.ok(text.includes('<!DOCTYPE html>'));
            assert.ok(text.includes('CV Manager'));
        });
    });

    describe('Public API (port)', () => {
        it('GET /api/profile returns 200', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/profile`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(typeof data, 'object');
        });

        it('GET /api/experiences returns array', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/experiences`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('GET /api/cv returns full CV object', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/cv`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.profile !== undefined);
            assert.ok(Array.isArray(data.experiences));
            assert.ok(Array.isArray(data.skills));
        });

        it('rejects non-GET methods', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/profile`, { method: 'POST' });
            assert.strictEqual(res.status, 405);
        });

        it('includes security headers', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/profile`);
            assert.ok(res.headers.get('x-content-type-options'));
            assert.ok(res.headers.get('x-frame-options'));
        });

        it('serves public HTML at root', async () => {
            const res = await fetch(PUBLIC_URL);
            assert.strictEqual(res.status, 200);
            const text = await res.text();
            assert.ok(text.includes('<!DOCTYPE html>'));
        });
    });
});

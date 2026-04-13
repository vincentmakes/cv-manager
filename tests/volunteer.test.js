const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const PORT = 14000 + Math.floor(Math.random() * 1000);
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

describe('Volunteer Work Feature', () => {
    const dbPath = path.join(__dirname, '..', 'data', 'volunteer-test.db');

    before(async () => {
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

        serverProcess.stdout.on('data', (data) => {
            process.stdout.write(`[server-out] ${data.toString()}`);
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
        try { fs.unlinkSync(dbPath); } catch { /* ignore */ }
    });

    it('POST /api/volunteer creates a volunteer entry with multiple roles', async () => {
        const roles = [
            { title: 'Member', start_date: '2026-02', end_date: '' },
            { title: 'President', start_date: '2025-02', end_date: '2026-02' }
        ];
        const res = await fetch(`${BASE_URL}/api/volunteer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                organization: 'Rotary International',
                description: 'Volunteering locally',
                roles: roles
            }),
        });
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.ok(data.id);

        // Verify it was stored correctly
        const getRes = await fetch(`${BASE_URL}/api/volunteer/${data.id}`);
        const vol = await getRes.json();
        assert.strictEqual(vol.organization, 'Rotary International');
        assert.strictEqual(vol.roles.length, 2);
        assert.strictEqual(vol.roles[0].title, 'Member');
    });

    it('GET /api/timeline includes volunteer roles as separate items', async () => {
        const res = await fetch(`${BASE_URL}/api/timeline`);
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        
        // Find items related to our volunteer work
        const volItems = data.filter(item => item.id && String(item.id).startsWith('vol_'));
        assert.ok(volItems.length >= 2, 'Should have at least 2 volunteer roles in timeline');
        
        const memberRole = volItems.find(i => i.role === 'Member');
        assert.ok(memberRole, 'Timeline should include Member role');
        assert.strictEqual(memberRole.company, 'Rotary International');
    });

    it('Dataset lifecycle preserves volunteer work', async () => {
        // 1. Create a dataset
        const createDsRes = await fetch(`${BASE_URL}/api/datasets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Volunteer Snapshot' }),
        });
        const ds = await createDsRes.json();
        assert.ok(ds.id);

        // 2. Clear current volunteer work
        const listRes = await fetch(`${BASE_URL}/api/volunteer`);
        const list = await listRes.json();
        for (const item of list) {
            await fetch(`${BASE_URL}/api/volunteer/${item.id}`, { method: 'DELETE' });
        }

        // Verify cleared
        const listRes2 = await fetch(`${BASE_URL}/api/volunteer`);
        assert.strictEqual((await listRes2.json()).length, 0);

        // 3. Load dataset back
        const loadRes = await fetch(`${BASE_URL}/api/datasets/${ds.id}/load`, { method: 'POST' });
        assert.strictEqual(loadRes.status, 200);

        // 4. Verify volunteer work restored
        const listRes3 = await fetch(`${BASE_URL}/api/volunteer`);
        const restoredList = await listRes3.json();
        assert.ok(restoredList.length > 0, 'Volunteer work should be restored');
        assert.strictEqual(restoredList[0].organization, 'Rotary International');
        assert.ok(Array.isArray(restoredList[0].roles));
    });

    it('Public API /api/cv includes volunteer work', async () => {
        const res = await fetch(`${PUBLIC_URL}/api/cv`);
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.ok(Array.isArray(data.volunteer_work));
        assert.ok(data.volunteer_work.length > 0);
        assert.strictEqual(data.volunteer_work[0].organization, 'Rotary International');
    });

    it('Public API /api/timeline includes volunteer roles for the career timeline', async () => {
        const res = await fetch(`${PUBLIC_URL}/api/timeline`);
        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.ok(Array.isArray(data));

        const volItems = data.filter(item => item.id && String(item.id).startsWith('vol_'));
        assert.ok(volItems.length >= 2, 'Public timeline should expose volunteer roles as separate items');

        const presidentRole = volItems.find(item => item.role === 'President');
        assert.ok(presidentRole, 'Public timeline should include the President volunteer role');
        assert.strictEqual(presidentRole.company, 'Rotary International');
    });
});

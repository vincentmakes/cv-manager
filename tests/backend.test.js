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

        it('GET /api/timeline includes logo field', async () => {
            const res = await fetch(`${BASE_URL}/api/timeline`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
            if (data.length > 0) {
                assert.ok('logo' in data[0], 'Timeline item should have logo field');
            }
        });

        it('GET /api/experiences includes logo_filename field', async () => {
            const res = await fetch(`${BASE_URL}/api/experiences`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
            if (data.length > 0) {
                assert.ok('logo_filename' in data[0], 'Experience should have logo_filename field');
            }
        });

        it('POST /api/experiences/:id/logo returns 404 for non-existent experience', async () => {
            const formData = new FormData();
            formData.append('logo', new Blob(['fake image data'], { type: 'image/jpeg' }), 'test.jpg');
            const res = await fetch(`${BASE_URL}/api/experiences/99999/logo`, {
                method: 'POST',
                body: formData,
            });
            // Either 404 (not found) or 400 (no file due to filter) are acceptable
            assert.ok(res.status === 404 || res.status === 400);
        });

        it('DELETE /api/experiences/:id/logo returns 404 for non-existent experience', async () => {
            const res = await fetch(`${BASE_URL}/api/experiences/99999/logo`, {
                method: 'DELETE',
            });
            assert.strictEqual(res.status, 404);
        });

        it('DELETE /api/experiences/:id/logo succeeds for existing experience without logo', async () => {
            // First create an experience
            const createRes = await fetch(`${BASE_URL}/api/experiences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_title: 'Logo Test',
                    company_name: 'LogoCo',
                    start_date: '2024-01',
                    end_date: '',
                    location: 'Remote',
                    highlights: [],
                }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/experiences/${id}/logo`, {
                method: 'DELETE',
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
        });

        it('serves admin HTML at root', async () => {
            const res = await fetch(BASE_URL);
            assert.strictEqual(res.status, 200);
            const text = await res.text();
            assert.ok(text.includes('<!DOCTYPE html>'));
            assert.ok(text.includes('CV Manager'));
        });

        // --- Certifications CRUD ---
        it('POST /api/certifications creates a certification', async () => {
            const res = await fetch(`${BASE_URL}/api/certifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'AWS Solutions Architect',
                    provider: 'Amazon',
                    issue_date: '2024-01',
                    expiry_date: '2027-01',
                    credential_id: 'AWS-123',
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.id);
        });

        it('GET /api/certifications/:id returns a specific certification', async () => {
            // Create one first
            const createRes = await fetch(`${BASE_URL}/api/certifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'CertGet', provider: 'TestProvider', issue_date: '2024-03' }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/certifications/${id}`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.name, 'CertGet');
            assert.strictEqual(data.provider, 'TestProvider');
        });

        it('PUT /api/certifications/:id updates a certification', async () => {
            const createRes = await fetch(`${BASE_URL}/api/certifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'OldCert', provider: 'OldProvider', issue_date: '2024-01' }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/certifications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'UpdatedCert', provider: 'NewProvider', issue_date: '2024-06', expiry_date: '2027-06', credential_id: 'NEW-456' }),
            });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/certifications/${id}`);
            const data = await getRes.json();
            assert.strictEqual(data.name, 'UpdatedCert');
            assert.strictEqual(data.provider, 'NewProvider');
        });

        it('DELETE /api/certifications/:id deletes a certification', async () => {
            const createRes = await fetch(`${BASE_URL}/api/certifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'ToDelete', provider: 'X', issue_date: '2024-01' }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/certifications/${id}`, { method: 'DELETE' });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/certifications/${id}`);
            assert.strictEqual(getRes.status, 404);
        });

        // --- Education CRUD ---
        it('POST /api/education creates an education entry', async () => {
            const res = await fetch(`${BASE_URL}/api/education`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    degree_title: 'MSc Computer Science',
                    institution_name: 'MIT',
                    start_date: '2018-09',
                    end_date: '2020-06',
                    description: 'Graduated with honors',
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.id);
        });

        it('GET /api/education/:id returns a specific education entry', async () => {
            const createRes = await fetch(`${BASE_URL}/api/education`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ degree_title: 'EduGet', institution_name: 'TestUni', start_date: '2020-01', end_date: '2024-01' }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/education/${id}`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.degree_title, 'EduGet');
        });

        it('PUT /api/education/:id updates an education entry', async () => {
            const createRes = await fetch(`${BASE_URL}/api/education`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ degree_title: 'OldDeg', institution_name: 'OldUni', start_date: '2020-01', end_date: '2024-01' }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/education/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ degree_title: 'NewDeg', institution_name: 'NewUni', start_date: '2019-09', end_date: '2023-06', description: 'Updated' }),
            });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/education/${id}`);
            const data = await getRes.json();
            assert.strictEqual(data.degree_title, 'NewDeg');
            assert.strictEqual(data.institution_name, 'NewUni');
        });

        it('DELETE /api/education/:id deletes an education entry', async () => {
            const createRes = await fetch(`${BASE_URL}/api/education`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ degree_title: 'DeleteMe', institution_name: 'X', start_date: '2020-01', end_date: '2024-01' }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/education/${id}`, { method: 'DELETE' });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/education/${id}`);
            assert.strictEqual(getRes.status, 404);
        });

        // --- Skills CRUD ---
        it('POST /api/skills creates a skill category with skills', async () => {
            const res = await fetch(`${BASE_URL}/api/skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Programming',
                    icon: 'code',
                    skills: ['JavaScript', 'Python', 'Go'],
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.id);

            // Verify skills are stored
            const getRes = await fetch(`${BASE_URL}/api/skills/${data.id}`);
            const cat = await getRes.json();
            assert.strictEqual(cat.name, 'Programming');
            assert.deepStrictEqual(cat.skills, ['JavaScript', 'Python', 'Go']);
        });

        it('PUT /api/skills/:id updates a skill category', async () => {
            const createRes = await fetch(`${BASE_URL}/api/skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'OldSkills', icon: 'default', skills: ['A'] }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/skills/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'NewSkills', icon: 'server', skills: ['B', 'C'] }),
            });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/skills/${id}`);
            const data = await getRes.json();
            assert.strictEqual(data.name, 'NewSkills');
            assert.deepStrictEqual(data.skills, ['B', 'C']);
        });

        it('DELETE /api/skills/:id deletes a skill category and its skills', async () => {
            const createRes = await fetch(`${BASE_URL}/api/skills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'DeleteSkills', skills: ['X'] }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/skills/${id}`, { method: 'DELETE' });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/skills/${id}`);
            assert.strictEqual(getRes.status, 404);
        });

        // --- Projects CRUD ---
        it('POST /api/projects creates a project', async () => {
            const res = await fetch(`${BASE_URL}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Test Project',
                    description: 'A test project',
                    technologies: ['Node.js', 'Express'],
                    link: 'https://example.com',
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.id);
        });

        it('GET /api/projects/:id returns a specific project', async () => {
            const createRes = await fetch(`${BASE_URL}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'ProjGet', description: 'Desc', technologies: ['React'], link: '' }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/projects/${id}`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.title, 'ProjGet');
            assert.deepStrictEqual(data.technologies, ['React']);
        });

        it('PUT /api/projects/:id updates a project', async () => {
            const createRes = await fetch(`${BASE_URL}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'OldProj', description: 'Old', technologies: [], link: '' }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'NewProj', description: 'New desc', technologies: ['Vue'], link: 'https://new.com' }),
            });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/projects/${id}`);
            const data = await getRes.json();
            assert.strictEqual(data.title, 'NewProj');
            assert.deepStrictEqual(data.technologies, ['Vue']);
        });

        it('DELETE /api/projects/:id deletes a project', async () => {
            const createRes = await fetch(`${BASE_URL}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'DeleteProj', description: '', technologies: [], link: '' }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/projects/${id}`, { method: 'DELETE' });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/projects/${id}`);
            assert.strictEqual(getRes.status, 404);
        });

        // --- Experiences Update & Delete ---
        it('PUT /api/experiences/:id updates an experience', async () => {
            const createRes = await fetch(`${BASE_URL}/api/experiences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_title: 'OldTitle', company_name: 'OldCo', start_date: '2023-01', end_date: '', location: 'NYC', highlights: [] }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/experiences/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_title: 'NewTitle', company_name: 'NewCo', start_date: '2023-06', end_date: '2024-01', location: 'SF', highlights: ['Did stuff'] }),
            });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/experiences/${id}`);
            const data = await getRes.json();
            assert.strictEqual(data.job_title, 'NewTitle');
            assert.strictEqual(data.company_name, 'NewCo');
        });

        it('DELETE /api/experiences/:id deletes an experience', async () => {
            const createRes = await fetch(`${BASE_URL}/api/experiences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_title: 'DeleteMe', company_name: 'X', start_date: '2023-01', end_date: '', location: '', highlights: [] }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/experiences/${id}`, { method: 'DELETE' });
            assert.strictEqual(res.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/experiences/${id}`);
            assert.strictEqual(getRes.status, 404);
        });

        // --- Section Visibility ---
        it('PUT /api/sections/:name toggles section visibility', async () => {
            const res = await fetch(`${BASE_URL}/api/sections/skills`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visible: false }),
            });
            assert.strictEqual(res.status, 200);

            const sectionsRes = await fetch(`${BASE_URL}/api/sections`);
            const sections = await sectionsRes.json();
            assert.strictEqual(sections.skills, false);

            // Toggle back
            await fetch(`${BASE_URL}/api/sections/skills`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visible: true }),
            });
        });

        // --- Reorder ---
        it('PUT /api/reorder/:type reorders items', async () => {
            // Create two experiences
            const r1 = await fetch(`${BASE_URL}/api/experiences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_title: 'First', company_name: 'A', start_date: '2024-01', end_date: '', location: '', highlights: [] }),
            });
            const r2 = await fetch(`${BASE_URL}/api/experiences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_title: 'Second', company_name: 'B', start_date: '2024-02', end_date: '', location: '', highlights: [] }),
            });
            const { id: id1 } = await r1.json();
            const { id: id2 } = await r2.json();

            const res = await fetch(`${BASE_URL}/api/reorder/experiences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [{ id: id1, sort_order: 2 }, { id: id2, sort_order: 1 }] }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
        });

        it('PUT /api/reorder/:type rejects invalid type', async () => {
            const res = await fetch(`${BASE_URL}/api/reorder/invalid`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [] }),
            });
            assert.strictEqual(res.status, 400);
        });

        // --- Settings ---
        it('GET /api/settings returns settings object', async () => {
            const res = await fetch(`${BASE_URL}/api/settings`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(typeof data, 'object');
        });

        it('PUT /api/settings/:key updates a setting and GET retrieves it', async () => {
            const putRes = await fetch(`${BASE_URL}/api/settings/date_format`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: 'MMMM YYYY' }),
            });
            assert.strictEqual(putRes.status, 200);

            const getRes = await fetch(`${BASE_URL}/api/settings/date_format`);
            const data = await getRes.json();
            assert.strictEqual(data.value, 'MMMM YYYY');
        });

        // --- Version ---
        it('GET /api/version returns version info', async () => {
            const res = await fetch(`${BASE_URL}/api/version`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.current, 'Should have current version');
        });

        // --- Datasets ---
        it('GET /api/datasets returns array', async () => {
            const res = await fetch(`${BASE_URL}/api/datasets`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('POST /api/datasets creates a dataset', async () => {
            const res = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test Dataset' }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.id);
            assert.strictEqual(data.success, true);
        });

        it('POST /api/datasets rejects empty name', async () => {
            const res = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: '' }),
            });
            assert.strictEqual(res.status, 400);
        });

        it('dataset lifecycle: create, set default, save, load, delete', async () => {
            // Create dataset
            const createRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Lifecycle Test' }),
            });
            const created = await createRes.json();
            assert.ok(created.id);

            // Set as default
            const defaultRes = await fetch(`${BASE_URL}/api/datasets/${created.id}/default`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });
            assert.strictEqual(defaultRes.status, 200);
            const defaultData = await defaultRes.json();
            assert.strictEqual(defaultData.is_default, true);

            // Save current state to dataset
            const saveRes = await fetch(`${BASE_URL}/api/datasets/${created.id}/save`, { method: 'POST' });
            assert.strictEqual(saveRes.status, 200);

            // Load dataset
            const loadRes = await fetch(`${BASE_URL}/api/datasets/${created.id}/load`, { method: 'POST' });
            assert.strictEqual(loadRes.status, 200);

            // Cannot delete default dataset
            const deleteRes = await fetch(`${BASE_URL}/api/datasets/${created.id}`, { method: 'DELETE' });
            assert.strictEqual(deleteRes.status, 400);

            // Create another dataset, set it as default, then delete original
            const create2Res = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'New Default' }),
            });
            const created2 = await create2Res.json();
            await fetch(`${BASE_URL}/api/datasets/${created2.id}/default`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });

            // Now delete the original
            const deleteRes2 = await fetch(`${BASE_URL}/api/datasets/${created.id}`, { method: 'DELETE' });
            assert.strictEqual(deleteRes2.status, 200);
        });

        it('PUT /api/datasets/:id/public toggles public visibility', async () => {
            const createRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Public Test' }),
            });
            const { id } = await createRes.json();

            const res = await fetch(`${BASE_URL}/api/datasets/${id}/public`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_public: true }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.is_public, true);
        });

        // --- Custom Sections ---
        it('custom sections lifecycle: create, get, update, add items, delete', async () => {
            // Create section
            const createRes = await fetch(`${BASE_URL}/api/custom-sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Awards', layout_type: 'list', icon: 'star' }),
            });
            assert.strictEqual(createRes.status, 200);
            const created = await createRes.json();
            assert.ok(created.id);
            assert.ok(created.section_key);

            // Get all custom sections
            const listRes = await fetch(`${BASE_URL}/api/custom-sections`);
            assert.strictEqual(listRes.status, 200);
            const list = await listRes.json();
            assert.ok(Array.isArray(list));
            assert.ok(list.some(s => s.id === created.id));

            // Get specific section
            const getRes = await fetch(`${BASE_URL}/api/custom-sections/${created.id}`);
            assert.strictEqual(getRes.status, 200);
            const section = await getRes.json();
            assert.strictEqual(section.name, 'Awards');
            assert.strictEqual(section.layout_type, 'list');

            // Update section
            const updateRes = await fetch(`${BASE_URL}/api/custom-sections/${created.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Awards & Honors', layout_type: 'cards', icon: 'trophy' }),
            });
            assert.strictEqual(updateRes.status, 200);

            // Add item
            const addItemRes = await fetch(`${BASE_URL}/api/custom-sections/${created.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Best Employee', subtitle: '2024', description: 'Annual award' }),
            });
            assert.strictEqual(addItemRes.status, 200);
            const item = await addItemRes.json();
            assert.ok(item.id);

            // Get items
            const itemsRes = await fetch(`${BASE_URL}/api/custom-sections/${created.id}/items`);
            assert.strictEqual(itemsRes.status, 200);
            const items = await itemsRes.json();
            assert.ok(items.some(i => i.title === 'Best Employee'));

            // Update item
            const updateItemRes = await fetch(`${BASE_URL}/api/custom-sections/${created.id}/items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Top Performer', subtitle: '2024', description: 'Updated award' }),
            });
            assert.strictEqual(updateItemRes.status, 200);

            // Delete item
            const deleteItemRes = await fetch(`${BASE_URL}/api/custom-sections/${created.id}/items/${item.id}`, { method: 'DELETE' });
            assert.strictEqual(deleteItemRes.status, 200);

            // Delete section
            const deleteRes = await fetch(`${BASE_URL}/api/custom-sections/${created.id}`, { method: 'DELETE' });
            assert.strictEqual(deleteRes.status, 200);

            // Verify deleted
            const verify = await fetch(`${BASE_URL}/api/custom-sections/${created.id}`);
            assert.strictEqual(verify.status, 404);
        });

        it('POST /api/custom-sections rejects empty name', async () => {
            const res = await fetch(`${BASE_URL}/api/custom-sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: '' }),
            });
            assert.strictEqual(res.status, 400);
        });

        // --- Import ---
        it('POST /api/import imports CV data', async () => {
            const res = await fetch(`${BASE_URL}/api/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile: { name: 'Imported User', title: 'Imported Title' },
                    experiences: [{ job_title: 'Imported Job', company_name: 'ImportCo', start_date: '2024-01', end_date: '', location: 'Remote', highlights: ['Did things'] }],
                    certifications: [{ name: 'ImportCert', provider: 'ImportProv', issue_date: '2024-01' }],
                    education: [{ degree_title: 'ImportDeg', institution_name: 'ImportUni', start_date: '2020-01', end_date: '2024-01' }],
                    skills: [{ name: 'ImportSkills', skills: ['Skill1'] }],
                    projects: [{ title: 'ImportProj', description: 'Desc', technologies: ['Tech1'] }],
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);

            // Verify imported data
            const profileRes = await fetch(`${BASE_URL}/api/profile`);
            const profile = await profileRes.json();
            assert.strictEqual(profile.name, 'Imported User');
        });

        // --- Utility endpoints ---
        it('GET /api/layout-types returns array', async () => {
            const res = await fetch(`${BASE_URL}/api/layout-types`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
            assert.ok(data.length > 0);
        });

        it('GET /api/social-platforms returns array', async () => {
            const res = await fetch(`${BASE_URL}/api/social-platforms`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
            assert.ok(data.length > 0);
        });

        it('GET /api/cv returns comprehensive CV data', async () => {
            const res = await fetch(`${BASE_URL}/api/cv`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.profile);
            assert.ok(Array.isArray(data.experiences));
            assert.ok(Array.isArray(data.certifications));
            assert.ok(Array.isArray(data.education));
            assert.ok(Array.isArray(data.skills));
            assert.ok(Array.isArray(data.projects));
            assert.ok(data.sectionVisibility);
            assert.ok(Array.isArray(data.sectionOrder));
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

        it('GET /api/timeline returns array on public API', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/timeline`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('GET /api/custom-sections returns array on public API', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/custom-sections`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('GET /api/settings returns object on public API', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/settings`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(typeof data, 'object');
        });

        it('GET /api/settings/:key returns value on public API', async () => {
            // First set a value via admin
            await fetch(`${BASE_URL}/api/settings/language`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: 'en' }),
            });
            const res = await fetch(`${PUBLIC_URL}/api/settings/language`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.value, 'en');
        });

        it('GET /api/layout-types returns array on public API', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/layout-types`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });

        it('GET /api/social-platforms returns array on public API', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/social-platforms`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
        });
    });

    describe('Security', () => {
        it('public /api/profile does not expose email or phone', async () => {
            // Store profile with sensitive data via admin
            await fetch(`${BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Secure User',
                    title: 'Dev',
                    email: 'secret@example.com',
                    phone: '+1-555-0199',
                }),
            });

            // Fetch from public API
            const res = await fetch(`${PUBLIC_URL}/api/profile`);
            const data = await res.json();
            assert.strictEqual(data.email, undefined, 'Public profile should not contain email');
            assert.strictEqual(data.phone, undefined, 'Public profile should not contain phone');
            assert.strictEqual(data.name, 'Secure User', 'Public profile should still contain name');
        });

        it('public /api/cv does not expose email or phone', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/cv`);
            const data = await res.json();
            assert.strictEqual(data.profile.email, undefined, 'Public CV profile should not contain email');
            assert.strictEqual(data.profile.phone, undefined, 'Public CV profile should not contain phone');
        });

        it('public /api/profile does not expose database id', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/profile`);
            const data = await res.json();
            assert.strictEqual(data.id, undefined, 'Public profile should not expose database id');
        });

        it('survives SQL injection in profile fields', async () => {
            const payload = "'; DROP TABLE profile; --";
            const res = await fetch(`${BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: payload, title: 'Dev' }),
            });
            assert.strictEqual(res.status, 200);

            // Verify server still works and data stored correctly
            const getRes = await fetch(`${BASE_URL}/api/profile`);
            assert.strictEqual(getRes.status, 200);
            const data = await getRes.json();
            assert.strictEqual(data.name, payload, 'SQL injection string should be stored as literal text');
        });

        it('survives SQL injection in experience creation', async () => {
            const payload = "'; DROP TABLE experiences; --";
            const res = await fetch(`${BASE_URL}/api/experiences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_title: payload,
                    company_name: 'TestCo',
                    start_date: '2024-01',
                    end_date: '',
                    location: 'Remote',
                    highlights: [payload],
                }),
            });
            assert.strictEqual(res.status, 200);

            // Verify the table still exists and works
            const getRes = await fetch(`${BASE_URL}/api/experiences`);
            assert.strictEqual(getRes.status, 200);
            const data = await getRes.json();
            assert.ok(Array.isArray(data), 'Experiences table should still exist after injection attempt');
        });

        it('stores XSS payloads as-is without corruption', async () => {
            const xss = '<script>alert("xss")</script><img onerror="alert(1)" src=x>';
            await fetch(`${BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: xss, title: '<b onmouseover="alert(1)">title</b>' }),
            });

            // Admin API should return raw data (frontend escapes on display)
            const adminRes = await fetch(`${BASE_URL}/api/profile`);
            const adminData = await adminRes.json();
            assert.strictEqual(adminData.name, xss, 'XSS payload should be stored without corruption');

            // Public API should also return raw data
            const publicRes = await fetch(`${PUBLIC_URL}/api/profile`);
            const publicData = await publicRes.json();
            assert.strictEqual(publicData.name, xss, 'Public API should return raw XSS payload for frontend to escape');
        });

        it('rejects PUT on public API endpoints', async () => {
            const endpoints = ['/api/profile', '/api/experiences', '/api/certifications', '/api/education'];
            for (const endpoint of endpoints) {
                const res = await fetch(`${PUBLIC_URL}${endpoint}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'hack' }),
                });
                assert.strictEqual(res.status, 405, `PUT ${endpoint} on public API should return 405`);
            }
        });

        it('rejects DELETE on public API endpoints', async () => {
            const endpoints = ['/api/profile', '/api/experiences', '/api/certifications'];
            for (const endpoint of endpoints) {
                const res = await fetch(`${PUBLIC_URL}${endpoint}`, { method: 'DELETE' });
                assert.strictEqual(res.status, 405, `DELETE ${endpoint} on public API should return 405`);
            }
        });

        it('rejects PATCH on public API endpoints', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'hack' }),
            });
            assert.strictEqual(res.status, 405, 'PATCH on public API should return 405');
        });

        it('handles malformed JSON body gracefully', async () => {
            const res = await fetch(`${BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: 'this is not json{{{',
            });
            // Should return 400 (bad request) not 500 (server error)
            assert.ok(res.status >= 400 && res.status < 500, `Malformed JSON should return 4xx, got ${res.status}`);
        });

        it('security headers have correct values', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/profile`);
            assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
            assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
        });

        it('rate limits public API after threshold', async () => {
            // Rate limit is 200 requests per minute per IP
            // Send 210 requests rapidly to trigger the limiter
            const requests = [];
            for (let i = 0; i < 210; i++) {
                requests.push(fetch(`${PUBLIC_URL}/api/profile`));
            }
            const responses = await Promise.all(requests);
            const statuses = responses.map(r => r.status);
            const has429 = statuses.some(s => s === 429);
            assert.ok(has429, 'Should receive 429 after exceeding rate limit (200 req/min)');
        });

        it('path traversal in logo upload filename is handled safely', async () => {
            // Create an experience to upload a logo to
            const createRes = await fetch(`${BASE_URL}/api/experiences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_title: 'Path Test',
                    company_name: 'PathCo',
                    start_date: '2024-01',
                    end_date: '',
                    location: 'Remote',
                    highlights: [],
                }),
            });
            const { id } = await createRes.json();

            // Attempt path traversal via logo upload
            const formData = new FormData();
            formData.append('logo', new Blob(['fake'], { type: 'image/jpeg' }), '../../etc/passwd');
            const res = await fetch(`${BASE_URL}/api/experiences/${id}/logo`, {
                method: 'POST',
                body: formData,
            });
            // Should either reject (400) or accept safely (200) — not crash (500)
            assert.ok(res.status !== 500, 'Path traversal should not cause server error');
        });
    });
});

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
                    credential_id: 'https://aws.amazon.com/verification/AWS-123',
                }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.id);
        });

        it('POST /api/certifications rejects a non-URL credential_id', async () => {
            const res = await fetch(`${BASE_URL}/api/certifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'BadCert',
                    provider: 'X',
                    issue_date: '2024-01',
                    credential_id: 'not-a-url',
                }),
            });
            assert.strictEqual(res.status, 400);
            const data = await res.json();
            assert.match(data.error, /URL/i);
        });

        it('POST /api/certifications accepts empty credential_id', async () => {
            const res = await fetch(`${BASE_URL}/api/certifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'NoCredCert',
                    provider: 'X',
                    issue_date: '2024-01',
                    credential_id: '',
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
                body: JSON.stringify({ name: 'UpdatedCert', provider: 'NewProvider', issue_date: '2024-06', expiry_date: '2027-06', credential_id: 'https://aws.amazon.com/verification/NEW-456' }),
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

        it('PUT /api/sections/:name/print toggles print visibility without affecting visibility', async () => {
            const res = await fetch(`${BASE_URL}/api/sections/experience/print`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_visible: false }),
            });
            assert.strictEqual(res.status, 200);

            const orderRes = await fetch(`${BASE_URL}/api/sections/order`);
            const order = await orderRes.json();
            const exp = order.find(s => s.key === 'experience');
            assert.ok(exp, 'experience section present in order');
            assert.strictEqual(exp.print_visible, false, 'print_visible persisted as false');
            assert.strictEqual(exp.visible, true, 'visible stays true when only print was toggled');

            // Restore
            await fetch(`${BASE_URL}/api/sections/experience/print`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_visible: true }),
            });
        });

        it('PUT /api/sections/:name/print returns 404 for unknown section', async () => {
            const res = await fetch(`${BASE_URL}/api/sections/does_not_exist/print`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_visible: false }),
            });
            assert.strictEqual(res.status, 404);
        });

        it('PUT /api/sections/:name/print-compact toggles print_compact without affecting visible or print_visible', async () => {
            const res = await fetch(`${BASE_URL}/api/sections/skills/print-compact`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_compact: true }),
            });
            assert.strictEqual(res.status, 200);

            const orderRes = await fetch(`${BASE_URL}/api/sections/order`);
            const order = await orderRes.json();
            const skills = order.find(s => s.key === 'skills');
            assert.ok(skills, 'skills section present in order');
            assert.strictEqual(skills.print_compact, true, 'print_compact persisted as true');
            assert.strictEqual(skills.visible, true, 'visible stays true when only print_compact was toggled');
            assert.strictEqual(skills.print_visible, true, 'print_visible stays true when only print_compact was toggled');

            // Restore
            await fetch(`${BASE_URL}/api/sections/skills/print-compact`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_compact: false }),
            });
        });

        it('PUT /api/sections/:name/print-compact works independently for projects', async () => {
            // Toggle projects compact on
            await fetch(`${BASE_URL}/api/sections/projects/print-compact`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_compact: true }),
            });

            const order = await (await fetch(`${BASE_URL}/api/sections/order`)).json();
            const projects = order.find(s => s.key === 'projects');
            const skills = order.find(s => s.key === 'skills');
            assert.strictEqual(projects.print_compact, true, 'projects print_compact is on');
            assert.strictEqual(skills.print_compact, false, 'skills print_compact stays off — flag is per-section');

            // Restore
            await fetch(`${BASE_URL}/api/sections/projects/print-compact`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_compact: false }),
            });
        });

        it('PUT /api/sections/:name/print-compact returns 404 for unknown section', async () => {
            const res = await fetch(`${BASE_URL}/api/sections/does_not_exist/print-compact`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_compact: true }),
            });
            assert.strictEqual(res.status, 404);
        });

        it('PUT /api/sections/order preserves print_compact round-trip', async () => {
            // Turn on print_compact for skills
            await fetch(`${BASE_URL}/api/sections/skills/print-compact`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_compact: true }),
            });

            // Send the full order back through the bulk endpoint, including the flag
            const orderRes = await fetch(`${BASE_URL}/api/sections/order`);
            const order = await orderRes.json();
            const payload = order.map((s, idx) => ({
                key: s.key,
                visible: s.visible,
                print_visible: s.print_visible !== false,
                print_compact: s.print_compact === true,
                sort_order: idx,
            }));
            const putRes = await fetch(`${BASE_URL}/api/sections/order`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sections: payload }),
            });
            assert.strictEqual(putRes.status, 200);

            const after = await (await fetch(`${BASE_URL}/api/sections/order`)).json();
            const skills = after.find(s => s.key === 'skills');
            assert.strictEqual(skills.print_compact, true, 'print_compact survived the round-trip');

            // Restore
            await fetch(`${BASE_URL}/api/sections/skills/print-compact`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_compact: false }),
            });
        });

        it('saved datasets carry print_compact through to the public API', async () => {
            // Turn on print_compact for skills in the live DB
            await fetch(`${BASE_URL}/api/sections/skills/print-compact`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_compact: true }),
            });

            // Create a public dataset and save the current live state into it
            const createRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Compact Print Public' }),
            });
            const created = await createRes.json();
            await fetch(`${BASE_URL}/api/datasets/${created.id}/save`, { method: 'POST' });
            await fetch(`${BASE_URL}/api/datasets/${created.id}/public`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_public: true }),
            });

            // Fetch the dataset via the PUBLIC server's slug endpoint —
            // this is what /v/:slug's client uses to render the CV
            const pubRes = await fetch(`${PUBLIC_URL}/api/datasets/slug/${created.slug}`);
            assert.strictEqual(pubRes.status, 200);
            const pub = await pubRes.json();
            const pubSkills = pub.sectionOrder.find(s => s.key === 'skills');
            assert.ok(pubSkills, 'skills entry present in public dataset sectionOrder');
            assert.strictEqual(pubSkills.print_compact, true, 'print_compact reaches the public dataset payload');

            // Clean up — delete dataset, reset flag
            await fetch(`${BASE_URL}/api/datasets/${created.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/sections/skills/print-compact`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ print_compact: false }),
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

        it('POST /api/datasets creates a dataset with version fields', async () => {
            const res = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test Dataset' }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.id);
            assert.strictEqual(data.success, true);
            assert.ok(data.version_group, 'should have version_group');
            assert.strictEqual(data.version, 1);
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

        // --- Dataset Language Variants ---
        it('POST /api/datasets with language creates dataset with language fields', async () => {
            const res = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Lang Test', language: 'en' }),
            });
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.id);
            assert.strictEqual(data.language, 'en');
            assert.ok(data.language_group);
            // Clean up
            await fetch(`${BASE_URL}/api/datasets/${data.id}`, { method: 'DELETE' });
        });

        it('creates language sibling sharing slug and group', async () => {
            // Create base dataset
            const res1 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Multi Lang', language: 'en' }),
            });
            const d1 = await res1.json();

            // Create sibling in same group
            const res2 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Multi Lang', language: 'de', language_group: d1.language_group }),
            });
            const d2 = await res2.json();
            assert.ok(d2.id);
            assert.strictEqual(d2.language, 'de');
            assert.strictEqual(d2.language_group, d1.language_group);
            assert.strictEqual(d2.slug, d1.slug); // Share slug

            // Clean up
            await fetch(`${BASE_URL}/api/datasets/${d2.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${d1.id}`, { method: 'DELETE' });
        });

        it('rejects duplicate language in group', async () => {
            const res1 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Dup Test', language: 'en' }),
            });
            const d1 = await res1.json();

            const res2 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Dup Test', language: 'en', language_group: d1.language_group }),
            });
            assert.strictEqual(res2.status, 400);

            await fetch(`${BASE_URL}/api/datasets/${d1.id}`, { method: 'DELETE' });
        });

        it('GET /api/datasets returns language fields', async () => {
            const res = await fetch(`${BASE_URL}/api/datasets`);
            const datasets = await res.json();
            assert.ok(Array.isArray(datasets));
            if (datasets.length > 0) {
                assert.ok('language' in datasets[0]);
                assert.ok('language_group' in datasets[0]);
            }
        });

        it('GET /api/datasets/:id/siblings returns group members', async () => {
            const res1 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Sib Test', language: 'en' }),
            });
            const d1 = await res1.json();

            const res2 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Sib Test', language: 'fr', language_group: d1.language_group }),
            });
            const d2 = await res2.json();

            const sibRes = await fetch(`${BASE_URL}/api/datasets/${d1.id}/siblings`);
            const siblings = await sibRes.json();
            assert.ok(Array.isArray(siblings));
            assert.strictEqual(siblings.length, 2);
            assert.ok(siblings.some(s => s.language === 'en'));
            assert.ok(siblings.some(s => s.language === 'fr'));

            await fetch(`${BASE_URL}/api/datasets/${d2.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${d1.id}`, { method: 'DELETE' });
        });

        it('set default applies to one specific variant only', async () => {
            const res1 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Def Single', language: 'en' }),
            });
            const d1 = await res1.json();

            const res2 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Def Single', language: 'de', language_group: d1.language_group }),
            });
            const d2 = await res2.json();

            // Set d1 (EN) as default
            await fetch(`${BASE_URL}/api/datasets/${d1.id}/default`, { method: 'PUT' });

            // Only d1 should be default, not d2
            const listRes = await fetch(`${BASE_URL}/api/datasets`);
            const all = await listRes.json();
            const g1 = all.find(d => d.id === d1.id);
            const g2 = all.find(d => d.id === d2.id);
            assert.strictEqual(g1.is_default, true);
            assert.strictEqual(g2.is_default, false);

            // Now set d2 (DE) as default — d1 should lose default
            await fetch(`${BASE_URL}/api/datasets/${d2.id}/default`, { method: 'PUT' });
            const listRes2 = await fetch(`${BASE_URL}/api/datasets`);
            const all2 = await listRes2.json();
            assert.strictEqual(all2.find(d => d.id === d1.id).is_default, false);
            assert.strictEqual(all2.find(d => d.id === d2.id).is_default, true);

            // Create another dataset and set it as default to allow cleanup
            const res3 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Other Default' }),
            });
            const d3 = await res3.json();
            await fetch(`${BASE_URL}/api/datasets/${d3.id}/default`, { method: 'PUT' });

            await fetch(`${BASE_URL}/api/datasets/${d2.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${d1.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${d3.id}`, { method: 'DELETE' });
        });

        it('toggle public applies per individual language variant', async () => {
            const res1 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Pub Indiv', language: 'en' }),
            });
            const d1 = await res1.json();

            const res2 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Pub Indiv', language: 'es', language_group: d1.language_group }),
            });
            const d2 = await res2.json();

            // Toggle public on d1 only
            await fetch(`${BASE_URL}/api/datasets/${d1.id}/public`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_public: true }),
            });

            // d1 should be public, d2 should remain private
            const listRes = await fetch(`${BASE_URL}/api/datasets`);
            const all = await listRes.json();
            const g1 = all.find(d => d.id === d1.id);
            const g2 = all.find(d => d.id === d2.id);
            assert.strictEqual(g1.is_public, true);
            assert.strictEqual(g2.is_public, false);

            await fetch(`${BASE_URL}/api/datasets/${d2.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${d1.id}`, { method: 'DELETE' });
        });

        it('structural propagation syncs section order to siblings', async () => {
            const res1 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Prop Test', language: 'en' }),
            });
            const d1 = await res1.json();

            const res2 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Prop Test', language: 'de', language_group: d1.language_group }),
            });
            const d2 = await res2.json();

            // Modify section order (reorder sections on live data)
            await fetch(`${BASE_URL}/api/sections/order`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sections: [
                    { key: 'skills', visible: true, sort_order: 0 },
                    { key: 'about', visible: true, sort_order: 1 },
                    { key: 'experience', visible: false, sort_order: 2 },
                ] }),
            });

            // Save d1 (triggers propagation)
            await fetch(`${BASE_URL}/api/datasets/${d1.id}/save`, { method: 'POST' });

            // Check d2 got the structural update
            const slugRes = await fetch(`${BASE_URL}/api/datasets/slug/${d2.slug}/de`);
            const d2Data = await slugRes.json();
            if (d2Data.sectionOrder) {
                const skills = d2Data.sectionOrder.find(s => s.key === 'skills');
                if (skills) assert.strictEqual(skills.sort_order, 0);
            }

            await fetch(`${BASE_URL}/api/datasets/${d2.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${d1.id}`, { method: 'DELETE' });
        });

        // --- Backend Versioning ---
        it('creating new version increments version number', async () => {
            const res1 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Ver Test' }),
            });
            const d1 = await res1.json();
            assert.strictEqual(d1.version, 1);
            assert.ok(d1.version_group);

            // Create v2 using the version_group
            const res2 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Ver Test v2', version_group: d1.version_group }),
            });
            const d2 = await res2.json();
            assert.strictEqual(d2.version, 2);
            assert.strictEqual(d2.version_group, d1.version_group);

            await fetch(`${BASE_URL}/api/datasets/${d2.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${d1.id}`, { method: 'DELETE' });
        });

        it('new version copies language siblings from previous version', async () => {
            // Create v1 EN
            const res1 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'ML Ver', language: 'en' }),
            });
            const d1 = await res1.json();

            // Add DE to v1
            const res2 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'ML Ver', language: 'de', language_group: d1.language_group }),
            });
            const d2 = await res2.json();

            // Create v2 using version_group
            const res3 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'ML Ver v2', language: 'en', version_group: d1.version_group }),
            });
            const d3 = await res3.json();
            assert.strictEqual(d3.version, 2);

            // Check that DE was also copied to v2
            const listRes = await fetch(`${BASE_URL}/api/datasets`);
            const all = await listRes.json();
            const v2Items = all.filter(d => d.version_group === d1.version_group && d.version === 2);
            assert.strictEqual(v2Items.length, 2);
            assert.ok(v2Items.some(d => d.language === 'en'));
            assert.ok(v2Items.some(d => d.language === 'de'));
            // v2 should have a different language_group than v1
            assert.notStrictEqual(v2Items[0].language_group, d1.language_group);

            // Cleanup
            for (const d of v2Items) await fetch(`${BASE_URL}/api/datasets/${d.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${d2.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${d1.id}`, { method: 'DELETE' });
        });

        it('datasets in same version_group share slug', async () => {
            const res1 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Slug Share' }),
            });
            const d1 = await res1.json();

            const res2 = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Slug Share v2', version_group: d1.version_group }),
            });
            const d2 = await res2.json();
            assert.strictEqual(d2.slug, d1.slug, 'versions should share the same slug');

            await fetch(`${BASE_URL}/api/datasets/${d2.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${d1.id}`, { method: 'DELETE' });
        });

        it('version_group and version returned in GET /api/datasets', async () => {
            const res = await fetch(`${BASE_URL}/api/datasets`);
            const datasets = await res.json();
            if (datasets.length > 0) {
                assert.ok('version_group' in datasets[0], 'should have version_group');
                assert.ok('version' in datasets[0], 'should have version');
            }
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

        describe('ATS PDF export localization', () => {
            async function exportAts(locale) {
                const res = await fetch(`${BASE_URL}/api/export/ats-pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scale: 1, paperSize: 'A4', locale }),
                });
                assert.strictEqual(res.status, 200, `ATS export for locale=${locale} should return 200`);
                assert.strictEqual(
                    res.headers.get('content-type'),
                    'application/pdf',
                    `ATS export for locale=${locale} should return application/pdf`
                );
                const buf = Buffer.from(await res.arrayBuffer());
                assert.ok(buf.length > 0, `ATS export for locale=${locale} should be non-empty`);
                assert.strictEqual(
                    buf.slice(0, 4).toString('latin1'),
                    '%PDF',
                    `ATS export for locale=${locale} should start with %PDF header`
                );
                return buf;
            }

            function extractLangTag(buf) {
                // PDF /Catalog dictionary is not compressed — /Lang (xx) is readable as plain bytes.
                const m = buf.toString('latin1').match(/\/Lang\s*\(([^)]+)\)/);
                return m ? m[1] : null;
            }

            it('returns a valid localized PDF for each supported locale', async () => {
                // Seed at least one experience so the PDF contains section headings.
                await fetch(`${BASE_URL}/api/experiences`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        job_title: 'ATS Test Engineer',
                        company_name: 'LocalizationCo',
                        start_date: '2020-01',
                        end_date: '',
                        location: 'Remote',
                        highlights: ['Verified localized export'],
                    }),
                });

                for (const locale of ['en', 'de', 'fr', 'nl', 'es', 'it', 'pt', 'zh']) {
                    const buf = await exportAts(locale);
                    const lang = extractLangTag(buf);
                    assert.strictEqual(
                        lang, locale,
                        `PDF /Lang metadata for locale=${locale} should be "${locale}", got "${lang}"`
                    );
                }
            });

            it('produces different PDF content for different locales', async () => {
                // If localization wired up correctly, the German PDF must differ from the
                // English one (section headings, "Present", "Technologies:", PDF metadata
                // etc. are all different strings with different lengths). A regression that
                // drops serverT() calls would make the bodies identical except for the
                // /Lang tag — so normalize that before comparing to avoid a false pass.
                const enBuf = await exportAts('en');
                const deBuf = await exportAts('de');
                const stripLang = s => s.replace(/\/Lang\s*\([^)]+\)/, '/Lang(XX)');
                const enNorm = stripLang(enBuf.toString('latin1'));
                const deNorm = stripLang(deBuf.toString('latin1'));
                assert.notStrictEqual(
                    enNorm, deNorm,
                    'EN and DE ATS PDFs should differ in content beyond the /Lang tag — if ' +
                    'identical after normalization, serverT() is not being applied to PDF body text'
                );
                // File length should also differ because translated strings are different lengths.
                assert.notStrictEqual(
                    enBuf.length, deBuf.length,
                    'EN and DE PDF byte lengths should differ — identical lengths suggest localization regressed'
                );
            });

            it('falls back to English for an unknown locale', async () => {
                const buf = await exportAts('xx-unknown');
                assert.strictEqual(extractLangTag(buf), 'en');
            });

            it('accepts request without locale and still returns a valid PDF', async () => {
                // Server should fall back to the stored language setting, then to English.
                const res = await fetch(`${BASE_URL}/api/export/ats-pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scale: 1, paperSize: 'A4' }),
                });
                assert.strictEqual(res.status, 200);
                const buf = Buffer.from(await res.arrayBuffer());
                assert.strictEqual(buf.slice(0, 4).toString('latin1'), '%PDF');
                assert.ok(extractLangTag(buf), 'PDF should still carry a /Lang tag');
            });
        });

        describe('Bold markdown (**word**) handling', () => {
            it('strips ** markers from og:description / meta description on SSR', async () => {
                // The SSR path depends on whether a default dataset exists. Fetch the
                // page once up-front to see which bio source is authoritative, then
                // write the marker-bearing bio into that same source so we know the
                // test exercises the stripping path regardless of earlier state.
                const currentProfile = await (await fetch(`${BASE_URL}/api/profile`)).json();
                const bioWithBold = 'I built a **real-time** pipeline and led **three launches**.';
                await fetch(`${BASE_URL}/api/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...currentProfile, bio: bioWithBold }),
                });

                const res = await fetch(`${PUBLIC_URL}/`);
                assert.strictEqual(res.status, 200);
                const html = await res.text();
                // Neither meta description nor og:description should ever contain literal ** markers.
                const metas = [...html.matchAll(/<meta\s+(?:name|property)="(?:description|og:description)"\s+content="([^"]*)"/g)];
                assert.ok(metas.length >= 1, 'response should contain at least one description meta tag');
                for (const m of metas) {
                    assert.ok(
                        !m[1].includes('**'),
                        `meta description should not contain ** markers (got: ${m[1]})`
                    );
                }
            });

            it('renders **bold** as Helvetica-Bold runs in ATS PDF without literal ** markers', async () => {
                // Seed data containing **markers** in multiple fields.
                await fetch(`${BASE_URL}/api/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'PDF Bold Test',
                        bio: 'Emphasize **achievements** in the summary.',
                    }),
                });
                // Wipe previous seeded experience rows to keep the PDF small + predictable.
                const existing = await (await fetch(`${BASE_URL}/api/experiences`)).json();
                for (const e of existing) {
                    await fetch(`${BASE_URL}/api/experiences/${e.id}`, { method: 'DELETE' });
                }
                await fetch(`${BASE_URL}/api/experiences`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        job_title: 'Bold Engineer',
                        company_name: 'BoldCo',
                        start_date: '2021-01',
                        end_date: '',
                        highlights: ['Shipped a **real-time** feature to millions of users'],
                    }),
                });

                const res = await fetch(`${BASE_URL}/api/export/ats-pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scale: 1, paperSize: 'A4', locale: 'en' }),
                });
                assert.strictEqual(res.status, 200);
                const buf = Buffer.from(await res.arrayBuffer());
                const latin = buf.toString('latin1');

                // Bold font must be embedded because at least one run needs it.
                assert.ok(
                    latin.includes('Helvetica-Bold'),
                    'PDF should embed Helvetica-Bold font once **bold** markers appear in content'
                );
                // Literal ** markers must not leak through to the rendered PDF text.
                // The raw content streams in this codebase are uncompressed text, so a
                // substring search is a reasonable smoke test.
                assert.ok(
                    !/\*\*[A-Za-z]/.test(latin),
                    'rendered PDF bytes should not contain literal "**word" sequences'
                );
            });

            it('renders *italic* as Helvetica-Oblique runs and strips leading "- " in bullets', async () => {
                await fetch(`${BASE_URL}/api/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'PDF Markdown Test',
                        bio: 'Hello *world* and welcome.',
                    }),
                });
                const existing = await (await fetch(`${BASE_URL}/api/experiences`)).json();
                for (const e of existing) {
                    await fetch(`${BASE_URL}/api/experiences/${e.id}`, { method: 'DELETE' });
                }
                await fetch(`${BASE_URL}/api/experiences`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        job_title: 'Markdown Engineer',
                        company_name: 'MD Co',
                        start_date: '2022-01',
                        end_date: '',
                        // Leading "- " should be stripped so the PDF bullet glyph
                        // is not duplicated; *italic* should render in oblique font.
                        highlights: ['- Wrote *clean* code'],
                    }),
                });

                const res = await fetch(`${BASE_URL}/api/export/ats-pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scale: 1, paperSize: 'A4', locale: 'en' }),
                });
                assert.strictEqual(res.status, 200);
                const buf = Buffer.from(await res.arrayBuffer());
                const latin = buf.toString('latin1');

                assert.ok(
                    latin.includes('Helvetica-Oblique'),
                    'PDF should embed Helvetica-Oblique once *italic* markers appear in content'
                );
                assert.ok(
                    !/\*[A-Za-z]+\*/.test(latin),
                    'rendered PDF bytes should not contain literal "*word*" sequences'
                );
            });

            it('routes "- " bullet lines from description fields through the PDF bullet list', async () => {
                // Seed a project description containing markdown bullet lines.
                // We can't substring-match rendered text in the encoded PDF stream,
                // so instead we verify (a) the structural list operator "/L" tag
                // appears (PDF tagged bullet list, emitted only by addBulletList)
                // and (b) no literal "- " line marker leaks through verbatim.
                await fetch(`${BASE_URL}/api/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: 'PDF Description Test', bio: 'short bio' }),
                });
                const existingProjects = await (await fetch(`${BASE_URL}/api/projects`)).json();
                for (const p of existingProjects) {
                    await fetch(`${BASE_URL}/api/projects/${p.id}`, { method: 'DELETE' });
                }
                await fetch(`${BASE_URL}/api/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: 'Bullet Project',
                        description: 'Highlights:\n- shipped feature A\n- reduced bundle 40%',
                        technologies: [],
                    }),
                });

                const res = await fetch(`${BASE_URL}/api/export/ats-pdf`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scale: 1, paperSize: 'A4', locale: 'en' }),
                });
                assert.strictEqual(res.status, 200);
                const buf = Buffer.from(await res.arrayBuffer());
                const latin = buf.toString('latin1');

                // The PDF tagged-structure markers for a bullet list must be present.
                // addBulletList wraps each list in /L and each item in /LI + /Lbl + /LBody.
                assert.ok(/\/L\b/.test(latin) && /\/LI\b/.test(latin),
                    'PDF should contain /L and /LI tagged-structure entries from addBulletList');
                assert.ok(/\/Lbl\b/.test(latin),
                    'PDF should contain /Lbl entries (one per bullet) from addBulletList');
                // No literal "- shipped" / "- reduced" survives: bullet marker stripped.
                assert.ok(!/-\s+shipped/.test(latin),
                    'PDF text stream should not contain literal "- shipped"');
                assert.ok(!/-\s+reduced/.test(latin),
                    'PDF text stream should not contain literal "- reduced"');
            });

            it('stripMarkdown removes italic / underscore markers as well as bold', () => {
                // Direct unit-style test of the helper exposed by the server module.
                // We require the file fresh so we get the real exported helpers; the
                // already-running test server is a separate child process.
                const path = require('node:path');
                const serverPath = path.join(__dirname, '..', 'src', 'server.js');
                // The server module isn't a typical require()-able module (it boots
                // listeners as a side effect), so instead read its source and extract
                // stripMarkdown as a standalone function, mirroring the frontend test
                // pattern. This keeps the test hermetic.
                const fs = require('node:fs');
                const src = fs.readFileSync(serverPath, 'utf8');
                const m = src.match(/function stripMarkdown\(text\)\s*\{[\s\S]*?\n\}/);
                assert.ok(m, 'should find stripMarkdown in server.js');
                const stripMarkdown = new Function(`${m[0]}\nreturn stripMarkdown;`)();

                assert.strictEqual(stripMarkdown('Built a **fast** system.'), 'Built a fast system.');
                assert.strictEqual(stripMarkdown('A *resilient* design.'), 'A resilient design.');
                assert.strictEqual(stripMarkdown('Very _scalable_ stack.'), 'Very scalable stack.');
                assert.strictEqual(stripMarkdown('Mixes **bold** with *italic*.'), 'Mixes bold with italic.');
                // snake_case identifiers must survive stripping.
                assert.strictEqual(stripMarkdown('use foo_bar_baz here'), 'use foo_bar_baz here');
                // Empty / null
                assert.strictEqual(stripMarkdown(''), '');
                assert.strictEqual(stripMarkdown(null), '');
            });
        });
    });

    describe('Section title overrides', () => {
        // Each test creates its own datasets so they don't leak state.
        async function createDataset(name, language, language_group) {
            const body = { name, language };
            if (language_group) body.language_group = language_group;
            const res = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
            assert.strictEqual(res.status, 200, `create ${name}/${language}`);
            return res.json();
        }
        async function del(id) {
            await fetch(`${BASE_URL}/api/datasets/${id}`, { method: 'DELETE' });
        }

        it('apply_to_language=true writes the name to every same-language dataset and overwrites existing overrides', async () => {
            const a = await createDataset('Override Base A', 'en');
            const b = await createDataset('Override Base B', 'en');
            const sibling = await createDataset('Override Base Sibling FR', 'fr', a.language_group);

            // Pre-seed B with a different per-dataset override so we can verify it gets overwritten.
            const pre = await fetch(`${BASE_URL}/api/sections/rename`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_key: 'experience', new_name: 'B Pre-Rename', dataset_id: b.id, apply_to_language: false })
            });
            assert.strictEqual(pre.status, 200);

            // Language-wide rename on A — should overwrite B's prior per-dataset override.
            const res = await fetch(`${BASE_URL}/api/sections/rename`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_key: 'experience', new_name: 'Career Highlights', dataset_id: a.id, apply_to_language: true })
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.strictEqual(body.applied_to_language, true);

            const aOrder = await (await fetch(`${BASE_URL}/api/sections/order?dataset_id=${a.id}`)).json();
            const bOrder = await (await fetch(`${BASE_URL}/api/sections/order?dataset_id=${b.id}`)).json();
            const sOrder = await (await fetch(`${BASE_URL}/api/sections/order?dataset_id=${sibling.id}`)).json();
            const pick = arr => arr.find(s => s.key === 'experience');
            assert.strictEqual(pick(aOrder).name, 'Career Highlights');
            assert.strictEqual(pick(bOrder).name, 'Career Highlights', 'same-language sibling overwritten');
            assert.notStrictEqual(pick(sOrder).name, 'Career Highlights', 'other-language sibling must NOT be touched');

            await del(a.id); await del(b.id); await del(sibling.id);
        });

        it('apply_to_language=false touches only the active dataset', async () => {
            const a = await createDataset('Local Rename A', 'en');
            const b = await createDataset('Local Rename B', 'en');

            const res = await fetch(`${BASE_URL}/api/sections/rename`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_key: 'skills', new_name: 'My Skills', dataset_id: a.id, apply_to_language: false })
            });
            assert.strictEqual(res.status, 200);

            const aOrder = await (await fetch(`${BASE_URL}/api/sections/order?dataset_id=${a.id}`)).json();
            const bOrder = await (await fetch(`${BASE_URL}/api/sections/order?dataset_id=${b.id}`)).json();
            const pick = arr => arr.find(s => s.key === 'skills');
            assert.strictEqual(pick(aOrder).name, 'My Skills');
            assert.notStrictEqual(pick(bOrder).name, 'My Skills', 'per-dataset-only rename must not leak to other datasets');

            await del(a.id); await del(b.id);
        });

        it('resets the title when new_name is empty (language and dataset cleared)', async () => {
            const a = await createDataset('Reset Test A', 'en');
            // Set a language-wide override first
            await fetch(`${BASE_URL}/api/sections/rename`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_key: 'education', new_name: 'Studies', dataset_id: a.id, apply_to_language: true })
            });
            let aOrder = await (await fetch(`${BASE_URL}/api/sections/order?dataset_id=${a.id}`)).json();
            assert.strictEqual(aOrder.find(s => s.key === 'education').name, 'Studies');

            // Reset via empty string
            const res = await fetch(`${BASE_URL}/api/sections/rename`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_key: 'education', new_name: '', dataset_id: a.id, apply_to_language: true })
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.reset, true);

            aOrder = await (await fetch(`${BASE_URL}/api/sections/order?dataset_id=${a.id}`)).json();
            const entry = aOrder.find(s => s.key === 'education');
            assert.notStrictEqual(entry.name, 'Studies', 'title should no longer equal the removed override');

            await del(a.id);
        });

        it('custom section rename with apply_to_language=true propagates to same-language siblings only', async () => {
            // Create a custom section
            const createRes = await fetch(`${BASE_URL}/api/custom-sections`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Original Name', layout_type: 'grid-3', icon: 'layers' })
            });
            assert.strictEqual(createRes.status, 200);
            const cs = await createRes.json();

            const a = await createDataset('Custom Rename A', 'en');
            const b = await createDataset('Custom Rename B', 'en');
            const sibling = await createDataset('Custom Rename Sibling FR', 'fr', a.language_group);

            const res = await fetch(`${BASE_URL}/api/sections/rename`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_key: cs.section_key, new_name: 'Renamed Custom', dataset_id: a.id, apply_to_language: true })
            });
            assert.strictEqual(res.status, 200);

            const aOrder = await (await fetch(`${BASE_URL}/api/sections/order?dataset_id=${a.id}`)).json();
            const bOrder = await (await fetch(`${BASE_URL}/api/sections/order?dataset_id=${b.id}`)).json();
            const sOrder = await (await fetch(`${BASE_URL}/api/sections/order?dataset_id=${sibling.id}`)).json();
            const pick = arr => arr.find(s => s.key === cs.section_key);
            assert.strictEqual(pick(aOrder).name, 'Renamed Custom');
            assert.strictEqual(pick(bOrder).name, 'Renamed Custom');
            assert.notStrictEqual(pick(sOrder).name, 'Renamed Custom', 'fr sibling must keep its own title');

            // Cleanup. The custom section delete cascades the override row away;
            // we rely on the server's DELETE FROM section_title_overrides in DELETE /api/custom-sections.
            await fetch(`${BASE_URL}/api/custom-sections/${cs.id}`, { method: 'DELETE' });
            await del(a.id); await del(b.id); await del(sibling.id);
        });

        it('rename endpoint rejects requests without dataset_id', async () => {
            const res = await fetch(`${BASE_URL}/api/sections/rename`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_key: 'experience', new_name: 'X', apply_to_language: false })
            });
            assert.strictEqual(res.status, 400);
        });

        it('public dataset endpoint returns the per-dataset rename in sectionOrder.name', async () => {
            const a = await createDataset('Public Rename A', 'en');
            // Make it fetchable on the public server
            await fetch(`${BASE_URL}/api/datasets/${a.id}/public`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_public: true })
            });
            await fetch(`${BASE_URL}/api/sections/rename`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ section_key: 'experience', new_name: 'Public Experience', dataset_id: a.id, apply_to_language: false })
            });
            const publicRes = await fetch(`${PUBLIC_URL}/api/datasets/id/${a.id}`);
            assert.strictEqual(publicRes.status, 200);
            const publicData = await publicRes.json();
            const entry = publicData.sectionOrder.find(s => s.key === 'experience');
            assert.strictEqual(entry.name, 'Public Experience', 'public side must see the rename');
            assert.strictEqual(entry.display_name, 'Public Experience');
            await del(a.id);
        });

        it('public dataset endpoint re-resolves section titles in the dataset language', async () => {
            // Fresh en+fr sibling pair; fr sibling must return French section titles
            // even if section_visibility.display_name (frozen legacy column) is null.
            const en = await createDataset('Lang Resolve EN', 'en');
            const fr = await createDataset('Lang Resolve FR', 'fr', en.language_group);
            await fetch(`${BASE_URL}/api/datasets/${fr.id}/public`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_public: true })
            });
            const publicRes = await fetch(`${PUBLIC_URL}/api/datasets/id/${fr.id}`);
            const publicData = await publicRes.json();
            const expEntry = publicData.sectionOrder.find(s => s.key === 'experience');
            // The French translation of `section.experience` in fr.json is
            // "Expérience professionnelle". Assert it's not the English default.
            assert.notStrictEqual(expEntry.name, 'Work Experience', 'FR sibling should not carry English title');
            assert.match(expEntry.name, /Expérience/, 'FR sibling should show French title');
            await del(en.id); await del(fr.id);
        });
    });

    describe('Theme management', () => {
        async function getJson(url) { const r = await fetch(url); return r.json(); }
        async function putJson(url, body) {
            const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            return r.json();
        }
        async function createDs(name) {
            const r = await fetch(`${BASE_URL}/api/datasets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, language: 'en' }) });
            return r.json();
        }
        async function delDs(id) { await fetch(`${BASE_URL}/api/datasets/${id}`, { method: 'DELETE' }); }

        it('GET /api/theme returns defaults when nothing has been set', async () => {
            // Reset known keys first
            await fetch(`${BASE_URL}/api/settings/themeColor`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: null }) });
            const theme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(typeof theme, 'object');
            assert.ok(/^#[0-9a-fA-F]{6}$/.test(theme.primary), 'primary is a hex color');
            assert.strictEqual(theme.fontFamily, 'Inter');
        });

        it('PUT /api/theme rejects invalid primary color', async () => {
            const r = await fetch(`${BASE_URL}/api/theme`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ primary: 'not-a-color' }) });
            assert.strictEqual(r.status, 400);
        });

        it('PUT /api/theme with applyToAll=true writes theme into every dataset.data.theme', async () => {
            const a = await createDs('Theme Bulk A');
            const b = await createDs('Theme Bulk B');
            const result = await putJson(`${BASE_URL}/api/theme`, {
                primary: '#ff0000', gradientEnd: '#440000', fontFamily: 'Roboto', applyToAll: true
            });
            assert.strictEqual(result.success, true);
            // Both datasets should now have the new theme embedded
            const aData = await getJson(`${BASE_URL}/api/datasets/id/${a.id}`);
            const bData = await getJson(`${BASE_URL}/api/datasets/id/${b.id}`);
            assert.strictEqual(aData.theme.primary, '#ff0000');
            assert.strictEqual(aData.theme.gradientEnd, '#440000');
            assert.strictEqual(aData.theme.fontFamily, 'Roboto');
            assert.strictEqual(bData.theme.primary, '#ff0000');
            assert.strictEqual(bData.theme.fontFamily, 'Roboto');
            // Settings also reflect the new theme
            const settingsTheme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(settingsTheme.primary, '#ff0000');
            await delDs(a.id); await delDs(b.id);
        });

        it('PUT /api/theme with applyToAll=false only updates currentDatasetId (and its language siblings), not unrelated datasets', async () => {
            const a = await createDs('Theme Solo A');
            const b = await createDs('Theme Solo B');
            // Seed both with one theme via applyToAll
            await putJson(`${BASE_URL}/api/theme`, { primary: '#00ff00', bulletStyle: 'triangle', applyToAll: true });
            // Now change only `a` with applyToAll=false (covers bulletStyle too)
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0000ff', fontFamily: 'Lato', bulletStyle: 'star', applyToAll: false, currentDatasetId: a.id });
            const aData = await getJson(`${BASE_URL}/api/datasets/id/${a.id}`);
            const bData = await getJson(`${BASE_URL}/api/datasets/id/${b.id}`);
            assert.strictEqual(aData.theme.primary, '#0000ff', 'A picks up the new theme');
            assert.strictEqual(aData.theme.fontFamily, 'Lato');
            assert.strictEqual(aData.theme.bulletStyle, 'star', 'A picks up the new bulletStyle');
            assert.strictEqual(bData.theme.primary, '#00ff00', 'B (no shared language_group) retains the prior bulk-applied theme');
            assert.strictEqual(bData.theme.bulletStyle, 'triangle', 'B retains its prior bulletStyle');
            await delDs(a.id); await delDs(b.id);
        });

        it('PUT /api/theme with applyToAll=false also propagates to language siblings', async () => {
            // Two datasets in the same language_group
            const en = await createDs('Theme Sibling Group');
            const frRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Theme Sibling Group', language: 'fr', language_group: en.language_group })
            });
            const fr = await frRes.json();
            // Apply a per-dataset theme (toggle off) on the English one — including a bulletStyle
            await putJson(`${BASE_URL}/api/theme`, {
                primary: '#aabbcc', gradientStart: '#112233', gradientEnd: '#445566',
                fontFamily: 'Roboto', bulletStyle: 'bolt', applyToAll: false, currentDatasetId: en.id
            });
            const enData = await getJson(`${BASE_URL}/api/datasets/id/${en.id}`);
            const frData = await getJson(`${BASE_URL}/api/datasets/id/${fr.id}`);
            assert.strictEqual(enData.theme.primary, '#aabbcc');
            assert.strictEqual(enData.theme.bulletStyle, 'bolt');
            assert.strictEqual(frData.theme.primary, '#aabbcc', 'sibling FR variant inherits the new theme');
            assert.strictEqual(frData.theme.gradientStart, '#112233');
            assert.strictEqual(frData.theme.gradientEnd, '#445566');
            assert.strictEqual(frData.theme.fontFamily, 'Roboto');
            assert.strictEqual(frData.theme.bulletStyle, 'bolt', 'sibling FR variant inherits the bulletStyle');
            await delDs(en.id); await delDs(fr.id);
        });

        it('PUT /api/theme persists both gradientStart and gradientEnd; clears them when null', async () => {
            await putJson(`${BASE_URL}/api/theme`, { primary: '#abcdef', gradientStart: '#222222', gradientEnd: '#123456', applyToAll: false });
            let theme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(theme.gradientStart, '#222222');
            assert.strictEqual(theme.gradientEnd, '#123456');
            await putJson(`${BASE_URL}/api/theme`, { primary: '#abcdef', gradientStart: null, gradientEnd: null, applyToAll: false });
            theme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(theme.gradientStart, null);
            assert.strictEqual(theme.gradientEnd, null);
        });

        it('PUT /api/theme rejects invalid bulletStyle', async () => {
            const r = await fetch(`${BASE_URL}/api/theme`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ primary: '#0066ff', bulletStyle: 'not-a-style' })
            });
            assert.strictEqual(r.status, 400);
        });

        it('PUT /api/theme persists bulletStyle into settings and dataset.data.theme', async () => {
            const a = await createDs('Bullet Style Dataset');
            const result = await putJson(`${BASE_URL}/api/theme`, {
                primary: '#0066ff', bulletStyle: 'star', applyToAll: true
            });
            assert.strictEqual(result.success, true);
            const settingsTheme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(settingsTheme.bulletStyle, 'star');
            const aData = await getJson(`${BASE_URL}/api/datasets/id/${a.id}`);
            assert.strictEqual(aData.theme.bulletStyle, 'star');
            await delDs(a.id);
        });

        it('PUT /api/theme defaults bulletStyle to "triangle" when omitted', async () => {
            // Seed a non-default bullet, then omit the field on a later PUT
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0066ff', bulletStyle: 'check', applyToAll: false });
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0066ff', applyToAll: false });
            const theme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(theme.bulletStyle, 'triangle');
        });

        it('PUT /api/theme rejects invalid sectionTitleColor', async () => {
            const r = await fetch(`${BASE_URL}/api/theme`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ primary: '#0066ff', sectionTitleColor: 'not-a-color' })
            });
            assert.strictEqual(r.status, 400);
        });

        it('PUT /api/theme persists sectionTitleColor into settings and every dataset when applyToAll=true', async () => {
            const a = await createDs('Section Title Bulk A');
            const b = await createDs('Section Title Bulk B');
            const result = await putJson(`${BASE_URL}/api/theme`, {
                primary: '#0066ff', sectionTitleColor: '#001a4d', applyToAll: true
            });
            assert.strictEqual(result.success, true);
            const settingsTheme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(settingsTheme.sectionTitleColor, '#001a4d');
            const aData = await getJson(`${BASE_URL}/api/datasets/id/${a.id}`);
            const bData = await getJson(`${BASE_URL}/api/datasets/id/${b.id}`);
            assert.strictEqual(aData.theme.sectionTitleColor, '#001a4d');
            assert.strictEqual(bData.theme.sectionTitleColor, '#001a4d');
            await delDs(a.id); await delDs(b.id);
        });

        it('PUT /api/theme with applyToAll=false only updates currentDatasetId sectionTitleColor', async () => {
            const a = await createDs('Section Title Solo A');
            const b = await createDs('Section Title Solo B');
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0066ff', sectionTitleColor: '#111827', applyToAll: true });
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0066ff', sectionTitleColor: '#000000', applyToAll: false, currentDatasetId: a.id });
            const aData = await getJson(`${BASE_URL}/api/datasets/id/${a.id}`);
            const bData = await getJson(`${BASE_URL}/api/datasets/id/${b.id}`);
            assert.strictEqual(aData.theme.sectionTitleColor, '#000000', 'A picks up the new sectionTitleColor');
            assert.strictEqual(bData.theme.sectionTitleColor, '#111827', 'B retains the prior bulk-applied sectionTitleColor');
            await delDs(a.id); await delDs(b.id);
        });

        it('PUT /api/theme with applyToAll=false propagates sectionTitleColor to language siblings', async () => {
            const en = await createDs('Section Title Sibling Group');
            const frRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Section Title Sibling Group', language: 'fr', language_group: en.language_group })
            });
            const fr = await frRes.json();
            await putJson(`${BASE_URL}/api/theme`, {
                primary: '#0066ff', sectionTitleColor: '#1e3a8a', applyToAll: false, currentDatasetId: en.id
            });
            const enData = await getJson(`${BASE_URL}/api/datasets/id/${en.id}`);
            const frData = await getJson(`${BASE_URL}/api/datasets/id/${fr.id}`);
            assert.strictEqual(enData.theme.sectionTitleColor, '#1e3a8a');
            assert.strictEqual(frData.theme.sectionTitleColor, '#1e3a8a', 'sibling FR variant inherits sectionTitleColor');
            await delDs(en.id); await delDs(fr.id);
        });

        it('PUT /api/theme clears sectionTitleColor when set to null', async () => {
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0066ff', sectionTitleColor: '#000000', applyToAll: false });
            let theme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(theme.sectionTitleColor, '#000000');
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0066ff', sectionTitleColor: null, applyToAll: false });
            theme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(theme.sectionTitleColor, null);
        });

        it('PUT /api/theme rejects invalid sectionRadius (out of range, non-integer, non-numeric)', async () => {
            for (const bad of [-1, 33, 1000, 3.5, 'foo']) {
                const r = await fetch(`${BASE_URL}/api/theme`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ primary: '#0066ff', sectionRadius: bad })
                });
                assert.strictEqual(r.status, 400, `expected 400 for sectionRadius=${bad}`);
            }
        });

        it('PUT /api/theme persists sectionRadius into settings and every dataset when applyToAll=true', async () => {
            const a = await createDs('Section Radius Bulk A');
            const b = await createDs('Section Radius Bulk B');
            const result = await putJson(`${BASE_URL}/api/theme`, {
                primary: '#0066ff', sectionRadius: 4, applyToAll: true
            });
            assert.strictEqual(result.success, true);
            const settingsTheme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(settingsTheme.sectionRadius, 4);
            const aData = await getJson(`${BASE_URL}/api/datasets/id/${a.id}`);
            const bData = await getJson(`${BASE_URL}/api/datasets/id/${b.id}`);
            assert.strictEqual(aData.theme.sectionRadius, 4);
            assert.strictEqual(bData.theme.sectionRadius, 4);
            await delDs(a.id); await delDs(b.id);
        });

        it('PUT /api/theme with applyToAll=false only updates currentDatasetId sectionRadius', async () => {
            const a = await createDs('Section Radius Solo A');
            const b = await createDs('Section Radius Solo B');
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0066ff', sectionRadius: 20, applyToAll: true });
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0066ff', sectionRadius: 0, applyToAll: false, currentDatasetId: a.id });
            const aData = await getJson(`${BASE_URL}/api/datasets/id/${a.id}`);
            const bData = await getJson(`${BASE_URL}/api/datasets/id/${b.id}`);
            assert.strictEqual(aData.theme.sectionRadius, 0, 'A picks up the new sectionRadius');
            assert.strictEqual(bData.theme.sectionRadius, 20, 'B retains the prior bulk-applied sectionRadius');
            await delDs(a.id); await delDs(b.id);
        });

        it('PUT /api/theme with applyToAll=false propagates sectionRadius to language siblings', async () => {
            const en = await createDs('Section Radius Sibling Group');
            const frRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Section Radius Sibling Group', language: 'fr', language_group: en.language_group })
            });
            const fr = await frRes.json();
            await putJson(`${BASE_URL}/api/theme`, {
                primary: '#0066ff', sectionRadius: 24, applyToAll: false, currentDatasetId: en.id
            });
            const enData = await getJson(`${BASE_URL}/api/datasets/id/${en.id}`);
            const frData = await getJson(`${BASE_URL}/api/datasets/id/${fr.id}`);
            assert.strictEqual(enData.theme.sectionRadius, 24);
            assert.strictEqual(frData.theme.sectionRadius, 24, 'sibling FR variant inherits sectionRadius');
            await delDs(en.id); await delDs(fr.id);
        });

        it('PUT /api/theme clears sectionRadius when set to null', async () => {
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0066ff', sectionRadius: 12, applyToAll: false });
            let theme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(theme.sectionRadius, 12);
            await putJson(`${BASE_URL}/api/theme`, { primary: '#0066ff', sectionRadius: null, applyToAll: false });
            theme = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(theme.sectionRadius, null);
        });

        it('Dataset load with embedded theme writes theme into settings', async () => {
            // Create a dataset, manually set its data.theme, then load it
            await putJson(`${BASE_URL}/api/theme`, { primary: '#aaaaaa', fontFamily: 'Inter', applyToAll: false });
            const a = await createDs('Theme Load Source');
            // Bulk-apply a custom theme so the dataset stores it
            await putJson(`${BASE_URL}/api/theme`, { primary: '#cc00cc', fontFamily: 'Merriweather', applyToAll: true });
            // Reset settings to a different theme
            await putJson(`${BASE_URL}/api/theme`, { primary: '#aaaaaa', fontFamily: 'Inter', applyToAll: false });
            const beforeLoad = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(beforeLoad.primary, '#aaaaaa');
            // Load the dataset — server should re-write the dataset's theme into settings
            const loadRes = await fetch(`${BASE_URL}/api/datasets/${a.id}/load`, { method: 'POST' });
            const loadJson = await loadRes.json();
            assert.strictEqual(loadJson.success, true);
            assert.ok(loadJson.theme, 'load response includes theme');
            assert.strictEqual(loadJson.theme.primary, '#cc00cc');
            const afterLoad = await getJson(`${BASE_URL}/api/theme`);
            assert.strictEqual(afterLoad.primary, '#cc00cc');
            assert.strictEqual(afterLoad.fontFamily, 'Merriweather');
            await delDs(a.id);
        });
    });

    describe('Copy section between datasets', () => {
        // Helpers — keep the setup local so these tests don't depend on other blocks' state
        async function postJson(url, body) {
            return fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        }
        async function putJson(url, body) {
            return fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        }
        async function createDataset(name, language = 'en') {
            const res = await postJson(`${BASE_URL}/api/datasets`, { name, language });
            assert.strictEqual(res.status, 200);
            return await res.json();
        }
        async function readTargetJson(id) {
            const res = await fetch(`${BASE_URL}/api/datasets/id/${id}`);
            assert.strictEqual(res.status, 200);
            return await res.json();
        }
        async function copySection(id, sectionKey) {
            return postJson(`${BASE_URL}/api/datasets/${id}/copy-section-from-live`, { sectionKey });
        }

        it('rejects invalid sectionKey with 400', async () => {
            const ds = await createDataset('Copy Invalid Key');
            const resTimeline = await copySection(ds.id, 'timeline');
            assert.strictEqual(resTimeline.status, 400);
            const resBogus = await copySection(ds.id, 'bogus-section');
            assert.strictEqual(resBogus.status, 400);
            const resMissing = await copySection(ds.id, '');
            assert.strictEqual(resMissing.status, 400);
            await fetch(`${BASE_URL}/api/datasets/${ds.id}`, { method: 'DELETE' });
        });

        it('returns 404 when target dataset is missing', async () => {
            const res = await copySection(999999, 'experience');
            assert.strictEqual(res.status, 404);
        });

        it('about: copies live profile into the target dataset JSON blob', async () => {
            // Arrange: seed the live profile with a distinctive value
            await putJson(`${BASE_URL}/api/profile`, {
                name: 'Live Profile Source',
                initials: 'LPS',
                title: 'Source Title',
                subtitle: 'Source Subtitle',
                bio: 'Source Bio',
                location: 'Nowhere',
                linkedin: '',
                email: 'src@example.com',
                phone: '',
                languages: '',
            });
            const target = await createDataset('Copy About Target');
            // Pre-copy: the target's stored profile.name should be whatever live data was at creation
            const before = await readTargetJson(target.id);
            const beforeName = before.profile?.name || null;

            // Mutate live profile with new name after creating the target
            await putJson(`${BASE_URL}/api/profile`, {
                ...before.profile,
                name: 'Edited After Target Creation',
                bio: 'New bio value',
            });

            const res = await copySection(target.id, 'about');
            assert.strictEqual(res.status, 200);

            const after = await readTargetJson(target.id);
            assert.strictEqual(after.profile.name, 'Edited After Target Creation');
            assert.strictEqual(after.profile.bio, 'New bio value');
            assert.notStrictEqual(after.profile.name, beforeName);

            await fetch(`${BASE_URL}/api/datasets/${target.id}`, { method: 'DELETE' });
        });

        it('experience: replaces the target dataset experiences array', async () => {
            // Arrange: create an experience on live, create target, then swap the experience
            const createExp1 = await postJson(`${BASE_URL}/api/experiences`, {
                job_title: 'Copy-src-role-1', company_name: 'CoA',
                start_date: '2020-01', end_date: '', location: 'Loc', highlights: [],
            });
            assert.strictEqual(createExp1.status, 200);
            const exp1 = await createExp1.json();

            const target = await createDataset('Copy Experience Target');

            // Swap: delete original live experience, create a new distinctive one
            await fetch(`${BASE_URL}/api/experiences/${exp1.id}`, { method: 'DELETE' });
            const createExp2 = await postJson(`${BASE_URL}/api/experiences`, {
                job_title: 'Copy-src-role-2', company_name: 'CoB',
                start_date: '2021-02', end_date: '', location: 'Loc2', highlights: ['highlight-a'],
            });
            assert.strictEqual(createExp2.status, 200);
            const exp2 = await createExp2.json();

            const copyRes = await copySection(target.id, 'experience');
            assert.strictEqual(copyRes.status, 200);

            const after = await readTargetJson(target.id);
            const titles = after.experiences.map(e => e.job_title);
            assert.ok(titles.includes('Copy-src-role-2'), 'target should receive the current live experience');
            assert.ok(!titles.includes('Copy-src-role-1'), 'old experience should not be present in target after copy');

            // Cleanup
            await fetch(`${BASE_URL}/api/experiences/${exp2.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${target.id}`, { method: 'DELETE' });
        });

        it('skills: replaces target categories and their nested skills', async () => {
            // Seed a distinctive skill category live
            const createCat = await postJson(`${BASE_URL}/api/skills`, {
                name: 'CopySrcCat-X', icon: 'default',
                skills: ['alpha', 'beta'],
            });
            assert.strictEqual(createCat.status, 200);
            const cat = await createCat.json();

            const target = await createDataset('Copy Skills Target');

            const copyRes = await copySection(target.id, 'skills');
            assert.strictEqual(copyRes.status, 200);

            const after = await readTargetJson(target.id);
            const match = (after.skills || []).find(c => c.name === 'CopySrcCat-X');
            assert.ok(match, 'target skills should include the copied category');
            assert.deepStrictEqual(match.skills, ['alpha', 'beta']);

            await fetch(`${BASE_URL}/api/skills/${cat.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${target.id}`, { method: 'DELETE' });
        });

        it('custom section: matched by section_key, overwrites items and preserves sort_order', async () => {
            // Create a custom section live
            const csRes = await postJson(`${BASE_URL}/api/custom-sections`, {
                name: 'CopyCustomMatch', layout_type: 'list', icon: 'layers',
            });
            assert.strictEqual(csRes.status, 200);
            const cs = await csRes.json();
            const sectionKey = cs.section_key;
            // Add one item live
            await postJson(`${BASE_URL}/api/custom-sections/${cs.id}/items`, {
                title: 'live-item-1', description: 'live desc',
            });

            // Create target dataset (it will snapshot the current custom section + item)
            const target = await createDataset('Copy Custom Match Target');

            // Mutate live custom section: change name, add second item
            await putJson(`${BASE_URL}/api/custom-sections/${cs.id}`, {
                name: 'CopyCustomMatch-renamed', layout_type: 'list', icon: 'layers',
            });
            await postJson(`${BASE_URL}/api/custom-sections/${cs.id}/items`, {
                title: 'live-item-2', description: 'second live desc',
            });

            // Read target's pre-copy snapshot to capture sort_order of matching section
            const before = await readTargetJson(target.id);
            const beforeMatch = (before.customSections || []).find(c => c.section_key === sectionKey);
            const preservedSortOrder = beforeMatch && beforeMatch.sort_order;

            const copyRes = await copySection(target.id, sectionKey);
            assert.strictEqual(copyRes.status, 200);

            const after = await readTargetJson(target.id);
            const match = (after.customSections || []).find(c => c.section_key === sectionKey);
            assert.ok(match, 'target should still contain the custom section');
            assert.strictEqual(match.name, 'CopyCustomMatch-renamed', 'target custom section name should be overwritten');
            const titles = (match.items || []).map(i => i.title);
            assert.ok(titles.includes('live-item-1'));
            assert.ok(titles.includes('live-item-2'));
            if (preservedSortOrder != null) {
                assert.strictEqual(match.sort_order, preservedSortOrder, 'target sort_order should be preserved');
            }

            // Ensure the section wasn't duplicated
            const dupes = (after.customSections || []).filter(c => c.section_key === sectionKey);
            assert.strictEqual(dupes.length, 1);

            await fetch(`${BASE_URL}/api/custom-sections/${cs.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${target.id}`, { method: 'DELETE' });
        });

        it('custom section: appends when target has no matching section_key or name', async () => {
            const csRes = await postJson(`${BASE_URL}/api/custom-sections`, {
                name: 'CopyCustomBrandNew', layout_type: 'cards', icon: 'star',
            });
            assert.strictEqual(csRes.status, 200);
            const cs = await csRes.json();
            const sectionKey = cs.section_key;
            await postJson(`${BASE_URL}/api/custom-sections/${cs.id}/items`, {
                title: 'brand-new-item', description: 'hello',
            });

            // Create target BEFORE the custom section is created, so target has no record of it
            // Instead, create the custom section first, then snapshot into target, then delete it from live
            // Approach: create a target that does NOT contain this section — use DELETE live after target creation
            // Simpler: create target first by deleting the custom section from live, then re-create it.
            // That's messy. Alternative: create custom section, then create target, then delete the section from target's JSON by loading a fresh state. Too complex.
            // Easiest: create the custom section AFTER creating the target. gatherCvData at target-creation time won't include it.
            await fetch(`${BASE_URL}/api/custom-sections/${cs.id}`, { method: 'DELETE' });
            const target = await createDataset('Copy Custom Append Target');
            // Re-create the custom section live with fresh data
            const csRes2 = await postJson(`${BASE_URL}/api/custom-sections`, {
                name: 'CopyCustomBrandNew', layout_type: 'cards', icon: 'star',
            });
            const cs2 = await csRes2.json();
            const sectionKey2 = cs2.section_key;
            await postJson(`${BASE_URL}/api/custom-sections/${cs2.id}/items`, {
                title: 'appended-item', description: 'appended',
            });

            const copyRes = await copySection(target.id, sectionKey2);
            assert.strictEqual(copyRes.status, 200);

            const after = await readTargetJson(target.id);
            const match = (after.customSections || []).find(c => c.section_key === sectionKey2);
            assert.ok(match, 'target should have the appended custom section');
            const titles = (match.items || []).map(i => i.title);
            assert.ok(titles.includes('appended-item'));
            // sectionVisibility and sectionOrder should include an entry for the new section
            assert.ok(after.sectionVisibility && sectionKey2 in after.sectionVisibility, 'sectionVisibility should include the new key');
            const orderEntry = (after.sectionOrder || []).find(e => e.key === sectionKey2);
            assert.ok(orderEntry, 'sectionOrder should include the new key');

            await fetch(`${BASE_URL}/api/custom-sections/${cs2.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/datasets/${target.id}`, { method: 'DELETE' });
        });

        it('custom section: returns 404 when source section is not present in live data', async () => {
            const target = await createDataset('Copy Custom 404 Target');
            const res = await copySection(target.id, 'custom_does_not_exist_9999');
            assert.strictEqual(res.status, 404);
            await fetch(`${BASE_URL}/api/datasets/${target.id}`, { method: 'DELETE' });
        });

        describe('copy-section-diff preview', () => {
            async function getDiff(id, sectionKey) {
                return postJson(`${BASE_URL}/api/datasets/${id}/copy-section-diff`, { sectionKey });
            }

            it('rejects invalid sectionKey with 400', async () => {
                const ds = await createDataset('Diff Invalid Key');
                const r = await getDiff(ds.id, 'timeline');
                assert.strictEqual(r.status, 400);
                await fetch(`${BASE_URL}/api/datasets/${ds.id}`, { method: 'DELETE' });
            });

            it('returns 404 when the target dataset is missing', async () => {
                const r = await getDiff(999999, 'experience');
                assert.strictEqual(r.status, 404);
            });

            it('returns before/after/parts and detects added lines after live mutation', async () => {
                // Seed live with one experience, snapshot, then mutate live so
                // the diff must report the change.
                const seed = await postJson(`${BASE_URL}/api/experiences`, {
                    job_title: 'Diff-seed-role', company_name: 'DiffCo',
                    start_date: '2020-01', end_date: '', location: 'L1', highlights: ['old-highlight'],
                });
                assert.strictEqual(seed.status, 200);
                const seedExp = await seed.json();

                const target = await createDataset('Diff Experience Target');

                // Mutate: add a second experience so live now differs from the
                // snapshot that was captured when the target was created.
                const second = await postJson(`${BASE_URL}/api/experiences`, {
                    job_title: 'Diff-added-role', company_name: 'DiffCo2',
                    start_date: '2022-05', end_date: '', location: 'L2', highlights: ['new-highlight'],
                });
                assert.strictEqual(second.status, 200);
                const secondExp = await second.json();

                const r = await getDiff(target.id, 'experience');
                assert.strictEqual(r.status, 200);
                const body = await r.json();
                assert.strictEqual(typeof body.before, 'string');
                assert.strictEqual(typeof body.after, 'string');
                assert.ok(Array.isArray(body.parts), 'parts should be an array');
                assert.strictEqual(body.unchanged, false);
                // The new experience's content must appear in an `added` part.
                const addedText = body.parts.filter(p => p.added).map(p => p.value).join('');
                assert.ok(addedText.includes('Diff-added-role'), 'added parts should contain the newly-added role');

                await fetch(`${BASE_URL}/api/experiences/${seedExp.id}`, { method: 'DELETE' });
                await fetch(`${BASE_URL}/api/experiences/${secondExp.id}`, { method: 'DELETE' });
                await fetch(`${BASE_URL}/api/datasets/${target.id}`, { method: 'DELETE' });
            });

            it('reports unchanged=true when target already matches live', async () => {
                // Fresh target snapshots live, so with no mutation afterwards
                // the serialized before/after must be identical.
                const target = await createDataset('Diff Unchanged Target');
                const r = await getDiff(target.id, 'about');
                assert.strictEqual(r.status, 200);
                const body = await r.json();
                assert.strictEqual(body.unchanged, true);
                assert.strictEqual(body.before, body.after);
                await fetch(`${BASE_URL}/api/datasets/${target.id}`, { method: 'DELETE' });
            });

            it('batch summary returns per-dataset +/- counts and flags unchanged', async () => {
                // Two targets: one is a fresh snapshot (unchanged), one is the
                // same but live mutates afterwards so it shows non-zero counts.
                const fresh = await createDataset('Diff Summary Fresh');

                const seed = await postJson(`${BASE_URL}/api/experiences`, {
                    job_title: 'Summary-seed-role', company_name: 'SumCo',
                    start_date: '2020-01', end_date: '', location: '', highlights: [],
                });
                assert.strictEqual(seed.status, 200);
                const seedExp = await seed.json();

                const stale = await createDataset('Diff Summary Stale');

                // Add a second experience so `stale` now diverges from live.
                const added = await postJson(`${BASE_URL}/api/experiences`, {
                    job_title: 'Summary-added-role', company_name: 'SumCo2',
                    start_date: '2022-06', end_date: '', location: '', highlights: [],
                });
                assert.strictEqual(added.status, 200);
                const addedExp = await added.json();

                const res = await postJson(`${BASE_URL}/api/datasets/copy-section-diff-summary`, { sectionKey: 'experience' });
                assert.strictEqual(res.status, 200);
                const { summaries } = await res.json();
                assert.ok(Array.isArray(summaries));

                const byId = Object.fromEntries(summaries.map(s => [s.id, s]));
                assert.ok(byId[fresh.id], 'fresh dataset must appear in summary');
                assert.ok(byId[stale.id], 'stale dataset must appear in summary');
                // `fresh` was snapshotted AFTER the second experience was added,
                // actually no — it was snapshotted BEFORE. Let me re-check.
                // Actually fresh captured live when only seedExp existed; stale
                // captured live when only seedExp existed too (addedExp was
                // created AFTER stale). So BOTH should show added > 0 now.
                assert.ok(byId[fresh.id].added > 0 || byId[fresh.id].unchanged === false, 'fresh should show divergence');
                assert.strictEqual(byId[stale.id].unchanged, false);
                assert.ok(byId[stale.id].added > 0, 'stale should have added lines');

                await fetch(`${BASE_URL}/api/experiences/${seedExp.id}`, { method: 'DELETE' });
                await fetch(`${BASE_URL}/api/experiences/${addedExp.id}`, { method: 'DELETE' });
                await fetch(`${BASE_URL}/api/datasets/${fresh.id}`, { method: 'DELETE' });
                await fetch(`${BASE_URL}/api/datasets/${stale.id}`, { method: 'DELETE' });
            });

            it('batch summary rejects invalid sectionKey with 400', async () => {
                const r = await postJson(`${BASE_URL}/api/datasets/copy-section-diff-summary`, { sectionKey: 'bogus' });
                assert.strictEqual(r.status, 400);
            });
        });

        describe('copy-section-bulk overwrite', () => {
            async function bulkCopy(sectionKey, targetIds) {
                return postJson(`${BASE_URL}/api/datasets/copy-section-bulk`, { sectionKey, targetIds });
            }

            it('rejects invalid inputs with 400', async () => {
                const noIds = await bulkCopy('experience', []);
                assert.strictEqual(noIds.status, 400);
                const badKey = await bulkCopy('bogus', [1]);
                assert.strictEqual(badKey.status, 400);
                const missingKey = await bulkCopy('', [1]);
                assert.strictEqual(missingKey.status, 400);
            });

            it('copies the live section into every selected target in one call', async () => {
                // Seed: two targets, both snapshotted before we mutate live.
                const t1 = await createDataset('Bulk Target A');
                const t2 = await createDataset('Bulk Target B');

                const exp = await postJson(`${BASE_URL}/api/experiences`, {
                    job_title: 'Bulk-copy-role', company_name: 'BulkCo',
                    start_date: '2023-01', end_date: '', location: '', highlights: ['bulk-hl'],
                });
                assert.strictEqual(exp.status, 200);
                const expJson = await exp.json();

                const res = await bulkCopy('experience', [t1.id, t2.id]);
                assert.strictEqual(res.status, 200);
                const body = await res.json();
                assert.strictEqual(body.okCount, 2);
                assert.strictEqual(body.failCount, 0);
                assert.strictEqual(body.success, true);

                // Both targets must now contain the added live experience.
                const after1 = await readTargetJson(t1.id);
                const after2 = await readTargetJson(t2.id);
                assert.ok(after1.experiences.some(e => e.job_title === 'Bulk-copy-role'), 't1 must contain the live role');
                assert.ok(after2.experiences.some(e => e.job_title === 'Bulk-copy-role'), 't2 must contain the live role');

                await fetch(`${BASE_URL}/api/experiences/${expJson.id}`, { method: 'DELETE' });
                await fetch(`${BASE_URL}/api/datasets/${t1.id}`, { method: 'DELETE' });
                await fetch(`${BASE_URL}/api/datasets/${t2.id}`, { method: 'DELETE' });
            });

            it('reports per-id failures without aborting successful targets', async () => {
                // One real target + one bogus id. The real target should still
                // be updated, and the bogus id should show up as a failure.
                const real = await createDataset('Bulk Partial Target');
                const res = await bulkCopy('about', [real.id, 999999]);
                assert.strictEqual(res.status, 200);
                const body = await res.json();
                assert.strictEqual(body.okCount, 1);
                assert.strictEqual(body.failCount, 1);
                const byId = Object.fromEntries(body.results.map(r => [r.id, r]));
                assert.strictEqual(byId[real.id].ok, true);
                assert.strictEqual(byId[999999].ok, false);
                await fetch(`${BASE_URL}/api/datasets/${real.id}`, { method: 'DELETE' });
            });
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

        it('GET /api/certifications exposes credential_id as URL', async () => {
            // Create a cert via admin API with a credential URL
            const credUrl = 'https://www.credly.com/badges/example/public-api-test';
            const createRes = await fetch(`${BASE_URL}/api/certifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'PublicApiCert',
                    provider: 'TestProv',
                    issue_date: '2024-01',
                    credential_id: credUrl,
                }),
            });
            assert.strictEqual(createRes.status, 200);

            const res = await fetch(`${PUBLIC_URL}/api/certifications`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
            const cert = data.find(c => c.name === 'PublicApiCert');
            assert.ok(cert, 'Created cert should appear in public API');
            assert.strictEqual(cert.credential_id, credUrl, 'Public API should expose credential_id');
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

    describe('robots.txt API allow-list', () => {
        it('does not block public read-only API paths from JS-rendering crawlers', async () => {
            // Make sure the indexable branch is exercised.
            await fetch(`${BASE_URL}/api/settings/robotsMeta`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: 'index, follow' }),
            });

            const res = await fetch(`${PUBLIC_URL}/robots.txt`);
            assert.strictEqual(res.status, 200);
            const text = await res.text();

            // Sanity: the rule the public site relies on for hydration must not
            // be a bare blanket block. The Disallow may still appear as the
            // catch-all fallback, but explicit Allow rules for the read-only
            // endpoints must precede it (longer-prefix Allow wins for Google).
            const requiredAllows = [
                '/api/profile',
                '/api/sections',
                '/api/settings',
                '/api/experiences',
                '/api/certifications',
                '/api/education',
                '/api/skills',
                '/api/projects',
                '/api/timeline',
                '/api/custom-sections',
                '/api/cv',
                '/api/datasets/slug/',
                '/api/datasets/id/',
            ];
            for (const path of requiredAllows) {
                assert.ok(
                    text.includes(`Allow: ${path}`),
                    `robots.txt is missing Allow rule for ${path}; full body:\n${text}`,
                );
            }
        });

        it('still emits a single global Disallow when robotsMeta is noindex', async () => {
            await fetch(`${BASE_URL}/api/settings/robotsMeta`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: 'noindex, nofollow' }),
            });

            const res = await fetch(`${PUBLIC_URL}/robots.txt`);
            assert.strictEqual(res.status, 200);
            const text = await res.text();
            assert.match(text, /^User-agent: \*\nDisallow: \/$/);

            // Restore default so subsequent tests see the indexable branch.
            await fetch(`${BASE_URL}/api/settings/robotsMeta`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: 'index, follow' }),
            });
        });
    });

    describe('Canonical link injection', () => {
        it('emits canonical from request host on public root', async () => {
            // Node's fetch reserves the Host header, so simulate the deployed-host
            // case via X-Forwarded-Host (the realistic reverse-proxy path).
            const res = await fetch(PUBLIC_URL, {
                headers: { 'X-Forwarded-Host': 'cv.example.com' },
            });
            assert.strictEqual(res.status, 200);
            const text = await res.text();
            assert.match(text, /<link rel="canonical" href="http:\/\/cv\.example\.com\/">/);
        });

        it('honors X-Forwarded-Proto and X-Forwarded-Host', async () => {
            const res = await fetch(PUBLIC_URL, {
                headers: {
                    'X-Forwarded-Proto': 'https',
                    'X-Forwarded-Host': 'cv.example.com',
                },
            });
            assert.strictEqual(res.status, 200);
            const text = await res.text();
            assert.match(text, /<link rel="canonical" href="https:\/\/cv\.example\.com\/">/);
        });

        it('omits canonical on /v/:slug when slugsIndex is disabled', async () => {
            // Default state — slugsIndex unset
            const createRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Canonical NoIndex' }),
            });
            const created = await createRes.json();
            await fetch(`${BASE_URL}/api/datasets/${created.id}/save`, { method: 'POST' });
            await fetch(`${BASE_URL}/api/datasets/${created.id}/public`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_public: true }),
            });

            const res = await fetch(`${PUBLIC_URL}/v/${created.slug}`, {
                headers: { 'X-Forwarded-Host': 'cv.example.com' },
            });
            assert.strictEqual(res.status, 200);
            const text = await res.text();
            assert.doesNotMatch(text, /<link rel="canonical"/);
            assert.match(text, /<meta name="robots"[^>]*content="noindex/);

            await fetch(`${BASE_URL}/api/datasets/${created.id}`, { method: 'DELETE' });
        });

        it('emits canonical on /v/:slug when slugsIndex is enabled', async () => {
            await fetch(`${BASE_URL}/api/settings/slugsIndex`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: 'true' }),
            });

            const createRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Canonical Indexable' }),
            });
            const created = await createRes.json();
            await fetch(`${BASE_URL}/api/datasets/${created.id}/save`, { method: 'POST' });
            await fetch(`${BASE_URL}/api/datasets/${created.id}/public`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_public: true }),
            });

            const res = await fetch(`${PUBLIC_URL}/v/${created.slug}`, {
                headers: { 'X-Forwarded-Host': 'cv.example.com' },
            });
            assert.strictEqual(res.status, 200);
            const text = await res.text();
            const expected = new RegExp(`<link rel="canonical" href="http://cv\\.example\\.com/v/${created.slug}">`);
            assert.match(text, expected);

            await fetch(`${BASE_URL}/api/datasets/${created.id}`, { method: 'DELETE' });
            await fetch(`${BASE_URL}/api/settings/slugsIndex`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: 'false' }),
            });
        });
    });

    describe('Tracking consent gating', () => {
        const SNIPPET = '<script>window.__cvTrackingFlag = "yes";</script>';

        async function setConsentRequired(value) {
            const res = await fetch(`${BASE_URL}/api/settings/trackingConsentRequired`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            });
            assert.strictEqual(res.status, 200);
        }

        async function setTrackingCode(value) {
            const res = await fetch(`${BASE_URL}/api/settings/trackingCode`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            });
            assert.strictEqual(res.status, 200);
        }

        it('injects snippet into public HTML when consent is not required', async () => {
            await setTrackingCode(SNIPPET);
            await setConsentRequired('false');
            const res = await fetch(PUBLIC_URL);
            assert.strictEqual(res.status, 200);
            const html = await res.text();
            assert.ok(html.includes('__cvTrackingFlag'), 'snippet should be present in SSR HTML when consent is off');
        });

        it('omits snippet from public HTML when consent is required', async () => {
            await setTrackingCode(SNIPPET);
            await setConsentRequired('true');
            const res = await fetch(PUBLIC_URL);
            assert.strictEqual(res.status, 200);
            const html = await res.text();
            assert.ok(!html.includes('__cvTrackingFlag'), 'snippet must not be in SSR HTML when consent is required');
        });

        it('public /api/settings/trackingCode returns null + consentRequired flag when gated', async () => {
            await setTrackingCode(SNIPPET);
            await setConsentRequired('true');
            const res = await fetch(`${PUBLIC_URL}/api/settings/trackingCode`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.value, null);
            assert.strictEqual(data.consentRequired, true);
        });

        it('public /api/settings/trackingCode returns the snippet when not gated', async () => {
            await setTrackingCode(SNIPPET);
            await setConsentRequired('false');
            const res = await fetch(`${PUBLIC_URL}/api/settings/trackingCode`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.value, SNIPPET);
        });

        it('public bulk /api/settings omits trackingCode when gated', async () => {
            await setTrackingCode(SNIPPET);
            await setConsentRequired('true');
            const res = await fetch(`${PUBLIC_URL}/api/settings`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.trackingCode, undefined);
            assert.strictEqual(data.trackingConsentRequired, 'true');
        });

        it('admin /api/settings/trackingCode returns the snippet even when gated', async () => {
            await setTrackingCode(SNIPPET);
            await setConsentRequired('true');
            const res = await fetch(`${BASE_URL}/api/settings/trackingCode`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.value, SNIPPET);
            // Cleanup so later tests aren't affected
            await setConsentRequired('false');
            await setTrackingCode('');
        });
    });

    describe('Profile Picture Library', () => {
        // A 1x1 PNG — smallest valid image payload for the upload test.
        const tinyPngBytes = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
            0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
            0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
            0x42, 0x60, 0x82
        ]);

        async function uploadPicture() {
            const formData = new FormData();
            formData.append('picture', new Blob([tinyPngBytes], { type: 'image/png' }), 'test.png');
            const res = await fetch(`${BASE_URL}/api/profile/picture`, { method: 'POST', body: formData });
            assert.strictEqual(res.status, 200);
            return (await res.json()).filename;
        }

        async function setPropagate(enabled) {
            const profile = await (await fetch(`${BASE_URL}/api/profile`)).json();
            const res = await fetch(`${BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...profile, picture_propagate: enabled }),
            });
            assert.strictEqual(res.status, 200);
        }

        it('public /api/cv exposes profile_picture_enabled and picture_filename', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/cv`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(data.profile, 'profile must be present');
            assert.ok(Object.prototype.hasOwnProperty.call(data.profile, 'profile_picture_enabled'), 'profile_picture_enabled must be returned');
            assert.ok(Object.prototype.hasOwnProperty.call(data.profile, 'picture_filename'), 'picture_filename must be returned');
        });

        it('public /api/profile exposes picture fields', async () => {
            const res = await fetch(`${PUBLIC_URL}/api/profile`);
            const data = await res.json();
            assert.ok(Object.prototype.hasOwnProperty.call(data, 'profile_picture_enabled'));
            assert.ok(Object.prototype.hasOwnProperty.call(data, 'picture_filename'));
            // Sensitive fields must still be filtered out.
            assert.strictEqual(data.email, undefined);
            assert.strictEqual(data.phone, undefined);
        });

        it('dataset save+load preserves profile_picture_enabled, picture_filename, picture_propagate', async () => {
            const filename = await uploadPicture();
            // Disable toggle, keep propagate on
            const profile = await (await fetch(`${BASE_URL}/api/profile`)).json();
            await fetch(`${BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...profile, profile_picture_enabled: false, picture_propagate: true }),
            });

            const createRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Picture Snapshot ${Date.now()}` }),
            });
            const created = await createRes.json();
            assert.ok(created.id);

            // Flip the live profile so load has something to restore
            await fetch(`${BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...profile, profile_picture_enabled: true, picture_propagate: true }),
            });

            const loadRes = await fetch(`${BASE_URL}/api/datasets/${created.id}/load`, { method: 'POST' });
            assert.strictEqual(loadRes.status, 200);

            const after = await (await fetch(`${BASE_URL}/api/profile`)).json();
            assert.strictEqual(after.profile_picture_enabled, 0, 'disabled toggle must be restored');
            assert.strictEqual(after.picture_filename, filename, 'picture_filename must be restored');
        });

        it('upload with picture_propagate=1 mirrors filename into saved datasets', async () => {
            await setPropagate(true);
            const createRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Propagate On ${Date.now()}` }),
            });
            const created = await createRes.json();
            const filename = await uploadPicture();

            const listRes = await fetch(`${BASE_URL}/api/datasets`);
            const datasets = await listRes.json();
            const target = datasets.find(d => d.id === created.id);
            assert.ok(target, 'created dataset must be in the list');
            // Re-fetch dataset data to inspect the snapshot
            const dsRes = await fetch(`${BASE_URL}/api/datasets/id/${created.id}`);
            const dsData = await dsRes.json();
            assert.strictEqual(dsData.profile.picture_filename, filename, 'dataset snapshot must carry the new filename');
        });

        it('upload with picture_propagate=0 does NOT mutate existing datasets', async () => {
            await setPropagate(true);
            const firstFilename = await uploadPicture();
            const createRes = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Propagate Off ${Date.now()}` }),
            });
            const created = await createRes.json();

            await setPropagate(false);
            const secondFilename = await uploadPicture();

            const dsRes = await fetch(`${BASE_URL}/api/datasets/id/${created.id}`);
            const dsData = await dsRes.json();
            assert.strictEqual(dsData.profile.picture_filename, firstFilename, 'dataset snapshot must stay on the pre-upload filename');
            assert.notStrictEqual(dsData.profile.picture_filename, secondFilename);
        });

        it('GET /api/profile-pictures returns library with in_use flag', async () => {
            await setPropagate(true);
            const filename = await uploadPicture();
            const res = await fetch(`${BASE_URL}/api/profile-pictures`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.ok(Array.isArray(data));
            const entry = data.find(p => p.filename === filename);
            assert.ok(entry, 'uploaded picture must appear in the library');
            assert.strictEqual(entry.in_use, true, 'active picture must be marked in use');
        });

        it('DELETE /api/profile-pictures/:filename returns 409 when in use', async () => {
            const filename = await uploadPicture();
            const res = await fetch(`${BASE_URL}/api/profile-pictures/${encodeURIComponent(filename)}`, { method: 'DELETE' });
            assert.strictEqual(res.status, 409);
        });

        it('DELETE /api/profile-pictures/:filename succeeds for orphan files', async () => {
            const keep = await uploadPicture(); // stays active
            const orphan = await uploadPicture(); // becomes active immediately after second upload — swap back
            // Reinstate the first picture so the second is no longer referenced
            const reselect = await fetch(`${BASE_URL}/api/profile/picture/select`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: keep }),
            });
            assert.strictEqual(reselect.status, 200);
            const res = await fetch(`${BASE_URL}/api/profile-pictures/${encodeURIComponent(orphan)}`, { method: 'DELETE' });
            assert.strictEqual(res.status, 200);
            const list = await (await fetch(`${BASE_URL}/api/profile-pictures`)).json();
            assert.ok(!list.some(p => p.filename === orphan), 'orphan must be removed from the library');
        });

        it('PUT /api/profile/picture/select switches live picture', async () => {
            const a = await uploadPicture();
            const b = await uploadPicture();
            const res = await fetch(`${BASE_URL}/api/profile/picture/select`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: a }),
            });
            assert.strictEqual(res.status, 200);
            const profile = await (await fetch(`${BASE_URL}/api/profile`)).json();
            assert.strictEqual(profile.picture_filename, a);
            assert.notStrictEqual(a, b);
        });

        it('PUT /api/profile/picture/select rejects path traversal', async () => {
            const res = await fetch(`${BASE_URL}/api/profile/picture/select`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: '../../etc/passwd' }),
            });
            assert.strictEqual(res.status, 400);
        });

        it('upload with propagate=0 syncs language siblings of the active dataset only', async () => {
            // Build two datasets in the SAME language_group (en) + (fr) and one unrelated.
            await setPropagate(true);
            const first = await uploadPicture(); // gives us a starting filename for seeding dataset snapshots

            const baseName = `Sibling Test ${Date.now()}`;
            const enCreate = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: baseName, language: 'en' }),
            });
            const enDs = await enCreate.json();
            assert.ok(enDs.language_group, 'dataset must have a language_group');

            const frCreate = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: baseName, language: 'fr', language_group: enDs.language_group }),
            });
            const frDs = await frCreate.json();
            assert.strictEqual(frDs.language_group, enDs.language_group, 'sibling shares language_group');

            const unrelatedCreate = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Unrelated ${Date.now()}` }),
            });
            const unrelatedDs = await unrelatedCreate.json();
            assert.notStrictEqual(unrelatedDs.language_group, enDs.language_group);

            // Flip the flag OFF so only the sibling path should propagate.
            await setPropagate(false);

            // Upload a new picture while editing the en dataset.
            const formData = new FormData();
            formData.append('picture', new Blob([tinyPngBytes], { type: 'image/png' }), 'test.png');
            formData.append('current_dataset_id', String(enDs.id));
            const uploadRes = await fetch(`${BASE_URL}/api/profile/picture`, { method: 'POST', body: formData });
            assert.strictEqual(uploadRes.status, 200);
            const { filename: newPic } = await uploadRes.json();
            assert.notStrictEqual(newPic, first, 'a fresh filename is generated per upload');

            // Both siblings must carry the new picture…
            const enData = await (await fetch(`${BASE_URL}/api/datasets/id/${enDs.id}`)).json();
            const frData = await (await fetch(`${BASE_URL}/api/datasets/id/${frDs.id}`)).json();
            assert.strictEqual(enData.profile.picture_filename, newPic, 'active dataset updated');
            assert.strictEqual(frData.profile.picture_filename, newPic, 'sibling updated even with propagate off');

            // …but the unrelated dataset must NOT have been touched by the sibling sync.
            const unrelatedData = await (await fetch(`${BASE_URL}/api/datasets/id/${unrelatedDs.id}`)).json();
            assert.notStrictEqual(unrelatedData.profile.picture_filename, newPic, 'unrelated dataset stays on its prior filename');
        });
    });

    describe('Profile Picture Crop (LinkedIn-style adjustment)', () => {
        // Reuse the tiny-PNG helper + upload flow from the library block. Tests are
        // independent but share the uploaded state inside this run.
        const tinyPngBytes = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
            0x89, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41,
            0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
            0x42, 0x60, 0x82
        ]);
        async function uploadPic() {
            const fd = new FormData();
            fd.append('picture', new Blob([tinyPngBytes], { type: 'image/png' }), 'test.png');
            const res = await fetch(`${BASE_URL}/api/profile/picture`, { method: 'POST', body: fd });
            assert.strictEqual(res.status, 200);
            return (await res.json()).filename;
        }
        async function setPropagate(enabled) {
            const profile = await (await fetch(`${BASE_URL}/api/profile`)).json();
            await fetch(`${BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...profile, picture_propagate: enabled }),
            });
        }
        async function putCrop(body) {
            return fetch(`${BASE_URL}/api/profile/picture/crop`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        }

        it('rejects non-numeric offsetX with 400', async () => {
            await uploadPic();
            const res = await putCrop({ offsetX: 'nope', offsetY: 0, zoom: 1 });
            assert.strictEqual(res.status, 400);
        });

        it('rejects missing zoom with 400', async () => {
            await uploadPic();
            const res = await putCrop({ offsetX: 10, offsetY: -5 });
            assert.strictEqual(res.status, 400);
        });

        it('clamps out-of-range values (zoom=10 -> 4, offset=999 -> 100)', async () => {
            await uploadPic();
            const res = await putCrop({ offsetX: 999, offsetY: -999, zoom: 10 });
            assert.strictEqual(res.status, 200);
            const profile = await (await fetch(`${BASE_URL}/api/profile`)).json();
            const crop = JSON.parse(profile.picture_crop);
            assert.strictEqual(crop.zoom, 4);
            assert.strictEqual(crop.offsetX, 100);
            assert.strictEqual(crop.offsetY, -100);
        });

        it('stores and returns crop via GET /api/profile', async () => {
            await uploadPic();
            const res = await putCrop({ offsetX: 12.5, offsetY: -7.25, zoom: 1.75 });
            assert.strictEqual(res.status, 200);
            const profile = await (await fetch(`${BASE_URL}/api/profile`)).json();
            assert.ok(profile.picture_crop, 'picture_crop must be populated');
            const crop = JSON.parse(profile.picture_crop);
            assert.strictEqual(crop.offsetX, 12.5);
            assert.strictEqual(crop.offsetY, -7.25);
            assert.strictEqual(crop.zoom, 1.75);
        });

        it('returns 400 when no picture is set', async () => {
            // Ensure a picture exists so we can delete it cleanly
            await uploadPic();
            await fetch(`${BASE_URL}/api/profile/picture`, { method: 'DELETE' });
            const res = await putCrop({ offsetX: 0, offsetY: 0, zoom: 1 });
            assert.strictEqual(res.status, 400);
        });

        it('new upload resets crop to NULL', async () => {
            await uploadPic();
            await putCrop({ offsetX: 10, offsetY: 10, zoom: 2 });
            const before = await (await fetch(`${BASE_URL}/api/profile`)).json();
            assert.ok(before.picture_crop);
            await uploadPic();
            const after = await (await fetch(`${BASE_URL}/api/profile`)).json();
            assert.strictEqual(after.picture_crop, null, 'new upload must clear the crop');
        });

        it('applyToAll:true propagates crop to every dataset snapshot', async () => {
            await uploadPic();
            const mk = (name) => fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `${name} ${Date.now()}${Math.random()}` }),
            }).then(r => r.json());
            const a = await mk('Crop Global A');
            const b = await mk('Crop Global B');

            const res = await putCrop({ offsetX: 3, offsetY: 4, zoom: 1.5, applyToAll: true });
            assert.strictEqual(res.status, 200);

            const aData = await (await fetch(`${BASE_URL}/api/datasets/id/${a.id}`)).json();
            const bData = await (await fetch(`${BASE_URL}/api/datasets/id/${b.id}`)).json();
            const aCrop = JSON.parse(aData.profile.picture_crop);
            const bCrop = JSON.parse(bData.profile.picture_crop);
            assert.strictEqual(aCrop.offsetX, 3);
            assert.strictEqual(bCrop.offsetY, 4);
            assert.strictEqual(aCrop.zoom, 1.5);
        });

        it('applyToAll:false mirrors crop to language siblings only', async () => {
            await uploadPic();
            const group = `grp-${Date.now()}-${Math.random()}`;
            const en = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Crop Sib EN ${Date.now()}`, language: 'en' }),
            }).then(r => r.json());
            const fr = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Crop Sib EN ${Date.now()}`, language: 'fr', language_group: en.language_group }),
            }).then(r => r.json());
            const unrelated = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Crop Unrelated ${Date.now()}` }),
            }).then(r => r.json());

            const res = await putCrop({ offsetX: -11, offsetY: 22, zoom: 2.2, applyToAll: false, current_dataset_id: en.id });
            assert.strictEqual(res.status, 200);

            const enData = await (await fetch(`${BASE_URL}/api/datasets/id/${en.id}`)).json();
            const frData = await (await fetch(`${BASE_URL}/api/datasets/id/${fr.id}`)).json();
            const unData = await (await fetch(`${BASE_URL}/api/datasets/id/${unrelated.id}`)).json();

            assert.ok(enData.profile.picture_crop, 'active dataset carries the crop');
            assert.ok(frData.profile.picture_crop, 'language sibling carries the crop');
            assert.strictEqual(JSON.parse(enData.profile.picture_crop).offsetY, 22);
            assert.strictEqual(JSON.parse(frData.profile.picture_crop).zoom, 2.2);
            // Unrelated dataset's snapshot was created before the crop call and falls
            // outside the language group, so it must still have no crop set.
            assert.ok(
                !unData.profile.picture_crop || JSON.parse(unData.profile.picture_crop).offsetY !== 22,
                'unrelated dataset must not receive the siblings-scoped crop'
            );
        });

        it('dataset save+load restores picture_crop onto the live profile', async () => {
            await uploadPic();
            await putCrop({ offsetX: 8, offsetY: -4, zoom: 1.25, applyToAll: true });

            const created = await fetch(`${BASE_URL}/api/datasets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: `Crop Restore ${Date.now()}` }),
            }).then(r => r.json());

            // Change live crop so we can verify the load restores the snapshot's value.
            await putCrop({ offsetX: 0, offsetY: 0, zoom: 3, applyToAll: false });
            const mid = await (await fetch(`${BASE_URL}/api/profile`)).json();
            assert.strictEqual(JSON.parse(mid.picture_crop).zoom, 3);

            const loadRes = await fetch(`${BASE_URL}/api/datasets/${created.id}/load`, { method: 'POST' });
            assert.strictEqual(loadRes.status, 200);
            const after = await (await fetch(`${BASE_URL}/api/profile`)).json();
            assert.ok(after.picture_crop, 'crop must be restored from the snapshot');
            const crop = JSON.parse(after.picture_crop);
            assert.strictEqual(crop.offsetX, 8);
            assert.strictEqual(crop.offsetY, -4);
            assert.strictEqual(crop.zoom, 1.25);
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

    // The undo/redo feature in admin.js is built on the round-trip
    // GET /api/cv  →  POST /api/import  (with the snapshot as body).
    // These tests guard the contract that the snapshot returned by /api/cv is
    // a valid /api/import body that fully restores the prior content slice.
    describe('Undo/Redo snapshot round-trip (/api/cv ↔ /api/import)', () => {
        async function snapshot() {
            const res = await fetch(`${BASE_URL}/api/cv`);
            assert.strictEqual(res.status, 200);
            return await res.json();
        }
        async function importSnapshot(data) {
            const res = await fetch(`${BASE_URL}/api/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
        }

        it('profile edit round-trips: snapshot before, mutate, restore, profile matches snapshot', async () => {
            // Capture pre-mutation state
            const before = await snapshot();
            const originalName = before.profile.name;

            // Mutate
            const mutated = { ...before.profile, name: 'UNDO_TEST_NAME_1' };
            await fetch(`${BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mutated)
            });

            const afterMutation = await snapshot();
            assert.strictEqual(afterMutation.profile.name, 'UNDO_TEST_NAME_1', 'Mutation should have landed');

            // "Undo" by importing the captured snapshot
            await importSnapshot(before);

            const restored = await snapshot();
            assert.strictEqual(restored.profile.name, originalName, 'Profile name should be restored');
        });

        it('experience CRUD round-trips: deleted experience comes back via snapshot import', async () => {
            // Create an experience to ensure there's something to delete
            const createRes = await fetch(`${BASE_URL}/api/experiences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_title: 'Undo Test Role',
                    company_name: 'Undo Test Co',
                    start_date: '2020-01',
                    end_date: '2021-06',
                    location: 'Test City',
                    highlights: ['First highlight', 'Second highlight'],
                    visible: true
                })
            });
            assert.strictEqual(createRes.status, 200);

            // Capture snapshot AFTER create — this is what undo of a delete restores to
            const snap = await snapshot();
            const originalCount = snap.experiences.length;
            const targetExp = snap.experiences.find(e => e.job_title === 'Undo Test Role');
            assert.ok(targetExp, 'Created experience should be in snapshot');
            const originalHighlights = targetExp.highlights;

            // Delete it
            const delRes = await fetch(`${BASE_URL}/api/experiences/${targetExp.id}`, { method: 'DELETE' });
            assert.strictEqual(delRes.status, 200);

            const afterDelete = await snapshot();
            assert.strictEqual(
                afterDelete.experiences.find(e => e.job_title === 'Undo Test Role'),
                undefined,
                'Experience should be gone after delete'
            );

            // Restore via snapshot
            await importSnapshot(snap);

            const restored = await snapshot();
            assert.strictEqual(restored.experiences.length, originalCount, 'Experience count should be restored');
            const restoredExp = restored.experiences.find(e => e.job_title === 'Undo Test Role');
            assert.ok(restoredExp, 'Experience should reappear');
            assert.deepStrictEqual(
                restoredExp.highlights,
                originalHighlights,
                'Highlights should be preserved on restore'
            );

            // Cleanup
            await fetch(`${BASE_URL}/api/experiences/${restoredExp.id}`, { method: 'DELETE' });
        });

        it('custom section + items round-trip: snapshot import restores section and items', async () => {
            // Create a custom section with two items
            const createSection = await fetch(`${BASE_URL}/api/custom-sections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Undo Test Section',
                    layout_type: 'list',
                    icon: 'layers'
                })
            });
            assert.strictEqual(createSection.status, 200);
            const sectionResult = await createSection.json();
            const sectionId = sectionResult.id;
            assert.ok(sectionId, 'Section creation should return id');

            await fetch(`${BASE_URL}/api/custom-sections/${sectionId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Undo Item One', description: 'First' })
            });
            await fetch(`${BASE_URL}/api/custom-sections/${sectionId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Undo Item Two', description: 'Second' })
            });

            // Snapshot AFTER create
            const snap = await snapshot();
            const targetSection = snap.customSections.find(s => s.name === 'Undo Test Section');
            assert.ok(targetSection, 'Custom section should be in snapshot');
            assert.strictEqual(targetSection.items.length, 2, 'Section should have 2 items');

            // Delete the section (cascades items)
            const delRes = await fetch(`${BASE_URL}/api/custom-sections/${sectionId}`, { method: 'DELETE' });
            assert.strictEqual(delRes.status, 200);

            const afterDelete = await snapshot();
            assert.strictEqual(
                afterDelete.customSections.find(s => s.name === 'Undo Test Section'),
                undefined,
                'Section should be gone after delete'
            );

            // Restore
            await importSnapshot(snap);

            const restored = await snapshot();
            const restoredSection = restored.customSections.find(s => s.name === 'Undo Test Section');
            assert.ok(restoredSection, 'Section should reappear after import');
            assert.strictEqual(restoredSection.items.length, 2, 'Both items should be restored');
            const titles = restoredSection.items.map(i => i.title).sort();
            assert.deepStrictEqual(titles, ['Undo Item One', 'Undo Item Two'], 'Item titles should match');

            // Cleanup
            await fetch(`${BASE_URL}/api/custom-sections/${restoredSection.id}`, { method: 'DELETE' });
        });

        it('section order round-trip: snapshot import restores section_order', async () => {
            // Capture original
            const snap = await snapshot();
            const originalOrder = snap.sectionOrder.map(s => s.key);
            assert.ok(originalOrder.length >= 2, 'Need at least 2 sections to test reorder');

            // Reorder by reversing the section_order
            const reordered = [...snap.sectionOrder].reverse().map((s, idx) => ({
                key: s.key,
                visible: s.visible,
                print_visible: s.print_visible !== false,
                sort_order: idx
            }));
            const orderRes = await fetch(`${BASE_URL}/api/sections/order`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sections: reordered })
            });
            assert.strictEqual(orderRes.status, 200);

            const afterReorder = await snapshot();
            const newOrder = afterReorder.sectionOrder.map(s => s.key);
            assert.notDeepStrictEqual(newOrder, originalOrder, 'Order should have changed');

            // Restore via snapshot
            await importSnapshot(snap);

            const restored = await snapshot();
            const restoredOrder = restored.sectionOrder.map(s => s.key);
            assert.deepStrictEqual(restoredOrder, originalOrder, 'Section order should be restored');
        });
    });

});

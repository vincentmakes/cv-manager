/* CV Manager - Admin-Specific JavaScript */

// State
let currentModal = { type: null, id: null };
let sectionVisibility = {};

// Initialize Admin
async function initAdmin() {
    sectionVisibility = await loadSectionsAdmin();
    await loadProfile(true); // true = include email/phone
    await loadTimeline();
    await loadExperiences();
    await loadCertifications();
    await loadEducation();
    await loadSkills();
    await loadProjects();
    await generateATSContent();
}

// Load Sections with visibility toggle (admin version)
async function loadSectionsAdmin() {
    const sections = await api('/api/sections');
    Object.keys(sections).forEach(section => {
        const el = document.getElementById(`section-${section}`);
        const toggleBtn = document.getElementById(`toggle-${section}`);
        if (el) {
            el.classList.toggle('hidden-print', !sections[section]);
        }
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', sections[section]);
        }
    });
    return sections;
}

// Load Experiences (admin version with edit controls)
async function loadExperiences() {
    const experiences = await api('/api/experiences');
    const container = document.getElementById('experienceList');
    
    container.innerHTML = experiences.map(exp => `
        <article class="item-card ${exp.visible ? '' : 'hidden-print'}" data-id="${exp.id}" itemscope itemtype="https://schema.org/OrganizationRole">
            <div class="item-actions">
                <button class="item-btn" onclick="toggleVisibility('experiences', ${exp.id}, ${!exp.visible})" title="Toggle Visibility">
                    ${visibilityIcon(exp.visible)}
                </button>
                <button class="item-btn" onclick="openModal('experience', ${exp.id})" title="Edit">
                    ${editIcon()}
                </button>
                <button class="item-btn delete" onclick="confirmDelete('experiences', ${exp.id})" title="Delete">
                    ${deleteIcon()}
                </button>
            </div>
            <div class="item-header">
                <div>
                    <h3 class="item-title" itemprop="roleName">${escapeHtml(exp.job_title)}</h3>
                    <div class="item-subtitle" itemprop="memberOf" itemscope itemtype="https://schema.org/Organization">
                        <span itemprop="name">${escapeHtml(exp.company_name)}</span>
                    </div>
                </div>
                <span class="item-date">
                    <time itemprop="startDate" datetime="${exp.start_date || ''}">${formatDate(exp.start_date)}</time> - 
                    <time itemprop="endDate" datetime="${exp.end_date || ''}">${exp.end_date ? formatDate(exp.end_date) : 'Present'}</time>
                </span>
            </div>
            ${exp.location ? `<div class="item-location">${escapeHtml(exp.location)}</div>` : ''}
            ${exp.highlights && exp.highlights.length ? `
                <ul class="item-highlights" itemprop="description">
                    ${exp.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
                </ul>
            ` : ''}
        </article>
    `).join('');
}

// Load Certifications (admin version with edit controls)
async function loadCertifications() {
    const certs = await api('/api/certifications');
    const container = document.getElementById('certGrid');
    
    container.innerHTML = certs.map(cert => `
        <article class="cert-card ${cert.visible ? '' : 'hidden-print'}" data-id="${cert.id}" itemscope itemtype="https://schema.org/EducationalOccupationalCredential">
            <div class="item-actions">
                <button class="item-btn" onclick="toggleVisibility('certifications', ${cert.id}, ${!cert.visible})" title="Toggle Visibility">
                    ${visibilityIcon(cert.visible)}
                </button>
                <button class="item-btn" onclick="openModal('certification', ${cert.id})" title="Edit">
                    ${editIcon()}
                </button>
                <button class="item-btn delete" onclick="confirmDelete('certifications', ${cert.id})" title="Delete">
                    ${deleteIcon()}
                </button>
            </div>
            <div class="cert-header">
                <div class="cert-name" itemprop="name">${escapeHtml(cert.name)}</div>
                <time class="cert-date" itemprop="dateCreated">${escapeHtml(cert.issue_date || '')}</time>
            </div>
            <div class="cert-provider" itemprop="issuedBy">${escapeHtml(cert.provider || '')}</div>
        </article>
    `).join('');
}

// Load Education (admin version with edit controls)
async function loadEducation() {
    const education = await api('/api/education');
    const container = document.getElementById('educationList');
    
    container.innerHTML = education.map(edu => `
        <article class="item-card ${edu.visible ? '' : 'hidden-print'}" data-id="${edu.id}" itemscope itemtype="https://schema.org/EducationalOccupationalCredential">
            <div class="item-actions">
                <button class="item-btn" onclick="toggleVisibility('education', ${edu.id}, ${!edu.visible})" title="Toggle Visibility">
                    ${visibilityIcon(edu.visible)}
                </button>
                <button class="item-btn" onclick="openModal('education', ${edu.id})" title="Edit">
                    ${editIcon()}
                </button>
                <button class="item-btn delete" onclick="confirmDelete('education', ${edu.id})" title="Delete">
                    ${deleteIcon()}
                </button>
            </div>
            <div class="item-header">
                <div>
                    <h3 class="item-title" itemprop="name">${escapeHtml(edu.degree_title)}</h3>
                    <div class="item-subtitle" itemprop="recognizedBy" itemscope itemtype="https://schema.org/EducationalOrganization">
                        <span itemprop="name">${escapeHtml(edu.institution_name)}</span>
                    </div>
                </div>
                <span class="item-date">
                    <time datetime="${edu.start_date || ''}">${escapeHtml(edu.start_date || '')}</time> - 
                    <time datetime="${edu.end_date || ''}">${escapeHtml(edu.end_date || '')}</time>
                </span>
            </div>
            ${edu.description ? `<div class="item-location" itemprop="description">${escapeHtml(edu.description)}</div>` : ''}
        </article>
    `).join('');
}

// Load Skills (admin version with edit controls)
async function loadSkills() {
    const skills = await api('/api/skills');
    const container = document.getElementById('skillsGrid');
    
    container.innerHTML = skills.map(cat => `
        <div class="skill-category ${cat.visible ? '' : 'hidden-print'}" data-id="${cat.id}">
            <div class="item-actions">
                <button class="item-btn" onclick="toggleVisibility('skills', ${cat.id}, ${!cat.visible})" title="Toggle Visibility">
                    ${visibilityIcon(cat.visible)}
                </button>
                <button class="item-btn" onclick="openModal('skill', ${cat.id})" title="Edit">
                    ${editIcon()}
                </button>
                <button class="item-btn delete" onclick="confirmDelete('skills', ${cat.id})" title="Delete">
                    ${deleteIcon()}
                </button>
            </div>
            <div class="skill-category-title">
                <span class="skill-icon">${getSkillIcon(cat.icon, cat.name)}</span>
                ${escapeHtml(cat.name)}
            </div>
            <div class="skill-tags" itemscope itemtype="https://schema.org/ItemList">
                ${cat.skills.map(s => `<span class="skill-tag" itemprop="itemListElement">${escapeHtml(s)}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Load Projects (admin version with edit controls)
async function loadProjects() {
    const projects = await api('/api/projects');
    const container = document.getElementById('projectsGrid');
    
    container.innerHTML = projects.map(proj => `
        <article class="project-card ${proj.visible ? '' : 'hidden-print'}" data-id="${proj.id}" itemscope itemtype="https://schema.org/CreativeWork">
            <div class="item-actions">
                <button class="item-btn" onclick="toggleVisibility('projects', ${proj.id}, ${!proj.visible})" title="Toggle Visibility">
                    ${visibilityIcon(proj.visible)}
                </button>
                <button class="item-btn" onclick="openModal('project', ${proj.id})" title="Edit">
                    ${editIcon()}
                </button>
                <button class="item-btn delete" onclick="confirmDelete('projects', ${proj.id})" title="Delete">
                    ${deleteIcon()}
                </button>
            </div>
            <h3 class="project-title" itemprop="name">${escapeHtml(proj.title)}</h3>
            <p class="project-description" itemprop="description">${escapeHtml(proj.description || '')}</p>
            <div class="tech-tags">
                ${(proj.technologies || []).map(t => `<span class="tech-tag" itemprop="keywords">${escapeHtml(t)}</span>`).join('')}
            </div>
        </article>
    `).join('');
}

// Toggle Section Visibility
async function toggleSection(section) {
    const newValue = !sectionVisibility[section];
    await api(`/api/sections/${section}`, { method: 'PUT', body: { visible: newValue } });
    sectionVisibility = await loadSectionsAdmin();
    toast('Section visibility updated');
}

// Toggle Item Visibility
async function toggleVisibility(endpoint, id, visible) {
    const data = await api(`/api/${endpoint}/${id}`);
    await api(`/api/${endpoint}/${id}`, { 
        method: 'PUT', 
        body: { ...data, visible } 
    });
    await reloadSection(endpoint);
    toast('Visibility updated');
}

// Modal Functions
async function openModal(type, id = null) {
    currentModal = { type, id };
    document.getElementById('deleteBtn').style.display = id ? 'block' : 'none';
    
    let title = '';
    let form = '';
    let data = {};

    if (id) {
        const endpoint = getEndpoint(type);
        data = await api(`/api/${endpoint}/${id}`);
    }

    switch (type) {
        case 'profile':
            title = 'Edit Profile';
            data = await api('/api/profile');
            form = profileForm(data);
            document.getElementById('deleteBtn').style.display = 'none';
            break;
        case 'experience':
            title = id ? 'Edit Experience' : 'Add Experience';
            form = experienceForm(data);
            break;
        case 'certification':
            title = id ? 'Edit Certification' : 'Add Certification';
            form = certificationForm(data);
            break;
        case 'education':
            title = id ? 'Edit Education' : 'Add Education';
            form = educationForm(data);
            break;
        case 'skill':
            title = id ? 'Edit Skill Category' : 'Add Skill Category';
            form = skillForm(data);
            break;
        case 'project':
            title = id ? 'Edit Project' : 'Add Project';
            form = projectForm(data);
            break;
    }

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = form;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    currentModal = { type: null, id: null };
}

function editProfile() {
    openModal('profile');
}

// Form Templates
function profileForm(d) {
    return `
        <div class="form-group">
            <label class="form-label">Profile Picture</label>
            <div class="profile-upload-container">
                <div class="profile-upload-preview" id="profileUploadPreview">
                    <img src="/uploads/picture.jpeg?${Date.now()}" alt="" id="profilePreviewImg" onerror="this.style.display='none';document.getElementById('profilePreviewInitials').style.display='flex';">
                    <div class="profile-preview-initials" id="profilePreviewInitials" style="display:none;">${escapeHtml(d.initials || 'CV')}</div>
                </div>
                <div class="profile-upload-actions">
                    <input type="file" id="f-picture" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="previewProfilePicture(this)">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('f-picture').click()">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        Choose Image
                    </button>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="removeProfilePicture()">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        Remove
                    </button>
                </div>
            </div>
            <div class="form-hint">Recommended: Square image, at least 200x200 pixels. JPEG, PNG or WebP.</div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-input" id="f-name" value="${escapeHtml(d.name || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Initials</label>
                <input type="text" class="form-input" id="f-initials" value="${escapeHtml(d.initials || '')}" maxlength="3">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" class="form-input" id="f-title" value="${escapeHtml(d.title || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Subtitle</label>
            <input type="text" class="form-input" id="f-subtitle" value="${escapeHtml(d.subtitle || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea class="form-textarea" id="f-bio">${escapeHtml(d.bio || '')}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Location</label>
                <input type="text" class="form-input" id="f-location" value="${escapeHtml(d.location || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Languages</label>
                <input type="text" class="form-input" id="f-languages" value="${escapeHtml(d.languages || '')}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">LinkedIn URL</label>
            <input type="text" class="form-input" id="f-linkedin" value="${escapeHtml(d.linkedin || '')}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="f-email" value="${escapeHtml(d.email || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Phone</label>
                <input type="text" class="form-input" id="f-phone" value="${escapeHtml(d.phone || '')}">
            </div>
        </div>
    `;
}

function experienceForm(d) {
    return `
        <div class="form-group">
            <label class="form-label">Job Title</label>
            <input type="text" class="form-input" id="f-job_title" value="${escapeHtml(d.job_title || '')}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Company</label>
                <input type="text" class="form-input" id="f-company_name" value="${escapeHtml(d.company_name || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Country Code</label>
                <input type="text" class="form-input" id="f-country_code" value="${escapeHtml(d.country_code || 'ch')}" maxlength="2" placeholder="ch, fr, us...">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="text" class="form-input" id="f-start_date" value="${escapeHtml(d.start_date || '')}" placeholder="2020-01 or Jan 2020">
            </div>
            <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="text" class="form-input" id="f-end_date" value="${escapeHtml(d.end_date || '')}" placeholder="Leave empty for Present">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" class="form-input" id="f-location" value="${escapeHtml(d.location || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Key Highlights (one per line)</label>
            <textarea class="form-textarea" id="f-highlights" rows="6">${(d.highlights || []).join('\n')}</textarea>
        </div>
    `;
}

function certificationForm(d) {
    return `
        <div class="form-group">
            <label class="form-label">Certification Name</label>
            <input type="text" class="form-input" id="f-name" value="${escapeHtml(d.name || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Provider / Issuer</label>
            <input type="text" class="form-input" id="f-provider" value="${escapeHtml(d.provider || '')}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Issue Date</label>
                <input type="text" class="form-input" id="f-issue_date" value="${escapeHtml(d.issue_date || '')}" placeholder="Jan 2024">
            </div>
            <div class="form-group">
                <label class="form-label">Expiry Date (optional)</label>
                <input type="text" class="form-input" id="f-expiry_date" value="${escapeHtml(d.expiry_date || '')}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Credential ID (optional)</label>
            <input type="text" class="form-input" id="f-credential_id" value="${escapeHtml(d.credential_id || '')}">
        </div>
    `;
}

function educationForm(d) {
    return `
        <div class="form-group">
            <label class="form-label">Degree / Qualification</label>
            <input type="text" class="form-input" id="f-degree_title" value="${escapeHtml(d.degree_title || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Institution</label>
            <input type="text" class="form-input" id="f-institution_name" value="${escapeHtml(d.institution_name || '')}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Start Year</label>
                <input type="text" class="form-input" id="f-start_date" value="${escapeHtml(d.start_date || '')}" placeholder="2002">
            </div>
            <div class="form-group">
                <label class="form-label">End Year</label>
                <input type="text" class="form-input" id="f-end_date" value="${escapeHtml(d.end_date || '')}" placeholder="2007">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="f-description">${escapeHtml(d.description || '')}</textarea>
        </div>
    `;
}

function skillForm(d) {
    const iconOptions = [
        { value: 'code', label: 'Code / Programming' },
        { value: 'server', label: 'Server / Infrastructure' },
        { value: 'database', label: 'Database / Data' },
        { value: 'cloud', label: 'Cloud' },
        { value: 'settings', label: 'Tools / Settings' },
        { value: 'users', label: 'Leadership / Team' },
        { value: 'briefcase', label: 'Business' },
        { value: 'cpu', label: 'AI / Machine Learning' },
        { value: 'layers', label: 'Architecture / Design' },
        { value: 'default', label: 'Default' }
    ];
    
    return `
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">Category Name</label>
                <input type="text" class="form-input" id="f-name" value="${escapeHtml(d.name || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Icon</label>
                <select class="form-select" id="f-icon">
                    ${iconOptions.map(opt => `<option value="${opt.value}" ${d.icon === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Skills (comma separated)</label>
            <textarea class="form-textarea" id="f-skills">${(d.skills || []).join(', ')}</textarea>
        </div>
    `;
}

function projectForm(d) {
    return `
        <div class="form-group">
            <label class="form-label">Project Title</label>
            <input type="text" class="form-input" id="f-title" value="${escapeHtml(d.title || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="f-description">${escapeHtml(d.description || '')}</textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Technologies (comma separated)</label>
            <input type="text" class="form-input" id="f-technologies" value="${(d.technologies || []).join(', ')}">
        </div>
        <div class="form-group">
            <label class="form-label">Link (optional)</label>
            <input type="text" class="form-input" id="f-link" value="${escapeHtml(d.link || '')}">
        </div>
    `;
}

// Save Item
async function saveItem() {
    const { type, id } = currentModal;
    let endpoint = getEndpoint(type);
    let data = {};

    switch (type) {
        case 'profile':
            data = {
                name: val('f-name'),
                initials: val('f-initials'),
                title: val('f-title'),
                subtitle: val('f-subtitle'),
                bio: val('f-bio'),
                location: val('f-location'),
                languages: val('f-languages'),
                linkedin: val('f-linkedin'),
                email: val('f-email'),
                phone: val('f-phone'),
                visible: true
            };
            await api('/api/profile', { method: 'PUT', body: data });
            await uploadProfilePicture();
            await loadProfile(true);
            break;

        case 'experience':
            data = {
                job_title: val('f-job_title'),
                company_name: val('f-company_name'),
                start_date: val('f-start_date'),
                end_date: val('f-end_date'),
                location: val('f-location'),
                country_code: val('f-country_code') || 'ch',
                highlights: val('f-highlights').split('\n').filter(h => h.trim()),
                visible: true
            };
            if (id) {
                await api(`/api/${endpoint}/${id}`, { method: 'PUT', body: data });
            } else {
                await api(`/api/${endpoint}`, { method: 'POST', body: data });
            }
            await loadExperiences();
            await loadTimeline();
            break;

        case 'certification':
            data = {
                name: val('f-name'),
                provider: val('f-provider'),
                issue_date: val('f-issue_date'),
                expiry_date: val('f-expiry_date'),
                credential_id: val('f-credential_id'),
                visible: true
            };
            if (id) {
                await api(`/api/${endpoint}/${id}`, { method: 'PUT', body: data });
            } else {
                await api(`/api/${endpoint}`, { method: 'POST', body: data });
            }
            await loadCertifications();
            break;

        case 'education':
            data = {
                degree_title: val('f-degree_title'),
                institution_name: val('f-institution_name'),
                start_date: val('f-start_date'),
                end_date: val('f-end_date'),
                description: val('f-description'),
                visible: true
            };
            if (id) {
                await api(`/api/${endpoint}/${id}`, { method: 'PUT', body: data });
            } else {
                await api(`/api/${endpoint}`, { method: 'POST', body: data });
            }
            await loadEducation();
            break;

        case 'skill':
            data = {
                name: val('f-name'),
                icon: val('f-icon') || '💡',
                skills: val('f-skills').split(',').map(s => s.trim()).filter(s => s),
                visible: true
            };
            if (id) {
                await api(`/api/${endpoint}/${id}`, { method: 'PUT', body: data });
            } else {
                await api(`/api/${endpoint}`, { method: 'POST', body: data });
            }
            await loadSkills();
            break;

        case 'project':
            data = {
                title: val('f-title'),
                description: val('f-description'),
                technologies: val('f-technologies').split(',').map(t => t.trim()).filter(t => t),
                link: val('f-link'),
                visible: true
            };
            if (id) {
                await api(`/api/${endpoint}/${id}`, { method: 'PUT', body: data });
            } else {
                await api(`/api/${endpoint}`, { method: 'POST', body: data });
            }
            await loadProjects();
            break;
    }

    closeModal();
    toast('Saved successfully');
}

// Delete Item
async function deleteItem() {
    const { type, id } = currentModal;
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this item?')) {
        const endpoint = getEndpoint(type);
        await api(`/api/${endpoint}/${id}`, { method: 'DELETE' });
        closeModal();
        await reloadSection(endpoint);
        if (endpoint === 'experiences') await loadTimeline();
        toast('Deleted');
    }
}

async function confirmDelete(endpoint, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        await api(`/api/${endpoint}/${id}`, { method: 'DELETE' });
        await reloadSection(endpoint);
        if (endpoint === 'experiences') await loadTimeline();
        toast('Deleted');
    }
}

// Show All Items
async function showAllItems() {
    const cv = await api('/api/cv');
    
    // Show all sections
    for (const section of Object.keys(sectionVisibility)) {
        await api(`/api/sections/${section}`, { method: 'PUT', body: { visible: true } });
    }
    
    // Show all items
    for (const exp of cv.experiences) {
        await api(`/api/experiences/${exp.id}`, { method: 'PUT', body: { ...exp, visible: true } });
    }
    for (const cert of cv.certifications) {
        await api(`/api/certifications/${cert.id}`, { method: 'PUT', body: { ...cert, visible: true } });
    }
    for (const edu of cv.education) {
        await api(`/api/education/${edu.id}`, { method: 'PUT', body: { ...edu, visible: true } });
    }
    for (const skill of cv.skills) {
        await api(`/api/skills/${skill.id}`, { method: 'PUT', body: { ...skill, visible: true } });
    }
    for (const proj of cv.projects) {
        await api(`/api/projects/${proj.id}`, { method: 'PUT', body: { ...proj, visible: true } });
    }
    
    await initAdmin();
    toast('All items visible');
}

// Export/Import
async function exportData() {
    const data = await api('/api/cv');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cv-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported');
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            await api('/api/import', { method: 'POST', body: data });
            await initAdmin();
            toast('Imported successfully');
        } catch (err) {
            toast('Invalid file', 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Helpers
function getEndpoint(type) {
    const map = {
        'experience': 'experiences',
        'certification': 'certifications',
        'education': 'education',
        'skill': 'skills',
        'project': 'projects'
    };
    return map[type] || type;
}

async function reloadSection(endpoint) {
    switch (endpoint) {
        case 'experiences': await loadExperiences(); break;
        case 'certifications': await loadCertifications(); break;
        case 'education': await loadEducation(); break;
        case 'skills': await loadSkills(); break;
        case 'projects': await loadProjects(); break;
    }
}

function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

// Profile Picture Functions
let pendingProfilePicture = null;

function previewProfilePicture(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast('Image too large. Maximum size is 5MB.', 'error');
            input.value = '';
            return;
        }
        
        // Store for upload on save
        pendingProfilePicture = file;
        
        // Preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('profilePreviewImg');
            const initials = document.getElementById('profilePreviewInitials');
            img.src = e.target.result;
            img.style.display = 'block';
            initials.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function removeProfilePicture() {
    pendingProfilePicture = 'remove';
    const img = document.getElementById('profilePreviewImg');
    const initials = document.getElementById('profilePreviewInitials');
    img.style.display = 'none';
    initials.style.display = 'flex';
    document.getElementById('f-picture').value = '';
}

async function uploadProfilePicture() {
    if (pendingProfilePicture === 'remove') {
        // Delete the picture
        try {
            await fetch('/api/profile/picture', { method: 'DELETE' });
        } catch (err) {
            console.error('Failed to delete picture:', err);
        }
        pendingProfilePicture = null;
        return;
    }
    
    if (pendingProfilePicture && pendingProfilePicture instanceof File) {
        const formData = new FormData();
        formData.append('picture', pendingProfilePicture);
        
        try {
            const response = await fetch('/api/profile/picture', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
        } catch (err) {
            console.error('Failed to upload picture:', err);
            toast('Failed to upload picture', 'error');
        }
        pendingProfilePicture = null;
    }
}

function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3000);
}

// Icons
function visibilityIcon(visible) {
    return visible 
        ? '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>'
        : '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>';
}

function editIcon() {
    return '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>';
}

function deleteIcon() {
    return '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
}

// ===========================
// Dataset Management
// ===========================

async function saveAsDataset() {
    const name = prompt('Enter a name for this dataset:');
    if (!name || !name.trim()) return;
    
    try {
        const result = await api('/api/datasets', { method: 'POST', body: { name: name.trim() } });
        if (result.success) {
            toast(result.updated ? 'Dataset updated' : 'Dataset saved');
        } else {
            toast(result.error || 'Failed to save', 'error');
        }
    } catch (err) {
        toast('Failed to save dataset', 'error');
    }
}

async function openDatasetsModal() {
    await loadDatasetsList();
    document.getElementById('datasetsModalOverlay').classList.add('active');
}

function closeDatasetsModal() {
    document.getElementById('datasetsModalOverlay').classList.remove('active');
}

async function loadDatasetsList() {
    const datasets = await api('/api/datasets');
    const container = document.getElementById('datasetsList');
    
    if (datasets.length === 0) {
        container.innerHTML = '<p style="color: var(--gray-500); text-align: center; padding: 20px;">No saved datasets yet.<br>Use "Save As..." to save your current CV.</p>';
        return;
    }
    
    container.innerHTML = datasets.map(ds => `
        <div class="dataset-item" data-id="${ds.id}">
            <div class="dataset-info">
                <div class="dataset-name">${escapeHtml(ds.name)}</div>
                <div class="dataset-date">Last updated: ${formatDateTime(ds.updated_at)}</div>
            </div>
            <div class="dataset-actions">
                <button class="btn btn-primary btn-sm" onclick="loadDataset(${ds.id}, '${escapeHtml(ds.name).replace(/'/g, "\\'")}')">Load</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDataset(${ds.id}, '${escapeHtml(ds.name).replace(/'/g, "\\'")}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function loadDataset(id, name) {
    if (!confirm(`Load dataset "${name}"? This will replace your current CV data.`)) return;
    
    try {
        const result = await api(`/api/datasets/${id}/load`, { method: 'POST' });
        if (result.success) {
            closeDatasetsModal();
            await initAdmin();
            toast(`Loaded: ${result.name}`);
        } else {
            toast(result.error || 'Failed to load', 'error');
        }
    } catch (err) {
        toast('Failed to load dataset', 'error');
    }
}

async function deleteDataset(id, name) {
    if (!confirm(`Delete dataset "${name}"? This cannot be undone.`)) return;
    
    try {
        await api(`/api/datasets/${id}`, { method: 'DELETE' });
        await loadDatasetsList();
        toast('Dataset deleted');
    } catch (err) {
        toast('Failed to delete dataset', 'error');
    }
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===========================
// Theme Color Picker
// ===========================

let currentColor = '#0066ff';
let colorWheelCtx = null;
let isDraggingWheel = false;

function initColorPicker() {
    const canvas = document.getElementById('colorWheel');
    if (!canvas) return;
    
    colorWheelCtx = canvas.getContext('2d');
    drawColorWheel();
    
    // Load saved color from server
    loadThemeColor();
    
    // Canvas events
    canvas.addEventListener('mousedown', startColorPick);
    canvas.addEventListener('mousemove', pickColorOnDrag);
    canvas.addEventListener('mouseup', stopColorPick);
    canvas.addEventListener('mouseleave', stopColorPick);
    
    // Touch support
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startColorPick(e.touches[0]); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); pickColorOnDrag(e.touches[0]); });
    canvas.addEventListener('touchend', stopColorPick);
    
    // Brightness slider
    document.getElementById('colorBrightness').addEventListener('input', () => {
        drawColorWheel();
    });
    
    // Hex input
    document.getElementById('colorHexInput').addEventListener('change', (e) => {
        const hex = e.target.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            currentColor = hex;
            updateColorPickerUI(hex);
        }
    });
    
    // Presets
    document.querySelectorAll('.color-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            const color = preset.dataset.color;
            currentColor = color;
            updateColorPickerUI(color);
        });
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('colorPickerDropdown');
        const wrapper = document.querySelector('.color-picker-wrapper');
        if (dropdown.classList.contains('active') && !wrapper.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

async function loadThemeColor() {
    try {
        const result = await api('/api/settings/themeColor');
        if (result.value) {
            currentColor = result.value;
            applyColorToCSS(currentColor);
            updateColorPickerUI(currentColor);
        }
    } catch (err) {
        // Fallback to localStorage
        const savedColor = localStorage.getItem('cvThemeColor');
        if (savedColor) {
            currentColor = savedColor;
            applyColorToCSS(currentColor);
            updateColorPickerUI(currentColor);
        }
    }
}

function drawColorWheel() {
    const canvas = document.getElementById('colorWheel');
    const ctx = colorWheelCtx;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);
    const brightness = document.getElementById('colorBrightness')?.value || 50;
    
    // Draw color wheel
    for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 1) * Math.PI / 180;
        const endAngle = (angle + 1) * Math.PI / 180;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        const hslColor = `hsl(${angle}, 100%, ${brightness}%)`;
        const hslWhite = `hsl(${angle}, 0%, ${brightness}%)`;
        gradient.addColorStop(0, hslWhite);
        gradient.addColorStop(1, hslColor);
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function startColorPick(e) {
    isDraggingWheel = true;
    pickColor(e);
}

function pickColorOnDrag(e) {
    if (isDraggingWheel) pickColor(e);
}

function stopColorPick() {
    isDraggingWheel = false;
}

function pickColor(e) {
    const canvas = document.getElementById('colorWheel');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.pageX) - rect.left;
    const y = (e.clientY || e.pageY) - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(centerX, centerY);
    
    if (distance <= radius) {
        const imageData = colorWheelCtx.getImageData(x, y, 1, 1).data;
        const hex = rgbToHex(imageData[0], imageData[1], imageData[2]);
        currentColor = hex;
        updateColorPickerUI(hex);
        
        // Update cursor position
        const cursor = document.getElementById('colorWheelCursor');
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
    }
}

function updateColorPickerUI(hex) {
    document.getElementById('colorPreview').style.backgroundColor = hex;
    document.getElementById('colorHexInput').value = hex.toUpperCase();
    
    // Update preset selection
    document.querySelectorAll('.color-preset').forEach(preset => {
        preset.classList.toggle('active', preset.dataset.color.toLowerCase() === hex.toLowerCase());
    });
}

function toggleColorPicker() {
    const dropdown = document.getElementById('colorPickerDropdown');
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) {
        updateColorPickerUI(currentColor);
    }
}

async function applyThemeColor() {
    applyColorToCSS(currentColor);
    try {
        await api('/api/settings/themeColor', { method: 'PUT', body: { value: currentColor } });
    } catch (err) {
        // Fallback to localStorage
        localStorage.setItem('cvThemeColor', currentColor);
    }
    document.getElementById('colorPickerDropdown').classList.remove('active');
    toast('Theme color applied');
}

async function resetThemeColor() {
    currentColor = '#0066ff';
    applyColorToCSS(currentColor);
    try {
        await api('/api/settings/themeColor', { method: 'PUT', body: { value: null } });
    } catch (err) {
        localStorage.removeItem('cvThemeColor');
    }
    updateColorPickerUI(currentColor);
    document.getElementById('colorPickerDropdown').classList.remove('active');
    toast('Theme reset to default');
}

function applyColorToCSS(hex) {
    const root = document.documentElement;
    const hsl = hexToHSL(hex);
    
    // Generate color variants
    const primary = hex;
    const primaryDark = hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 10));
    const primaryLight = hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.min(hsl.l + 15, 80));
    const accent = hslToHex((hsl.h + 15) % 360, hsl.s, hsl.l);
    const dark = hslToHex(hsl.h, hsl.s, 15);
    const light = hslToHex(hsl.h, 30, 90);
    const veryLight = hslToHex(hsl.h, 20, 97);
    
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-dark', primaryDark);
    root.style.setProperty('--primary-light', primaryLight);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--dark', dark);
    root.style.setProperty('--light', light);
    root.style.setProperty('--very-light', veryLight);
}

// Color conversion utilities
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function hexToHSL(hex) {
    const rgb = hexToRGB(hex);
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Initialize color picker when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initColorPicker, 100);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeDatasetsModal();
    }
});

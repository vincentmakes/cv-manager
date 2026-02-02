/* CV Manager - Admin-Specific JavaScript */

// State
let currentModal = { type: null, id: null };
let sectionVisibility = {};
let sectionOrder = [];

// Parse date string into comparable numeric value for sorting
// Handles formats: "2020", "2020-01", "Jan 2020", etc.
function parseDateForSort(dateStr) {
    if (!dateStr) return 0;
    
    // Format: "YYYY" (year only)
    if (/^\d{4}$/.test(dateStr)) {
        return parseInt(dateStr) * 100; // e.g., 2020 -> 202000
    }
    
    // Format: "YYYY-MM" (ISO month)
    if (/^\d{4}-\d{2}$/.test(dateStr)) {
        const [year, month] = dateStr.split('-');
        return parseInt(year) * 100 + parseInt(month); // e.g., 2020-03 -> 202003
    }
    
    // Format: "Mon YYYY" (e.g., "Jan 2020")
    const monthMatch = dateStr.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (monthMatch) {
        const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        const monthIdx = months.indexOf(monthMatch[1].toLowerCase().substring(0, 3));
        const year = parseInt(monthMatch[2]);
        return year * 100 + (monthIdx >= 0 ? monthIdx + 1 : 0);
    }
    
    // Fallback: try to extract year
    const yearMatch = dateStr.match(/(\d{4})/);
    if (yearMatch) {
        return parseInt(yearMatch[1]) * 100;
    }
    
    return 0;
}

// Initialize Admin
async function initAdmin() {
    sectionOrder = await loadSectionOrder();
    sectionVisibility = await loadSectionsAdmin();
    await loadProfile(true);
    await renderSectionsInOrder();
    await generateATSContent();
    await setupPrintPagination();
    await loadPageSplitsSetting();
}

// Load and apply page splits settings on init
async function loadPageSplitsSetting() {
    try {
        const sectionSplits = await api('/api/settings/allowSectionSplits');
        const itemSplits = await api('/api/settings/allowItemSplits');
        applySplitSettings(sectionSplits.value === 'true', itemSplits.value === 'true');
    } catch (err) {
        // Default to false (prevent splits)
    }
}

// Pagination settings cache
let paginationSettings = {
    enabled: false,
    position: 'bottom-center',
    style: 'simple',
    cvName: ''
};

// Setup print pagination with @page rules
async function setupPrintPagination() {
    try {
        const enabled = await api('/api/settings/paginationEnabled');
        const position = await api('/api/settings/paginationPosition');
        const style = await api('/api/settings/paginationStyle');
        const profile = await api('/api/profile');
        
        paginationSettings.enabled = enabled.value === 'true';
        paginationSettings.position = position.value || 'bottom-center';
        paginationSettings.style = style.value || 'simple';
        paginationSettings.cvName = profile.name || 'CV';
    } catch (err) {
        console.log('Pagination settings not loaded:', err);
    }
    
    // Add print event listeners
    window.addEventListener('beforeprint', injectPaginationStyles);
    window.addEventListener('afterprint', removePaginationStyles);
}

// Inject @page CSS rules for pagination
function injectPaginationStyles() {
    if (!paginationSettings.enabled) return;
    
    removePaginationStyles();
    
    const pos = paginationSettings.position;
    const style = paginationSettings.style;
    const name = paginationSettings.cvName;
    
    // Determine margin box based on position
    let marginBox;
    switch (pos) {
        case 'top-left': marginBox = '@top-left'; break;
        case 'top-center': marginBox = '@top-center'; break;
        case 'top-right': marginBox = '@top-right'; break;
        case 'bottom-left': marginBox = '@bottom-left'; break;
        case 'bottom-right': marginBox = '@bottom-right'; break;
        default: marginBox = '@bottom-center';
    }
    
    // Determine content based on style
    let content;
    switch (style) {
        case 'with-total': content = 'counter(page) " of " counter(pages)'; break;
        case 'with-name': content = `"${name} | " counter(page)`; break;
        case 'minimal': content = '"— " counter(page) " —"'; break;
        default: content = 'counter(page)';
    }
    
    const css = `
        @page {
            ${marginBox} {
                content: ${content};
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 10px;
                color: #6b7280;
            }
        }
    `;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'pagination-print-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
}

// Remove pagination styles after print
function removePaginationStyles() {
    const existing = document.getElementById('pagination-print-styles');
    if (existing) existing.remove();
}

// Update pagination settings (called when settings change)
function updatePaginationSettings(key, value) {
    if (key === 'paginationEnabled') paginationSettings.enabled = value === true || value === 'true';
    else if (key === 'paginationPosition') paginationSettings.position = value;
    else if (key === 'paginationStyle') paginationSettings.style = value;
}

// Load section order from API
async function loadSectionOrder() {
    const order = await api('/api/sections/order');
    return order;
}

// Render sections in the correct order
async function renderSectionsInOrder() {
    const container = document.querySelector('.container');
    
    // Load all section data
    await loadTimeline();
    await loadExperiences();
    await loadCertifications();
    await loadEducation();
    await loadSkills();
    await loadProjects();
    await loadCustomSections();
    
    // Get all section elements (built-in sections)
    const sectionElements = {
        'about': document.getElementById('section-about'),
        'timeline': document.getElementById('section-timeline'),
        'experience': document.getElementById('section-experience'),
        'certifications': document.getElementById('section-certifications'),
        'education': document.getElementById('section-education'),
        'skills': document.getElementById('section-skills'),
        'projects': document.getElementById('section-projects')
    };
    
    // Add custom section elements
    customSections.forEach(cs => {
        const el = document.getElementById(`section-${cs.section_key}`);
        if (el) {
            sectionElements[cs.section_key] = el;
        }
    });
    
    // Reorder sections based on sectionOrder
    sectionOrder.forEach(section => {
        const el = sectionElements[section.key];
        if (el) {
            container.appendChild(el);
            
            // Apply hidden-print class if section is visible but not print_visible
            if (section.visible && section.print_visible === false) {
                el.classList.add('hidden-print');
            } else if (section.visible) {
                el.classList.remove('hidden-print');
            }
        }
    });
}

// Load custom sections and render them
async function loadCustomSections() {
    await loadCustomSectionsData();
    
    // Remove any existing custom sections from DOM
    document.querySelectorAll('.section.custom-section').forEach(el => el.remove());
    
    const container = document.querySelector('.container');
    
    customSections.forEach(section => {
        const sectionHtml = renderCustomSection(section);
        container.insertAdjacentHTML('beforeend', sectionHtml);
        
        // Apply visibility
        const el = document.getElementById(`section-${section.section_key}`);
        if (el && !section.visible) {
            el.classList.add('hidden-print');
        }
    });
}

// Render a custom section based on its layout type
function renderCustomSection(section) {
    const layoutType = layoutTypes.find(l => l.id === section.layout_type) || { id: 'grid-3' };
    const items = section.items || [];
    const visible = section.visible !== false;
    
    let contentHtml = '';
    
    switch (section.layout_type) {
        case 'social-links':
            contentHtml = renderSocialLinksLayout(items);
            break;
        case 'grid-2':
            contentHtml = renderGridLayout(items, 2);
            break;
        case 'grid-3':
            contentHtml = renderGridLayout(items, 3);
            break;
        case 'list':
            contentHtml = renderListLayout(items);
            break;
        case 'cards':
            contentHtml = renderCardsLayout(items);
            break;
        case 'bullet-list':
            contentHtml = renderBulletListLayout(items);
            break;
        default:
            contentHtml = renderGridLayout(items, 3);
    }
    
    return `
        <section class="section custom-section ${visible ? '' : 'hidden-print'}" id="section-${section.section_key}">
            <div class="section-header">
                <h2 class="section-title">${escapeHtml(section.name)}</h2>
                <div class="section-actions no-print">
                    <button class="icon-btn ${visible ? 'active' : ''}" onclick="toggleSection('${section.section_key}')" title="Toggle Visibility" id="toggle-${section.section_key}">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                </div>
            </div>
            <div class="custom-section-content" data-layout="${section.layout_type}">
                ${contentHtml}
            </div>
            <button class="add-btn no-print" onclick="manageCustomSectionItems(${section.id})">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Manage Items
            </button>
        </section>
    `;
}

// Social links layout
function renderSocialLinksLayout(items) {
    if (items.length === 0) return '<p class="empty-section">No social links added yet.</p>';
    
    return `<div class="social-links-grid">${items.map(item => {
        const platform = item.metadata?.platform || 'custom';
        const platformData = socialPlatforms.find(p => p.id === platform) || {};
        const icon = platformData.icon || '🔗';
        const color = platformData.color || 'var(--primary)';
        const visible = item.visible !== false;
        const displayUrl = item.link ? item.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '';
        
        return `
            <a href="${escapeHtml(item.link || '#')}" class="social-link-item ${visible ? '' : 'hidden-print'}" target="_blank" rel="noopener" style="--social-color: ${color}">
                <span class="social-link-icon">${icon}</span>
                <div class="social-link-text">
                    <span class="social-link-name">${escapeHtml(item.title)}</span>
                    ${displayUrl ? `<span class="social-link-url">${escapeHtml(displayUrl)}</span>` : ''}
                </div>
            </a>
        `;
    }).join('')}</div>`;
}

// Grid layout (2 or 3 columns)
function renderGridLayout(items, cols) {
    if (items.length === 0) return '<p class="empty-section">No items added yet.</p>';
    
    return `<div class="custom-grid custom-grid-${cols}">${items.map(item => {
        const visible = item.visible !== false;
        return `
            <div class="custom-grid-item ${visible ? '' : 'hidden-print'}">
                <h3 class="custom-item-title">${escapeHtml(item.title)}</h3>
                ${item.subtitle ? `<div class="custom-item-subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
                ${item.description ? `<p class="custom-item-description">${escapeHtml(item.description)}</p>` : ''}
                ${item.link ? `<a href="${escapeHtml(item.link)}" class="custom-item-link" target="_blank" rel="noopener">View →</a>` : ''}
            </div>
        `;
    }).join('')}</div>`;
}

// List layout
function renderListLayout(items) {
    if (items.length === 0) return '<p class="empty-section">No items added yet.</p>';
    
    return `<div class="custom-list">${items.map(item => {
        const visible = item.visible !== false;
        return `
            <div class="custom-list-item ${visible ? '' : 'hidden-print'}">
                <div class="custom-list-content">
                    <h3 class="custom-item-title">${escapeHtml(item.title)}</h3>
                    ${item.subtitle ? `<div class="custom-item-subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
                    ${item.description ? `<p class="custom-item-description">${escapeHtml(item.description)}</p>` : ''}
                </div>
                ${item.link ? `<a href="${escapeHtml(item.link)}" class="custom-item-link" target="_blank" rel="noopener">View →</a>` : ''}
            </div>
        `;
    }).join('')}</div>`;
}

// Cards layout
function renderCardsLayout(items) {
    if (items.length === 0) return '<p class="empty-section">No items added yet.</p>';
    
    return `<div class="custom-cards">${items.map(item => {
        const visible = item.visible !== false;
        return `
            <div class="custom-card ${visible ? '' : 'hidden-print'}">
                <h3 class="custom-card-title">${escapeHtml(item.title)}</h3>
                ${item.subtitle ? `<div class="custom-card-subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
                ${item.description ? `<p class="custom-card-description">${escapeHtml(item.description)}</p>` : ''}
                ${item.link ? `<a href="${escapeHtml(item.link)}" class="custom-card-link" target="_blank" rel="noopener">Learn More →</a>` : ''}
            </div>
        `;
    }).join('')}</div>`;
}

// Bullet list layout - each item's description contains lines that become bullets
function renderBulletListLayout(items) {
    if (items.length === 0) return '<p class="empty-section">No bullet points added yet.</p>';
    
    return `<div class="custom-bullet-lists">${items.map(item => {
        const visible = item.visible !== false;
        const hideTitle = item.metadata?.hideTitle || false;
        const bullets = (item.description || '').split('\n').filter(line => line.trim());
        
        return `
            <div class="custom-bullet-group ${visible ? '' : 'hidden-print'}">
                ${item.title && !hideTitle ? `<h3 class="custom-bullet-title">${escapeHtml(item.title)}</h3>` : ''}
                ${bullets.length > 0 ? `
                    <ul class="custom-bullet-list">
                        ${bullets.map(bullet => `<li>${escapeHtml(bullet)}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;
    }).join('')}</div>`;
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
// Sorted by start_date DESC (newest first)
async function loadExperiences() {
    const experiences = await api('/api/experiences');
    
    // Sort by start_date descending (newest first)
    experiences.sort((a, b) => {
        const dateA = parseDateForSort(a.start_date);
        const dateB = parseDateForSort(b.start_date);
        return dateB - dateA; // DESC: higher dates first
    });
    
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
            <div class="project-header">
                <h3 class="project-title" itemprop="name">${escapeHtml(proj.title)}</h3>
                ${proj.link ? `<a href="${escapeHtml(proj.link)}" class="project-link" target="_blank" rel="noopener" title="View Project">${linkIcon()}</a>` : ''}
            </div>
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
    
    // For custom sections, also update the customSections data
    if (section.startsWith('custom_')) {
        const customSection = customSections.find(cs => cs.section_key === section);
        if (customSection) {
            customSection.visible = newValue;
        }
    }
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
                icon: val('f-icon') || 'default',
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
    
    for (const section of Object.keys(sectionVisibility)) {
        await api(`/api/sections/${section}`, { method: 'PUT', body: { visible: true } });
    }
    
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
        if (file.size > 5 * 1024 * 1024) {
            toast('Image too large. Maximum size is 5MB.', 'error');
            input.value = '';
            return;
        }
        pendingProfilePicture = file;
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
        try { await fetch('/api/profile/picture', { method: 'DELETE' }); } catch (err) {}
        pendingProfilePicture = null;
        return;
    }
    if (pendingProfilePicture && pendingProfilePicture instanceof File) {
        const formData = new FormData();
        formData.append('picture', pendingProfilePicture);
        try {
            const response = await fetch('/api/profile/picture', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Upload failed');
        } catch (err) {
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

function printerIcon(printVisible) {
    return printVisible
        ? '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>'
        : '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4l16 16"/></svg>';
}

function editIcon() {
    return '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>';
}

function deleteIcon() {
    return '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
}

function linkIcon() {
    return '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>';
}

// ===========================
// Settings Modal - Section Reordering
// ===========================

let settingsSectionOrder = [];
let draggedItem = null;

async function openSettingsModal() {
    settingsSectionOrder = await api('/api/sections/order');
    renderSettingsSections();
    await loadPublicSettings();
    document.getElementById('settingsModalOverlay').classList.add('active');
}

async function loadPublicSettings() {
    // Load print button setting
    const printBtnSetting = await api('/api/settings/showPublicPrintButton');
    document.getElementById('settingShowPrintButton').checked = printBtnSetting.value === 'true';
    
    // Load pagination settings
    const paginationEnabled = await api('/api/settings/paginationEnabled');
    const paginationPosition = await api('/api/settings/paginationPosition');
    const paginationStyle = await api('/api/settings/paginationStyle');
    
    document.getElementById('settingPaginationEnabled').checked = paginationEnabled.value === 'true';
    document.getElementById('settingPaginationPosition').value = paginationPosition.value || 'bottom-center';
    document.getElementById('settingPaginationStyle').value = paginationStyle.value || 'simple';
    
    // Show/hide sub-options based on enabled state
    updatePaginationSubOptions(paginationEnabled.value === 'true');
    
    // Load page split settings
    const allowSectionSplits = await api('/api/settings/allowSectionSplits');
    const allowItemSplits = await api('/api/settings/allowItemSplits');
    
    document.getElementById('settingAllowSectionSplits').checked = allowSectionSplits.value === 'true';
    document.getElementById('settingAllowItemSplits').checked = allowItemSplits.value === 'true';
    
    // Show/hide item splits sub-option
    updateItemSplitsSubOption(allowSectionSplits.value === 'true');
    
    // Apply settings to body
    applySplitSettings(allowSectionSplits.value === 'true', allowItemSplits.value === 'true');
}

async function togglePublicSetting(key, value) {
    await api(`/api/settings/${key}`, { method: 'PUT', body: { value: value.toString() } });
    
    // Update pagination sub-options visibility when pagination is toggled
    if (key === 'paginationEnabled') {
        updatePaginationSubOptions(value);
    }
    
    // Update pagination cache for print
    if (key.startsWith('pagination')) {
        updatePaginationSettings(key, value);
    }
    
    toast('Setting saved');
}

// Handle split settings with sub-option visibility
async function toggleSplitSetting(key, value) {
    await api(`/api/settings/${key}`, { method: 'PUT', body: { value: value.toString() } });
    
    const sectionSplits = document.getElementById('settingAllowSectionSplits').checked;
    const itemSplits = document.getElementById('settingAllowItemSplits').checked;
    
    // Show/hide item splits sub-option when section splits is toggled
    if (key === 'allowSectionSplits') {
        updateItemSplitsSubOption(value);
        // If section splits is disabled, also disable item splits
        if (!value && itemSplits) {
            document.getElementById('settingAllowItemSplits').checked = false;
            await api('/api/settings/allowItemSplits', { method: 'PUT', body: { value: 'false' } });
        }
    }
    
    // Apply settings to body
    applySplitSettings(
        document.getElementById('settingAllowSectionSplits').checked,
        document.getElementById('settingAllowItemSplits').checked
    );
    
    toast('Setting saved');
}

// Show/hide item splits sub-option
function updateItemSplitsSubOption(sectionSplitsEnabled) {
    const itemSplitsOption = document.getElementById('itemSplitsOption');
    if (itemSplitsOption) {
        itemSplitsOption.style.display = sectionSplitsEnabled ? 'flex' : 'none';
    }
}

// Apply split settings classes to body
function applySplitSettings(sectionSplits, itemSplits) {
    document.body.classList.toggle('allow-section-splits', sectionSplits);
    document.body.classList.toggle('allow-item-splits', sectionSplits && itemSplits);
}

function updatePaginationSubOptions(enabled) {
    const optionsRow = document.getElementById('paginationOptionsRow');
    if (optionsRow) {
        optionsRow.style.display = enabled ? 'flex' : 'none';
    }
}

function closeSettingsModal() {
    document.getElementById('settingsModalOverlay').classList.remove('active');
}

function renderSettingsSections() {
    const container = document.getElementById('settingsSectionsList');
    
    container.innerHTML = settingsSectionOrder.map((section, index) => `
        <div class="settings-section-item" draggable="true" data-key="${section.key}" data-index="${index}">
            <div class="settings-section-drag">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                </svg>
            </div>
            <div class="settings-section-name">${escapeHtml(section.name)}</div>
            <div class="settings-section-actions">
                <button class="settings-section-btn ${section.visible ? 'active' : ''}" onclick="toggleSettingsSectionVisibility('${section.key}')" title="Show/Hide on Site">
                    ${visibilityIcon(section.visible)}
                </button>
                <button class="settings-section-btn ${section.print_visible !== false ? 'active' : ''} ${!section.visible ? 'disabled' : ''}" onclick="toggleSettingsSectionPrintVisibility('${section.key}')" title="Show/Hide in Print" ${!section.visible ? 'disabled' : ''}>
                    ${printerIcon(section.print_visible !== false)}
                </button>
                <button class="settings-section-btn" onclick="moveSettingsSection('${section.key}', -1)" title="Move Up" ${index === 0 ? 'disabled' : ''}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                </button>
                <button class="settings-section-btn" onclick="moveSettingsSection('${section.key}', 1)" title="Move Down" ${index === settingsSectionOrder.length - 1 ? 'disabled' : ''}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add drag-and-drop event listeners
    const items = container.querySelectorAll('.settings-section-item');
    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.key);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.settings-section-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    if (this !== draggedItem) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (draggedItem && this !== draggedItem) {
        const fromKey = draggedItem.dataset.key;
        const toKey = this.dataset.key;
        
        const fromIndex = settingsSectionOrder.findIndex(s => s.key === fromKey);
        const toIndex = settingsSectionOrder.findIndex(s => s.key === toKey);
        
        if (fromIndex !== -1 && toIndex !== -1) {
            const [moved] = settingsSectionOrder.splice(fromIndex, 1);
            settingsSectionOrder.splice(toIndex, 0, moved);
            renderSettingsSections();
        }
    }
}

function toggleSettingsSectionVisibility(key) {
    const section = settingsSectionOrder.find(s => s.key === key);
    if (section) {
        section.visible = !section.visible;
        // If hiding section, also hide from print
        if (!section.visible) {
            section.print_visible = false;
        }
        renderSettingsSections();
    }
}

function toggleSettingsSectionPrintVisibility(key) {
    const section = settingsSectionOrder.find(s => s.key === key);
    if (section && section.visible) {
        section.print_visible = section.print_visible === false ? true : false;
        renderSettingsSections();
    }
}

function moveSettingsSection(key, direction) {
    const index = settingsSectionOrder.findIndex(s => s.key === key);
    const newIndex = index + direction;
    
    if (newIndex >= 0 && newIndex < settingsSectionOrder.length) {
        const [moved] = settingsSectionOrder.splice(index, 1);
        settingsSectionOrder.splice(newIndex, 0, moved);
        renderSettingsSections();
    }
}

async function saveSettingsSectionOrder() {
    const sections = settingsSectionOrder.map((s, index) => ({
        key: s.key,
        visible: s.visible,
        print_visible: s.print_visible !== false,
        sort_order: index
    }));
    
    try {
        await api('/api/sections/order', { method: 'PUT', body: { sections } });
        sectionOrder = await loadSectionOrder();
        sectionVisibility = await loadSectionsAdmin();
        await renderSectionsInOrder();
        closeSettingsModal();
        toast('Section order saved');
    } catch (err) {
        toast('Failed to save section order', 'error');
    }
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
                ${ds.slug ? `<div class="dataset-url">
                    <span class="dataset-url-text">/v/${escapeHtml(ds.slug)}</span>
                    <button class="dataset-url-copy" onclick="copyDatasetUrl('${escapeHtml(ds.slug)}')" title="Copy preview URL">
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                    </button>
                </div>` : ''}
            </div>
            <div class="dataset-actions">
                ${ds.slug ? `<button class="btn btn-ghost btn-sm" onclick="previewDataset('${escapeHtml(ds.slug)}')" title="Preview saved version">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>` : ''}
                <button class="btn btn-primary btn-sm" onclick="loadDataset(${ds.id}, '${escapeHtml(ds.name).replace(/'/g, "\\'")}')">Load</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDataset(${ds.id}, '${escapeHtml(ds.name).replace(/'/g, "\\'")}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Preview dataset in new tab (admin only)
function previewDataset(slug) {
    window.open(`/v/${slug}`, '_blank');
}

// Copy dataset URL to clipboard (admin preview URL)
function copyDatasetUrl(slug) {
    // Use current origin since preview only works on admin
    const url = `${window.location.origin}/v/${slug}`;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            toast('Preview URL copied');
        }).catch((err) => {
            console.error('Clipboard API failed:', err);
            fallbackCopyToClipboard(url);
        });
    } else {
        fallbackCopyToClipboard(url);
    }
}

// Fallback copy method for non-HTTPS contexts
function fallbackCopyToClipboard(text) {
    try {
        const input = document.createElement('textarea');
        input.value = text;
        input.style.position = 'fixed';
        input.style.left = '-9999px';
        document.body.appendChild(input);
        input.focus();
        input.select();
        const success = document.execCommand('copy');
        document.body.removeChild(input);
        if (success) {
            toast('Preview URL copied');
        } else {
            toast('Copy failed - URL: ' + text, 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        toast('Copy failed - URL: ' + text, 'error');
    }
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
    loadThemeColor();
    
    canvas.addEventListener('mousedown', startColorPick);
    canvas.addEventListener('mousemove', pickColorOnDrag);
    canvas.addEventListener('mouseup', stopColorPick);
    canvas.addEventListener('mouseleave', stopColorPick);
    
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startColorPick(e.touches[0]); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); pickColorOnDrag(e.touches[0]); });
    canvas.addEventListener('touchend', stopColorPick);
    
    document.getElementById('colorBrightness').addEventListener('input', () => { drawColorWheel(); });
    
    document.getElementById('colorHexInput').addEventListener('change', (e) => {
        const hex = e.target.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            currentColor = hex;
            updateColorPickerUI(hex);
        }
    });
    
    document.querySelectorAll('.color-preset').forEach(preset => {
        preset.addEventListener('click', () => {
            const color = preset.dataset.color;
            currentColor = color;
            updateColorPickerUI(color);
        });
    });
    
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

function startColorPick(e) { isDraggingWheel = true; pickColor(e); }
function pickColorOnDrag(e) { if (isDraggingWheel) pickColor(e); }
function stopColorPick() { isDraggingWheel = false; }

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
        
        const cursor = document.getElementById('colorWheelCursor');
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
    }
}

function updateColorPickerUI(hex) {
    document.getElementById('colorPreview').style.backgroundColor = hex;
    document.getElementById('colorHexInput').value = hex.toUpperCase();
    
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
    
    root.style.setProperty('--primary', hex);
    root.style.setProperty('--primary-dark', hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 10)));
    root.style.setProperty('--primary-light', hslToHex(hsl.h, Math.min(hsl.s + 10, 100), Math.min(hsl.l + 15, 80)));
    root.style.setProperty('--accent', hslToHex((hsl.h + 15) % 360, hsl.s, hsl.l));
    root.style.setProperty('--dark', hslToHex(hsl.h, hsl.s, 15));
    root.style.setProperty('--light', hslToHex(hsl.h, 30, 90));
    root.style.setProperty('--very-light', hslToHex(hsl.h, 20, 97));
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function hexToHSL(hex) {
    const rgb = hexToRGB(hex);
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) { h = s = 0; }
    else {
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
    s /= 100; l /= 100;
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
        closeSettingsModal();
        closeCustomSectionModal();
        closeCustomItemModal();
    }
});

// ===========================
// Custom Sections Management
// ===========================

let customSections = [];
let layoutTypes = [];
let socialPlatforms = [];
let currentCustomSection = { id: null };
let currentCustomItem = { sectionId: null, itemId: null };
let inItemsView = false; // Track if we're in items management view

// Load custom sections data
async function loadCustomSectionsData() {
    customSections = await api('/api/custom-sections');
    layoutTypes = await api('/api/layout-types');
    socialPlatforms = await api('/api/social-platforms');
}

// Switch settings tabs
function switchSettingsTab(tabName) {
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    document.getElementById('settingsTabSections').classList.toggle('active', tabName === 'sections');
    document.getElementById('settingsTabCustom').classList.toggle('active', tabName === 'custom');
    document.getElementById('settingsTabPublic').classList.toggle('active', tabName === 'public');
    
    if (tabName === 'custom') {
        loadCustomSectionsList();
    }
}

// Render custom sections list
async function loadCustomSectionsList() {
    await loadCustomSectionsData();
    const container = document.getElementById('customSectionsList');
    
    // Restore the Save button (it may have been changed by manageCustomSectionItems)
    const saveBtn = document.querySelector('#customSectionModalOverlay .modal-footer-right .btn-primary');
    if (saveBtn) {
        saveBtn.textContent = 'Save';
        saveBtn.setAttribute('onclick', 'saveCustomSection()');
        saveBtn.style.display = '';
    }
    
    if (customSections.length === 0) {
        container.innerHTML = '<p style="color: var(--gray-500); text-align: center; padding: 20px;">No custom sections yet.<br>Click "Add Custom Section" to create one.</p>';
        return;
    }
    
    container.innerHTML = customSections.map(section => {
        const layoutType = layoutTypes.find(l => l.id === section.layout_type) || { name: section.layout_type };
        return `
            <div class="custom-section-item" data-id="${section.id}">
                <div class="custom-section-info">
                    <div class="custom-section-name">${escapeHtml(section.name)}</div>
                    <div class="custom-section-meta">
                        <span class="custom-section-layout">${layoutType.name}</span>
                        <span class="custom-section-count">${section.items?.length || 0} items</span>
                    </div>
                </div>
                <div class="custom-section-actions">
                    <button class="btn btn-ghost btn-sm" onclick="openCustomSectionModal(${section.id})" title="Edit Section">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="manageCustomSectionItems(${section.id})" title="Manage Items">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Open custom section modal
async function openCustomSectionModal(id = null) {
    currentCustomSection.id = id;
    inItemsView = false; // We're in section edit mode, not items view
    
    try {
        await loadCustomSectionsData();
    } catch (err) {
        console.error('Failed to load custom sections data:', err);
        toast('Failed to load section data', 'error');
        return;
    }
    
    // Ensure layoutTypes is an array
    if (!Array.isArray(layoutTypes) || layoutTypes.length === 0) {
        console.error('layoutTypes is empty or not an array:', layoutTypes);
        toast('Failed to load layout options', 'error');
        return;
    }
    
    let section = { name: '', layout_type: 'grid-3', icon: 'default' };
    if (id) {
        section = customSections.find(s => s.id === id) || section;
    }
    
    document.getElementById('customSectionModalTitle').textContent = id ? 'Edit Custom Section' : 'Add Custom Section';
    document.getElementById('deleteCustomSectionBtn').style.display = id ? 'block' : 'none';
    
    // Restore the Save button (it may have been changed by manageCustomSectionItems)
    const saveBtn = document.querySelector('#customSectionModalOverlay .modal-footer-right .btn-primary');
    if (saveBtn) {
        saveBtn.textContent = 'Save';
        saveBtn.setAttribute('onclick', 'saveCustomSection()');
        saveBtn.style.display = '';
    }
    
    document.getElementById('customSectionModalBody').innerHTML = `
        <div class="form-group">
            <label class="form-label">Section Name</label>
            <input type="text" class="form-input" id="cs-name" value="${escapeHtml(section.name || '')}" placeholder="e.g., Social Links, Awards, Publications">
        </div>
        <div class="form-group">
            <label class="form-label">Layout Type</label>
            <div class="layout-type-grid">
                ${layoutTypes.map(lt => `
                    <div class="layout-type-option ${section.layout_type === lt.id ? 'selected' : ''}" data-layout="${lt.id}" onclick="selectLayoutType('${lt.id}')">
                        <div class="layout-type-icon">${lt.icon}</div>
                        <div class="layout-type-name">${escapeHtml(lt.name)}</div>
                    </div>
                `).join('')}
            </div>
            <input type="hidden" id="cs-layout" value="${section.layout_type || 'grid-3'}">
        </div>
        <div class="form-group">
            <label class="form-label">Section Icon</label>
            <select class="form-select" id="cs-icon">
                <option value="default" ${section.icon === 'default' ? 'selected' : ''}>Default</option>
                <option value="star" ${section.icon === 'star' ? 'selected' : ''}>Star (Awards)</option>
                <option value="book" ${section.icon === 'book' ? 'selected' : ''}>Book (Publications)</option>
                <option value="link" ${section.icon === 'link' ? 'selected' : ''}>Link (Social)</option>
                <option value="globe" ${section.icon === 'globe' ? 'selected' : ''}>Globe (Languages)</option>
                <option value="heart" ${section.icon === 'heart' ? 'selected' : ''}>Heart (Interests)</option>
                <option value="award" ${section.icon === 'award' ? 'selected' : ''}>Award</option>
                <option value="briefcase" ${section.icon === 'briefcase' ? 'selected' : ''}>Briefcase</option>
            </select>
        </div>
    `;
    
    document.getElementById('customSectionModalOverlay').classList.add('active');
}

function selectLayoutType(layoutId) {
    document.querySelectorAll('.layout-type-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.layout === layoutId);
    });
    document.getElementById('cs-layout').value = layoutId;
}

async function closeCustomSectionModal() {
    document.getElementById('customSectionModalOverlay').classList.remove('active');
    
    const wasInItemsView = inItemsView;
    currentCustomSection.id = null;
    inItemsView = false;
    
    // Restore buttons for next time
    const saveBtn = document.querySelector('#customSectionModalOverlay .modal-footer-right .btn-primary');
    const cancelBtn = document.querySelector('#customSectionModalOverlay .modal-footer-right .btn-ghost');
    if (saveBtn) {
        saveBtn.textContent = 'Save';
        saveBtn.setAttribute('onclick', 'saveCustomSection()');
        saveBtn.style.display = '';
    }
    if (cancelBtn) {
        cancelBtn.textContent = 'Cancel';
        cancelBtn.setAttribute('onclick', 'closeCustomSectionModal()');
    }
    
    // Refresh custom sections on main page if we were in items view
    if (wasInItemsView) {
        await loadCustomSections();
    }
}

async function saveCustomSection() {
    const nameEl = document.getElementById('cs-name');
    const layoutEl = document.getElementById('cs-layout');
    const iconEl = document.getElementById('cs-icon');
    
    if (!nameEl || !layoutEl || !iconEl) {
        toast('Form not ready. Please try again.', 'error');
        return;
    }
    
    const name = nameEl.value.trim();
    const layout_type = layoutEl.value;
    const icon = iconEl.value;
    
    if (!name) {
        toast('Please enter a section name', 'error');
        return;
    }
    
    try {
        if (currentCustomSection.id) {
            await api(`/api/custom-sections/${currentCustomSection.id}`, { 
                method: 'PUT', 
                body: { name, layout_type, icon } 
            });
            toast('Section updated');
        } else {
            await api('/api/custom-sections', { 
                method: 'POST', 
                body: { name, layout_type, icon } 
            });
            toast('Section created');
        }
        
        closeCustomSectionModal();
        await loadCustomSectionsList();
        // Refresh section order since custom sections affect it
        settingsSectionOrder = await api('/api/sections/order');
        renderSettingsSections();
        // Refresh main page sections
        sectionOrder = await loadSectionOrder();
        sectionVisibility = await loadSectionsAdmin();
        await renderSectionsInOrder();
    } catch (err) {
        toast('Failed to save section', 'error');
    }
}

async function deleteCustomSection() {
    if (!currentCustomSection.id) return;
    
    if (!confirm('Delete this custom section and all its items? This cannot be undone.')) return;
    
    try {
        await api(`/api/custom-sections/${currentCustomSection.id}`, { method: 'DELETE' });
        toast('Section deleted');
        closeCustomSectionModal();
        await loadCustomSectionsList();
        settingsSectionOrder = await api('/api/sections/order');
        renderSettingsSections();
        // Refresh main page sections
        sectionOrder = await loadSectionOrder();
        sectionVisibility = await loadSectionsAdmin();
        await renderSectionsInOrder();
    } catch (err) {
        toast('Failed to delete section', 'error');
    }
}

// Manage custom section items
async function manageCustomSectionItems(sectionId) {
    const section = customSections.find(s => s.id === sectionId);
    if (!section) return;
    
    currentCustomItem.sectionId = sectionId;
    inItemsView = true; // Mark that we're in items view for refresh on close
    
    const layoutType = layoutTypes.find(l => l.id === section.layout_type) || { name: section.layout_type };
    const items = section.items || [];
    
    document.getElementById('customSectionModalTitle').textContent = `${section.name} - Items`;
    document.getElementById('deleteCustomSectionBtn').style.display = 'none';
    
    // Change footer buttons for items view
    const saveBtn = document.querySelector('#customSectionModalOverlay .modal-footer-right .btn-primary');
    const cancelBtn = document.querySelector('#customSectionModalOverlay .modal-footer-right .btn-ghost');
    if (saveBtn) {
        saveBtn.textContent = 'Done';
        saveBtn.setAttribute('onclick', 'closeCustomSectionModal()');
    }
    if (cancelBtn) {
        cancelBtn.textContent = 'Close';
        cancelBtn.setAttribute('onclick', 'closeCustomSectionModal()');
    }
    
    document.getElementById('customSectionModalBody').innerHTML = `
        <div class="settings-info" style="margin-bottom: 12px;">
            Layout: <strong>${escapeHtml(layoutType.name)}</strong> | ${items.length} items
        </div>
        <button class="add-btn" onclick="openCustomItemModal(${sectionId})" style="margin-top: 0; margin-bottom: 12px;">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Item
        </button>
        <div class="custom-items-list">
            ${items.length === 0 ? '<p style="color: var(--gray-500); text-align: center; padding: 20px;">No items yet.</p>' : items.map(item => `
                <div class="custom-item-row" data-id="${item.id}">
                    <div class="custom-item-info">
                        <div class="custom-item-title">${escapeHtml(item.title || 'Untitled')}</div>
                        ${item.subtitle ? `<div class="custom-item-subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
                    </div>
                    <div class="custom-item-actions">
                        <button class="item-btn" onclick="openCustomItemModal(${sectionId}, ${item.id})" title="Edit">
                            ${editIcon()}
                        </button>
                        <button class="item-btn delete" onclick="confirmDeleteCustomItem(${sectionId}, ${item.id})" title="Delete">
                            ${deleteIcon()}
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('customSectionModalOverlay').classList.add('active');
}

// Close items view and refresh the custom sections on the page (now handled by closeCustomSectionModal with inItemsView flag)

// Custom item modal
function openCustomItemModal(sectionId, itemId = null) {
    currentCustomItem.sectionId = sectionId;
    currentCustomItem.itemId = itemId;
    
    const section = customSections.find(s => s.id === sectionId);
    if (!section) return;
    
    let item = { title: '', subtitle: '', description: '', link: '', icon: '', metadata: {} };
    if (itemId) {
        item = section.items.find(i => i.id === itemId) || item;
    }
    
    document.getElementById('customItemModalTitle').textContent = itemId ? 'Edit Item' : 'Add Item';
    document.getElementById('deleteCustomItemBtn').style.display = itemId ? 'block' : 'none';
    
    // Different forms based on layout type
    let formHtml = '';
    
    if (section.layout_type === 'social-links') {
        // Social links form with platform selector
        const platform = item.metadata?.platform || 'custom';
        formHtml = `
            <div class="form-group">
                <label class="form-label">Platform</label>
                <select class="form-select" id="ci-platform" onchange="updateSocialPlatformFields()">
                    ${socialPlatforms.map(p => `<option value="${p.id}" ${platform === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Display Name</label>
                <input type="text" class="form-input" id="ci-title" value="${escapeHtml(item.title || '')}" placeholder="e.g., @username or My Website">
            </div>
            <div class="form-group">
                <label class="form-label">Link URL</label>
                <input type="text" class="form-input" id="ci-link" value="${escapeHtml(item.link || '')}" placeholder="https://...">
            </div>
        `;
    } else if (section.layout_type === 'bullet-list') {
        // Bullet list form - title for grouping, description becomes bullet points
        const hideTitle = item.metadata?.hideTitle || false;
        formHtml = `
            <div class="form-group">
                <label class="form-label">Group Title (optional)</label>
                <input type="text" class="form-input" id="ci-title" value="${escapeHtml(item.title || '')}" placeholder="e.g., Key Achievements, Technical Skills...">
            </div>
            <div class="form-group">
                <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="ci-hide-title" ${hideTitle ? 'checked' : ''} style="width: 16px; height: 16px;">
                    <span>Hide group title</span>
                </label>
                <div class="form-hint">Display bullet points without the group heading.</div>
            </div>
            <div class="form-group">
                <label class="form-label">Bullet Points (one per line)</label>
                <textarea class="form-textarea" id="ci-description" rows="8" placeholder="First bullet point\nSecond bullet point\nThird bullet point">${escapeHtml(item.description || '')}</textarea>
            </div>
        `;
    } else {
        // Generic form for other layouts
        formHtml = `
            <div class="form-group">
                <label class="form-label">Title</label>
                <input type="text" class="form-input" id="ci-title" value="${escapeHtml(item.title || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Subtitle (optional)</label>
                <input type="text" class="form-input" id="ci-subtitle" value="${escapeHtml(item.subtitle || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">Description (optional)</label>
                <textarea class="form-textarea" id="ci-description">${escapeHtml(item.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Link URL (optional)</label>
                <input type="text" class="form-input" id="ci-link" value="${escapeHtml(item.link || '')}" placeholder="https://...">
            </div>
        `;
    }
    
    document.getElementById('customItemModalBody').innerHTML = formHtml;
    document.getElementById('customItemModalOverlay').classList.add('active');
}

// Update social platform fields when platform changes
function updateSocialPlatformFields() {
    const platformSelect = document.getElementById('ci-platform');
    const titleInput = document.getElementById('ci-title');
    
    if (!platformSelect || !titleInput) return;
    
    const platform = platformSelect.value;
    const platformData = socialPlatforms.find(p => p.id === platform);
    
    // Update placeholder based on platform
    const placeholders = {
        'linkedin': 'e.g., John Doe',
        'github': 'e.g., @username',
        'twitter': 'e.g., @username',
        'instagram': 'e.g., @username',
        'youtube': 'e.g., Channel Name',
        'medium': 'e.g., @username',
        'devto': 'e.g., @username',
        'dribbble': 'e.g., @username',
        'behance': 'e.g., Your Name',
        'website': 'e.g., My Website',
        'email': 'e.g., Contact Email',
        'phone': 'e.g., +1 234 567 8900',
        'custom': 'e.g., Display Name'
    };
    
    titleInput.placeholder = placeholders[platform] || 'Display Name';
}

function closeCustomItemModal() {
    document.getElementById('customItemModalOverlay').classList.remove('active');
    currentCustomItem.itemId = null;
}

async function saveCustomItem() {
    const section = customSections.find(s => s.id === currentCustomItem.sectionId);
    if (!section) return;
    
    const title = document.getElementById('ci-title')?.value?.trim() || '';
    const subtitle = document.getElementById('ci-subtitle')?.value?.trim() || '';
    const description = document.getElementById('ci-description')?.value?.trim() || '';
    const link = document.getElementById('ci-link')?.value?.trim() || '';
    
    let metadata = {};
    if (section.layout_type === 'social-links') {
        const platform = document.getElementById('ci-platform')?.value || 'custom';
        const platformData = socialPlatforms.find(p => p.id === platform);
        metadata = { platform, icon: platformData?.icon, color: platformData?.color };
    } else if (section.layout_type === 'bullet-list') {
        const hideTitle = document.getElementById('ci-hide-title')?.checked || false;
        metadata = { hideTitle };
    }
    
    // Validation - title not required for bullet-list with hideTitle
    if (section.layout_type !== 'bullet-list' && !title) {
        toast('Please enter a title', 'error');
        return;
    }
    
    // Bullet list requires description (the bullet points)
    if (section.layout_type === 'bullet-list' && !description) {
        toast('Please enter at least one bullet point', 'error');
        return;
    }
    
    try {
        if (currentCustomItem.itemId) {
            await api(`/api/custom-sections/${currentCustomItem.sectionId}/items/${currentCustomItem.itemId}`, { 
                method: 'PUT', 
                body: { title, subtitle, description, link, metadata } 
            });
            toast('Item updated');
        } else {
            await api(`/api/custom-sections/${currentCustomItem.sectionId}/items`, { 
                method: 'POST', 
                body: { title, subtitle, description, link, metadata } 
            });
            toast('Item added');
        }
        
        closeCustomItemModal();
        await loadCustomSectionsData();
        manageCustomSectionItems(currentCustomItem.sectionId);
    } catch (err) {
        toast('Failed to save item', 'error');
    }
}

async function confirmDeleteCustomItem(sectionId, itemId) {
    if (!confirm('Delete this item?')) return;
    
    try {
        await api(`/api/custom-sections/${sectionId}/items/${itemId}`, { method: 'DELETE' });
        toast('Item deleted');
        await loadCustomSectionsData();
        manageCustomSectionItems(sectionId);
    } catch (err) {
        toast('Failed to delete item', 'error');
    }
}

async function deleteCustomItem() {
    if (!currentCustomItem.sectionId || !currentCustomItem.itemId) return;
    await confirmDeleteCustomItem(currentCustomItem.sectionId, currentCustomItem.itemId);
    closeCustomItemModal();
}

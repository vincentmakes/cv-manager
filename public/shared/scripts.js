/* CV Manager - Shared JavaScript */

// SVG Icons for contact badges
const icons = {
    email: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    phone: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    location: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    linkedin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    languages: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    link: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>',
    // Skill category icons (flat style)
    code: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    server: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>',
    database: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
    cloud: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
    settings: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    users: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    briefcase: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    cpu: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
    layers: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    default: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};

// Get skill icon based on category name or icon hint
function getSkillIcon(iconHint, categoryName) {
    // Map common category names to icons
    const categoryMap = {
        'programming': 'code', 'development': 'code', 'languages': 'code', 'coding': 'code',
        'infrastructure': 'server', 'devops': 'server', 'systems': 'server',
        'database': 'database', 'data': 'database', 'sql': 'database',
        'cloud': 'cloud', 'aws': 'cloud', 'azure': 'cloud', 'gcp': 'cloud',
        'tools': 'settings', 'methodologies': 'settings', 'frameworks': 'settings',
        'leadership': 'users', 'management': 'users', 'soft skills': 'users', 'team': 'users',
        'business': 'briefcase', 'enterprise': 'briefcase', 'strategy': 'briefcase',
        'architecture': 'layers', 'design': 'layers',
        'ai': 'cpu', 'machine learning': 'cpu', 'artificial intelligence': 'cpu'
    };
    
    // Check if iconHint matches an icon name directly (new format)
    if (iconHint && icons[iconHint]) {
        return icons[iconHint];
    }
    
    // Try to match category name for auto-detection (works for legacy emoji icons too)
    const lowerName = (categoryName || '').toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
        if (lowerName.includes(key)) {
            return icons[value];
        }
    }
    
    return icons.default;
}

// API Base
const API = '';

// API Helper
async function api(endpoint, options = {}) {
    const res = await fetch(API + endpoint, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    return res.json();
}

// Utility Functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Global date format setting - loaded from settings API
let dateFormatSetting = 'MMM YYYY'; // default: "Jan 2020"

const DATE_FORMAT_OPTIONS = [
    { value: 'MMM YYYY', label: 'Jan 2020', example: 'Jan 2020' },
    { value: 'MMMM YYYY', label: 'January 2020', example: 'January 2020' },
    { value: 'MM/YYYY', label: '01/2020', example: '01/2020' },
    { value: 'MM.YYYY', label: '01.2020', example: '01.2020' },
    { value: 'MM-YYYY', label: '01-2020', example: '01-2020' },
    { value: 'YYYY-MM', label: '2020-01', example: '2020-01' },
    { value: 'YYYY', label: '2020 (year only)', example: '2020' }
];

function formatDate(dateStr) {
    if (!dateStr) return '';
    if (dateStr.match(/^\d{4}$/)) return dateStr;
    if (dateStr.match(/^\d{4}-\d{2}$/)) {
        const [y, m] = dateStr.split('-');
        const monthIdx = parseInt(m) - 1;
        const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const monthsFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        
        switch (dateFormatSetting) {
            case 'MMMM YYYY': return `${monthsFull[monthIdx]} ${y}`;
            case 'MM/YYYY': return `${m}/${y}`;
            case 'MM.YYYY': return `${m}.${y}`;
            case 'MM-YYYY': return `${m}-${y}`;
            case 'YYYY-MM': return `${y}-${m}`;
            case 'YYYY': return y;
            case 'MMM YYYY':
            default: return `${monthsShort[monthIdx]} ${y}`;
        }
    }
    return dateStr;
}

// Format date for ATS - consistent format: "Mon YYYY" or "YYYY"
function formatDateATS(dateStr) {
    if (!dateStr) return '';
    if (dateStr.match(/^\d{4}$/)) return dateStr;
    if (dateStr.match(/^\d{4}-\d{2}$/)) {
        const [y, m] = dateStr.split('-');
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return `${months[parseInt(m)-1]} ${y}`;
    }
    return dateStr;
}

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

// Apply custom section titles from section order data to the DOM
function applySectionTitles(sectionOrderData) {
    if (!sectionOrderData || !sectionOrderData.length) return;
    sectionOrderData.forEach(section => {
        const el = document.getElementById(`section-${section.key}`);
        if (el && section.name) {
            const titleEl = el.querySelector('.section-title');
            if (titleEl) {
                titleEl.textContent = section.name;
            }
        }
    });
}

// Load date format setting from API
async function loadDateFormatSetting() {
    try {
        const result = await api('/api/settings/dateFormat');
        if (result.value) {
            dateFormatSetting = result.value;
        }
    } catch (err) {
        // Use default format
    }
}

// Format timeline period - always uses year only (YYYY)
function formatTimelinePeriod(item) {
    if (item.start_date) {
        const startYear = item.start_date.substring(0, 4);
        const endYear = item.end_date ? item.end_date.substring(0, 4) : 'Present';
        return `${startYear} - ${endYear}`;
    }
    return item.period || '';
}

// Load Profile (shared between admin and public)
async function loadProfile(includePrivate = false) {
    const p = await api('/api/profile');
    document.getElementById('profileInitials').textContent = p.initials || 'CV';
    document.getElementById('profileName').textContent = p.name || '';
    document.getElementById('profileTitle').textContent = p.title || '';
    document.getElementById('profileSubtitle').textContent = p.subtitle || '';
    
    // Bio - CSS white-space: pre-line handles line breaks
    document.getElementById('aboutText').textContent = p.bio || '';
    
    // Update page title
    if (p.name) document.title = `${p.name} - CV`;
    
    // Profile picture
    const pic = document.getElementById('profilePicture');
    const initials = document.getElementById('profileInitials');
    pic.onload = () => { pic.style.display = 'block'; initials.style.display = 'none'; };
    pic.onerror = () => { pic.style.display = 'none'; initials.style.display = 'block'; };
    pic.src = '/uploads/picture.jpeg?' + new Date().getTime();
    
    // Build contact badges
    const badges = [];
    if (includePrivate && p.email) badges.push(`<a href="mailto:${escapeHtml(p.email)}" class="contact-badge" itemprop="email">${icons.email} ${escapeHtml(p.email)}</a>`);
    if (includePrivate && p.phone) badges.push(`<a href="tel:${escapeHtml(p.phone)}" class="contact-badge" itemprop="telephone">${icons.phone} ${escapeHtml(p.phone)}</a>`);
    if (p.location) badges.push(`<span class="contact-badge" itemprop="address">${icons.location} ${escapeHtml(p.location)}</span>`);
    if (p.linkedin) badges.push(`<a href="${escapeHtml(p.linkedin)}" class="contact-badge" target="_blank" rel="noopener" itemprop="url">${icons.linkedin} LinkedIn</a>`);
    if (p.languages) badges.push(`<span class="contact-badge">${icons.languages} ${escapeHtml(p.languages)}</span>`);
    document.getElementById('contactBadges').innerHTML = badges.join('');
}

// Load Timeline
// Sorted by start_date ASC (oldest first - left to right)
async function loadTimeline() {
    const timeline = await api('/api/timeline');
    
    // Sort by start_date ascending (oldest first for timeline)
    // Timeline API returns 'period' field like "Jan 2020 - Present", extract start date from it
    timeline.sort((a, b) => {
        // Extract start date from period string (format: "Jan 2020 - Present" or "2020 - 2022")
        const getStartFromPeriod = (item) => {
            if (item.start_date) return parseDateForSort(item.start_date);
            if (item.period) {
                const startPart = item.period.split(' - ')[0];
                return parseDateForSort(startPart);
            }
            return 0;
        };
        
        const dateA = getStartFromPeriod(a);
        const dateB = getStartFromPeriod(b);
        return dateA - dateB; // ASC: lower dates first (oldest on left)
    });
    
    const container = document.getElementById('timelineItems');
    
    let lastCountry = null;
    container.innerHTML = timeline.map((item, idx) => {
        const pos = idx % 2 === 0 ? 'top' : 'bottom';
        const countryCode = (item.countryCode || '').toLowerCase();
        const showFlag = countryCode && countryCode !== lastCountry;
        lastCountry = countryCode;
        
        // Show flag only when country changes, dot otherwise
        const marker = showFlag
            ? `<img src="https://flagcdn.com/w40/${countryCode}.png" class="timeline-flag" alt="${countryCode.toUpperCase()}" onerror="this.outerHTML='<div class=\\'timeline-dot\\'></div>'">`
            : '<div class="timeline-dot"></div>';
        
        const hiddenClass = item.visible === false ? 'hidden-print' : '';
        const expId = item.id || '';
        
        return `
            <div class="timeline-item ${pos} ${hiddenClass}" 
                 onclick="scrollToExperience(this)" 
                 data-exp-id="${expId}"
                 data-company="${escapeHtml(item.company)}"
                 data-role="${escapeHtml(item.role)}"
                 style="cursor: pointer;">
                <div class="timeline-content">
                    <div class="timeline-company">${escapeHtml(item.company)}</div>
                    <div class="timeline-role">${escapeHtml(item.role)}</div>
                    <div class="timeline-period">${escapeHtml(formatTimelinePeriod(item))}</div>
                </div>
                ${marker}
            </div>
        `;
    }).join('');
    
    resizeTimelineContainer();
}

// Dynamically resize timeline container based on content height
function resizeTimelineContainer() {
    const container = document.querySelector('.timeline-container');
    if (!container) return;
    
    let maxTopHeight = 0;
    let maxBottomHeight = 0;
    
    container.querySelectorAll('.timeline-item').forEach(item => {
        const content = item.querySelector('.timeline-content');
        if (!content) return;
        const contentHeight = content.offsetHeight;
        if (item.classList.contains('top')) {
            maxTopHeight = Math.max(maxTopHeight, contentHeight);
        } else {
            maxBottomHeight = Math.max(maxBottomHeight, contentHeight);
        }
    });
    
    // 16px gap between content and track on each side, plus some breathing room
    const neededHeight = maxTopHeight + maxBottomHeight + 50;
    const minHeight = 220;
    container.style.height = Math.max(minHeight, neededHeight) + 'px';
}

// Scroll to matching experience card when timeline item is clicked
function scrollToExperience(timelineItem) {
    const expId = timelineItem.dataset.expId;
    const company = timelineItem.dataset.company;
    const role = timelineItem.dataset.role;
    
    let targetCard = null;
    
    // Try to find by ID first (scoped to experience section)
    if (expId) {
        targetCard = document.querySelector(`#experienceList .item-card[data-id="${expId}"]`);
    }
    
    // Fall back to matching by company and role (public mode)
    if (!targetCard && company && role) {
        const expCards = document.querySelectorAll('#experienceList .item-card');
        for (const card of expCards) {
            const cardCompany = card.querySelector('.item-subtitle span')?.textContent || '';
            const cardRole = card.querySelector('.item-title')?.textContent || '';
            if (cardCompany === company && cardRole === role) {
                targetCard = card;
                break;
            }
        }
    }
    
    if (targetCard) {
        // Scroll to card with offset for toolbar
        const offset = 100;
        const targetPosition = targetCard.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        
        // Add highlight effect
        targetCard.classList.remove('highlight-pulse');
        void targetCard.offsetWidth; // Force reflow to restart animation
        targetCard.classList.add('highlight-pulse');
        
        // Remove class after animation completes
        setTimeout(() => {
            targetCard.classList.remove('highlight-pulse');
        }, 1500);
    }
}

// Load Experiences (read-only version)
// Sorted by start_date DESC (newest first)
async function loadExperiencesReadOnly() {
    const experiences = await api('/api/experiences');
    
    // Sort by start_date descending (newest first)
    experiences.sort((a, b) => {
        const dateA = parseDateForSort(a.start_date);
        const dateB = parseDateForSort(b.start_date);
        return dateB - dateA; // DESC: higher dates first
    });
    
    const container = document.getElementById('experienceList');
    
    container.innerHTML = experiences.map(exp => `
        <article class="item-card" data-id="${exp.id}" itemscope itemtype="https://schema.org/OrganizationRole">
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

// Load Certifications (read-only version)
async function loadCertificationsReadOnly() {
    const certs = await api('/api/certifications');
    const container = document.getElementById('certGrid');
    
    container.innerHTML = certs.map(cert => `
        <article class="cert-card" itemscope itemtype="https://schema.org/EducationalOccupationalCredential">
            <div class="cert-header">
                <div class="cert-name" itemprop="name">${escapeHtml(cert.name)}</div>
                <time class="cert-date" itemprop="dateCreated">${formatDate(cert.issue_date) || escapeHtml(cert.issue_date || '')}</time>
            </div>
            <div class="cert-provider" itemprop="issuedBy">${escapeHtml(cert.provider || '')}</div>
        </article>
    `).join('');
}

// Load Education (read-only version)
async function loadEducationReadOnly() {
    const education = await api('/api/education');
    const container = document.getElementById('educationList');
    
    container.innerHTML = education.map(edu => `
        <article class="item-card" itemscope itemtype="https://schema.org/EducationalOccupationalCredential">
            <div class="item-header">
                <div>
                    <h3 class="item-title" itemprop="name">${escapeHtml(edu.degree_title)}</h3>
                    <div class="item-subtitle" itemprop="recognizedBy" itemscope itemtype="https://schema.org/EducationalOrganization">
                        <span itemprop="name">${escapeHtml(edu.institution_name)}</span>
                    </div>
                </div>
                <span class="item-date">
                    <time datetime="${edu.start_date || ''}">${formatDate(edu.start_date) || escapeHtml(edu.start_date || '')}</time> - 
                    <time datetime="${edu.end_date || ''}">${formatDate(edu.end_date) || escapeHtml(edu.end_date || '')}</time>
                </span>
            </div>
            ${edu.description ? `<div class="item-location" itemprop="description">${escapeHtml(edu.description)}</div>` : ''}
        </article>
    `).join('');
}

// Load Skills (read-only version)
async function loadSkillsReadOnly() {
    const skills = await api('/api/skills');
    const container = document.getElementById('skillsGrid');
    
    container.innerHTML = skills.map(cat => `
        <div class="skill-category">
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

// Load Projects (read-only version)
async function loadProjectsReadOnly() {
    const projects = await api('/api/projects');
    const container = document.getElementById('projectsGrid');
    
    container.innerHTML = projects.map(proj => `
        <article class="project-card" itemscope itemtype="https://schema.org/CreativeWork">
            <div class="project-header">
                <h3 class="project-title" itemprop="name">${escapeHtml(proj.title)}</h3>
                ${proj.link ? `<a href="${escapeHtml(proj.link)}" class="project-link" target="_blank" rel="noopener" itemprop="url" title="View Project">${icons.link}</a>` : ''}
            </div>
            <p class="project-description" itemprop="description">${escapeHtml(proj.description || '')}</p>
            <div class="tech-tags">
                ${(proj.technologies || []).map(t => `<span class="tech-tag" itemprop="keywords">${escapeHtml(t)}</span>`).join('')}
            </div>
        </article>
    `).join('');
}

// Load Sections visibility
async function loadSections() {
    const sections = await api('/api/sections');
    Object.keys(sections).forEach(section => {
        const el = document.getElementById(`section-${section}`);
        if (el) {
            if (!sections[section]) {
                el.classList.add('hidden-print');
                el.style.display = 'none';
            } else {
                el.classList.remove('hidden-print');
                el.style.display = '';
            }
        }
    });
    return sections;
}

// Generate ATS-friendly content
// Improved version with better structure for ATS parsing
async function generateATSContent() {
    const cv = await api('/api/cv');
    const p = cv.profile;
    
    let ats = [];
    
    // Header section - clear labels for ATS field mapping
    ats.push('=== PERSONAL INFORMATION ===');
    ats.push(`Full Name: ${p.name || ''}`);
    if (p.title) ats.push(`Job Title: ${p.title}`);
    if (p.location) ats.push(`Location: ${p.location}`);
    if (p.email) ats.push(`Email: ${p.email}`);
    if (p.phone) ats.push(`Phone: ${p.phone}`);
    if (p.linkedin) ats.push(`LinkedIn: ${p.linkedin}`);
    if (p.languages) ats.push(`Languages: ${p.languages}`);
    ats.push('');
    
    // Professional Summary
    if (p.bio) {
        ats.push('=== PROFESSIONAL SUMMARY ===');
        ats.push(p.bio.replace(/\n+/g, ' ').trim());
        ats.push('');
    }
    
    // Skills - critical for ATS keyword matching
    if (cv.skills && cv.skills.length > 0) {
        ats.push('=== SKILLS ===');
        cv.skills
            .filter(cat => cat.visible !== false)
            .forEach(cat => {
                ats.push(`${cat.name}: ${cat.skills.join(', ')}`);
            });
        // Also add a flat keyword list for better ATS matching
        const allSkills = cv.skills
            .filter(cat => cat.visible !== false)
            .flatMap(cat => cat.skills);
        ats.push('');
        ats.push(`Keywords: ${allSkills.join(', ')}`);
        ats.push('');
    }
    
    // Work Experience - structured format for ATS
    if (cv.experiences && cv.experiences.length > 0) {
        ats.push('=== WORK EXPERIENCE ===');
        cv.experiences
            .filter(exp => exp.visible !== false)
            .forEach(exp => {
                ats.push('');
                ats.push(`Position: ${exp.job_title}`);
                ats.push(`Company: ${exp.company_name}`);
                ats.push(`Duration: ${formatDateATS(exp.start_date)} - ${exp.end_date ? formatDateATS(exp.end_date) : 'Present'}`);
                if (exp.location) ats.push(`Location: ${exp.location}`);
                if (exp.highlights && exp.highlights.length > 0) {
                    ats.push('Responsibilities and Achievements:');
                    exp.highlights.forEach(h => ats.push(`- ${h}`));
                }
            });
        ats.push('');
    }
    
    // Education - structured format
    if (cv.education && cv.education.length > 0) {
        ats.push('=== EDUCATION ===');
        cv.education
            .filter(edu => edu.visible !== false)
            .forEach(edu => {
                ats.push('');
                ats.push(`Degree: ${edu.degree_title}`);
                ats.push(`Institution: ${edu.institution_name}`);
                ats.push(`Duration: ${formatDateATS(edu.start_date)} - ${formatDateATS(edu.end_date)}`);
                if (edu.description) ats.push(`Details: ${edu.description}`);
            });
        ats.push('');
    }
    
    // Certifications - structured format
    if (cv.certifications && cv.certifications.length > 0) {
        ats.push('=== CERTIFICATIONS ===');
        cv.certifications
            .filter(cert => cert.visible !== false)
            .forEach(cert => {
                let certLine = `${cert.name}`;
                if (cert.provider) certLine += ` - ${cert.provider}`;
                if (cert.issue_date) certLine += ` (${formatDateATS(cert.issue_date)})`;
                ats.push(certLine);
            });
        ats.push('');
    }
    
    // Projects - structured format
    if (cv.projects && cv.projects.length > 0) {
        ats.push('=== PROJECTS ===');
        cv.projects
            .filter(proj => proj.visible !== false)
            .forEach(proj => {
                ats.push('');
                ats.push(`Project: ${proj.title}`);
                if (proj.description) ats.push(`Description: ${proj.description}`);
                if (proj.technologies && proj.technologies.length > 0) {
                    ats.push(`Technologies: ${proj.technologies.join(', ')}`);
                }
                if (proj.link) ats.push(`Link: ${proj.link}`);
            });
        ats.push('');
    }
    
    const atsEl = document.getElementById('ats-content');
    if (atsEl) atsEl.textContent = ats.join('\n');
}

// ===========================
// Shared Custom Section Rendering (Public)
// ===========================

// Render custom sections for public view
async function renderCustomSectionsPublic(container) {
    const customSections = await api('/api/custom-sections');
    const layoutTypes = await api('/api/layout-types');
    const socialPlatforms = await api('/api/social-platforms');
    
    customSections.forEach(section => {
        const sectionHtml = renderCustomSectionPublic(section, layoutTypes, socialPlatforms);
        container.insertAdjacentHTML('beforeend', sectionHtml);
    });
}

function renderCustomSectionPublic(section, layoutTypes, socialPlatforms) {
    const items = section.items || [];
    let contentHtml = '';
    
    switch (section.layout_type) {
        case 'social-links':
            contentHtml = renderSocialLinksPublic(items, socialPlatforms);
            break;
        case 'grid-2':
            contentHtml = renderGridPublic(items, 2);
            break;
        case 'grid-3':
            contentHtml = renderGridPublic(items, 3);
            break;
        case 'list':
            contentHtml = renderListPublic(items);
            break;
        case 'cards':
            contentHtml = renderCardsPublic(items);
            break;
        case 'bullet-list':
            contentHtml = renderBulletListPublic(items);
            break;
        case 'free-text':
            contentHtml = renderFreeTextPublic(items);
            break;
        default:
            contentHtml = renderGridPublic(items, 3);
    }
    
    return `
        <section class="section custom-section" id="section-${section.section_key}">
            <div class="section-header">
                <h2 class="section-title">${escapeHtml(section.name)}</h2>
            </div>
            <div class="custom-section-content" data-layout="${section.layout_type}">
                ${contentHtml}
            </div>
        </section>
    `;
}

function renderSocialLinksPublic(items, socialPlatforms) {
    if (items.length === 0) return '';
    
    return `<div class="social-links-grid">${items.map(item => {
        const platform = item.metadata?.platform || 'custom';
        const platformData = socialPlatforms.find(p => p.id === platform) || {};
        const icon = platformData.icon || '🔗';
        const color = platformData.color || 'var(--primary)';
        const displayUrl = item.link ? item.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '';
        
        return `
            <a href="${escapeHtml(item.link || '#')}" class="social-link-item" target="_blank" rel="noopener" style="--social-color: ${color}">
                <span class="social-link-icon">${icon}</span>
                <div class="social-link-text">
                    <span class="social-link-name">${escapeHtml(item.title)}</span>
                    ${displayUrl ? `<span class="social-link-url">${escapeHtml(displayUrl)}</span>` : ''}
                </div>
            </a>
        `;
    }).join('')}</div>`;
}

function renderGridPublic(items, cols) {
    if (items.length === 0) return '';
    
    return `<div class="custom-grid custom-grid-${cols}">${items.map(item => {
        const hideTitle = item.metadata?.hideTitle || false;
        return `
        <div class="custom-grid-item">
            ${item.title && !hideTitle ? `<h3 class="custom-item-title">${escapeHtml(item.title)}</h3>` : ''}
            ${item.subtitle ? `<div class="custom-item-subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
            ${item.description ? `<p class="custom-item-description">${escapeHtml(item.description)}</p>` : ''}
            ${item.link ? `<a href="${escapeHtml(item.link)}" class="custom-item-link" target="_blank" rel="noopener">View →</a>` : ''}
        </div>
    `;
    }).join('')}</div>`;
}

function renderListPublic(items) {
    if (items.length === 0) return '';
    
    return `<div class="custom-list">${items.map(item => {
        const hideTitle = item.metadata?.hideTitle || false;
        return `
        <div class="custom-list-item">
            <div class="custom-list-content">
                ${item.title && !hideTitle ? `<h3 class="custom-item-title">${escapeHtml(item.title)}</h3>` : ''}
                ${item.subtitle ? `<div class="custom-item-subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
                ${item.description ? `<p class="custom-item-description">${escapeHtml(item.description)}</p>` : ''}
            </div>
            ${item.link ? `<a href="${escapeHtml(item.link)}" class="custom-item-link" target="_blank" rel="noopener">View →</a>` : ''}
        </div>
    `;
    }).join('')}</div>`;
}

function renderCardsPublic(items) {
    if (items.length === 0) return '';
    
    return `<div class="custom-cards">${items.map(item => {
        const hideTitle = item.metadata?.hideTitle || false;
        return `
        <div class="custom-card">
            ${item.title && !hideTitle ? `<h3 class="custom-card-title">${escapeHtml(item.title)}</h3>` : ''}
            ${item.subtitle ? `<div class="custom-card-subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
            ${item.description ? `<p class="custom-card-description">${escapeHtml(item.description)}</p>` : ''}
            ${item.link ? `<a href="${escapeHtml(item.link)}" class="custom-card-link" target="_blank" rel="noopener">Learn More →</a>` : ''}
        </div>
    `;
    }).join('')}</div>`;
}

// Bullet list layout for public view
function renderBulletListPublic(items) {
    if (items.length === 0) return '';
    
    return `<div class="custom-bullet-lists">${items.map(item => {
        const visible = item.visible !== false;
        const hideTitle = item.metadata?.hideTitle || false;
        const bullets = (item.description || '').split('\n').filter(line => line.trim());
        
        if (!visible) return '';
        
        return `
            <div class="custom-bullet-group">
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

// Free text layout for public view
function renderFreeTextPublic(items) {
    if (items.length === 0) return '';
    
    return `<div class="custom-free-text-blocks">${items.map(item => {
        const visible = item.visible !== false;
        if (!visible) return '';
        
        return `
            <div class="custom-free-text">
                <p class="custom-free-text-content">${escapeHtml(item.description || '')}</p>
            </div>
        `;
    }).join('')}</div>`;
}

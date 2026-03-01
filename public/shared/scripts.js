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
let timelineYearOnly = true; // default: show years only in timeline

const DATE_FORMAT_OPTIONS = [
    { value: 'MMM YYYY', label: 'Jan 2020', example: 'Jan 2020' },
    { value: 'MMM YY', label: 'Jan 20', example: 'Jan 20' },
    { value: 'MMMM YYYY', label: 'January 2020', example: 'January 2020' },
    { value: 'MM/YYYY', label: '01/2020', example: '01/2020' },
    { value: 'MM.YYYY', label: '01.2020', example: '01.2020' },
    { value: 'MM-YYYY', label: '01-2020', example: '01-2020' },
    { value: 'YYYY-MM', label: '2020-01', example: '2020-01' },
    { value: 'YYYY', label: '2020 (year only)', example: '2020' }
];

// Normalize a date string to ISO format (YYYY-MM or YYYY)
// Returns { value: normalizedString } on success, { error: message } on failure
function normalizeDate(dateStr) {
    if (!dateStr) return { value: '' };
    const s = dateStr.trim();
    if (!s) return { value: '' };

    // Already ISO: YYYY-MM
    if (/^\d{4}-\d{2}$/.test(s)) {
        const m = parseInt(s.split('-')[1]);
        if (m >= 1 && m <= 12) return { value: s };
        return { error: `Invalid month in "${s}". Use 01-12.` };
    }

    // Year only: YYYY
    if (/^\d{4}$/.test(s)) return { value: s };

    const monthsShort = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const monthsFull = ['january','february','march','april','may','june','july','august','september','october','november','december'];

    // MMM YYYY or MMMM YYYY (e.g., "Jan 2020", "January 2020")
    const wordMonth = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (wordMonth) {
        const mName = wordMonth[1].toLowerCase();
        let idx = monthsShort.indexOf(mName.substring(0, 3));
        if (idx === -1) idx = monthsFull.indexOf(mName);
        if (idx >= 0) {
            return { value: `${wordMonth[2]}-${String(idx + 1).padStart(2, '0')}` };
        }
        return { error: `Unrecognized month "${wordMonth[1]}". Use e.g. Jan, February, etc.` };
    }

    // MM/YYYY, MM.YYYY, MM-YYYY, MM YYYY (e.g., "01/2020", "01.2020")
    const numMonth = s.match(/^(\d{1,2})[\/.\-\s](\d{4})$/);
    if (numMonth) {
        const m = parseInt(numMonth[1]);
        if (m >= 1 && m <= 12) {
            return { value: `${numMonth[2]}-${String(m).padStart(2, '0')}` };
        }
        return { error: `Invalid month "${numMonth[1]}". Use 01-12.` };
    }

    // YYYY/MM, YYYY.MM (e.g., "2020/01")
    const reverseNum = s.match(/^(\d{4})[\/.](\d{1,2})$/);
    if (reverseNum) {
        const m = parseInt(reverseNum[2]);
        if (m >= 1 && m <= 12) {
            return { value: `${reverseNum[1]}-${String(m).padStart(2, '0')}` };
        }
        return { error: `Invalid month "${reverseNum[2]}". Use 01-12.` };
    }

    return { error: `Unrecognized date format "${s}". Use YYYY-MM (e.g. 2020-01), MMM YYYY (e.g. Jan 2020), or YYYY.` };
}

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
            case 'MMM YY': return `${monthsShort[monthIdx]} ${y.slice(-2)}`;
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

// Get the translated default name for a built-in section, or fall back to the English default
function getTranslatedSectionName(key, fallback) {
    const i18nKey = `section.${key}`;
    const translated = t(i18nKey);
    return translated !== i18nKey ? translated : (fallback || key);
}

// Apply custom section titles from section order data to the DOM
function applySectionTitles(sectionOrderData) {
    if (!sectionOrderData || !sectionOrderData.length) return;
    sectionOrderData.forEach(section => {
        const el = document.getElementById(`section-${section.key}`);
        if (el) {
            const titleEl = el.querySelector('.section-title');
            if (titleEl) {
                // Use custom name if user set one, otherwise use translated default
                const isCustom = section.name && section.name !== section.default_name;
                titleEl.textContent = isCustom ? section.name : getTranslatedSectionName(section.key, section.name);
            }
        }
    });
}

// Load date format setting from API
async function loadDateFormatSetting(allSettings) {
    try {
        if (allSettings && allSettings.dateFormat !== undefined) {
            if (allSettings.dateFormat) dateFormatSetting = allSettings.dateFormat;
        } else {
            const result = await api('/api/settings/dateFormat');
            if (result.value) {
                dateFormatSetting = result.value;
            }
        }
    } catch (err) {
        // Use default format
    }
    try {
        if (allSettings && allSettings.timelineYearOnly !== undefined) {
            timelineYearOnly = allSettings.timelineYearOnly !== 'false';
        } else {
            const result = await api('/api/settings/timelineYearOnly');
            timelineYearOnly = result.value !== 'false';
        }
    } catch (err) {
        // Use default (false)
    }
}

// Format timeline period - uses year only if setting enabled, otherwise global date format
// Handles ISO dates (YYYY-MM, YYYY), legacy formats (MMM YYYY, Jan 2020), and period fallback
function formatTimelinePeriod(item) {
    const isISODate = (d) => d && /^\d{4}(-\d{2})?$/.test(d);
    
    // Extract a 4-digit year from any date string (ISO, legacy, or freeform)
    const extractYear = (d) => {
        if (!d) return null;
        const m = d.match(/\d{4}/);
        return m ? m[0] : null;
    };
    
    if (item.start_date) {
        if (isISODate(item.start_date)) {
            if (timelineYearOnly) {
                const startYear = item.start_date.substring(0, 4);
                const endYear = item.end_date ? item.end_date.substring(0, 4) : t('present');
                return `${startYear} - ${endYear}`;
            }
            const startFormatted = formatDate(item.start_date);
            const endFormatted = item.end_date ? formatDate(item.end_date) : t('present');
            return `${startFormatted} - ${endFormatted}`;
        }
        // Non-ISO date (legacy format like "Jan 2020") — extract year or use as-is
        if (timelineYearOnly) {
            const startYear = extractYear(item.start_date);
            const endYear = item.end_date ? extractYear(item.end_date) || t('present') : t('present');
            if (startYear) return `${startYear} - ${endYear}`;
        }
        // Use the raw date strings as-is for non-ISO when not year-only
        const endStr = item.end_date || t('present');
        return `${item.start_date} - ${endStr}`;
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
    const profileImg = document.getElementById('profileImage');
    if (p.profile_picture_enabled == 1) { 
        const pic = document.getElementById('profilePicture');
        const initials = document.getElementById('profileInitials');
        pic.onload = () => { pic.style.display = 'block'; initials.style.display = 'none'; };
        pic.onerror = () => { pic.style.display = 'none'; initials.style.display = 'block'; };
        pic.src = '/uploads/picture.jpeg?' + new Date().getTime();
        profileImg.style.display = 'flex';
    } else {
        profileImg.style.display = 'none';
    }
    
    // Build contact badges
    const badges = [];
    if (includePrivate && p.email) badges.push(`<a href="mailto:${escapeHtml(p.email)}" class="contact-badge" itemprop="email">${icons.email} ${escapeHtml(p.email)}</a>`);
    if (includePrivate && p.phone) badges.push(`<a href="tel:${escapeHtml(p.phone)}" class="contact-badge" itemprop="telephone">${icons.phone} ${escapeHtml(p.phone)}</a>`);
    if (p.location) badges.push(`<span class="contact-badge" itemprop="address">${icons.location} ${escapeHtml(p.location)}</span>`);
    if (p.linkedin) badges.push(`<a href="${escapeHtml(p.linkedin)}" class="contact-badge" target="_blank" rel="noopener" itemprop="url">${icons.linkedin} LinkedIn</a>`);
    if (p.languages) badges.push(`<span class="contact-badge">${icons.languages} ${escapeHtml(p.languages)}</span>`);
    document.getElementById('contactBadges').innerHTML = badges.join('');
}

// Detect overlapping timeline items and assign branch tracks
function computeTimelineBranches(items) {
    if (items.length <= 1) return { branches: [], segments: items.map(item => ({ item, track: 0, branchGroup: null })) };

    const now = new Date();
    const currentNumeric = now.getFullYear() * 100 + (now.getMonth() + 1);

    const getEnd = (item) => {
        if (item.end_date) return parseDateForSort(item.end_date);
        return currentNumeric; // "Present" = current date
    };
    const getStart = (item) => parseDateForSort(item.start_date);

    const segments = items.map(item => ({
        item,
        track: 0,
        branchGroup: null,
        startNum: getStart(item),
        endNum: getEnd(item)
    }));

    const branches = [];

    for (let i = 1; i < segments.length; i++) {
        for (let j = i - 1; j >= 0; j--) {
            const overlap = Math.min(segments[j].endNum, segments[i].endNum) - segments[i].startNum;
            // Ignore overlaps of less than 1 month (noise from job transitions)
            if (overlap >= 1) {
                segments[i].track = segments[j].track === 0 ? 1 : 0;
                const existingBranch = branches.find(b => b.mergeAfterIdx >= i - 1 && segments[j].branchGroup === branches.indexOf(b));
                if (existingBranch) {
                    existingBranch.mergeAfterIdx = i;
                    segments[i].branchGroup = branches.indexOf(existingBranch);
                } else {
                    segments[i].branchGroup = branches.length;
                    segments[j].branchGroup = branches.length;
                    branches.push({ forkBeforeIdx: j, mergeAfterIdx: i });
                }
                break;
            }
        }
    }

    return { branches, segments };
}

// Compute time-scale positions for timeline items
// Returns an array of { leftPct, widthPct } for each segment
function computeTimePositions(segments) {
    if (!segments.length) return [];
    const allStarts = segments.map(s => s.startNum);
    const allEnds = segments.map(s => s.endNum);
    const minTime = Math.min(...allStarts);
    const maxTime = Math.max(...allEnds);
    const span = maxTime - minTime || 1;

    // Each item is positioned at its start date, with a minimum width
    const minWidthPct = 100 / segments.length * 0.6;
    return segments.map(seg => {
        const leftPct = ((seg.startNum - minTime) / span) * 100;
        return { leftPct, widthPct: Math.max(minWidthPct, 100 / segments.length) };
    });
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
    const timelineContainer = container.closest('.timeline-container');

    // Compute branching
    const { branches, segments } = computeTimelineBranches(timeline);
    const hasBranches = branches.length > 0;

    // Toggle branch class
    if (timelineContainer) {
        timelineContainer.classList.toggle('has-branches', hasBranches);
    }

    // Determine if flags should be shown: only when multiple countries exist
    const uniqueCountries = new Set(timeline.map(i => (i.countryCode || '').toLowerCase()).filter(Boolean));
    const showFlags = uniqueCountries.size > 1;

    // Compute time-scale positions
    const positions = computeTimePositions(segments);

    // Assign top/bottom: main-track items alternate, branch-track items always go top
    let mainTrackIdx = 0;
    let lastCountry = null;
    container.innerHTML = segments.map((seg, idx) => {
        const item = seg.item;
        let pos;
        if (seg.track === 1) {
            pos = 'top';
        } else {
            pos = mainTrackIdx % 2 === 0 ? 'top' : 'bottom';
            mainTrackIdx++;
        }
        const countryCode = (item.countryCode || '').toLowerCase();
        const isFirstOrChanged = countryCode && (lastCountry === null || countryCode !== lastCountry);
        lastCountry = countryCode || lastCountry;

        // Show flag at first entry and at country transitions, only if multiple countries exist
        const marker = showFlags && isFirstOrChanged && countryCode
            ? `<img src="https://flagcdn.com/w40/${countryCode}.png" class="timeline-flag" alt="${countryCode.toUpperCase()}" onerror="this.outerHTML='<div class=\\'timeline-dot\\'></div>'">`
            : '<div class="timeline-dot"></div>';

        const hiddenClass = item.visible === false ? 'hidden-print' : '';
        const expId = item.id || '';
        const branchClass = seg.track === 1 ? 'timeline-branch-track' : '';

        // Time-scale positioning
        const { leftPct, widthPct } = positions[idx];

        // Logo replaces company name on the card when present
        const companyLine = item.logo
            ? `<img src="/uploads/${encodeURIComponent(item.logo)}" class="timeline-card-logo" alt="${escapeHtml(item.company)}" onerror="this.outerHTML='<div class=\\'timeline-company\\'>${escapeHtml(item.company)}</div>'">`
            : `<div class="timeline-company">${escapeHtml(item.company)}</div>`;

        return `
            <div class="timeline-item ${pos} ${branchClass} ${hiddenClass}"
                 onclick="scrollToExperience(this)"
                 data-exp-id="${expId}"
                 data-company="${escapeHtml(item.company)}"
                 data-role="${escapeHtml(item.role)}"
                 style="cursor: pointer; left: ${leftPct}%; width: ${widthPct}%;">
                <div class="timeline-content">
                    ${companyLine}
                    <div class="timeline-role">${escapeHtml(item.role)}</div>
                    <div class="timeline-period">${escapeHtml(formatTimelinePeriod(item))}</div>
                </div>
                ${marker}
            </div>
        `;
    }).join('');

    resizeTimelineContainer();
    layoutTimelineCards(timelineContainer);
    renderBranchCurves(timelineContainer, segments, branches);
}

// Detect overlapping timeline cards and offset them, drawing angled connector lines
function layoutTimelineCards(timelineContainer) {
    if (!timelineContainer) return;
    const itemsContainer = timelineContainer.querySelector('.timeline-items');
    if (!itemsContainer) return;

    // Remove existing connector SVG
    const existingConnectors = itemsContainer.querySelector('.timeline-connectors');
    if (existingConnectors) existingConnectors.remove();

    const allItems = itemsContainer.querySelectorAll('.timeline-item');
    if (!allItems.length) return;

    // Reset any previous offsets
    allItems.forEach(item => {
        const content = item.querySelector('.timeline-content');
        if (content) content.style.transform = '';
    });

    const containerRect = itemsContainer.getBoundingClientRect();
    const containerW = itemsContainer.offsetWidth;
    const containerH = itemsContainer.offsetHeight;
    if (!containerW || !containerH) return;

    // Collect card info grouped by side (top / bottom)
    const cards = [];
    allItems.forEach((item, idx) => {
        const content = item.querySelector('.timeline-content');
        if (!content) return;
        const isTop = item.classList.contains('top');
        const isBranch = item.classList.contains('timeline-branch-track');
        const rect = content.getBoundingClientRect();
        cards.push({
            idx, item, content, isTop, isBranch,
            // Card center X relative to container
            naturalX: rect.left - containerRect.left + rect.width / 2,
            width: rect.width,
            left: rect.left - containerRect.left,
            right: rect.left - containerRect.left + rect.width,
            offsetX: 0
        });
    });

    // Resolve overlaps within each side
    ['top', 'bottom'].forEach(side => {
        const sideCards = cards.filter(c => c.isTop === (side === 'top')).sort((a, b) => a.naturalX - b.naturalX);
        const gap = 4; // minimum gap between cards
        for (let i = 1; i < sideCards.length; i++) {
            const prev = sideCards[i - 1];
            const curr = sideCards[i];
            const prevRight = prev.left + prev.offsetX + prev.width;
            const currLeft = curr.left + curr.offsetX;
            const overlap = prevRight + gap - currLeft;
            if (overlap > 0) {
                curr.offsetX += overlap;
            }
        }
    });

    // Apply offsets and build connector SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'timeline-connectors');
    svg.setAttribute('viewBox', `0 0 ${containerW} ${containerH}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1;overflow:visible;';

    const mainY = containerH * 0.5;

    cards.forEach(card => {
        if (Math.abs(card.offsetX) > 1) {
            // Combine with the base centering transform
            card.content.style.transform = `translateX(calc(-50% + ${card.offsetX}px))`;

            // Draw angled connector from dot to card center
            const dotX = card.item.offsetLeft + card.item.offsetWidth / 2;
            const dotY = card.isBranch ? mainY - 16 : mainY;
            const cardCenterX = dotX + card.offsetX;
            const cardY = card.isTop ? dotY - 16 : dotY + 16;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', dotX);
            line.setAttribute('y1', dotY);
            line.setAttribute('x2', cardCenterX);
            line.setAttribute('y2', cardY);
            line.setAttribute('stroke', 'var(--gray-300)');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('vector-effect', 'non-scaling-stroke');
            svg.appendChild(line);
        }
    });

    itemsContainer.appendChild(svg);
}

// Render SVG branch visualization: parallel branch track + fork/merge curves
function renderBranchCurves(timelineContainer, segments, branches) {
    if (!timelineContainer) return;
    const existing = timelineContainer.querySelector('.timeline-branch-curves');
    if (existing) existing.remove();
    if (!branches.length) return;

    const itemsContainer = timelineContainer.querySelector('.timeline-items');
    if (!itemsContainer) return;
    const items = itemsContainer.querySelectorAll('.timeline-item');
    if (!items.length) return;

    const containerW = itemsContainer.offsetWidth;
    const containerH = itemsContainer.offsetHeight;
    if (!containerW || !containerH) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'timeline-branch-curves');
    svg.setAttribute('viewBox', `0 0 ${containerW} ${containerH}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1;overflow:visible;';

    const mainY = containerH * 0.5;
    const branchOffset = 16;
    const branchY = mainY - branchOffset;
    // Fixed horizontal extent for the S-curve
    const curveW = 24;

    const makePath = (d) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'var(--accent)');
        path.setAttribute('stroke-width', '3');
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        return path;
    };

    branches.forEach(branch => {
        const forkItem = items[branch.forkBeforeIdx];
        if (!forkItem) return;

        // Find the first and last branch-track items in this branch
        let firstBranchIdx = -1, lastBranchIdx = -1;
        for (let i = branch.forkBeforeIdx; i <= branch.mergeAfterIdx; i++) {
            if (segments[i].track === 1) {
                if (firstBranchIdx === -1) firstBranchIdx = i;
                lastBranchIdx = i;
            }
        }
        if (firstBranchIdx === -1) return;

        const firstBranchItem = items[firstBranchIdx];
        const lastBranchItem = items[lastBranchIdx];
        if (!firstBranchItem || !lastBranchItem) return;

        const forkX = forkItem.offsetLeft + forkItem.offsetWidth / 2;
        const firstBranchX = firstBranchItem.offsetLeft + firstBranchItem.offsetWidth / 2;
        const lastBranchX = lastBranchItem.offsetLeft + lastBranchItem.offsetWidth / 2;

        // Fork S-curve: starts at fork item on main track, curves up to branch track
        const forkCurveStart = forkX;
        const forkCurveEnd = forkCurveStart + curveW;
        svg.appendChild(makePath(
            `M ${forkCurveStart},${mainY} C ${forkCurveStart + curveW / 2},${mainY} ${forkCurveStart + curveW / 2},${branchY} ${forkCurveEnd},${branchY}`
        ));

        // Parallel branch track line: from end of fork curve to start of merge curve (or to last branch item)
        const lastBranchOngoing = !segments[lastBranchIdx].item.end_date;

        if (lastBranchOngoing) {
            // Branch runs to the end — extend to right edge of last branch item
            const branchLineEnd = lastBranchX;
            if (forkCurveEnd < branchLineEnd) {
                svg.appendChild(makePath(`M ${forkCurveEnd},${branchY} L ${branchLineEnd},${branchY}`));
            }
        } else {
            // Find the next main-track item after branch for merge target
            let afterMergeIdx = branch.mergeAfterIdx + 1;
            const afterMergeItem = items[afterMergeIdx];

            if (afterMergeItem) {
                const afterMergeX = afterMergeItem.offsetLeft + afterMergeItem.offsetWidth / 2;
                const mergeCurveStart = afterMergeX - curveW;
                const mergeCurveEnd = afterMergeX;

                // Branch track line between fork curve end and merge curve start
                if (forkCurveEnd < mergeCurveStart) {
                    svg.appendChild(makePath(`M ${forkCurveEnd},${branchY} L ${mergeCurveStart},${branchY}`));
                }

                // Merge S-curve: from branch track down to main track
                svg.appendChild(makePath(
                    `M ${mergeCurveStart},${branchY} C ${mergeCurveStart + curveW / 2},${branchY} ${mergeCurveStart + curveW / 2},${mainY} ${mergeCurveEnd},${mainY}`
                ));
            } else {
                // No item after merge — just extend branch line to last branch item
                if (forkCurveEnd < lastBranchX) {
                    svg.appendChild(makePath(`M ${forkCurveEnd},${branchY} L ${lastBranchX},${branchY}`));
                }
            }
        }
    });

    itemsContainer.appendChild(svg);
}

// Dynamically resize timeline container based on content height
function resizeTimelineContainer() {
    const container = document.querySelector('.timeline-container');
    if (!container) return;

    let maxTopHeight = 0;
    let maxBottomHeight = 0;
    const hasBranches = container.classList.contains('has-branches');

    container.querySelectorAll('.timeline-item').forEach(item => {
        const content = item.querySelector('.timeline-content');
        if (!content) return;
        const contentHeight = content.offsetHeight;
        const isBranch = item.classList.contains('timeline-branch-track');
        // Branch-track top cards need extra room (24px offset vs 16px for main)
        const extra = isBranch ? 8 : 0;
        if (item.classList.contains('top')) {
            maxTopHeight = Math.max(maxTopHeight, contentHeight + extra);
        } else {
            maxBottomHeight = Math.max(maxBottomHeight, contentHeight + extra);
        }
    });

    // Gap between content and track on each side, plus breathing room
    const neededHeight = maxTopHeight + maxBottomHeight + (hasBranches ? 70 : 50);
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
                    <time itemprop="endDate" datetime="${exp.end_date || ''}">${exp.end_date ? formatDate(exp.end_date) : t('present')}</time>
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
                    <time datetime="${edu.end_date || ''}">${edu.end_date ? (formatDate(edu.end_date) || escapeHtml(edu.end_date)) : t('present')}</time>
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
                ${proj.link ? `<a href="${escapeHtml(proj.link)}" class="project-link" target="_blank" rel="noopener" itemprop="url" title="${t('view_project')}">${icons.link}</a>` : ''}
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
                ats.push(`Duration: ${formatDateATS(exp.start_date)} - ${exp.end_date ? formatDateATS(exp.end_date) : t('present')}`);
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
                ats.push(`Duration: ${formatDateATS(edu.start_date)} - ${edu.end_date ? formatDateATS(edu.end_date) : t('present')}`);
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
            ${item.link ? `<a href="${escapeHtml(item.link)}" class="custom-item-link" target="_blank" rel="noopener">${t('view_link')}</a>` : ''}
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
            ${item.link ? `<a href="${escapeHtml(item.link)}" class="custom-item-link" target="_blank" rel="noopener">${t('view_link')}</a>` : ''}
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
            ${item.link ? `<a href="${escapeHtml(item.link)}" class="custom-card-link" target="_blank" rel="noopener">${t('learn_more')}</a>` : ''}
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
        const hideTitle = item.metadata?.hideTitle !== false; // default true for free-text
        const showTitle = item.title && !hideTitle;
        
        return `
            <div class="custom-free-text">
                ${showTitle ? `<div class="custom-item-title">${escapeHtml(item.title)}</div>` : ''}
                <p class="custom-free-text-content">${escapeHtml(item.description || '')}</p>
            </div>
        `;
    }).join('')}</div>`;
}

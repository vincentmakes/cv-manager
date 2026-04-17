/* CV Manager - Admin-Specific JavaScript */

// State
let currentModal = { type: null, id: null };
let sectionVisibility = {};
let sectionOrder = [];
let activeDatasetId = null;
let activeDatasetName = null;
let activeDatasetIsDefault = false;
let activeDatasetIsPublic = false;
let activeDatasetLanguage = null;
let activeDatasetLanguageGroup = null;
let activeDatasetSiblings = [];
let activeDatasetVersion = null;
let activeDatasetVersionGroup = null;
let activeDatasetVersionCount = 1;
let adminInitialized = false; // tracks whether first init has completed

// Mobile menu toggle
let mobileMenuOpen = false;

function toggleMobileMenu(e) {
    if (e) e.stopPropagation(); // Prevent document click handlers from firing
    const actions = document.getElementById('toolbarActions');
    const hamburger = document.getElementById('toolbarHamburger');
    mobileMenuOpen = !mobileMenuOpen;
    actions.classList.toggle('mobile-open', mobileMenuOpen);
    // Swap hamburger icon to X when open
    hamburger.innerHTML = mobileMenuOpen
        ? '<span class="material-symbols-outlined">close</span>'
        : '<span class="material-symbols-outlined">menu</span>';
}

function closeMobileMenu() {
    if (!mobileMenuOpen) return;
    mobileMenuOpen = false;
    const actions = document.getElementById('toolbarActions');
    const hamburger = document.getElementById('toolbarHamburger');
    if (actions) actions.classList.remove('mobile-open');
    if (hamburger) hamburger.innerHTML = '<span class="material-symbols-outlined">menu</span>';
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileMenuOpen) return;
    const actions = document.getElementById('toolbarActions');
    const hamburger = document.getElementById('toolbarHamburger');
    if (!actions || !hamburger) return;
    if (actions.contains(e.target) || hamburger.contains(e.target)) return;
    closeMobileMenu();
});

// Auto-close mobile menu when action buttons are clicked (except color picker)
document.addEventListener('click', (e) => {
    if (!mobileMenuOpen) return;
    const actions = document.getElementById('toolbarActions');
    if (!actions) return;
    const btn = e.target.closest('.btn, a.btn');
    if (!btn || !actions.contains(btn)) return;
    // Don't close for color picker or language picker interactions
    if (btn.closest('.color-picker-wrapper') || btn.closest('.language-picker-wrapper')) return;
    setTimeout(closeMobileMenu, 50);
});

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
    // On first load only, try to load the default dataset
    if (!adminInitialized) {
        adminInitialized = true;
        await loadDefaultDatasetOnStartup();
        // Only render here if no default dataset was loaded (loadDefaultDatasetOnStartup handles its own render)
        if (activeDatasetId === null) {
            await renderAdminUI();
        }
    } else {
        // Re-init after loadDataset or importData — just re-render
        await renderAdminUI();
        if (activeDatasetId !== null) {
            showActiveDatasetBanner(activeDatasetId, activeDatasetName, activeDatasetIsDefault);
        }
    }
    
    // Non-blocking version check — fire and forget
    checkForUpdates();
}

// Render admin UI from current live DB state
async function renderAdminUI() {
    await loadDateFormatSetting();
    sectionOrder = await loadSectionOrder();
    sectionVisibility = await loadSectionsAdmin();
    await loadProfile(true);
    await renderSectionsInOrder();
    await generateATSContent();
    await setupPrintPagination();
    await loadPageSplitsSetting();
}

// Check for updates (non-blocking)
let versionData = null;

function checkForUpdates() {
    fetch('/api/version')
        .then(res => res.json())
        .then(data => {
            versionData = data;
            if (data.updateAvailable && data.latest) {
                const banner = document.getElementById('updateBanner');
                const text = document.getElementById('updateBannerText');
                const link = document.getElementById('updateBannerLink');
                if (banner && text) {
                    text.textContent = t('banner.update', { latest: data.latest, current: data.current });
                    if (data.changelog && link) {
                        link.href = data.changelog;
                        link.style.display = '';
                    } else if (link) {
                        link.style.display = 'none';
                    }
                    banner.style.display = '';
                    updateBannerMargins();
                }
            }
            populateVersionDisplay();
        })
        .catch(() => { /* silently ignore */ });
}

function populateVersionDisplay() {
    const el = document.getElementById('settingsVersionInfo');
    if (!el || !versionData) return;
    if (versionData.updateAvailable && versionData.latest) {
        const linkHref = versionData.changelog || 'https://github.com/vincentmakes/cv-manager/releases';
        el.innerHTML = `v${escapeHtml(versionData.current)} &middot; <a href="${escapeHtml(linkHref)}" target="_blank" rel="noopener noreferrer">${t('settings.version.update_available', { version: versionData.latest })}</a>`;
    } else {
        el.textContent = versionData.current ? `v${versionData.current}` : '';
    }
}

function dismissUpdateBanner() {
    const banner = document.getElementById('updateBanner');
    if (banner) banner.style.display = 'none';
    updateBannerMargins();
}

// Recalculate container margin based on visible banners
function updateBannerMargins() {
    const toolbarHeight = 54;
    const baseMargin = 70; // 54px toolbar + 16px gap
    let extraHeight = 0;
    
    const updateBanner = document.getElementById('updateBanner');
    const datasetBanner = document.getElementById('activeDatasetBanner');
    
    // Stack banners: update banner sits right below toolbar, dataset banner below that
    if (updateBanner && updateBanner.style.display !== 'none') {
        extraHeight += updateBanner.offsetHeight;
    }
    if (datasetBanner && datasetBanner.style.display !== 'none') {
        // Position dataset banner below update banner (or toolbar if no update banner)
        datasetBanner.style.top = (toolbarHeight + (updateBanner && updateBanner.style.display !== 'none' ? updateBanner.offsetHeight : 0)) + 'px';
        extraHeight += datasetBanner.offsetHeight;
    }
    
    document.querySelector('.container').style.marginTop = (baseMargin + extraHeight) + 'px';
}

// Load default dataset on admin startup — restores last-edited dataset if available
async function loadDefaultDatasetOnStartup() {
    try {
        // Try to restore the last-edited dataset from sessionStorage
        const lastId = sessionStorage.getItem('cv_active_dataset_id');
        if (lastId) {
            try {
                const result = await api(`/api/datasets/${lastId}/load`, { method: 'POST' });
                if (result.success) {
                    await applyLoadedDatasetResult(result);
                    // Sync UI locale to match
                    if (typeof I18n !== 'undefined' && activeDatasetLanguage && I18n.locale !== activeDatasetLanguage) {
                        await I18n.setLocale(activeDatasetLanguage);
                    }
                    await renderAdminUI();
                    showActiveDatasetBanner(activeDatasetId, activeDatasetName, activeDatasetIsDefault);
                    return;
                }
            } catch (err) { /* stored dataset may have been deleted, fall through */ }
        }

        const defaultDs = await api('/api/datasets/default');
        if (defaultDs && defaultDs.exists) {
            const result = await api(`/api/datasets/${defaultDs.id}/load`, { method: 'POST' });
            if (result.success) {
                await applyLoadedDatasetResult(result);
                persistActiveDataset();
                await renderAdminUI();
                showActiveDatasetBanner(activeDatasetId, activeDatasetName, activeDatasetIsDefault);
            }
        }
    } catch (err) {
        console.log('No default dataset to load:', err.message);
    }
}

// Persist / clear active dataset ID in sessionStorage
function persistActiveDataset() {
    if (activeDatasetId) {
        sessionStorage.setItem('cv_active_dataset_id', activeDatasetId);
    } else {
        sessionStorage.removeItem('cv_active_dataset_id');
    }
}

// Apply a dataset load/save API result to active dataset state.
// Normalizes the language (using I18n.locale as fallback if missing) and
// persists the fallback back to the DB so the row has a language value.
async function applyLoadedDatasetResult(result) {
    activeDatasetId = result.id;
    activeDatasetName = result.name;
    activeDatasetIsDefault = !!result.is_default;
    activeDatasetIsPublic = !!result.is_public;
    activeDatasetLanguageGroup = result.language_group || null;
    activeDatasetVersion = result.version || 1;
    activeDatasetVersionGroup = result.version_group || null;

    let language = result.language;
    if (!language) {
        language = (typeof I18n !== 'undefined' && I18n.locale) ? I18n.locale : 'en';
        try {
            await api(`/api/datasets/${result.id}/language`, {
                method: 'PUT',
                body: JSON.stringify({ language })
            });
        } catch (err) { /* best-effort; state still reflects resolved language */ }
    }
    activeDatasetLanguage = language;

    await loadActiveDatasetSiblings();
    await loadActiveDatasetVersionCount();
}

// Load siblings for the active dataset
async function loadActiveDatasetSiblings() {
    activeDatasetSiblings = [];
    if (!activeDatasetId) return;
    try {
        const siblings = await api(`/api/datasets/${activeDatasetId}/siblings`);
        activeDatasetSiblings = (siblings || []).filter(s => s.id !== activeDatasetId);
    } catch (err) { /* ignore */ }
}

// Count datasets sharing our version_group (used to decide whether to show the version chip)
async function loadActiveDatasetVersionCount() {
    activeDatasetVersionCount = 1;
    if (!activeDatasetVersionGroup) return;
    try {
        const all = await api('/api/datasets');
        activeDatasetVersionCount = (all || []).filter(d => d.version_group === activeDatasetVersionGroup).length || 1;
    } catch (err) { /* ignore */ }
}

// Show the active dataset banner
function showActiveDatasetBanner(id, name, isDefault) {
    const banner = document.getElementById('activeDatasetBanner');
    const nameEl = document.getElementById('activeDatasetName');
    const publicBadge = document.getElementById('activeDatasetPublicBadge');
    const makePublicBtn = document.getElementById('activeDatasetMakePublicBtn');
    const sharedBadge = document.getElementById('activeDatasetSharedBadge');
    if (!banner || !nameEl) return;

    nameEl.textContent = name;
    if (publicBadge) publicBadge.style.display = isDefault ? '' : 'none';
    if (makePublicBtn) makePublicBtn.style.display = isDefault ? 'none' : '';
    if (sharedBadge) sharedBadge.style.display = activeDatasetIsPublic ? '' : 'none';
    banner.style.display = '';

    // Language badge — always show when a dataset is active, with a round flag
    const langBadge = document.getElementById('activeDatasetLangBadge');
    if (langBadge) {
        const code = activeDatasetLanguage || 'en';
        const upper = code.toUpperCase();
        langBadge.innerHTML = `${langFlagImg(code, 16)}<span class="dataset-lang-badge-code">${escapeHtml(upper)}</span>`;
        langBadge.title = t('datasets.lang_badge_tooltip', { lang: upper });
        langBadge.style.display = '';
    }

    // Version badge — only when multiple versions exist in this version_group
    const versionBadge = document.getElementById('activeDatasetVersionBadge');
    if (versionBadge) {
        if (activeDatasetVersion && activeDatasetVersionCount > 1) {
            versionBadge.textContent = `v${activeDatasetVersion}`;
            versionBadge.title = t('datasets.version_badge_tooltip', { version: activeDatasetVersion });
            versionBadge.style.display = '';
        } else {
            versionBadge.style.display = 'none';
        }
    }

    renderActiveDatasetLangChips();
    renderAddLangDropdown();

    updateBannerMargins();
}

// Hide the active dataset banner
function hideActiveDatasetBanner() {
    const banner = document.getElementById('activeDatasetBanner');
    if (banner) banner.style.display = 'none';
    activeDatasetId = null;
    activeDatasetName = null;
    activeDatasetIsDefault = false;
    activeDatasetLanguage = null;
    activeDatasetLanguageGroup = null;
    activeDatasetSiblings = [];
    activeDatasetVersion = null;
    activeDatasetVersionGroup = null;
    activeDatasetVersionCount = 1;
    persistActiveDataset();
    updateBannerMargins();
}

// Render the sibling language chips inline in the banner, plus the intro label
function renderActiveDatasetLangChips() {
    const container = document.getElementById('activeDatasetLangChips');
    const label = document.getElementById('activeDatasetVariantsLabel');
    if (!container) return;

    const langNames = {};
    (typeof I18n !== 'undefined' ? I18n.languages : []).forEach(l => { langNames[l.code] = l.native; });

    // Intro label only when there's at least one sibling to switch to
    if (label) label.style.display = activeDatasetSiblings.length > 0 ? '' : 'none';

    container.innerHTML = activeDatasetSiblings.map(sib => {
        const code = (sib.language || '').toUpperCase();
        const name = langNames[sib.language] || sib.language;
        const tooltip = t('datasets.switch_to_lang', { lang: name });
        const attr = s => escapeHtml(s).replace(/"/g, '&quot;');
        return `<button type="button" class="dataset-lang-chip" title="${attr(tooltip)}" data-sibling-id="${sib.id}" data-sibling-name="${attr(sib.name || '')}" data-sibling-lang="${attr(sib.language)}">
            ${langFlagImg(sib.language, 16)}
            <span class="dataset-lang-chip-code">${escapeHtml(code)}</span>
        </button>`;
    }).join('');

    container.querySelectorAll('.dataset-lang-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const sid = parseInt(btn.getAttribute('data-sibling-id'), 10);
            const sname = btn.getAttribute('data-sibling-name') || '';
            const slang = btn.getAttribute('data-sibling-lang') || '';
            switchDatasetLanguage(sid, sname, slang);
        });
    });
}

// Populate and show/hide the add-language dropdown next to the chips
function renderAddLangDropdown() {
    const wrapper = document.getElementById('datasetAddLangWrapper');
    const dropdown = document.getElementById('datasetAddLangDropdown');
    if (!wrapper || !dropdown) return;

    // Always visible when a dataset is loaded
    wrapper.style.display = activeDatasetId ? '' : 'none';

    if (typeof I18n === 'undefined') {
        dropdown.innerHTML = '';
        return;
    }

    const used = new Set();
    used.add(activeDatasetLanguage || 'en');
    activeDatasetSiblings.forEach(s => used.add(s.language));
    const available = I18n.languages.filter(l => !used.has(l.code));

    if (available.length === 0) {
        dropdown.innerHTML = `<div class="dataset-lang-option disabled">
            <span class="dataset-lang-name">${escapeHtml(t('datasets.no_languages_available'))}</span>
        </div>`;
        return;
    }

    dropdown.innerHTML = available.map(l => `<div class="dataset-lang-option" onclick="addDatasetLanguage('${escapeHtml(l.code)}')">
        ${langFlagImg(l.code, 18)}
        <span class="dataset-lang-code">${escapeHtml(l.code.toUpperCase())}</span>
        <span class="dataset-lang-name">${escapeHtml(l.native)}</span>
    </div>`).join('');
}

// Toggle the add-language dropdown
function toggleDatasetAddLangDropdown() {
    const dropdown = document.getElementById('datasetAddLangDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

// Open Save As modal pre-filled for adding a specific new language variant
async function addDatasetLanguage(code) {
    const dropdown = document.getElementById('datasetAddLangDropdown');
    if (dropdown) dropdown.classList.remove('active');
    if (!activeDatasetId) return;

    // Ensure the active dataset is part of a language group before creating a sibling
    if (!activeDatasetLanguageGroup) {
        try {
            const refreshed = await api(`/api/datasets/id/${activeDatasetId}`);
            if (refreshed && refreshed.language_group) {
                activeDatasetLanguageGroup = refreshed.language_group;
            }
        } catch (err) { /* fall through; Save As will still create a group via new dataset flow */ }
    }

    await saveAsDataset();
    const input = document.getElementById('saveAsNameInput');
    const langGroupInput = document.getElementById('saveAsLangGroup');
    const langSelect = document.getElementById('saveAsLangSelect');
    if (input) input.value = activeDatasetName || '';
    if (langGroupInput && activeDatasetLanguageGroup) langGroupInput.value = activeDatasetLanguageGroup;

    if (langSelect && typeof I18n !== 'undefined') {
        const used = new Set();
        used.add(activeDatasetLanguage || 'en');
        activeDatasetSiblings.forEach(s => used.add(s.language));
        const available = I18n.languages.filter(l => !used.has(l.code));
        if (available.length > 0) {
            langSelect.innerHTML = available.map(l =>
                `<option value="${l.code}"${l.code === code ? ' selected' : ''}>${escapeHtml(l.native)} (${l.code.toUpperCase()})</option>`
            ).join('');
            langSelect.value = code;
        }
    }
    updateSaveAsSubmitState();
}

// Back-compat alias: old callers may still reference addLanguageFromSwitcher
async function addLanguageFromSwitcher() {
    // No preselection — picks the first available language in Save As
    await addDatasetLanguage('');
}

// Make the active dataset the default (served at root URL) from the banner
async function makeActiveDatasetPublic() {
    if (!activeDatasetId) return;
    await setDatasetDefault(activeDatasetId, activeDatasetName || '');
}

// Close add-language dropdown when clicking outside
document.addEventListener('click', (e) => {
    const wrapper = document.getElementById('datasetAddLangWrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        const dropdown = document.getElementById('datasetAddLangDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

// Switch to a different language variant in admin
async function switchDatasetLanguage(id, name, language) {
    // Auto-save current dataset first
    if (activeDatasetId) {
        try {
            await api(`/api/datasets/${activeDatasetId}/save`, { method: 'POST' });
        } catch (err) { /* continue anyway */ }
    }
    // Switch UI locale to match the dataset language
    if (typeof I18n !== 'undefined' && language && I18n.locale !== language) {
        await I18n.setLocale(language);
        renderLanguageGrid();
    }
    await loadDataset(id, name);
}

// Auto-save active dataset (debounced)
let autoSaveTimer = null;
let savedStatusTimer = null;

function autoSaveActiveDataset() {
    if (!activeDatasetId) return;
    
    // Clear any pending save
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    
    // Debounce: wait 1.5s after last mutation before saving
    autoSaveTimer = setTimeout(async () => {
        const statusEl = document.getElementById('activeDatasetStatus');
        try {
            if (statusEl) {
                statusEl.textContent = t('banner.saving');
                statusEl.className = 'active-dataset-status saving';
            }
            const result = await api(`/api/datasets/${activeDatasetId}/save`, { method: 'POST' });
            if (result.success && statusEl) {
                statusEl.textContent = t('banner.saved');
                statusEl.className = 'active-dataset-status saved';
                // Clear the "Saved" message after 3 seconds
                if (savedStatusTimer) clearTimeout(savedStatusTimer);
                savedStatusTimer = setTimeout(() => {
                    statusEl.textContent = '';
                    statusEl.className = 'active-dataset-status';
                }, 3000);
            }
        } catch (err) {
            console.error('Auto-save failed:', err);
            if (statusEl) {
                statusEl.textContent = t('banner.save_failed');
                statusEl.className = 'active-dataset-status';
            }
        }
    }, 1500);
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

// Reorder DOM section elements based on sectionOrder (lightweight, no data reload)
function reorderSectionElements() {
    const container = document.querySelector('.container');
    
    // Collect all section elements
    const sectionElements = {
        'about': document.getElementById('section-about'),
        'timeline': document.getElementById('section-timeline'),
        'experience': document.getElementById('section-experience'),
        'certifications': document.getElementById('section-certifications'),
        'education': document.getElementById('section-education'),
        'skills': document.getElementById('section-skills'),
        'projects': document.getElementById('section-projects')
    };
    
    customSections.forEach(cs => {
        const el = document.getElementById(`section-${cs.section_key}`);
        if (el) sectionElements[cs.section_key] = el;
    });
    
    // Reorder based on sectionOrder
    sectionOrder.forEach(section => {
        const el = sectionElements[section.key];
        if (el) {
            container.appendChild(el);
            if (section.visible && section.print_visible === false) {
                el.classList.add('hidden-print');
            } else if (section.visible) {
                el.classList.remove('hidden-print');
            }
        }
    });
    
    applySectionTitles(sectionOrder);
}

// Render sections in the correct order
async function renderSectionsInOrder() {
    // Load all section data
    await loadTimeline();
    await loadExperiences();
    await loadCertifications();
    await loadEducation();
    await loadSkills();
    await loadProjects();
    await loadCustomSections();
    
    reorderSectionElements();
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
        case 'free-text':
            contentHtml = renderFreeTextLayout(items);
            break;
        case 'picture-grid':
            contentHtml = renderPictureGridLayout(items, section.metadata?.columns || 3);
            break;
        case 'timeline':
            contentHtml = renderTimelineLayout(items);
            break;
        default:
            contentHtml = renderGridLayout(items, 3);
    }
    
    return `
        <section class="section custom-section ${visible ? '' : 'hidden-print'}" id="section-${section.section_key}">
            <button class="section-reorder-handle no-print" data-section-key="${section.section_key}" title="${t('action.reorder_sections')}" aria-label="${t('action.reorder_sections')}">
                <span class="material-symbols-outlined">drag_indicator</span>
            </button>
            <div class="section-header">
                <h2 class="section-title">${escapeHtml(section.name)}</h2>
                <div class="section-actions no-print">
                    <button class="icon-btn ${visible ? 'active' : ''}" onclick="toggleSection('${section.section_key}')" title="Toggle Visibility" id="toggle-${section.section_key}">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </div>
            <div class="custom-section-content" data-layout="${section.layout_type}">
                ${contentHtml}
            </div>
            <button class="add-btn no-print" onclick="manageCustomSectionItems(${section.id})">
                <span class="material-symbols-outlined">add</span>
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
        const hideTitle = item.metadata?.hideTitle || false;
        return `
            <div class="custom-grid-item ${visible ? '' : 'hidden-print'}">
                ${item.title && !hideTitle ? `<h3 class="custom-item-title">${escapeHtml(item.title)}</h3>` : ''}
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
        const hideTitle = item.metadata?.hideTitle || false;
        return `
            <div class="custom-list-item ${visible ? '' : 'hidden-print'}">
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

// Cards layout
function renderCardsLayout(items) {
    if (items.length === 0) return '<p class="empty-section">No items added yet.</p>';
    
    return `<div class="custom-cards">${items.map(item => {
        const visible = item.visible !== false;
        const hideTitle = item.metadata?.hideTitle || false;
        return `
            <div class="custom-card ${visible ? '' : 'hidden-print'}">
                ${item.title && !hideTitle ? `<h3 class="custom-card-title">${escapeHtml(item.title)}</h3>` : ''}
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

// Free text layout - plain text with preserved line breaks, no title
function renderFreeTextLayout(items) {
    if (items.length === 0) return '<p class="empty-section">No text added yet.</p>';
    
    return `<div class="custom-free-text-blocks">${items.map(item => {
        const visible = item.visible !== false;
        const hideTitle = item.metadata?.hideTitle !== false; // default true for free-text
        const showTitle = item.title && !hideTitle;
        return `
            <div class="custom-free-text ${visible ? '' : 'hidden-print'}">
                ${showTitle ? `<div class="custom-item-title">${escapeHtml(item.title)}</div>` : ''}
                <p class="custom-free-text-content">${escapeHtml(item.description || '')}</p>
            </div>
        `;
    }).join('')}</div>`;
}

// Picture grid layout - display uploaded images in a configurable grid
function renderPictureGridLayout(items, columns = 3) {
    if (items.length === 0) return `<div class="custom-picture-grid custom-picture-grid-${columns}">${Array(columns).fill('<div class="custom-picture-empty-cell no-print"></div>').join('')}</div>`;

    const itemsHtml = items.map(item => {
        const visible = item.visible !== false;
        return `
            <div class="custom-picture-item ${visible ? '' : 'hidden-print'}">
                ${item.image ? `<img src="/uploads/${escapeHtml(item.image)}?${Date.now()}" alt="${escapeHtml(item.title || '')}" class="custom-picture-img">` : `<div class="custom-picture-placeholder">${t('custom_item.no_image')}</div>`}
                ${item.title ? `<div class="custom-picture-caption">${escapeHtml(item.title)}</div>` : ''}
            </div>
        `;
    }).join('');

    // Pad with empty cells to fill the row
    const remainder = items.length % columns;
    const emptyCells = remainder === 0 ? '' : Array(columns - remainder).fill('<div class="custom-picture-empty-cell no-print"></div>').join('');

    return `<div class="custom-picture-grid custom-picture-grid-${columns}">${itemsHtml}${emptyCells}</div>`;
}

function renderTimelineLayout(items) {
    if (items.length === 0) return '<p style="color: var(--gray-500); text-align: center; padding: 20px;">No items yet.</p>';

    // Sort by start_date DESC (newest first)
    const sorted = [...items].sort((a, b) => {
        const dateA = parseDateForSort(a.metadata?.start_date || '');
        const dateB = parseDateForSort(b.metadata?.start_date || '');
        return dateB - dateA;
    });

    return sorted.map(item => {
        const meta = item.metadata || {};
        return renderExperienceCard({
            id: `cs_${item.id}`,
            title: item.title,
            subtitle: item.subtitle,
            startDate: meta.start_date,
            endDate: meta.end_date,
            location: meta.location,
            logo: item.image,
            summary: meta.summary,
            highlights: item.description ? item.description.split('\n').filter(h => h.trim()) : [],
            visible: item.visible !== false,
            showLogo: showExperienceLogos && !!item.image,
            showDuration: showExperienceDuration
        });
    }).join('');
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
// Sorted by sort_order ASC (user-defined order, falling back to start_date DESC)
async function loadExperiences() {
    const experiences = await api('/api/experiences');

    const container = document.getElementById('experienceList');
    const total = experiences.length;

    container.innerHTML = experiences.map((exp, index) => {
        const actionsHtml = `<div class="item-actions">
            <button class="item-btn move-btn" onclick="moveExperience(${exp.id}, 'up')" title="${t('action.move_up')}"${index === 0 ? ' disabled' : ''}>
                ${moveUpIcon()}
            </button>
            <button class="item-btn move-btn" onclick="moveExperience(${exp.id}, 'down')" title="${t('action.move_down')}"${index === total - 1 ? ' disabled' : ''}>
                ${moveDownIcon()}
            </button>
            <button class="item-btn" onclick="toggleVisibility('experiences', ${exp.id}, ${!exp.visible})" title="Toggle Visibility">
                ${visibilityIcon(exp.visible)}
            </button>
            <button class="item-btn" onclick="openModal('experience', ${exp.id})" title="Edit">
                ${editIcon()}
            </button>
            <button class="item-btn delete" onclick="confirmDelete('experiences', ${exp.id})" title="Delete">
                ${deleteIcon()}
            </button>
        </div>`;
        return renderExperienceCard({
            id: exp.id,
            title: exp.job_title,
            subtitle: exp.company_name,
            startDate: exp.start_date,
            endDate: exp.end_date,
            location: exp.location,
            logo: exp.logo_filename,
            summary: exp.summary,
            highlights: exp.highlights || [],
            visible: exp.visible,
            showLogo: showExperienceLogos,
            showDuration: showExperienceDuration,
            schemaOrg: true,
            actionsHtml
        });
    }).join('');
}

// Load Certifications (admin version with edit controls)
async function loadCertifications() {
    const certs = await api('/api/certifications');
    const container = document.getElementById('certGrid');
    
    container.innerHTML = certs.map(cert => {
        const hasLogo = !!cert.logo_filename;
        const hasLink = isValidUrl(cert.credential_id);
        return `
        <article class="cert-card ${cert.visible ? '' : 'hidden-print'}${hasLogo ? ' has-logo' : ''}" data-id="${cert.id}" draggable="true" itemscope itemtype="https://schema.org/EducationalOccupationalCredential">
            <div class="drag-handle" title="Drag to reorder">${dragHandleIcon()}</div>
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
            ${hasLogo ? `<img src="/uploads/${encodeURIComponent(cert.logo_filename)}" class="cert-logo" alt="${escapeHtml(cert.provider || '')}" onerror="this.style.display='none'">` : ''}
            <div class="cert-content">
                <div class="cert-header">
                    <div class="cert-name" itemprop="name">${escapeHtml(cert.name)}</div>
                    ${hasLink ? `<a href="${escapeHtml(cert.credential_id)}" class="cert-link" target="_blank" rel="noopener" title="${t('view_credential')}">${linkIcon()}</a>` : ''}
                </div>
                <time class="cert-date" itemprop="dateCreated">${formatDate(cert.issue_date) || escapeHtml(cert.issue_date || '')}</time>
                <div class="cert-provider" itemprop="issuedBy">${escapeHtml(cert.provider || '')}</div>
            </div>
        </article>`;
    }).join('');
    
    // Add drag-and-drop listeners
    initDragAndDrop(container, 'certifications');
}

// Load Education (admin version with edit controls)
async function loadEducation() {
    const education = await api('/api/education');
    const container = document.getElementById('educationList');
    
    container.innerHTML = education.map(edu => `
        <article class="item-card ${edu.visible ? '' : 'hidden-print'}${edu.logo_filename ? ' has-logo' : ''}" data-id="${edu.id}" draggable="true" itemscope itemtype="https://schema.org/EducationalOccupationalCredential">
            <div class="drag-handle" title="Drag to reorder">${dragHandleIcon()}</div>
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
                ${edu.logo_filename ? `<img src="/uploads/${encodeURIComponent(edu.logo_filename)}" class="experience-logo" alt="${escapeHtml(edu.institution_name)}" onerror="this.style.display='none'">` : ''}
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
    
    // Add drag-and-drop listeners
    initDragAndDrop(container, 'education');
}

// Load Skills (admin version with edit controls)
async function loadSkills() {
    const skills = await api('/api/skills');
    const container = document.getElementById('skillsGrid');
    
    container.innerHTML = skills.map(cat => `
        <div class="skill-category ${cat.visible ? '' : 'hidden-print'}" data-id="${cat.id}" draggable="true">
            <div class="drag-handle" title="Drag to reorder">${dragHandleIcon()}</div>
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
    
    // Add drag-and-drop listeners
    initDragAndDrop(container, 'skills');
}

// Load Projects (admin version with edit controls)
async function loadProjects() {
    const projects = await api('/api/projects');
    const container = document.getElementById('projectsGrid');
    
    container.innerHTML = projects.map(proj => `
        <article class="project-card ${proj.visible ? '' : 'hidden-print'}" data-id="${proj.id}" draggable="true" itemscope itemtype="https://schema.org/CreativeWork">
            <div class="drag-handle" title="Drag to reorder">${dragHandleIcon()}</div>
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
    
    // Add drag-and-drop listeners
    initDragAndDrop(container, 'projects');
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
    autoSaveActiveDataset();
}

// Toggle Item Visibility
async function toggleVisibility(endpoint, id, visible) {
    const data = await api(`/api/${endpoint}/${id}`);
    await api(`/api/${endpoint}/${id}`, {
        method: 'PUT',
        body: { ...data, visible }
    });
    await reloadSection(endpoint);
    // Regenerate timeline when experience visibility changes
    if (endpoint === 'experiences') {
        await loadTimeline();
    }
    toast(t('toast.visibility_updated'));
    autoSaveActiveDataset();
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
            title = t('action.edit_profile');
            data = await api('/api/profile');
            form = profileForm(data);
            document.getElementById('deleteBtn').style.display = 'none';
            break;
        case 'experience':
            title = id ? t('modal.edit_experience') : t('modal.add_experience');
            pendingLogo = null;
            currentModal.existingLogo = data.logo_filename || null;
            currentModal.existingPropagate = !!data.logo_propagate;
            currentModal.logoEntityType = 'experience';
            form = experienceForm(data);
            break;
        case 'certification':
            title = id ? t('modal.edit_certification') : t('modal.add_certification');
            pendingLogo = null;
            currentModal.existingLogo = data.logo_filename || null;
            currentModal.existingPropagate = !!data.logo_propagate;
            currentModal.logoEntityType = 'certifications';
            form = certificationForm(data);
            break;
        case 'education':
            title = id ? t('modal.edit_education') : t('modal.add_education');
            pendingLogo = null;
            currentModal.existingLogo = data.logo_filename || null;
            currentModal.existingPropagate = !!data.logo_propagate;
            currentModal.logoEntityType = 'education';
            form = educationForm(data);
            break;
        case 'skill':
            title = id ? t('modal.edit_skill') : t('modal.add_skill');
            form = skillForm(data);
            break;
        case 'project':
            title = id ? t('modal.edit_project') : t('modal.add_project');
            form = projectForm(data);
            break;
    }

    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = form;
    document.getElementById('modalOverlay').classList.add('active');
    if (type === 'experience' || type === 'education' || type === 'certification') {
        updateLogoApplyGlobal();
        initLogoPropagate();
    }
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
            <label class="form-label">${t('form.profile_picture')}</label>
            <div class="profile-upload-container">
                <div class="profile-upload-preview" id="profileUploadPreview">
                    <img src="${d.picture_filename ? '/uploads/' + encodeURIComponent(d.picture_filename) : '/uploads/picture.jpeg'}?${Date.now()}" alt="" id="profilePreviewImg" onerror="this.style.display='none';document.getElementById('profilePreviewInitials').style.display='flex';">
                    <div class="profile-preview-initials" id="profilePreviewInitials" style="display:none;">${escapeHtml(d.initials || 'CV')}</div>
                </div>
                <div class="profile-upload-actions">
                    <div>
                        ${t('form.show_profile_picture')}
                        <label class="toggle-switch">
                            <input type="checkbox" id="f-profilePictureEnabled" ${d.profile_picture_enabled == 1 ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <input type="file" id="f-picture" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="previewProfilePicture(this)">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('f-picture').click()">
                        <span class="material-symbols-outlined" style="font-size:14px">image</span>
                        ${t('form.choose_image')}
                    </button>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="showPicturePicker()">
                        <span class="material-symbols-outlined" style="font-size:14px">inventory_2</span>
                        ${t('form.use_existing')}
                    </button>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="removeProfilePicture()">
                        <span class="material-symbols-outlined" style="font-size:14px">delete</span>
                        ${t('form.remove')}
                    </button>
                </div>
            </div>
            <div class="logo-picker-grid" id="picturePickerGrid" style="display:none;"></div>
            <div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
                <label class="toggle-switch">
                    <input type="checkbox" id="f-picturePropagate" ${d.picture_propagate == 0 ? '' : 'checked'}>
                    <span class="toggle-slider"></span>
                </label>
                <span class="form-hint" style="margin:0">${t('form.apply_picture_globally')}</span>
            </div>
            <div class="form-hint">${t('form.picture_hint')}</div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.open_to_work')}</label>
            <div style="display:flex;align-items:center;gap:10px;">
                <label class="toggle-switch">
                    <input type="checkbox" id="f-openToWork" ${d.open_to_work == 1 ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
                <span class="form-hint" style="margin:0">${t('form.open_to_work_hint')}</span>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('form.name')}</label>
                <input type="text" class="form-input" id="f-name" value="${escapeHtml(d.name || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.initials')}</label>
                <input type="text" class="form-input" id="f-initials" value="${escapeHtml(d.initials || '')}" maxlength="3">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.title')}</label>
            <input type="text" class="form-input" id="f-title" value="${escapeHtml(d.title || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.subtitle')}</label>
            <input type="text" class="form-input" id="f-subtitle" value="${escapeHtml(d.subtitle || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.bio')}</label>
            <textarea class="form-textarea" id="f-bio">${escapeHtml(d.bio || '')}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('form.location')}</label>
                <input type="text" class="form-input" id="f-location" value="${escapeHtml(d.location || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.languages')}</label>
                <input type="text" class="form-input" id="f-languages" value="${escapeHtml(d.languages || '')}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.linkedin_url')}</label>
            <input type="text" class="form-input" id="f-linkedin" value="${escapeHtml(d.linkedin || '')}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('form.email')}</label>
                <input type="email" class="form-input" id="f-email" value="${escapeHtml(d.email || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.phone')}</label>
                <input type="text" class="form-input" id="f-phone" value="${escapeHtml(d.phone || '')}">
            </div>
        </div>
    `;
}

// Shared logo upload HTML - reused by experience, education, and timeline item modals
function logoUploadHtml(filename, labelKey) {
    const label = t(labelKey || 'form.company_logo');
    return `
        <div class="form-group">
            <label class="form-label">${label}</label>
            <div class="logo-upload-container">
                <div class="logo-upload-preview" id="logoUploadPreview">
                    ${filename
                        ? `<img src="/uploads/${encodeURIComponent(filename)}?${Date.now()}" alt="" id="logoPreviewImg">`
                        : `<div class="logo-preview-placeholder" id="logoPreviewPlaceholder"><span class="material-symbols-outlined" style="font-size:20px">image</span></div>`
                    }
                </div>
                <div class="logo-upload-actions">
                    <input type="file" id="f-logo" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="previewLogo(this)">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('f-logo').click()"><span class="material-symbols-outlined" style="font-size:14px">image</span> ${t('form.choose_image')}</button>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="showLogoPicker()"><span class="material-symbols-outlined" style="font-size:14px">inventory_2</span> ${t('form.use_existing')}</button>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="removeLogo()" style="color: var(--gray-500)"><span class="material-symbols-outlined" style="font-size:14px">delete</span> ${t('form.remove')}</button>
                </div>
                <div class="logo-picker-grid" id="logoPickerGrid" style="display:none;"></div>
            </div>
            <div class="form-hint">${t('form.logo_hint')}</div>
        </div>`;
}

function experienceForm(d) {
    return `
        ${logoUploadHtml(d.logo_filename)}
        <div class="form-group" style="margin-top: -8px;">
            <div class="logo-propagate-toggle" id="logoApplyGlobalLabel" style="display:none;">
                <label class="toggle-switch">
                    <input type="checkbox" id="f-logo-apply-global" onchange="onLogoPropagateToggle(this.checked)">
                    <span class="toggle-slider"></span>
                </label>
                <span class="logo-propagate-text" id="logoApplyGlobalText"></span>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.job_title')}</label>
            <input type="text" class="form-input" id="f-job_title" value="${escapeHtml(d.job_title || '')}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('form.company')}</label>
                <input type="text" class="form-input" id="f-company_name" value="${escapeHtml(d.company_name || '')}" oninput="onCompanyNameInput()">
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.country_code')}</label>
                <input type="text" class="form-input" id="f-country_code" value="${escapeHtml(d.country_code || '')}" maxlength="2" placeholder="${t('form.country_code_placeholder')}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('form.start_date')}</label>
                <input type="text" class="form-input" id="f-start_date" value="${escapeHtml(d.start_date || '')}" placeholder="${t('form.start_date_placeholder')}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.end_date')}</label>
                <input type="text" class="form-input" id="f-end_date" value="${escapeHtml(d.end_date || '')}" placeholder="${t('form.end_date_placeholder')}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.location')}</label>
            <input type="text" class="form-input" id="f-location" value="${escapeHtml(d.location || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.summary')}</label>
            <textarea class="form-textarea" id="f-summary" rows="3">${escapeHtml(d.summary || '')}</textarea>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.highlights')}</label>
            <textarea class="form-textarea" id="f-highlights" rows="6">${(d.highlights || []).join('\n')}</textarea>
        </div>
    `;
}

function certificationForm(d) {
    return `
        ${logoUploadHtml(d.logo_filename, 'form.certification_logo')}
        <div class="form-group" style="margin-top: -8px;">
            <div class="logo-propagate-toggle" id="logoApplyGlobalLabel" style="display:none;">
                <label class="toggle-switch">
                    <input type="checkbox" id="f-logo-apply-global" onchange="onLogoPropagateToggle(this.checked)">
                    <span class="toggle-slider"></span>
                </label>
                <span class="logo-propagate-text" id="logoApplyGlobalText"></span>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.cert_name')}</label>
            <input type="text" class="form-input" id="f-name" value="${escapeHtml(d.name || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.provider')}</label>
            <input type="text" class="form-input" id="f-provider" value="${escapeHtml(d.provider || '')}" oninput="onProviderNameInput()">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('form.issue_date')}</label>
                <input type="text" class="form-input" id="f-issue_date" value="${escapeHtml(d.issue_date || '')}" placeholder="${t('form.issue_date_placeholder')}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.expiry_date')}</label>
                <input type="text" class="form-input" id="f-expiry_date" value="${escapeHtml(d.expiry_date || '')}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.credential_url')}</label>
            <input type="url" class="form-input" id="f-credential_id" value="${escapeHtml(d.credential_id || '')}" placeholder="${t('form.credential_url_placeholder')}">
        </div>
    `;
}

function educationForm(d) {
    return `
        ${logoUploadHtml(d.logo_filename, 'form.institution_logo')}
        <div class="form-group" style="margin-top: -8px;">
            <div class="logo-propagate-toggle" id="logoApplyGlobalLabel" style="display:none;">
                <label class="toggle-switch">
                    <input type="checkbox" id="f-logo-apply-global" onchange="onLogoPropagateToggle(this.checked)">
                    <span class="toggle-slider"></span>
                </label>
                <span class="logo-propagate-text" id="logoApplyGlobalText"></span>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.degree')}</label>
            <input type="text" class="form-input" id="f-degree_title" value="${escapeHtml(d.degree_title || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.institution')}</label>
            <input type="text" class="form-input" id="f-institution_name" value="${escapeHtml(d.institution_name || '')}" oninput="onInstitutionNameInput()">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('form.start_year')}</label>
                <input type="text" class="form-input" id="f-start_date" value="${escapeHtml(d.start_date || '')}" placeholder="${t('form.start_year_placeholder')}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.end_year')}</label>
                <input type="text" class="form-input" id="f-end_date" value="${escapeHtml(d.end_date || '')}" placeholder="${t('form.end_year_placeholder')}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.description')}</label>
            <textarea class="form-textarea" id="f-description">${escapeHtml(d.description || '')}</textarea>
        </div>
    `;
}

function getIconOptions() {
    return [
        { value: 'code', icon: 'code' },
        { value: 'server', icon: 'dns' },
        { value: 'database', icon: 'storage' },
        { value: 'cloud', icon: 'cloud' },
        { value: 'settings', icon: 'settings' },
        { value: 'users', icon: 'group' },
        { value: 'briefcase', icon: 'work' },
        { value: 'cpu', icon: 'memory' },
        { value: 'layers', icon: 'layers' },
        { value: 'security', icon: 'security' },
        { value: 'web', icon: 'language' },
        { value: 'mobile', icon: 'phone_iphone' },
        { value: 'terminal', icon: 'terminal' },
        { value: 'api', icon: 'api' },
        { value: 'analytics', icon: 'analytics' },
        { value: 'science', icon: 'science' },
        { value: 'build', icon: 'build' },
        { value: 'palette', icon: 'palette' },
        { value: 'school', icon: 'school' },
        { value: 'shield', icon: 'shield' },
        { value: 'rocket', icon: 'rocket_launch' },
        { value: 'chat', icon: 'chat' },
        { value: 'bug', icon: 'bug_report' },
        { value: 'heart', icon: 'favorite' },
        { value: 'music', icon: 'music_note' },
        { value: 'photo', icon: 'photo_camera' },
        { value: 'sports', icon: 'sports_soccer' },
        { value: 'eco', icon: 'eco' },
        { value: 'finance', icon: 'account_balance' },
        { value: 'default', icon: 'info' }
    ];
}

function skillForm(d) {
    const iconOptions = getIconOptions();
    const selectedValue = d.icon || 'default';
    const selected = iconOptions.find(o => o.value === selectedValue) || iconOptions[iconOptions.length - 1];

    return `
        <div class="form-group">
            <label class="form-label">${t('form.category_name')}</label>
            <input type="text" class="form-input" id="f-name" value="${escapeHtml(d.name || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.icon')}</label>
            <input type="hidden" id="f-icon" value="${escapeHtml(selectedValue)}">
            <div class="icon-picker-wrapper">
                <button type="button" class="icon-picker-trigger" id="iconPickerTrigger" onclick="toggleIconPicker()">
                    <span class="material-symbols-outlined" id="iconPickerSelected">${selected.icon}</span>
                    <span class="icon-picker-trigger-label" id="iconPickerLabel">${t('icon.' + selected.value)}</span>
                    <span class="material-symbols-outlined icon-picker-arrow">expand_more</span>
                </button>
            </div>
            <div class="icon-picker-overlay" id="iconPickerOverlay" onclick="if(event.target===this)closeIconPicker()">
                <div class="icon-picker-popup">
                    <div class="icon-picker-popup-header">
                        <span class="icon-picker-popup-title">${t('form.icon')}</span>
                        <button type="button" class="icon-picker-popup-close" onclick="closeIconPicker()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div class="icon-picker-grid">
                        ${iconOptions.map(opt => `
                            <button type="button" class="icon-picker-item${selectedValue === opt.value ? ' active' : ''}" data-icon="${opt.value}" data-material="${opt.icon}" onclick="selectIcon(this)" title="${t('icon.' + opt.value)}">
                                <span class="material-symbols-outlined">${opt.icon}</span>
                                <span class="icon-picker-label">${t('icon.' + opt.value)}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.skills_comma')}</label>
            <textarea class="form-textarea" id="f-skills">${(d.skills || []).join(', ')}</textarea>
        </div>
    `;
}

function projectForm(d) {
    return `
        <div class="form-group">
            <label class="form-label">${t('form.project_title')}</label>
            <input type="text" class="form-input" id="f-title" value="${escapeHtml(d.title || '')}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.description')}</label>
            <textarea class="form-textarea" id="f-description">${escapeHtml(d.description || '')}</textarea>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.technologies')}</label>
            <input type="text" class="form-input" id="f-technologies" value="${(d.technologies || []).join(', ')}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.link_optional')}</label>
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
        case 'profile': {
            const propagate = checked('f-picturePropagate');
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
                visible: true,
                profile_picture_enabled: checked('f-profilePictureEnabled'),
                picture_propagate: propagate,
                open_to_work: checked('f-openToWork')
            };
            await api('/api/profile', { method: 'PUT', body: data });
            const pictureResult = await uploadProfilePicture();
            if (propagate) {
                // After the picture save, mirror the current picture filename across all datasets.
                const current = await api('/api/profile');
                await api('/api/profile-pictures/apply-global', { method: 'POST', body: { picture_filename: current.picture_filename || null } });
            }
            await loadProfile(true);
            break;
        }

        case 'experience':
            // Normalize dates
            const expStart = normalizeDate(val('f-start_date'));
            if (expStart.error) { toast(expStart.error, 'error'); return; }
            const expEnd = normalizeDate(val('f-end_date'));
            if (expEnd.error) { toast(expEnd.error, 'error'); return; }

            data = {
                job_title: val('f-job_title'),
                company_name: val('f-company_name'),
                start_date: expStart.value,
                end_date: expEnd.value,
                location: val('f-location'),
                country_code: val('f-country_code') || '',
                summary: val('f-summary'),
                highlights: val('f-highlights').split('\n').filter(h => h.trim()),
                visible: true
            };
            {
                const propagateOn = checked('f-logo-apply-global');
                const wasPropagate = currentModal.existingPropagate;
                let logoFilename = null;
                let logoRemoved = (pendingLogo === 'remove');
                if (id) {
                    await api(`/api/${endpoint}/${id}`, { method: 'PUT', body: data });
                    logoFilename = await uploadLogo(id);
                } else {
                    const result = await api(`/api/${endpoint}`, { method: 'POST', body: data });
                    if (result.id) logoFilename = await uploadLogo(result.id);
                }
                // Fall back to the existing logo if user didn't change it
                if (!logoFilename && !logoRemoved) logoFilename = currentModal.existingLogo;
                if (propagateOn && data.company_name) {
                    if (logoRemoved) {
                        // Remove logo from all matching experiences (but keep file in uploads for picker)
                        await api('/api/logos/remove-global', { method: 'POST', body: { company_name: data.company_name } });
                    } else if (logoFilename) {
                        // Apply logo to all matching experiences + set propagate flag
                        await api('/api/logos/apply-global', { method: 'POST', body: { company_name: data.company_name, logo_filename: logoFilename } });
                    }
                } else if (!propagateOn && wasPropagate && data.company_name) {
                    // Propagate was turned off — update flag on all matching experiences
                    // but don't remove logos already applied
                    await api('/api/logos/set-propagate', { method: 'POST', body: { company_name: data.company_name, propagate: false } });
                }
            }
            await loadExperiences();
            await loadTimeline();
            break;

        case 'certification':
            // Normalize dates
            const certIssue = normalizeDate(val('f-issue_date'));
            if (certIssue.error) { toast(certIssue.error, 'error'); return; }
            const certExpiry = normalizeDate(val('f-expiry_date'));
            if (certExpiry.error) { toast(certExpiry.error, 'error'); return; }

            // Validate credential URL if provided
            const certCredUrl = val('f-credential_id').trim();
            if (certCredUrl && !isValidUrl(certCredUrl)) {
                toast(t('toast.credential_url_invalid'), 'error');
                return;
            }

            data = {
                name: val('f-name'),
                provider: val('f-provider'),
                issue_date: certIssue.value,
                expiry_date: certExpiry.value,
                credential_id: certCredUrl,
                visible: true
            };
            {
                const propagateOn = checked('f-logo-apply-global');
                const wasPropagate = currentModal.existingPropagate;
                let logoFilename = null;
                let logoRemoved = (pendingLogo === 'remove');
                if (id) {
                    await api(`/api/${endpoint}/${id}`, { method: 'PUT', body: data });
                    logoFilename = await uploadLogo(id);
                } else {
                    const result = await api(`/api/${endpoint}`, { method: 'POST', body: data });
                    if (result.id) logoFilename = await uploadLogo(result.id);
                }
                if (!logoFilename && !logoRemoved) logoFilename = currentModal.existingLogo;
                if (propagateOn && data.provider) {
                    if (logoRemoved) {
                        await api('/api/cert-logos/remove-global', { method: 'POST', body: { provider: data.provider } });
                    } else if (logoFilename) {
                        await api('/api/cert-logos/apply-global', { method: 'POST', body: { provider: data.provider, logo_filename: logoFilename } });
                    }
                } else if (!propagateOn && wasPropagate && data.provider) {
                    await api('/api/cert-logos/set-propagate', { method: 'POST', body: { provider: data.provider, propagate: false } });
                }
            }
            await loadCertifications();
            break;

        case 'education':
            // Normalize dates
            const eduStart = normalizeDate(val('f-start_date'));
            if (eduStart.error) { toast(eduStart.error, 'error'); return; }
            const eduEnd = normalizeDate(val('f-end_date'));
            if (eduEnd.error) { toast(eduEnd.error, 'error'); return; }

            data = {
                degree_title: val('f-degree_title'),
                institution_name: val('f-institution_name'),
                start_date: eduStart.value,
                end_date: eduEnd.value,
                description: val('f-description'),
                visible: true
            };
            {
                const propagateOn = checked('f-logo-apply-global');
                const wasPropagate = currentModal.existingPropagate;
                let logoFilename = null;
                let logoRemoved = (pendingLogo === 'remove');
                if (id) {
                    await api(`/api/${endpoint}/${id}`, { method: 'PUT', body: data });
                    logoFilename = await uploadLogo(id);
                } else {
                    const result = await api(`/api/${endpoint}`, { method: 'POST', body: data });
                    if (result.id) logoFilename = await uploadLogo(result.id);
                }
                if (!logoFilename && !logoRemoved) logoFilename = currentModal.existingLogo;
                if (propagateOn && data.institution_name) {
                    if (logoRemoved) {
                        await api('/api/edu-logos/remove-global', { method: 'POST', body: { institution_name: data.institution_name } });
                    } else if (logoFilename) {
                        await api('/api/edu-logos/apply-global', { method: 'POST', body: { institution_name: data.institution_name, logo_filename: logoFilename } });
                    }
                } else if (!propagateOn && wasPropagate && data.institution_name) {
                    await api('/api/edu-logos/set-propagate', { method: 'POST', body: { institution_name: data.institution_name, propagate: false } });
                }
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
    toast(t('toast.saved'));
    autoSaveActiveDataset();
}

// Delete Item
async function deleteItem() {
    const { type, id } = currentModal;
    if (!id) return;

    if (confirm(t('confirm.delete_item'))) {
        const endpoint = getEndpoint(type);
        await api(`/api/${endpoint}/${id}`, { method: 'DELETE' });
        closeModal();
        await reloadSection(endpoint);
        if (endpoint === 'experiences') await loadTimeline();
        toast(t('toast.deleted'));
        autoSaveActiveDataset();
    }
}

async function confirmDelete(endpoint, id) {
    if (confirm(t('confirm.delete_item'))) {
        await api(`/api/${endpoint}/${id}`, { method: 'DELETE' });
        await reloadSection(endpoint);
        if (endpoint === 'experiences') await loadTimeline();
        toast(t('toast.deleted'));
        autoSaveActiveDataset();
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
    toast(t('toast.all_visible'));
    autoSaveActiveDataset();
}

// Export/Import
async function exportData() {
    const data = await api('/api/cv');
    const lang = activeDatasetLanguage || I18n.locale || 'en';
    data.language = lang;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cv-data-${lang}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(t('toast.exported'));
}

async function exportStaticSite() {
    const btn = document.getElementById('staticSiteExportBtn');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `${materialIcon('hourglass_empty', 16)} ${t('settings.print.static_site_generating')}`;
    try {
        const res = await fetch('/api/export/static-site');
        if (!res.ok) throw new Error('Failed to generate static site');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const disposition = res.headers.get('Content-Disposition');
        const filenameMatch = disposition?.match(/filename="([^"]+)"/);
        a.download = filenameMatch ? filenameMatch[1] : 'static_site.zip';
        a.click();
        URL.revokeObjectURL(url);
        toast(t('toast.static_site_exported'));
    } catch (err) {
        console.error('Static site export error:', err);
        toast(t('toast.static_site_export_failed'), 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(e.target.result);
            const importedLang = data.language || null;
            const result = await api('/api/import', { method: 'POST', body: data });
            if (result.error) {
                toast(result.error, 'error');
                return;
            }
            // Clear active dataset — imported data doesn't belong to any dataset
            hideActiveDatasetBanner();
            // Switch UI locale to match imported language
            if (importedLang && typeof I18n !== 'undefined' && I18n.locale !== importedLang) {
                await I18n.setLocale(importedLang);
                renderLanguageGrid();
            }
            activeDatasetLanguage = importedLang;
            await initAdmin();
            toast(t('toast.imported'));
        } catch (err) {
            toast(t('toast.invalid_file'), 'error');
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

function toggleIconPicker() {
    const overlay = document.getElementById('iconPickerOverlay');
    if (overlay) overlay.classList.toggle('active');
}

function closeIconPicker() {
    const overlay = document.getElementById('iconPickerOverlay');
    if (overlay) overlay.classList.remove('active');
}

function selectIcon(btn) {
    btn.closest('.icon-picker-grid').querySelectorAll('.icon-picker-item').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('f-icon').value = btn.dataset.icon;
    document.getElementById('iconPickerSelected').textContent = btn.dataset.material;
    document.getElementById('iconPickerLabel').textContent = btn.title;
    closeIconPicker();
}

function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function checked(id) {
    const el = document.getElementById(id);
    return el ? el.checked ? true : false : false;
}

// Profile Picture Functions
let pendingProfilePicture = null;

function previewProfilePicture(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 5 * 1024 * 1024) {
            toast(t('toast.image_too_large'), 'error');
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
    // Siblings of a localized dataset should share the picture even when "Apply to all datasets" is off.
    // The server uses this to look up the language_group and sync the siblings.
    const ctxId = activeDatasetId || '';
    if (pendingProfilePicture === 'remove') {
        const url = ctxId ? `/api/profile/picture?current_dataset_id=${encodeURIComponent(ctxId)}` : '/api/profile/picture';
        try { await fetch(url, { method: 'DELETE' }); } catch (err) {}
        pendingProfilePicture = null;
        return null;
    }
    if (pendingProfilePicture && typeof pendingProfilePicture === 'object' && pendingProfilePicture.reuse) {
        const filename = pendingProfilePicture.reuse;
        try {
            await api('/api/profile/picture/select', { method: 'PUT', body: { filename, current_dataset_id: ctxId || undefined } });
        } catch (err) {
            toast(t('toast.upload_failed'), 'error');
        }
        pendingProfilePicture = null;
        return filename;
    }
    if (pendingProfilePicture && pendingProfilePicture instanceof File) {
        const formData = new FormData();
        formData.append('picture', pendingProfilePicture);
        if (ctxId) formData.append('current_dataset_id', String(ctxId));
        try {
            const response = await fetch('/api/profile/picture', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Upload failed');
            const result = await response.json();
            pendingProfilePicture = null;
            return result.filename || null;
        } catch (err) {
            toast(t('toast.upload_failed'), 'error');
        }
        pendingProfilePicture = null;
    }
    return null;
}

async function showPicturePicker() {
    const grid = document.getElementById('picturePickerGrid');
    if (!grid) return;
    if (grid.style.display !== 'none') { grid.style.display = 'none'; return; }
    try {
        const pictures = await api('/api/profile-pictures');
        if (!pictures.length) { toast(t('form.no_pictures_available'), 'info'); return; }
        grid.innerHTML = pictures.map(p => {
            const label = p.in_use ? `<span class="logo-picker-in-use">${t('form.in_use')}</span>` : '';
            const del = !p.in_use ? `<button type="button" class="logo-picker-delete" onclick="event.stopPropagation();deleteUnusedPicture('${escapeHtml(p.filename)}')" title="${t('form.delete_picture')}">×</button>` : '';
            return `<div class="logo-picker-item">
                <div class="logo-picker-img" onclick="selectExistingPicture('${escapeHtml(p.filename)}')">
                    <img src="/uploads/${encodeURIComponent(p.filename)}?${Date.now()}" alt="">
                </div>
                ${label}${del}
            </div>`;
        }).join('');
        grid.style.display = 'flex';
    } catch (err) {
        toast(t('toast.upload_failed'), 'error');
    }
}

async function deleteUnusedPicture(filename) {
    if (!confirm(t('confirm.delete_picture'))) return;
    try {
        const res = await api(`/api/profile-pictures/${encodeURIComponent(filename)}`, { method: 'DELETE' });
        if (res.error) { toast(t('toast.picture_in_use'), 'error'); return; }
        toast(t('toast.picture_deleted'), 'success');
        const grid = document.getElementById('picturePickerGrid');
        if (grid) grid.style.display = 'none';
        showPicturePicker();
    } catch (err) {
        toast(t('toast.cannot_delete_picture'), 'error');
    }
}

function selectExistingPicture(filename) {
    pendingProfilePicture = { reuse: filename };
    const img = document.getElementById('profilePreviewImg');
    const initials = document.getElementById('profilePreviewInitials');
    if (img) {
        img.src = `/uploads/${encodeURIComponent(filename)}?${Date.now()}`;
        img.style.display = 'block';
    }
    if (initials) initials.style.display = 'none';
    const grid = document.getElementById('picturePickerGrid');
    if (grid) grid.style.display = 'none';
    const fileInput = document.getElementById('f-picture');
    if (fileInput) fileInput.value = '';
}

// Company logo upload
let pendingLogo = null;

function previewLogo(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        if (file.size > 5 * 1024 * 1024) {
            toast(t('toast.image_too_large'), 'error');
            input.value = '';
            return;
        }
        pendingLogo = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('logoUploadPreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="" id="logoPreviewImg">`;
            updateLogoApplyGlobal();
        };
        reader.readAsDataURL(file);
    }
}

function removeLogo() {
    pendingLogo = 'remove';
    const preview = document.getElementById('logoUploadPreview');
    preview.innerHTML = '<div class="logo-preview-placeholder" id="logoPreviewPlaceholder"><span class="material-symbols-outlined" style="font-size:20px">image</span></div>';
    const fileInput = document.getElementById('f-logo');
    if (fileInput) fileInput.value = '';
    updateLogoApplyGlobal();
}

function updateLogoApplyGlobal() {
    const label = document.getElementById('logoApplyGlobalLabel');
    if (!label) return;
    const isEducation = currentModal.logoEntityType === 'education';
    const isCertification = currentModal.logoEntityType === 'certifications';
    const nameField = isCertification ? 'f-provider' : isEducation ? 'f-institution_name' : 'f-company_name';
    const entityName = (document.getElementById(nameField)?.value || '').trim();
    const hasLogo = pendingLogo === 'remove' ? false : (pendingLogo || document.getElementById('logoPreviewImg'));
    const cb = document.getElementById('f-logo-apply-global');
    if (entityName && (hasLogo || (cb && cb.checked))) {
        label.style.display = 'flex';
        const textKey = isCertification ? 'form.apply_logo_provider' : isEducation ? 'form.apply_logo_institution' : 'form.apply_logo_global';
        const params = isCertification ? { provider: entityName } : isEducation ? { institution: entityName } : { company: entityName };
        document.getElementById('logoApplyGlobalText').textContent = t(textKey, params);
    } else {
        label.style.display = 'none';
        if (cb) cb.checked = false;
    }
}

function initLogoPropagate() {
    // Called after form is rendered to restore persisted toggle state
    if (currentModal.existingPropagate) {
        const cb = document.getElementById('f-logo-apply-global');
        if (cb) cb.checked = true;
        updateLogoApplyGlobal();
    }
}

function onLogoPropagateToggle(checked) {
    // When toggling off, just hide if no logo — don't touch other experiences
    updateLogoApplyGlobal();
}

let _logoLookupTimer = null;
function onCompanyNameInput() {
    updateLogoApplyGlobal();
    clearTimeout(_logoLookupTimer);
    // Only auto-fill if no logo is set and user hasn't explicitly touched the logo
    if (pendingLogo || currentModal.existingLogo || document.getElementById('logoPreviewImg')) return;
    const company = (document.getElementById('f-company_name')?.value || '').trim();
    if (!company) return;
    _logoLookupTimer = setTimeout(async () => {
        // Re-check after debounce — user may have set a logo in the meantime
        if (pendingLogo || document.getElementById('logoPreviewImg')) return;
        try {
            const result = await api(`/api/logos/by-company?name=${encodeURIComponent(company)}`);
            if (result.logo_filename) {
                pendingLogo = { reuse: result.logo_filename };
                const preview = document.getElementById('logoUploadPreview');
                if (preview) preview.innerHTML = `<img src="/uploads/${encodeURIComponent(result.logo_filename)}?${Date.now()}" alt="" id="logoPreviewImg">`;
                // If the source experience has propagate enabled, auto-enable the toggle
                if (result.logo_propagate) {
                    const cb = document.getElementById('f-logo-apply-global');
                    if (cb) cb.checked = true;
                }
                updateLogoApplyGlobal();
            }
        } catch (e) {}
    }, 400);
}

let _institutionLogoLookupTimer = null;
function onInstitutionNameInput() {
    updateLogoApplyGlobal();
    clearTimeout(_institutionLogoLookupTimer);
    if (pendingLogo || currentModal.existingLogo || document.getElementById('logoPreviewImg')) return;
    const institution = (document.getElementById('f-institution_name')?.value || '').trim();
    if (!institution) return;
    _institutionLogoLookupTimer = setTimeout(async () => {
        if (pendingLogo || document.getElementById('logoPreviewImg')) return;
        try {
            const result = await api(`/api/logos/by-institution?name=${encodeURIComponent(institution)}`);
            if (result.logo_filename) {
                pendingLogo = { reuse: result.logo_filename };
                const preview = document.getElementById('logoUploadPreview');
                if (preview) preview.innerHTML = `<img src="/uploads/${encodeURIComponent(result.logo_filename)}?${Date.now()}" alt="" id="logoPreviewImg">`;
                if (result.logo_propagate) {
                    const cb = document.getElementById('f-logo-apply-global');
                    if (cb) cb.checked = true;
                }
                updateLogoApplyGlobal();
            }
        } catch (e) {}
    }, 400);
}

let _providerLogoLookupTimer = null;
function onProviderNameInput() {
    updateLogoApplyGlobal();
    clearTimeout(_providerLogoLookupTimer);
    if (pendingLogo || currentModal.existingLogo || document.getElementById('logoPreviewImg')) return;
    const provider = (document.getElementById('f-provider')?.value || '').trim();
    if (!provider) return;
    _providerLogoLookupTimer = setTimeout(async () => {
        if (pendingLogo || document.getElementById('logoPreviewImg')) return;
        try {
            const result = await api(`/api/logos/by-provider?name=${encodeURIComponent(provider)}`);
            if (result.logo_filename) {
                pendingLogo = { reuse: result.logo_filename };
                const preview = document.getElementById('logoUploadPreview');
                if (preview) preview.innerHTML = `<img src="/uploads/${encodeURIComponent(result.logo_filename)}?${Date.now()}" alt="${escapeHtml(provider)}" id="logoPreviewImg">`;
                if (result.logo_propagate) {
                    const cb = document.getElementById('f-logo-apply-global');
                    if (cb) cb.checked = true;
                }
                updateLogoApplyGlobal();
            }
        } catch (e) {}
    }, 400);
}

async function showLogoPicker() {
    const grid = document.getElementById('logoPickerGrid');
    if (!grid) return;
    // Toggle visibility
    if (grid.style.display !== 'none') { grid.style.display = 'none'; return; }
    try {
        const logos = await api('/api/logos');
        if (!logos.length) { toast(t('toast.no_existing_logos'), 'info'); return; }
        grid.innerHTML = logos.map(l => {
            const label = l.company ? `<span class="logo-picker-label">${escapeHtml(l.company)}</span>`
                : l.in_use ? `<span class="logo-picker-in-use">${t('form.in_use')}</span>` : '';
            const del = !l.in_use ? `<button type="button" class="logo-picker-delete" onclick="event.stopPropagation();deleteUnusedLogo('${escapeHtml(l.filename)}')" title="${t('form.delete_logo')}">×</button>` : '';
            return `<div class="logo-picker-item" title="${escapeHtml(l.company || '')}">
                <div class="logo-picker-img" onclick="selectExistingLogo('${escapeHtml(l.filename)}')">
                    <img src="/uploads/${encodeURIComponent(l.filename)}?${Date.now()}" alt="${escapeHtml(l.company || '')}">
                </div>
                ${label}${del}
            </div>`;
        }).join('');
        grid.style.display = 'flex';
    } catch (err) {
        toast(t('toast.logo_upload_failed'), 'error');
    }
}

async function deleteUnusedLogo(filename) {
    if (!confirm(t('confirm.delete_logo'))) return;
    try {
        const res = await api(`/api/logos/${encodeURIComponent(filename)}`, { method: 'DELETE' });
        if (res.error) { toast(res.error, 'error'); return; }
        toast(t('toast.logo_deleted'), 'success');
        // Refresh the picker
        const grid = document.getElementById('logoPickerGrid');
        if (grid) grid.style.display = 'none';
        showLogoPicker();
    } catch (err) {
        toast(t('toast.logo_upload_failed'), 'error');
    }
}

function selectExistingLogo(filename) {
    pendingLogo = { reuse: filename };
    const preview = document.getElementById('logoUploadPreview');
    preview.innerHTML = `<img src="/uploads/${encodeURIComponent(filename)}?${Date.now()}" alt="" id="logoPreviewImg">`;
    const grid = document.getElementById('logoPickerGrid');
    if (grid) grid.style.display = 'none';
    const fileInput = document.getElementById('f-logo');
    if (fileInput) fileInput.value = '';
    updateLogoApplyGlobal();
}

async function uploadLogo(entityId) {
    const entityType = currentModal.logoEntityType || 'experiences';
    const apiBase = entityType === 'education' ? `/api/education/${entityId}/logo` : entityType === 'certifications' ? `/api/certifications/${entityId}/logo` : `/api/experiences/${entityId}/logo`;
    if (pendingLogo === 'remove') {
        try { await fetch(apiBase, { method: 'DELETE' }); } catch (err) {}
        pendingLogo = null;
        return null;
    }
    if (pendingLogo && pendingLogo.reuse) {
        const fname = pendingLogo.reuse;
        try {
            const response = await api(apiBase, { method: 'PUT', body: { filename: fname } });
            if (response.error) throw new Error(response.error);
        } catch (err) {
            toast(t('toast.logo_upload_failed'), 'error');
            pendingLogo = null;
            return null;
        }
        pendingLogo = null;
        return fname;
    }
    if (pendingLogo && pendingLogo instanceof File) {
        const formData = new FormData();
        formData.append('logo', pendingLogo);
        try {
            const response = await fetch(apiBase, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Upload failed');
            const result = await response.json();
            pendingLogo = null;
            return result.filename || null;
        } catch (err) {
            toast(t('toast.logo_upload_failed'), 'error');
        }
        pendingLogo = null;
        return null;
    }
    return null;
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
        ? '<span class="material-symbols-outlined" style="font-size:14px">visibility</span>'
        : '<span class="material-symbols-outlined" style="font-size:14px">visibility_off</span>';
}

function printerIcon(printVisible) {
    return printVisible
        ? '<span class="material-symbols-outlined" style="font-size:14px">print</span>'
        : '<span class="material-symbols-outlined" style="font-size:14px">print_disabled</span>';
}

function dragHandleIcon() {
    return '<span class="material-symbols-outlined" style="font-size:14px">drag_indicator</span>';
}

// ===========================
// Drag and Drop for Items
// ===========================
let itemDraggedEl = null;
let itemDragType = null;
let currentDropTarget = null;

function initDragAndDrop(container, type) {
    const items = container.querySelectorAll('[draggable="true"]');
    
    items.forEach(item => {
        // Only start drag from the drag handle
        const handle = item.querySelector('.drag-handle');
        if (handle) {
            handle.addEventListener('mousedown', () => {
                item.setAttribute('draggable', 'true');
            });
            handle.addEventListener('mouseup', () => {
                item.setAttribute('draggable', 'true');
            });
        }
        
        item.addEventListener('dragstart', (e) => handleItemDragStart(e, type));
        item.addEventListener('dragend', handleItemDragEnd);
        item.addEventListener('dragover', (e) => handleItemDragOver(e, container));
        item.addEventListener('drop', (e) => handleItemDrop(e, type, container));
    });
    
    // Also listen on container for better drop detection
    container.addEventListener('dragover', (e) => e.preventDefault());
}

function handleItemDragStart(e, type) {
    itemDraggedEl = e.target.closest('[draggable="true"]');
    itemDragType = type;
    itemDraggedEl.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemDraggedEl.dataset.id);
    
    // Slight delay to allow the drag image to be captured before visual changes
    setTimeout(() => {
        if (itemDraggedEl) {
            itemDraggedEl.style.opacity = '0.4';
        }
    }, 0);
}

function handleItemDragEnd(e) {
    if (itemDraggedEl) {
        itemDraggedEl.classList.remove('dragging');
        itemDraggedEl.style.opacity = '';
    }
    // Clear all drop indicators
    document.querySelectorAll('.drag-over, .drag-above, .drag-below, .drag-left, .drag-right').forEach(el => {
        el.classList.remove('drag-over', 'drag-above', 'drag-below', 'drag-left', 'drag-right');
    });
    itemDraggedEl = null;
    itemDragType = null;
    currentDropTarget = null;
}

function isGridLayout(container) {
    const style = window.getComputedStyle(container);
    return style.display === 'grid' || style.display === 'inline-grid';
}

function handleItemDragOver(e, container) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const target = e.target.closest('[draggable="true"]');
    if (!target || target === itemDraggedEl) {
        // Clear previous target if we're not over a valid one
        if (currentDropTarget && currentDropTarget !== target) {
            currentDropTarget.classList.remove('drag-over', 'drag-above', 'drag-below', 'drag-left', 'drag-right');
        }
        currentDropTarget = null;
        return;
    }
    
    // Clear previous target
    if (currentDropTarget && currentDropTarget !== target) {
        currentDropTarget.classList.remove('drag-over', 'drag-above', 'drag-below', 'drag-left', 'drag-right');
    }
    
    currentDropTarget = target;
    
    const rect = target.getBoundingClientRect();
    const isGrid = isGridLayout(container);
    
    // Clear all position classes first
    target.classList.remove('drag-above', 'drag-below', 'drag-left', 'drag-right');
    target.classList.add('drag-over');
    
    if (isGrid) {
        // For grids, use horizontal detection
        const midX = rect.left + rect.width / 2;
        const isLeft = e.clientX < midX;
        target.classList.add(isLeft ? 'drag-left' : 'drag-right');
    } else {
        // For lists, use vertical detection
        const midY = rect.top + rect.height / 2;
        const isAbove = e.clientY < midY;
        target.classList.add(isAbove ? 'drag-above' : 'drag-below');
    }
}

async function handleItemDrop(e, type, container) {
    e.preventDefault();
    const target = e.target.closest('[draggable="true"]');
    
    if (!target || !itemDraggedEl || target === itemDraggedEl) return;
    
    const rect = target.getBoundingClientRect();
    const isGrid = isGridLayout(container);
    
    // Determine drop position based on layout type
    let insertBefore;
    if (isGrid) {
        const midX = rect.left + rect.width / 2;
        insertBefore = e.clientX < midX;
    } else {
        const midY = rect.top + rect.height / 2;
        insertBefore = e.clientY < midY;
    }
    
    // Clear visual feedback
    target.classList.remove('drag-over', 'drag-above', 'drag-below', 'drag-left', 'drag-right');
    
    // Reorder in DOM
    if (insertBefore) {
        target.before(itemDraggedEl);
    } else {
        target.after(itemDraggedEl);
    }
    
    // Save new order to server
    await saveItemOrder(type, container);
}

async function saveItemOrder(type, container) {
    const items = Array.from(container.querySelectorAll('[draggable="true"]'));
    const orderData = items.map((item, index) => ({
        id: parseInt(item.dataset.id),
        sort_order: index
    }));
    
    try {
        await api(`/api/reorder/${type}`, { 
            method: 'PUT', 
            body: { items: orderData } 
        });
        toast(t('toast.order_saved'));
        autoSaveActiveDataset();
    } catch (err) {
        toast(t('toast.order_failed'), 'error');
    }
}

function editIcon() {
    return '<span class="material-symbols-outlined" style="font-size:14px">edit</span>';
}

function deleteIcon() {
    return '<span class="material-symbols-outlined" style="font-size:14px">delete</span>';
}

function linkIcon() {
    return '<span class="material-symbols-outlined" style="font-size:14px">open_in_new</span>';
}

function moveUpIcon() {
    return '<span class="material-symbols-outlined" style="font-size:14px">expand_less</span>';
}

function moveDownIcon() {
    return '<span class="material-symbols-outlined" style="font-size:14px">expand_more</span>';
}

async function moveExperience(id, direction) {
    const container = document.getElementById('experienceList');
    const cards = Array.from(container.querySelectorAll('.item-card'));
    const index = cards.findIndex(c => c.dataset.id === String(id));
    if (index === -1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= cards.length) return;

    // Swap in DOM
    if (direction === 'up') {
        cards[swapIndex].before(cards[index]);
    } else {
        cards[swapIndex].after(cards[index]);
    }

    // Save new order
    const updatedCards = Array.from(container.querySelectorAll('.item-card'));
    const orderData = updatedCards.map((card, i) => ({
        id: parseInt(card.dataset.id),
        sort_order: i
    }));

    try {
        await api('/api/reorder/experiences', {
            method: 'PUT',
            body: { items: orderData }
        });
        toast(t('toast.order_saved'));
        autoSaveActiveDataset();
    } catch (err) {
        toast(t('toast.order_failed'), 'error');
    }
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
    populateVersionDisplay();
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
    
    // Load tracking code
    const trackingCode = await api('/api/settings/trackingCode');
    document.getElementById('settingTrackingCode').value = trackingCode.value || '';
    
    // Load date format setting
    const dateFormat = await api('/api/settings/dateFormat');
    document.getElementById('settingDateFormat').value = dateFormat.value || 'MMM YYYY';
    
    // Load timeline year only setting
    const timelineYearOnlySetting = await api('/api/settings/timelineYearOnly');
    const timelineYearOnlyEl = document.getElementById('settingTimelineYearOnly');
    if (timelineYearOnlyEl) timelineYearOnlyEl.checked = timelineYearOnlySetting.value === 'true';

    // Load timeline branching setting (default: enabled)
    const timelineBranchingSetting = await api('/api/settings/timelineBranching');
    const timelineBranchingEl = document.getElementById('settingTimelineBranching');
    if (timelineBranchingEl) timelineBranchingEl.checked = timelineBranchingSetting.value !== 'false';

    // Load experience logos setting (default: disabled)
    const experienceLogosSetting = await api('/api/settings/showExperienceLogos');
    const experienceLogosEl = document.getElementById('settingExperienceLogos');
    if (experienceLogosEl) experienceLogosEl.checked = experienceLogosSetting.value === 'true';

    // Load timeline logos setting (default: enabled)
    const timelineLogosSetting = await api('/api/settings/showTimelineLogos');
    const timelineLogosEl = document.getElementById('settingTimelineLogos');
    if (timelineLogosEl) timelineLogosEl.checked = timelineLogosSetting.value !== 'false';

    // Load experience duration setting (default: disabled)
    const experienceDurationSetting = await api('/api/settings/showExperienceDuration');
    const experienceDurationEl = document.getElementById('settingExperienceDuration');
    if (experienceDurationEl) experienceDurationEl.checked = experienceDurationSetting.value === 'true';

    // Load robots meta setting
    const robotsMeta = await api('/api/settings/robotsMeta');
    const robotsEl = document.getElementById('settingRobotsMeta');
    if (robotsEl) robotsEl.value = robotsMeta.value || 'index, follow';
    
    // Load slugs index setting (default: off = noindex for versioned URLs)
    const slugsIndex = await api('/api/settings/slugsIndex');
    const slugsIndexEl = document.getElementById('settingSlugsIndex');
    if (slugsIndexEl) slugsIndexEl.checked = slugsIndex.value === 'true';
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
    
    toast(t('toast.setting_saved'));
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
    
    toast(t('toast.setting_saved'));
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

    container.innerHTML = settingsSectionOrder.map((section, index) => {
        const isCustomName = section.name !== section.default_name;
        const translatedDefault = getTranslatedSectionName(section.key, section.default_name);
        const displayName = isCustomName ? section.name : translatedDefault;
        return `
        <div class="settings-section-item" draggable="true" data-key="${section.key}" data-index="${index}">
            <div class="settings-section-drag">
                <span class="material-symbols-outlined" style="font-size:16px">drag_handle</span>
            </div>
            <div class="settings-section-name-wrap">
                <input type="text" class="settings-section-name-input"
                    value="${escapeHtml(displayName)}"
                    data-key="${section.key}"
                    data-default="${escapeHtml(translatedDefault)}"
                    onchange="updateSettingsSectionName('${section.key}', this.value)"
                    title="${t('settings.sections.click_to_edit')}"
                />
                ${isCustomName ? `<button class="settings-section-reset-btn" onclick="resetSettingsSectionName('${section.key}')" title="${t('settings.sections.reset_default')}: ${escapeHtml(translatedDefault)}">
                    <span class="material-symbols-outlined" style="font-size:12px">sync</span>
                </button>` : ''}
            </div>
            <div class="settings-section-actions">
                <button class="settings-section-btn ${section.visible ? 'active' : ''}" onclick="toggleSettingsSectionVisibility('${section.key}')" title="Show/Hide on Site">
                    ${visibilityIcon(section.visible)}
                </button>
                <button class="settings-section-btn ${section.print_visible !== false ? 'active' : ''} ${!section.visible ? 'disabled' : ''}" onclick="toggleSettingsSectionPrintVisibility('${section.key}')" title="Show/Hide in Print" ${!section.visible ? 'disabled' : ''}>
                    ${printerIcon(section.print_visible !== false)}
                </button>
                <button class="settings-section-btn" onclick="moveSettingsSection('${section.key}', -1)" title="Move Up" ${index === 0 ? 'disabled' : ''}>
                    <span class="material-symbols-outlined" style="font-size:14px">expand_less</span>
                </button>
                <button class="settings-section-btn" onclick="moveSettingsSection('${section.key}', 1)" title="Move Down" ${index === settingsSectionOrder.length - 1 ? 'disabled' : ''}>
                    <span class="material-symbols-outlined" style="font-size:14px">expand_more</span>
                </button>
            </div>
        </div>
    `}).join('');

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

function updateSettingsSectionName(key, newName) {
    const section = settingsSectionOrder.find(s => s.key === key);
    if (section) {
        const trimmed = newName.trim();
        const translatedDefault = getTranslatedSectionName(key, section.default_name);
        const wasCustom = section.name !== section.default_name;
        // Treat empty, English default, or translated default as "reset to default"
        if (!trimmed || trimmed === section.default_name || trimmed === translatedDefault) {
            section.name = section.default_name;
        } else {
            section.name = trimmed;
        }
        const isCustom = section.name !== section.default_name;
        if (wasCustom !== isCustom) {
            renderSettingsSections();
        }
    }
}

function resetSettingsSectionName(key) {
    const section = settingsSectionOrder.find(s => s.key === key);
    if (section) {
        section.name = section.default_name;
        renderSettingsSections();
    }
}

async function saveSettingsSectionOrder() {
    const sections = settingsSectionOrder.map((s, index) => ({
        key: s.key,
        visible: s.visible,
        print_visible: s.print_visible !== false,
        sort_order: index,
        display_name: (s.name && s.name !== s.default_name) ? s.name : null
    }));
    
    try {
        await api('/api/sections/order', { method: 'PUT', body: { sections } });
        
        // Also save tracking code
        const trackingCode = document.getElementById('settingTrackingCode').value;
        await api('/api/settings/trackingCode', { method: 'PUT', body: { value: trackingCode } });
        
        // Also save date format
        const dateFormat = document.getElementById('settingDateFormat').value;
        await api('/api/settings/dateFormat', { method: 'PUT', body: { value: dateFormat } });
        dateFormatSetting = dateFormat;
        
        // Also save timeline year only
        const timelineYearOnlyEl = document.getElementById('settingTimelineYearOnly');
        if (timelineYearOnlyEl) {
            await api('/api/settings/timelineYearOnly', { method: 'PUT', body: { value: timelineYearOnlyEl.checked.toString() } });
            timelineYearOnly = timelineYearOnlyEl.checked;
        }

        // Also save timeline branching
        const timelineBranchingEl = document.getElementById('settingTimelineBranching');
        if (timelineBranchingEl) {
            await api('/api/settings/timelineBranching', { method: 'PUT', body: { value: timelineBranchingEl.checked.toString() } });
            timelineBranching = timelineBranchingEl.checked;
        }

        // Also save experience logos
        const experienceLogosEl = document.getElementById('settingExperienceLogos');
        if (experienceLogosEl) {
            await api('/api/settings/showExperienceLogos', { method: 'PUT', body: { value: experienceLogosEl.checked.toString() } });
            showExperienceLogos = experienceLogosEl.checked;
        }

        // Also save timeline logos
        const timelineLogosEl = document.getElementById('settingTimelineLogos');
        if (timelineLogosEl) {
            await api('/api/settings/showTimelineLogos', { method: 'PUT', body: { value: timelineLogosEl.checked.toString() } });
            showTimelineLogos = timelineLogosEl.checked;
        }

        // Also save experience duration
        const experienceDurationEl = document.getElementById('settingExperienceDuration');
        if (experienceDurationEl) {
            await api('/api/settings/showExperienceDuration', { method: 'PUT', body: { value: experienceDurationEl.checked.toString() } });
            showExperienceDuration = experienceDurationEl.checked;
        }

        // Also save robots meta
        const robotsMetaEl = document.getElementById('settingRobotsMeta');
        if (robotsMetaEl) {
            await api('/api/settings/robotsMeta', { method: 'PUT', body: { value: robotsMetaEl.value } });
        }
        
        // Save slugs index setting
        const slugsIndexEl = document.getElementById('settingSlugsIndex');
        if (slugsIndexEl) {
            await api('/api/settings/slugsIndex', { method: 'PUT', body: { value: slugsIndexEl.checked.toString() } });
        }
        
        sectionOrder = await loadSectionOrder();
        sectionVisibility = await loadSectionsAdmin();
        await renderSectionsInOrder();
        closeSettingsModal();
        toast(t('toast.settings_saved'));
        autoSaveActiveDataset();
    } catch (err) {
        toast(t('toast.settings_failed'), 'error');
    }
}

// ===========================
// Dataset Management
// ===========================

// ===========================
// Save As Modal (rich picker with version grouping)
// ===========================

let saveAsDatasetsCache = [];

// Parse a name like "My CV v2" into { base: "My CV", version: 2 }.
// Used for display purposes only — grouping uses version_group from the backend.
function parseDatasetVersion(name) {
    const m = /^(.+?)\s+v(\d+)$/i.exec((name || '').trim());
    if (m) return { base: m[1].trim(), version: parseInt(m[2], 10) };
    return { base: (name || '').trim(), version: 1 };
}

// Group datasets into a 3-level hierarchy: Dataset → Version → Language.
// Uses version_group (UUID) from backend for grouping, NOT name parsing.
// Returns [{ base, versionGroup, versions: [{ version, name, languages: [ds...], language_group }] }]
function groupDatasetsHierarchy(datasets) {
    const vgMap = new Map();
    for (const ds of datasets) {
        const vg = ds.version_group || ds.id.toString(); // fallback for legacy
        const ver = ds.version || 1;
        if (!vgMap.has(vg)) vgMap.set(vg, new Map());
        const versionMap = vgMap.get(vg);
        if (!versionMap.has(ver)) versionMap.set(ver, []);
        versionMap.get(ver).push(ds);
    }
    const groups = Array.from(vgMap.entries()).map(([vg, versionMap]) => {
        const versions = Array.from(versionMap.entries()).map(([version, langs]) => {
            langs.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            return { version, name: langs[0].name, languages: langs, language_group: langs[0].language_group };
        });
        versions.sort((a, b) => a.version - b.version);
        // Derive display base name from the first version's name
        const base = parseDatasetVersion(versions[0].name).base;
        const latest = versions.reduce((max, v) => {
            const t = v.languages.reduce((m, d) => Math.max(m, new Date(d.updated_at).getTime()), 0);
            return Math.max(max, t);
        }, 0);
        return { base, versionGroup: vg, versions, latestUpdated: latest };
    });
    groups.sort((a, b) => b.latestUpdated - a.latestUpdated);
    return groups;
}

// Given a base name and the current dataset list, return the next free "Base vN".
// Uses version_group from backend when available.
function suggestNextVersion(baseName, datasets, versionGroup) {
    let max = 0;
    for (const ds of datasets) {
        if (versionGroup && ds.version_group === versionGroup) {
            if ((ds.version || 1) > max) max = ds.version || 1;
        } else if (!versionGroup) {
            const parsed = parseDatasetVersion(ds.name);
            if (parsed.base === baseName && parsed.version > max) max = parsed.version;
        }
    }
    const next = Math.max(max + 1, 2);
    return `${baseName} v${next}`;
}

// ─── Unified CV Manager Modal ───────────────────────────────

async function openCvManager() {
    try {
        saveAsDatasetsCache = await api('/api/datasets') || [];
    } catch (err) {
        saveAsDatasetsCache = [];
    }
    renderCvManagerList(saveAsDatasetsCache);
    const input = document.getElementById('saveAsNameInput');
    if (input) input.value = activeDatasetName || '';
    const langSelect = document.getElementById('saveAsLangSelect');
    if (langSelect && typeof I18n !== 'undefined') {
        langSelect.innerHTML = I18n.languages.map(l =>
            `<option value="${l.code}"${l.code === (activeDatasetLanguage || 'en') ? ' selected' : ''}>${escapeHtml(l.native)} (${l.code.toUpperCase()})</option>`
        ).join('');
    }
    const langGroupInput = document.getElementById('saveAsLangGroup');
    if (langGroupInput) langGroupInput.value = '';
    const vgInput = document.getElementById('saveAsVersionGroup');
    if (vgInput) vgInput.value = '';
    updateSaveAsSubmitState();
    document.getElementById('cvManagerOverlay').classList.add('active');
    if (input) setTimeout(() => { input.focus(); input.select(); }, 30);
}

// Backwards-compat aliases so banner language switcher and other callers still work
async function saveAsDataset() { return openCvManager(); }
async function openDatasetsModal() { return openCvManager(); }
function closeSaveAsModal() { closeCvManager(); }
function closeDatasetsModal() { closeCvManager(); }

function closeCvManager() {
    const overlay = document.getElementById('cvManagerOverlay');
    if (overlay) overlay.classList.remove('active');
    document.querySelectorAll('.cvm-overflow-menu').forEach(el => el.remove());
}

function renderCvManagerList(datasets) {
    const container = document.getElementById('datasetsList');
    if (!container) return;
    if (!datasets || datasets.length === 0) {
        container.innerHTML = `<p class="cvm-empty">${escapeHtml(t('datasets.no_existing'))}</p>`;
        return;
    }
    const hierarchy = groupDatasetsHierarchy(datasets);
    const newVersionLabel = escapeHtml(t('datasets.new_version'));
    const addLanguageLabel = escapeHtml(t('datasets.add_language'));

    // Build set of language_groups that contain the default dataset
    const defaultLangGroups = new Set();
    datasets.forEach(ds => {
        if (ds.is_default && ds.language_group) defaultLangGroups.add(ds.language_group);
    });

    function cvmRow(ds, opts = {}) {
        const isActive = ds.id === activeDatasetId;
        const isDefault = !!ds.is_default;
        const isDefSib = !isDefault && !!opts.isDefaultSibling;
        const dsLang = ds.language || 'en';
        const safeName = escapeHtml(ds.name).replace(/'/g, "\\'");
        const slugSuffix = opts.showLangBadge ? `/${dsLang}` : '';
        const classes = ['cvm-row'];
        if (isActive) classes.push('cvm-row-active');
        if (isDefault || isDefSib) classes.push('cvm-row-default');

        let urlText = '';
        if (isDefault && opts.showLangBadge) urlText = `/${dsLang}`;
        else if (isDefault) urlText = '/';
        else if (isDefSib) urlText = `/${dsLang}`;
        else if (ds.slug) urlText = `/v/${escapeHtml(ds.slug)}${slugSuffix}`;

        const urlHtml = urlText ? `<span class="cvm-url">${urlText}</span>` : '';
        const showToggle = ds.slug && !isDefault && !isDefSib;

        return `
            <div class="${classes.join(' ')}" data-id="${ds.id}" data-name="${escapeHtml(ds.name)}" data-lang="${dsLang}">
                <label class="cvm-radio" title="${isDefault ? t('datasets.default_hint') : ''}">
                    <input type="radio" name="dataset-default" ${isDefault ? 'checked' : ''} onchange="setDatasetDefault(${ds.id}, '${safeName}')">
                    <span class="radio-dot"></span>
                </label>
                <span class="dataset-lang-badge">${dsLang.toUpperCase()}</span>
                ${opts.versionBadge ? `<span class="dataset-version-badge">v${opts.versionBadge}</span>` : ''}
                <span class="cvm-name">${escapeHtml(ds.name)}${ds.is_public && !isDefault && !isDefSib ? ` <span class="cvm-shared-icon" title="${escapeHtml(t('datasets.shared'))}">${materialIcon('share', 12)}</span>` : ''}</span>
                ${isDefault
                    ? `<span class="dataset-default-badge">${escapeHtml(t('datasets.default_hint_short'))}</span>`
                    : `<button type="button" class="dataset-make-public-btn" title="${escapeHtml(t('datasets.default_hint'))}" onclick="setDatasetDefault(${ds.id}, '${safeName}')">${escapeHtml(t('datasets.make_public'))}</button>`}
                ${isActive ? '<span class="dataset-active-badge">Editing</span>' : ''}
                ${urlHtml}
                <span class="cvm-date">${formatDateTime(ds.updated_at)}</span>
                <button class="btn btn-primary btn-sm" onclick="loadDataset(${ds.id}, '${safeName}')">${isActive ? t('datasets.reload') : t('datasets.load')}</button>
                <button class="btn btn-ghost btn-sm cvm-more-btn" onclick="openCvmMenu(event, ${ds.id}, '${safeName}', '${dsLang}', '${escapeHtml(ds.slug || '')}', ${isDefault}, ${isDefSib}, ${!!ds.is_public}, ${showToggle})">
                    ${materialIcon('more_vert', 16)}
                </button>
            </div>`;
    }

    function renderVersionBlock(ver, showVersionBadge) {
        const hasDefSib = ver.language_group && defaultLangGroups.has(ver.language_group);
        if (ver.languages.length <= 1) {
            return cvmRow(ver.languages[0], { versionBadge: showVersionBadge ? (ver.version || 1) : null, isDefaultSibling: hasDefSib });
        }
        return ver.languages.map(ds =>
            cvmRow(ds, { versionBadge: showVersionBadge ? (ver.version || 1) : null, showLangBadge: true, isDefaultSibling: hasDefSib })
        ).join('');
    }

    function addLangBtn(ver) {
        if (!ver.language_group) return '';
        const existingLangs = new Set(ver.languages.map(d => d.language || 'en'));
        const allLangs = (typeof I18n !== 'undefined' ? I18n.languages : []).map(l => l.code);
        if (allLangs.filter(c => !existingLangs.has(c)).length === 0) return '';
        return `<button type="button" class="btn btn-ghost btn-sm cvm-action-btn" data-action="add-language" data-name="${escapeHtml(ver.name)}" data-group="${escapeHtml(ver.language_group)}">
            ${materialIcon('translate', 14)} <span>${addLanguageLabel}</span>
        </button>`;
    }

    function versionHasHighlight(ver) {
        return ver.languages.some(ds => ds.id === activeDatasetId || ds.is_default);
    }

    container.innerHTML = hierarchy.map(group => {
        const escBase = escapeHtml(group.base);
        const hasMultipleVersions = group.versions.length > 1;

        if (!hasMultipleVersions) {
            const ver = group.versions[0];
            const escVG = group.versionGroup ? escapeHtml(group.versionGroup) : '';
            const countLabel = ver.languages.length > 1
                ? escapeHtml(t('datasets.languages_count', { count: ver.languages.length }))
                : escapeHtml(t('datasets.versions_count', { count: 1 }));
            return `<div class="cvm-group">
                <div class="cvm-group-header">
                    <span class="cvm-group-name">${escapeHtml(group.base)}</span>
                    <button type="button" class="btn btn-ghost btn-sm cvm-action-btn" data-action="new-version" data-base="${escBase}" data-version-group="${escVG}">
                        ${materialIcon('add', 14)} <span>${newVersionLabel}</span>
                    </button>
                    ${addLangBtn(ver)}
                    <span class="cvm-group-count">${countLabel}</span>
                </div>
                <div class="cvm-group-body">${renderVersionBlock(ver, false)}</div>
            </div>`;
        }

        const latest = group.versions[group.versions.length - 1];
        const older = group.versions.slice(0, -1);
        const olderCount = older.length;
        const countLabel = escapeHtml(t('datasets.versions_count', { count: group.versions.length }));
        const olderHasHighlight = older.some(v => versionHasHighlight(v));
        const escVG = group.versionGroup ? escapeHtml(group.versionGroup) : '';

        return `<div class="cvm-group">
            <div class="cvm-group-header">
                <span class="cvm-group-name">${escapeHtml(group.base)}</span>
                <button type="button" class="btn btn-ghost btn-sm cvm-action-btn" data-action="new-version" data-base="${escBase}" data-version-group="${escVG}">
                    ${materialIcon('add', 14)} <span>${newVersionLabel}</span>
                </button>
                <span class="cvm-group-count">${countLabel}</span>
            </div>
            <div class="cvm-group-body">
                ${renderVersionBlock(latest, true)}
                ${olderCount > 0 ? `
                    <button type="button" class="btn btn-ghost btn-sm version-collapse-toggle" onclick="toggleOlderVersions(this)">
                        ${materialIcon(olderHasHighlight ? 'expand_less' : 'expand_more', 14)}
                        <span>${olderCount} older version${olderCount > 1 ? 's' : ''}</span>
                    </button>
                    <div class="version-collapsed-group" style="${olderHasHighlight ? '' : 'display:none;'}">
                        ${older.map(v => renderVersionBlock(v, true)).join('')}
                    </div>
                ` : ''}
            </div>
        </div>`;
    }).join('');
}

// Backwards-compat alias
function renderSaveAsList(datasets) { renderCvManagerList(datasets); }

function saveAsOnListClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const input = document.getElementById('saveAsNameInput');
    const langSelect = document.getElementById('saveAsLangSelect');
    const langGroupInput = document.getElementById('saveAsLangGroup');
    if (!input) return;
    const vgInput = document.getElementById('saveAsVersionGroup');
    if (action === 'fill-name') {
        input.value = btn.getAttribute('data-name') || '';
        if (langSelect && btn.getAttribute('data-lang')) {
            langSelect.value = btn.getAttribute('data-lang');
        }
        if (langGroupInput) langGroupInput.value = '';
        if (vgInput) vgInput.value = '';
    } else if (action === 'new-version') {
        const base = btn.getAttribute('data-base') || '';
        const versionGroup = btn.getAttribute('data-version-group') || '';
        input.value = suggestNextVersion(base, saveAsDatasetsCache, versionGroup);
        if (langGroupInput) langGroupInput.value = '';
        if (vgInput) vgInput.value = versionGroup;
    } else if (action === 'add-language') {
        const name = btn.getAttribute('data-name') || '';
        const group = btn.getAttribute('data-group') || '';
        input.value = name;
        if (langGroupInput) langGroupInput.value = group;
        // Set language to first available language not in this group
        if (langSelect && group) {
            const existingLangs = new Set();
            saveAsDatasetsCache.forEach(ds => {
                if (ds.language_group === group) existingLangs.add(ds.language || 'en');
            });
            const available = (typeof I18n !== 'undefined' ? I18n.languages : []).map(l => l.code).filter(c => !existingLangs.has(c));
            if (available.length > 0) {
                // Filter select to only show available languages
                langSelect.innerHTML = available.map(code => {
                    const langObj = I18n.languages.find(l => l.code === code);
                    return `<option value="${code}">${escapeHtml(langObj ? langObj.native : code)} (${code.toUpperCase()})</option>`;
                }).join('');
            }
        }
    }
    updateSaveAsSubmitState();
    input.focus();
}

function updateSaveAsSubmitState() {
    const input = document.getElementById('saveAsNameInput');
    const btn = document.getElementById('saveAsSubmitBtn');
    const langSelect = document.getElementById('saveAsLangSelect');
    const langGroupInput = document.getElementById('saveAsLangGroup');
    if (!input || !btn) return;
    const name = (input.value || '').trim();
    const language = langSelect ? langSelect.value : 'en';
    const languageGroup = langGroupInput ? langGroupInput.value : '';
    const match = saveAsDatasetsCache.find(d => d.name === name && d.language === language);
    btn.classList.remove('btn-primary', 'btn-warning');
    if (!name) {
        btn.disabled = true;
        btn.textContent = t('datasets.save_new_empty');
        btn.classList.add('btn-primary');
    } else if (match && !languageGroup) {
        btn.disabled = false;
        btn.textContent = t('datasets.overwrite', { name });
        btn.classList.add('btn-warning');
    } else if (languageGroup) {
        btn.disabled = false;
        btn.textContent = t('datasets.save_new_lang', { name, lang: language.toUpperCase() });
        btn.classList.add('btn-primary');
    } else {
        btn.disabled = false;
        btn.textContent = t('datasets.save_new', { name });
        btn.classList.add('btn-primary');
    }
    // Highlight the matching row so users see which CV will be overwritten
    document.querySelectorAll('#datasetsList .cvm-row').forEach(el => {
        if (name && el.getAttribute('data-name') === name && el.getAttribute('data-lang') === language) {
            el.classList.add('cvm-row-selected');
        } else {
            el.classList.remove('cvm-row-selected');
        }
    });
}

async function submitSaveAs() {
    const input = document.getElementById('saveAsNameInput');
    if (!input) return;
    const name = (input.value || '').trim();
    if (!name) return;
    const langSelect = document.getElementById('saveAsLangSelect');
    const langGroupInput = document.getElementById('saveAsLangGroup');
    const vgInput = document.getElementById('saveAsVersionGroup');
    const language = langSelect ? langSelect.value : 'en';
    const languageGroup = langGroupInput ? langGroupInput.value : '';
    const versionGroup = vgInput ? vgInput.value : '';

    const match = saveAsDatasetsCache.find(d => d.name === name && d.language === language);
    if (match && !confirm(t('confirm.overwrite_dataset', { name }))) return;
    try {
        const body = { name, language };
        if (languageGroup) body.language_group = languageGroup;
        if (versionGroup) body.version_group = versionGroup;
        const result = await api('/api/datasets', { method: 'POST', body });
        if (result.success) {
            await applyLoadedDatasetResult({
                id: result.id,
                name,
                is_default: result.is_default,
                language: result.language || language,
                language_group: result.language_group,
                version: result.version,
                version_group: result.version_group
            });
            persistActiveDataset();
            if (typeof I18n !== 'undefined' && activeDatasetLanguage && I18n.locale !== activeDatasetLanguage) {
                await I18n.setLocale(activeDatasetLanguage);
            }
            showActiveDatasetBanner(activeDatasetId, activeDatasetName, activeDatasetIsDefault);
            closeSaveAsModal();
            await initAdmin();
            toast(result.created && languageGroup ? t('toast.language_variant_created') : result.updated ? t('toast.dataset_updated') : t('toast.dataset_saved'));
        } else {
            toast(result.error || t('toast.failed_save'), 'error');
        }
    } catch (err) {
        toast(t('toast.dataset_save_failed'), 'error');
    }
}

// Wire up input + list listeners once the modal is in the DOM
(function initCvManagerListeners() {
    function setup() {
        const list = document.getElementById('datasetsList');
        const input = document.getElementById('saveAsNameInput');
        if (list && !list.dataset.saveAsBound) {
            list.addEventListener('click', saveAsOnListClick);
            list.dataset.saveAsBound = '1';
        }
        if (input && !input.dataset.saveAsBound) {
            input.addEventListener('input', updateSaveAsSubmitState);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    submitSaveAs();
                }
            });
            input.dataset.saveAsBound = '1';
        }
        const langSelect = document.getElementById('saveAsLangSelect');
        if (langSelect && !langSelect.dataset.saveAsBound) {
            langSelect.addEventListener('change', updateSaveAsSubmitState);
            langSelect.dataset.saveAsBound = '1';
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
})();



// Reload the unified list (called after actions like toggle public, set default, delete)
async function loadDatasetsList() {
    try {
        saveAsDatasetsCache = await api('/api/datasets') || [];
    } catch (err) {
        saveAsDatasetsCache = [];
    }
    renderCvManagerList(saveAsDatasetsCache);
    updateSaveAsSubmitState();
}

// Toggle older versions visibility in both modals
function toggleOlderVersions(btn) {
    const container = btn.nextElementSibling;
    if (!container) return;
    const isHidden = container.style.display === 'none';
    container.style.display = isHidden ? '' : 'none';
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = isHidden ? 'expand_less' : 'expand_more';
    const label = btn.querySelector('span:last-child');
    if (label) {
        const text = label.textContent;
        label.textContent = isHidden ? text.replace('older', 'older') : text;
    }
}

// Overflow menu for dataset row actions
function openCvmMenu(event, id, name, lang, slug, isDefault, isDefSib, isPublic, showToggle) {
    event.stopPropagation();
    document.querySelectorAll('.cvm-overflow-menu').forEach(el => el.remove());
    const menu = document.createElement('div');
    menu.className = 'cvm-overflow-menu';
    let items = '';
    if (showToggle) {
        items += `<button onclick="toggleDatasetPublic(${id}, ${!isPublic}); this.closest('.cvm-overflow-menu').remove()">
            ${materialIcon(isPublic ? 'link_off' : 'share', 16)}
            <span>${isPublic ? t('datasets.make_private') : t('datasets.make_shared')}</span>
        </button>`;
    }
    items += `<button onclick="openDatasetLangPicker(event, ${id}); this.closest('.cvm-overflow-menu').remove()">
        ${materialIcon('translate', 16)} <span>${t('datasets.change_language')}</span>
    </button>`;
    if (slug && !isDefault) {
        const slugSuffix = lang ? `/${lang}` : '';
        items += `<button onclick="previewDataset('${slug}${slugSuffix}'); this.closest('.cvm-overflow-menu').remove()">
            ${materialIcon('visibility', 16)} <span>${t('datasets.preview')}</span>
        </button>`;
    }
    if (slug) {
        const urlPath = isDefault ? '' : (isDefSib ? lang : `v/${slug}${lang ? '/' + lang : ''}`);
        items += `<button onclick="copyDatasetUrl('${urlPath}', ${isPublic || isDefault || isDefSib}); this.closest('.cvm-overflow-menu').remove()">
            ${materialIcon('content_copy', 16)} <span>${t('datasets.copy_url')}</span>
        </button>`;
    }
    if (!isDefault) {
        items += `<div class="cvm-overflow-divider"></div>`;
        items += `<button class="cvm-overflow-danger" onclick="deleteDataset(${id}, '${name}'); this.closest('.cvm-overflow-menu').remove()">
            ${materialIcon('delete', 16)} <span>${t('btn.delete')}</span>
        </button>`;
    }
    menu.innerHTML = items;
    document.body.appendChild(menu);
    const rect = event.currentTarget.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 4}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;
    const closeFn = (ev) => {
        if (!menu.contains(ev.target)) {
            menu.remove();
            document.removeEventListener('click', closeFn);
        }
    };
    setTimeout(() => document.addEventListener('click', closeFn), 0);
}

// Preview dataset in new tab (admin only)
function previewDataset(slug) {
    window.open(`/v/${slug}`, '_blank');
}

// Copy dataset URL to clipboard
function copyDatasetUrl(pathOrSlug, isPublic) {
    // Use current origin — works for both admin preview and public site
    const path = pathOrSlug.startsWith('v/') || pathOrSlug.length <= 2 ? pathOrSlug : `v/${pathOrSlug}`;
    const url = `${window.location.origin}/${path}`;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            toast(isPublic ? t('toast.url_copied_public') : t('toast.url_copied_preview'));
        }).catch((err) => {
            console.error('Clipboard API failed:', err);
            fallbackCopyToClipboard(url);
        });
    } else {
        fallbackCopyToClipboard(url);
    }
}

// Toggle dataset public visibility
async function toggleDatasetPublic(id, isPublic) {
    try {
        const result = await api(`/api/datasets/${id}/public`, {
            method: 'PUT',
            body: { is_public: isPublic }
        });
        if (result.success) {
            toast(isPublic ? t('toast.dataset_public') : t('toast.dataset_private'));
            await loadDatasetsList();
        } else {
            toast(result.error || t('toast.update_failed'), 'error');
            await loadDatasetsList(); // Revert toggle state
        }
    } catch (err) {
        toast(t('toast.visibility_update_failed'), 'error');
        await loadDatasetsList(); // Revert toggle state
    }
}

// Open an inline language picker anchored to the clicked language badge
function openDatasetLangPicker(event, datasetId) {
    event.stopPropagation();
    document.querySelectorAll('.dataset-lang-picker').forEach(el => el.remove());
    const langs = (typeof I18n !== 'undefined' ? I18n.languages : []);
    const picker = document.createElement('div');
    picker.className = 'dataset-lang-picker';
    picker.innerHTML = langs.map(l =>
        `<button type="button" class="dataset-lang-picker-option" data-lang="${l.code}">
            <span class="dataset-lang-code">${l.code.toUpperCase()}</span>
            <span class="dataset-lang-name">${escapeHtml(l.native)}</span>
        </button>`
    ).join('');
    picker.addEventListener('click', async (e) => {
        const opt = e.target.closest('[data-lang]');
        if (!opt) return;
        await changeDatasetLanguage(datasetId, opt.getAttribute('data-lang'));
    });
    document.body.appendChild(picker);
    const rect = event.currentTarget.getBoundingClientRect();
    picker.style.top = `${rect.bottom + 4}px`;
    picker.style.left = `${rect.left}px`;
    const closePicker = (ev) => {
        if (!picker.contains(ev.target)) {
            picker.remove();
            document.removeEventListener('click', closePicker);
        }
    };
    setTimeout(() => document.addEventListener('click', closePicker), 0);
}

async function changeDatasetLanguage(id, language) {
    try {
        const result = await api(`/api/datasets/${id}/language`, {
            method: 'PUT',
            body: { language }
        });
        if (result.success) {
            toast(t('toast.dataset_language_changed', { lang: language.toUpperCase() }));
            document.querySelectorAll('.dataset-lang-picker').forEach(el => el.remove());
            await loadDatasetsList();
        } else {
            toast(result.error || t('toast.update_failed'), 'error');
        }
    } catch (err) {
        toast(err.message || t('toast.update_failed'), 'error');
    }
}

// Set a dataset as the default (served at root URL /)
async function setDatasetDefault(id, name) {
    try {
        const result = await api(`/api/datasets/${id}/default`, { method: 'PUT' });
        if (result.success) {
            toast(t('toast.dataset_default', { name: result.name }));
            // If the active dataset was previously default, update its flag
            if (activeDatasetId === id) {
                activeDatasetIsDefault = true;
                showActiveDatasetBanner(activeDatasetId, activeDatasetName, true);
            } else if (activeDatasetIsDefault) {
                // Active dataset lost its default status
                activeDatasetIsDefault = false;
                showActiveDatasetBanner(activeDatasetId, activeDatasetName, false);
            }
            await loadDatasetsList();
        } else {
            toast(result.error || t('toast.default_failed'), 'error');
            await loadDatasetsList(); // Revert radio state
        }
    } catch (err) {
        toast(t('toast.default_failed'), 'error');
        await loadDatasetsList(); // Revert radio state
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
            toast(t('toast.url_copied_preview'));
        } else {
            toast(t('toast.copy_failed', { url: text }), 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        toast(t('toast.copy_failed', { url: text }), 'error');
    }
}

async function loadDataset(id, name) {
    try {
        const result = await api(`/api/datasets/${id}/load`, { method: 'POST' });
        if (result.success) {
            // Set active dataset state BEFORE initAdmin (so initAdmin skips auto-load)
            await applyLoadedDatasetResult(result);
            persistActiveDataset();
            // Sync UI locale to match dataset language
            if (typeof I18n !== 'undefined' && activeDatasetLanguage && I18n.locale !== activeDatasetLanguage) {
                await I18n.setLocale(activeDatasetLanguage);
            }
            closeDatasetsModal();
            await initAdmin();
            toast(t('toast.dataset_loaded', { name: result.name }));
        } else {
            toast(result.error || t('toast.dataset_load_failed'), 'error');
        }
    } catch (err) {
        toast(t('toast.dataset_load_failed'), 'error');
    }
}

async function deleteDataset(id, name) {
    if (!confirm(t('confirm.delete_dataset', { name }))) return;
    
    try {
        const result = await api(`/api/datasets/${id}`, { method: 'DELETE' });
        if (result.error) {
            toast(result.error, 'error');
            return;
        }
        // If we deleted the active dataset, clear the banner
        if (activeDatasetId === id) {
            hideActiveDatasetBanner();
        }
        await loadDatasetsList();
        toast(t('toast.dataset_deleted'));
    } catch (err) {
        toast(t('toast.dataset_delete_failed'), 'error');
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
        const langDropdown = document.getElementById('languagePickerDropdown');
        const langWrapper = document.querySelector('.language-picker-wrapper');
        if (langDropdown && langWrapper && langDropdown.classList.contains('active') && !langWrapper.contains(e.target)) {
            langDropdown.classList.remove('active');
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
    // Close language picker if open
    document.getElementById('languagePickerDropdown').classList.remove('active');
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
    toast(t('toast.theme_applied'));
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
    toast(t('toast.theme_reset'));
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
        closeSaveAsModal();
        closeSettingsModal();
        closeAtsPdfModal();
        closeCustomSectionModal();
        closeCustomItemModal();
        const langDropdown = document.getElementById('languagePickerDropdown');
        if (langDropdown) langDropdown.classList.remove('active');
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
    document.getElementById('settingsTabAdvanced').classList.toggle('active', tabName === 'advanced');

    if (tabName === 'custom') {
        loadCustomSectionsList();
    }
}

// Language picker toggle (toolbar dropdown)
function toggleLanguagePicker() {
    const dropdown = document.getElementById('languagePickerDropdown');
    const wasActive = dropdown.classList.contains('active');
    // Close color picker if open
    document.getElementById('colorPickerDropdown').classList.remove('active');
    dropdown.classList.toggle('active');
    if (!wasActive) renderLanguageGrid();
}

// Render language selector grid
function renderLanguageGrid() {
    const container = document.getElementById('toolbarLanguageGrid');
    if (!container) return;

    // Determine available languages based on active dataset's language group
    const hasMultiLang = activeDatasetSiblings.length > 0;
    const groupLangs = new Set();
    if (hasMultiLang) {
        groupLangs.add(activeDatasetLanguage || 'en');
        activeDatasetSiblings.forEach(s => groupLangs.add(s.language));
    }

    let html = I18n.languages.map(lang => {
        const isCurrent = I18n.locale === lang.code;
        const isDisabled = hasMultiLang && !groupLangs.has(lang.code);
        return `
        <div class="language-option ${isCurrent ? 'active' : ''} ${isDisabled ? 'language-option-disabled' : ''}" ${isDisabled ? '' : `onclick="selectLanguage('${lang.code}')"`}>
            <div>
                <div class="language-option-native">${lang.native}</div>
                <div class="language-option-name">${lang.name}</div>
            </div>
        </div>
    `;
    }).join('');

    if (hasMultiLang) {
        html += `<div class="language-picker-hint">${escapeHtml(t('datasets.add_language_hint'))}</div>`;
    }

    container.innerHTML = html;
}

// Handle language selection from toolbar picker
async function selectLanguage(code) {
    // If a multi-language dataset is active, switch to that language variant
    if (activeDatasetSiblings.length > 0) {
        const sibling = activeDatasetSiblings.find(s => s.language === code);
        if (sibling) {
            await switchDatasetLanguage(sibling.id, sibling.name, code);
            return;
        }
        // If the code matches the active dataset language, just switch locale
        if (code === activeDatasetLanguage) {
            await I18n.setLocale(code);
            renderLanguageGrid();
            document.getElementById('languagePickerDropdown').classList.remove('active');
            return;
        }
    }
    await I18n.setLocale(code);
    renderLanguageGrid();
    document.getElementById('languagePickerDropdown').classList.remove('active');
}

// Render custom sections list
async function loadCustomSectionsList() {
    await loadCustomSectionsData();
    const container = document.getElementById('customSectionsList');
    
    // Restore the Save button (it may have been changed by manageCustomSectionItems)
    const saveBtn = document.querySelector('#customSectionModalOverlay .modal-footer-right .btn-primary');
    if (saveBtn) {
        saveBtn.textContent = t('btn.save');
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
                        <span class="material-symbols-outlined" style="font-size:14px">edit</span>
                    </button>
                    <button class="btn btn-ghost btn-sm" onclick="manageCustomSectionItems(${section.id})" title="Manage Items">
                        <span class="material-symbols-outlined" style="font-size:14px">list</span>
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
        toast(t('toast.section_data_failed'), 'error');
        return;
    }

    // Ensure layoutTypes is an array
    if (!Array.isArray(layoutTypes) || layoutTypes.length === 0) {
        console.error('layoutTypes is empty or not an array:', layoutTypes);
        toast(t('toast.layout_options_failed'), 'error');
        return;
    }
    
    let section = { name: '', layout_type: 'grid-3', icon: 'default' };
    if (id) {
        section = customSections.find(s => s.id === id) || section;
    }
    
    document.getElementById('customSectionModalTitle').textContent = id ? t('custom_section.edit_title') : t('custom_section.add_title');
    document.getElementById('deleteCustomSectionBtn').style.display = id ? 'block' : 'none';
    
    // Restore the Save button (it may have been changed by manageCustomSectionItems)
    const saveBtn = document.querySelector('#customSectionModalOverlay .modal-footer-right .btn-primary');
    if (saveBtn) {
        saveBtn.textContent = t('btn.save');
        saveBtn.setAttribute('onclick', 'saveCustomSection()');
        saveBtn.style.display = '';
    }

    document.getElementById('customSectionModalBody').innerHTML = `
        <div class="form-group">
            <label class="form-label">${t('custom_section.section_name')}</label>
            <input type="text" class="form-input" id="cs-name" value="${escapeHtml(section.name || '')}" placeholder="${t('custom_section.section_name_placeholder')}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('custom_section.layout_type')}</label>
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
        <div class="form-group" id="cs-columns-group" style="display: ${(section.layout_type === 'picture-grid') ? '' : 'none'}">
            <label class="form-label">${t('custom_section.grid_columns')}</label>
            <div class="columns-selector">
                ${[1,2,3].map(n => `<button type="button" class="columns-btn ${(section.metadata?.columns || 3) === n ? 'selected' : ''}" onclick="selectPictureGridColumns(${n})">${n}</button>`).join('')}
            </div>
            <input type="hidden" id="cs-columns" value="${section.metadata?.columns || 3}">
        </div>
    `;
    
    document.getElementById('customSectionModalOverlay').classList.add('active');
}

function selectLayoutType(layoutId) {
    document.querySelectorAll('.layout-type-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.layout === layoutId);
    });
    document.getElementById('cs-layout').value = layoutId;
    const colGroup = document.getElementById('cs-columns-group');
    if (colGroup) colGroup.style.display = layoutId === 'picture-grid' ? '' : 'none';
}

function selectPictureGridColumns(n) {
    document.querySelectorAll('.columns-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`.columns-btn:nth-child(${n})`).classList.add('selected');
    document.getElementById('cs-columns').value = n;
}

async function updateSectionColumns(sectionId, columns) {
    try {
        await api(`/api/custom-sections/${sectionId}`, {
            method: 'PUT',
            body: { metadata: { columns } }
        });
        toast(t('toast.section_updated'));
        // Reload section data from server, refresh items view and main page
        await loadCustomSectionsData();
        manageCustomSectionItems(sectionId);
        await loadCustomSections();
        autoSaveActiveDataset();
    } catch (err) {
        toast(t('toast.save_failed'), 'error');
    }
}

async function updateSectionTimelineToggle(sectionId, showOnTimeline) {
    try {
        const section = customSections.find(s => s.id === sectionId);
        const existingMeta = section?.metadata || {};
        await api(`/api/custom-sections/${sectionId}`, {
            method: 'PUT',
            body: { metadata: { ...existingMeta, show_on_timeline: showOnTimeline } }
        });
        await loadCustomSectionsData();
        await loadCustomSections();
        if (typeof loadTimeline === 'function') loadTimeline();
        autoSaveActiveDataset();
    } catch (err) {
        toast(t('toast.save_failed'), 'error');
    }
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
        saveBtn.textContent = t('btn.save');
        saveBtn.setAttribute('onclick', 'saveCustomSection()');
        saveBtn.style.display = '';
    }
    if (cancelBtn) {
        cancelBtn.textContent = t('btn.cancel');
        cancelBtn.setAttribute('onclick', 'closeCustomSectionModal()');
    }
    
    // Refresh custom sections on main page if we were in items view
    if (wasInItemsView) {
        await loadCustomSections();
        reorderSectionElements();
    }
}

async function saveCustomSection() {
    const nameEl = document.getElementById('cs-name');
    const layoutEl = document.getElementById('cs-layout');

    if (!nameEl || !layoutEl) {
        toast(t('toast.form_not_ready'), 'error');
        return;
    }

    const name = nameEl.value.trim();
    const layout_type = layoutEl.value;

    // Build section metadata
    let metadata = {};
    if (layout_type === 'picture-grid') {
        const columns = parseInt(document.getElementById('cs-columns')?.value) || 3;
        metadata = { columns };
    }

    if (!name) {
        toast(t('toast.enter_section_name'), 'error');
        return;
    }

    try {
        if (currentCustomSection.id) {
            await api(`/api/custom-sections/${currentCustomSection.id}`, {
                method: 'PUT',
                body: { name, layout_type, metadata }
            });
            toast(t('toast.section_updated'));
        } else {
            await api('/api/custom-sections', {
                method: 'POST',
                body: { name, layout_type, metadata }
            });
            toast(t('toast.section_created'));
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
        autoSaveActiveDataset();
    } catch (err) {
        toast(t('toast.section_save_failed'), 'error');
    }
}

async function deleteCustomSection() {
    if (!currentCustomSection.id) return;
    
    if (!confirm(t('confirm.delete_section'))) return;
    
    try {
        await api(`/api/custom-sections/${currentCustomSection.id}`, { method: 'DELETE' });
        toast(t('toast.section_deleted'));
        closeCustomSectionModal();
        await loadCustomSectionsList();
        settingsSectionOrder = await api('/api/sections/order');
        renderSettingsSections();
        // Refresh main page sections
        sectionOrder = await loadSectionOrder();
        sectionVisibility = await loadSectionsAdmin();
        await renderSectionsInOrder();
        autoSaveActiveDataset();
    } catch (err) {
        toast(t('toast.section_delete_failed'), 'error');
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
    
    document.getElementById('customSectionModalTitle').textContent = `${section.name} ${t('custom_section.items_suffix')}`;
    document.getElementById('deleteCustomSectionBtn').style.display = 'none';
    
    // Change footer buttons for items view
    const saveBtn = document.querySelector('#customSectionModalOverlay .modal-footer-right .btn-primary');
    const cancelBtn = document.querySelector('#customSectionModalOverlay .modal-footer-right .btn-ghost');
    if (saveBtn) {
        saveBtn.textContent = t('btn.done');
        saveBtn.setAttribute('onclick', 'closeCustomSectionModal()');
    }
    if (cancelBtn) {
        cancelBtn.textContent = t('btn.close');
        cancelBtn.setAttribute('onclick', 'closeCustomSectionModal()');
    }
    
    const currentColumns = section.metadata?.columns || 3;
    document.getElementById('customSectionModalBody').innerHTML = `
        <div class="settings-info" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <span>Layout: <strong>${escapeHtml(layoutType.name)}</strong> | ${items.length} items</span>
            ${section.layout_type === 'picture-grid' ? `
                <span style="display: flex; align-items: center; gap: 6px;">
                    ${t('custom_section.grid_columns')}:
                    <span class="columns-selector" style="margin-top: 0;">
                        ${[1,2,3].map(n => `<button type="button" class="columns-btn ${currentColumns === n ? 'selected' : ''}" onclick="updateSectionColumns(${sectionId}, ${n})">${n}</button>`).join('')}
                    </span>
                </span>
            ` : ''}
            ${section.layout_type === 'timeline' ? `
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                    <input type="checkbox" ${section.metadata?.show_on_timeline ? 'checked' : ''} onchange="updateSectionTimelineToggle(${sectionId}, this.checked)" style="width: 16px; height: 16px;">
                    <span>${t('custom_section.show_on_timeline')}</span>
                </label>
            ` : ''}
        </div>
        <button class="add-btn" onclick="openCustomItemModal(${sectionId})" style="margin-top: 0; margin-bottom: 12px;">
            <span class="material-symbols-outlined">add</span>
            ${section.layout_type === 'picture-grid' ? t('custom_item.add_picture') : t('custom_item.add_item')}
        </button>
        <div class="custom-items-list" data-section-id="${sectionId}">
            ${items.length === 0 ? '<p style="color: var(--gray-500); text-align: center; padding: 20px;">No items yet.</p>' : items.map(item => `
                <div class="custom-item-row" data-id="${item.id}" draggable="true">
                    <div class="drag-handle" title="Drag to reorder">${dragHandleIcon()}</div>
                    ${(section.layout_type === 'picture-grid' || section.layout_type === 'timeline') && item.image ? `<img src="/uploads/${escapeHtml(item.image)}?${Date.now()}" alt="" class="custom-item-thumb">` : ''}
                    <div class="custom-item-info">
                        <div class="custom-item-title">${escapeHtml(item.title || (section.layout_type === 'picture-grid' ? t('custom_item.picture') : 'Untitled'))}</div>
                        ${section.layout_type === 'timeline' ? `<div class="custom-item-subtitle">${escapeHtml(item.subtitle || '')}${item.metadata?.start_date ? ` | ${escapeHtml(item.metadata.start_date)} - ${item.metadata.end_date ? escapeHtml(item.metadata.end_date) : t('present')}` : ''}</div>` : (item.subtitle ? `<div class="custom-item-subtitle">${escapeHtml(item.subtitle)}</div>` : '')}
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
    
    // Init drag-and-drop for custom items
    const itemsContainer = document.querySelector('.custom-items-list');
    if (itemsContainer && items.length > 0) {
        initDragAndDrop(itemsContainer, 'custom-items');
    }
    
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
    
    document.getElementById('customItemModalTitle').textContent = itemId ? t('custom_item.edit_title') : t('custom_item.add_title');
    document.getElementById('deleteCustomItemBtn').style.display = itemId ? 'block' : 'none';
    
    // Different forms based on layout type
    let formHtml = '';
    
    if (section.layout_type === 'social-links') {
        // Social links form with platform selector
        const platform = item.metadata?.platform || 'custom';
        formHtml = `
            <div class="form-group">
                <label class="form-label">${t('custom_item.platform')}</label>
                <select class="form-select" id="ci-platform" onchange="updateSocialPlatformFields()">
                    ${socialPlatforms.map(p => `<option value="${p.id}" ${platform === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">${t('custom_item.display_name')}</label>
                <input type="text" class="form-input" id="ci-title" value="${escapeHtml(item.title || '')}" placeholder="${t('custom_item.display_name_placeholder')}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('custom_item.link_url')}</label>
                <input type="text" class="form-input" id="ci-link" value="${escapeHtml(item.link || '')}" placeholder="https://...">
            </div>
        `;
    } else if (section.layout_type === 'bullet-list') {
        // Bullet list form - title for grouping, description becomes bullet points
        const hideTitle = item.metadata?.hideTitle || false;
        formHtml = `
            <div class="form-group">
                <label class="form-label">${t('custom_item.group_title')}</label>
                <input type="text" class="form-input" id="ci-title" value="${escapeHtml(item.title || '')}" placeholder="${t('custom_item.group_title_placeholder')}">
            </div>
            <div class="form-group">
                <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="ci-hide-title" ${hideTitle ? 'checked' : ''} style="width: 16px; height: 16px;">
                    <span>${t('custom_item.hide_group_title')}</span>
                </label>
                <div class="form-hint">${t('custom_item.hide_group_title_hint')}</div>
            </div>
            <div class="form-group">
                <label class="form-label">${t('custom_item.bullet_points')}</label>
                <textarea class="form-textarea" id="ci-description" rows="8" placeholder="First bullet point\nSecond bullet point\nThird bullet point">${escapeHtml(item.description || '')}</textarea>
            </div>
        `;
    } else if (section.layout_type === 'free-text') {
        // Free text form - title with hide option (hidden by default), plus textarea
        const hideTitle = item.metadata?.hideTitle !== false; // default true for free-text
        formHtml = `
            <div class="form-group">
                <label class="form-label">${t('custom_item.title_optional')}</label>
                <input type="text" class="form-input" id="ci-title" value="${escapeHtml(item.title || '')}">
            </div>
            <div class="form-group">
                <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="ci-hide-title" ${hideTitle ? 'checked' : ''} style="width: 16px; height: 16px;">
                    <span>${t('custom_item.hide_title')}</span>
                </label>
                <div class="form-hint">${t('custom_item.hide_title_hint')}</div>
            </div>
            <div class="form-group">
                <label class="form-label">${t('custom_item.text_content')}</label>
                <textarea class="form-textarea" id="ci-description" rows="10" placeholder="${t('custom_item.text_content_placeholder')}">${escapeHtml(item.description || '')}</textarea>
                <div class="form-hint">${t('custom_item.text_content_hint')}</div>
            </div>
        `;
    } else if (section.layout_type === 'timeline') {
        // Timeline form - reuses experience logo management (same element IDs, since only one modal is open at a time)
        const meta = item.metadata || {};
        pendingLogo = null;
        currentModal.existingLogo = item.image || null;
        currentModal.existingPropagate = false;
        formHtml = `
            ${logoUploadHtml(item.image)}
            <div class="form-group">
                <label class="form-label">${t('form.job_title')}</label>
                <input type="text" class="form-input" id="ci-title" value="${escapeHtml(item.title || '')}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">${t('form.company')}</label>
                    <input type="text" class="form-input" id="ci-subtitle" value="${escapeHtml(item.subtitle || '')}">
                </div>
                <div class="form-group">
                    <label class="form-label">${t('form.country_code')}</label>
                    <input type="text" class="form-input" id="ci-country-code" value="${escapeHtml(meta.country_code || '')}" maxlength="2" placeholder="${t('form.country_code_placeholder')}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">${t('form.start_date')}</label>
                    <input type="text" class="form-input" id="ci-start-date" value="${escapeHtml(meta.start_date || '')}" placeholder="${t('form.start_date_placeholder')}">
                </div>
                <div class="form-group">
                    <label class="form-label">${t('form.end_date')}</label>
                    <input type="text" class="form-input" id="ci-end-date" value="${escapeHtml(meta.end_date || '')}" placeholder="${t('form.end_date_placeholder')}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.location')}</label>
                <input type="text" class="form-input" id="ci-location" value="${escapeHtml(meta.location || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.summary')}</label>
                <textarea class="form-textarea" id="ci-summary" rows="3">${escapeHtml(meta.summary || '')}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.highlights')}</label>
                <textarea class="form-textarea" id="ci-description" rows="6">${escapeHtml(item.description || '')}</textarea>
            </div>
        `;
    } else if (section.layout_type === 'picture-grid') {
        // Picture grid form - picture upload with optional caption
        formHtml = `
            <div class="form-group">
                <label class="form-label">${t('custom_item.picture')}</label>
                <div class="picture-grid-preview" id="ci-picture-preview">
                    ${item.image ? `<img src="/uploads/${escapeHtml(item.image)}?${Date.now()}" alt="" class="picture-grid-preview-img">` : `<div class="picture-grid-placeholder">${t('custom_item.no_image')}</div>`}
                </div>
                <input type="file" id="ci-picture-file" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="previewPictureGridImage(this)">
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="document.getElementById('ci-picture-file').click()">
                        ${t('custom_item.choose_picture')}
                    </button>
                    ${item.image ? `<button type="button" class="btn btn-ghost btn-sm" onclick="removePictureGridImage()" id="ci-remove-picture-btn">${t('custom_item.remove_picture')}</button>` : ''}
                </div>
                <div class="form-hint">${t('custom_item.picture_hint')}</div>
            </div>
            <div class="form-group">
                <label class="form-label">${t('custom_item.caption_optional')}</label>
                <input type="text" class="form-input" id="ci-title" value="${escapeHtml(item.title || '')}" placeholder="${t('custom_item.caption_placeholder')}">
            </div>
        `;
    } else {
        // Generic form for other layouts
        const hideTitle = item.metadata?.hideTitle || false;
        formHtml = `
            <div class="form-group">
                <label class="form-label">${t('custom_item.item_title')}</label>
                <input type="text" class="form-input" id="ci-title" value="${escapeHtml(item.title || '')}">
            </div>
            <div class="form-group">
                <label class="form-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="ci-hide-title" ${hideTitle ? 'checked' : ''} style="width: 16px; height: 16px;">
                    <span>${t('custom_item.hide_title')}</span>
                </label>
                <div class="form-hint">${t('custom_item.hide_title_hint')}</div>
            </div>
            <div class="form-group">
                <label class="form-label">${t('custom_item.subtitle_optional')}</label>
                <input type="text" class="form-input" id="ci-subtitle" value="${escapeHtml(item.subtitle || '')}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('custom_item.description_optional')}</label>
                <textarea class="form-textarea" id="ci-description">${escapeHtml(item.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">${t('custom_item.link_url_optional')}</label>
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
        'bluesky': 'e.g., @username.bsky.social',
        'website': 'e.g., My Website',
        'email': 'e.g., Contact Email',
        'phone': 'e.g., +1 234 567 8900',
        'custom': 'e.g., Display Name'
    };
    
    titleInput.placeholder = placeholders[platform] || 'Display Name';
}

// Picture grid helpers
let pendingPictureGridFile = null;
let pictureGridRemoved = false;

function previewPictureGridImage(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) { toast(t('toast.file_too_large'), 'error'); return; }
    pendingPictureGridFile = file;
    pictureGridRemoved = false;
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('ci-picture-preview');
        if (preview) preview.innerHTML = `<img src="${e.target.result}" alt="" class="picture-grid-preview-img">`;
        // Show remove button
        let removeBtn = document.getElementById('ci-remove-picture-btn');
        if (!removeBtn) {
            const btnContainer = input.previousElementSibling?.nextElementSibling || input.nextElementSibling;
            if (btnContainer) {
                removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.className = 'btn btn-ghost btn-sm';
                removeBtn.id = 'ci-remove-picture-btn';
                removeBtn.onclick = removePictureGridImage;
                removeBtn.textContent = t('custom_item.remove_picture');
                btnContainer.appendChild(removeBtn);
            }
        }
    };
    reader.readAsDataURL(file);
}

function removePictureGridImage() {
    pendingPictureGridFile = null;
    pictureGridRemoved = true;
    const preview = document.getElementById('ci-picture-preview');
    if (preview) preview.innerHTML = `<div class="picture-grid-placeholder">${t('custom_item.no_image')}</div>`;
    const fileInput = document.getElementById('ci-picture-file');
    if (fileInput) fileInput.value = '';
    const removeBtn = document.getElementById('ci-remove-picture-btn');
    if (removeBtn) removeBtn.remove();
}

function closeCustomItemModal() {
    document.getElementById('customItemModalOverlay').classList.remove('active');
    currentCustomItem.itemId = null;
    pendingPictureGridFile = null;
    pictureGridRemoved = false;
    pendingLogo = null;
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
    } else if (section.layout_type === 'timeline') {
        const startRaw = document.getElementById('ci-start-date')?.value?.trim() || '';
        const endRaw = document.getElementById('ci-end-date')?.value?.trim() || '';
        const startResult = startRaw ? normalizeDate(startRaw) : { value: '' };
        if (startResult.error) { toast(startResult.error, 'error'); return; }
        const endResult = endRaw ? normalizeDate(endRaw) : { value: '' };
        if (endResult.error) { toast(endResult.error, 'error'); return; }
        metadata = {
            start_date: startResult.value,
            end_date: endResult.value,
            location: document.getElementById('ci-location')?.value?.trim() || '',
            country_code: document.getElementById('ci-country-code')?.value?.trim() || '',
            summary: document.getElementById('ci-summary')?.value?.trim() || ''
        };
    } else {
        const hideTitle = document.getElementById('ci-hide-title')?.checked || false;
        metadata = { hideTitle };
    }

    // Validation - title not required for bullet-list, free-text, picture-grid, timeline, or when hideTitle is checked
    if (section.layout_type !== 'bullet-list' && section.layout_type !== 'free-text' && section.layout_type !== 'picture-grid' && section.layout_type !== 'timeline' && !metadata.hideTitle && !title) {
        toast(t('toast.enter_title'), 'error');
        return;
    }

    // Bullet list and free text require description
    if ((section.layout_type === 'bullet-list' || section.layout_type === 'free-text') && !description) {
        toast(section.layout_type === 'free-text' ? t('toast.enter_text') : t('toast.enter_bullet'), 'error');
        return;
    }

    // Picture grid requires either an existing image, a pending file, or it's an edit with an image
    if (section.layout_type === 'picture-grid' && !currentCustomItem.itemId && !pendingPictureGridFile) {
        toast(t('toast.select_picture'), 'error');
        return;
    }

    try {
        let itemId = currentCustomItem.itemId;

        // For picture-grid edits, preserve existing image unless being changed
        let image;
        if (section.layout_type === 'picture-grid' && itemId) {
            const existingItem = section.items.find(i => i.id === itemId);
            image = pictureGridRemoved ? '' : (existingItem?.image || '');
        }
        // For timeline edits, image is handled separately via logo system
        if (section.layout_type === 'timeline' && itemId && !pendingLogo) {
            const existingItem = section.items.find(i => i.id === itemId);
            image = existingItem?.image || '';
        }

        if (itemId) {
            await api(`/api/custom-sections/${currentCustomItem.sectionId}/items/${itemId}`, {
                method: 'PUT',
                body: { title, subtitle, description, link, image, metadata }
            });
            toast(t('toast.item_updated'));
        } else {
            const result = await api(`/api/custom-sections/${currentCustomItem.sectionId}/items`, {
                method: 'POST',
                body: { title, subtitle, description, link, metadata }
            });
            itemId = result.id;
            toast(t('toast.item_added'));
        }

        // Handle picture upload for picture-grid
        if (section.layout_type === 'picture-grid' && itemId && pendingPictureGridFile) {
            const formData = new FormData();
            formData.append('picture', pendingPictureGridFile);
            const uploadRes = await fetch(`/api/custom-sections/${currentCustomItem.sectionId}/items/${itemId}/picture`, { method: 'POST', body: formData });
            if (!uploadRes.ok) { toast(t('toast.upload_failed'), 'error'); }
        }

        // Handle logo for timeline items (reuses pendingLogo from shared logo system)
        if (section.layout_type === 'timeline' && itemId && pendingLogo) {
            if (pendingLogo === 'remove') {
                await fetch(`/api/custom-sections/${currentCustomItem.sectionId}/items/${itemId}/picture`, { method: 'DELETE' });
            } else if (pendingLogo.reuse) {
                await api(`/api/custom-sections/${currentCustomItem.sectionId}/items/${itemId}/picture`, {
                    method: 'PUT',
                    body: { filename: pendingLogo.reuse }
                });
            } else if (pendingLogo instanceof File) {
                const formData = new FormData();
                formData.append('picture', pendingLogo);
                const uploadRes = await fetch(`/api/custom-sections/${currentCustomItem.sectionId}/items/${itemId}/picture`, { method: 'POST', body: formData });
                if (!uploadRes.ok) { toast(t('toast.upload_failed'), 'error'); }
            }
            pendingLogo = null;
        }

        closeCustomItemModal();
        await loadCustomSectionsData();
        manageCustomSectionItems(currentCustomItem.sectionId);
        // Refresh timeline if this is a timeline-layout section
        if (section.layout_type === 'timeline') {
            await loadCustomSections();
            if (typeof loadTimeline === 'function') loadTimeline();
        }
        autoSaveActiveDataset();
    } catch (err) {
        toast(t('toast.item_save_failed'), 'error');
    }
}

async function confirmDeleteCustomItem(sectionId, itemId) {
    if (!confirm(t('confirm.delete_custom_item'))) return;
    
    try {
        await api(`/api/custom-sections/${sectionId}/items/${itemId}`, { method: 'DELETE' });
        toast(t('toast.item_deleted'));
        await loadCustomSectionsData();
        const section = customSections.find(s => s.id === sectionId);
        manageCustomSectionItems(sectionId);
        // Refresh timeline if this is a timeline-layout section
        if (section && section.layout_type === 'timeline') {
            await loadCustomSections();
            if (typeof loadTimeline === 'function') loadTimeline();
        }
        autoSaveActiveDataset();
    } catch (err) {
        toast(t('toast.item_delete_failed'), 'error');
    }
}

async function deleteCustomItem() {
    if (!currentCustomItem.sectionId || !currentCustomItem.itemId) return;
    await confirmDeleteCustomItem(currentCustomItem.sectionId, currentCustomItem.itemId);
    closeCustomItemModal();
}

// ===========================
// ATS PDF Export
// ===========================

let atsPdfPreviewUrl = null;
let atsPdfDebounceTimer = null;

function openAtsPdfModal() {
    document.getElementById('atsPdfModalOverlay').classList.add('active');
    document.getElementById('atsPdfScale').value = 100;
    document.getElementById('atsPdfScaleLabel').textContent = '100%';
    const headerGroup = document.getElementById('atsPdfEnglishHeadersGroup');
    if (headerGroup) {
        headerGroup.style.display = (typeof I18n !== 'undefined' && I18n.locale !== 'en') ? '' : 'none';
    }
    updateAtsPdfPreview();
}

function closeAtsPdfModal() {
    document.getElementById('atsPdfModalOverlay').classList.remove('active');
    if (atsPdfPreviewUrl) {
        URL.revokeObjectURL(atsPdfPreviewUrl);
        atsPdfPreviewUrl = null;
    }
    document.getElementById('atsPdfPreview').src = 'about:blank';
}

function updateAtsPdfPreview() {
    const scaleInput = document.getElementById('atsPdfScale');
    document.getElementById('atsPdfScaleLabel').textContent = scaleInput.value + '%';

    clearTimeout(atsPdfDebounceTimer);
    atsPdfDebounceTimer = setTimeout(() => fetchAtsPdfPreview(), 300);
}

async function fetchAtsPdfPreview() {
    const loading = document.getElementById('atsPdfLoading');
    const iframe = document.getElementById('atsPdfPreview');
    loading.style.display = 'flex';
    iframe.style.opacity = '0.3';

    try {
        const scale = parseInt(document.getElementById('atsPdfScale').value) / 100;
        const paperSize = document.getElementById('atsPdfPaperSize').value;
        const englishHeaders = document.getElementById('atsPdfEnglishHeaders')?.checked || false;

        const res = await fetch('/api/export/ats-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scale, paperSize, locale: I18n.locale, forceEnglishHeaders: englishHeaders })
        });

        if (!res.ok) throw new Error('Failed to generate PDF');

        const blob = await res.blob();
        if (atsPdfPreviewUrl) URL.revokeObjectURL(atsPdfPreviewUrl);
        atsPdfPreviewUrl = URL.createObjectURL(blob);
        iframe.src = atsPdfPreviewUrl;
    } catch (err) {
        toast(t('ats.generate_failed'), 'error');
    } finally {
        loading.style.display = 'none';
        iframe.style.opacity = '1';
    }
}

async function downloadAtsPdf() {
    const btn = document.getElementById('atsPdfDownloadBtn');
    btn.disabled = true;

    try {
        const scale = parseInt(document.getElementById('atsPdfScale').value) / 100;
        const paperSize = document.getElementById('atsPdfPaperSize').value;
        const englishHeaders = document.getElementById('atsPdfEnglishHeaders')?.checked || false;

        const res = await fetch('/api/export/ats-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scale, paperSize, locale: I18n.locale, forceEnglishHeaders: englishHeaders })
        });

        if (!res.ok) throw new Error('Failed to generate PDF');

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const disposition = res.headers.get('Content-Disposition') || '';
        const filenameMatch = disposition.match(/filename="(.+?)"/);
        a.href = url;
        a.download = filenameMatch ? filenameMatch[1] : 'ATS_Resume.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast(t('ats.downloaded'), 'success');
    } catch (err) {
        toast(t('ats.generate_failed'), 'error');
    } finally {
        btn.disabled = false;
    }
}

// ===========================
// Section Reorder Overlay
// ===========================

let reorderState = null;

function reorderSectionDisplayName(section) {
    const isCustom = section.name && section.name !== section.default_name;
    return isCustom ? section.name : getTranslatedSectionName(section.key, section.name || section.default_name);
}

function renderReorderPills() {
    const list = document.getElementById('reorderList');
    if (!list || !reorderState) return;
    list.innerHTML = reorderState.order.map((section, index) => {
        const hidden = section.visible === false;
        const label = reorderSectionDisplayName(section);
        const hiddenBadge = hidden
            ? '<span class="reorder-pill-hidden-icon material-symbols-outlined" aria-hidden="true">visibility_off</span>'
            : '';
        return `
            <div class="reorder-pill${hidden ? ' reorder-pill--hidden' : ''}"
                 data-key="${section.key}"
                 data-index="${index}"
                 style="animation-delay: ${Math.min(index * 40, 240)}ms">
                <span class="reorder-pill-grip material-symbols-outlined" aria-hidden="true">drag_indicator</span>
                <span class="reorder-pill-label">${escapeHtml(label)}</span>
                ${hiddenBadge}
            </div>
        `;
    }).join('');
    attachReorderPillListeners();
}

function attachReorderPillListeners() {
    document.querySelectorAll('#reorderList .reorder-pill').forEach(pill => {
        pill.addEventListener('pointerdown', onReorderPillPointerDown);
    });
}

function onReorderPillPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    const pill = e.currentTarget;
    const key = pill.dataset.key;
    beginReorderDrag(key, e);
}

function openReorderOverlay(grabbedKey, pointerEvent) {
    if (!Array.isArray(sectionOrder) || sectionOrder.length === 0) return;
    const overlay = document.getElementById('reorderOverlay');
    if (!overlay) return;

    // Snapshot so Cancel can revert
    const snapshot = sectionOrder.map(s => ({ ...s }));
    reorderState = {
        order: sectionOrder.map(s => ({ ...s })),
        snapshot,
        dragging: null,
        isOpen: true
    };

    renderReorderPills();

    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('reorder-active');

    // Wire footer buttons once
    const okBtn = document.getElementById('reorderOkBtn');
    const cancelBtn = document.getElementById('reorderCancelBtn');
    if (okBtn && !okBtn.dataset.bound) {
        okBtn.addEventListener('click', confirmReorder);
        okBtn.dataset.bound = '1';
    }
    if (cancelBtn && !cancelBtn.dataset.bound) {
        cancelBtn.addEventListener('click', cancelReorder);
        cancelBtn.dataset.bound = '1';
    }

    // Esc to cancel, backdrop click to cancel
    document.addEventListener('keydown', onReorderKeyDown);
    overlay.addEventListener('pointerdown', onReorderOverlayPointerDown);

    // If a handle triggered the open, kick off a drag on that pill immediately.
    // Suppress the pill's entrance animation so getBoundingClientRect matches final layout.
    // Snap the pill under the cursor so the user doesn't have to chase it from
    // the section heading handle (potentially far from the overlay center).
    if (grabbedKey && pointerEvent) {
        const pill = document.querySelector(`#reorderList .reorder-pill[data-key="${grabbedKey}"]`);
        if (pill) pill.style.animation = 'none';
        beginReorderDrag(grabbedKey, pointerEvent, { snapPillToCursor: true });
    }
}

function onReorderOverlayPointerDown(e) {
    // Clicking the backdrop (the overlay itself, not the dialog) cancels
    if (e.target && e.target.id === 'reorderOverlay') {
        cancelReorder();
    }
}

function onReorderKeyDown(e) {
    if (e.key === 'Escape') {
        cancelReorder();
    }
}

function beginReorderDrag(key, pointerEvent, opts = {}) {
    if (!reorderState) return;
    const pill = document.querySelector(`#reorderList .reorder-pill[data-key="${key}"]`);
    if (!pill) return;

    // End any previous drag cleanly
    if (reorderState.dragging) endReorderDrag();

    const rect = pill.getBoundingClientRect();
    const pointerX = pointerEvent.clientX ?? (rect.left + rect.width / 2);
    const pointerY = pointerEvent.clientY ?? (rect.top + rect.height / 2);

    // If the pointer is outside the pill (e.g. drag initiated from the
    // section-heading handle on the left of the page), center the pill on
    // the cursor instead of preserving the pointer→pill offset. Otherwise
    // the pill floats far from the cursor and is hard to reach on a small
    // trackpad. Caller can also force this via opts.snapPillToCursor.
    const pointerOutsidePill =
        pointerX < rect.left || pointerX > rect.right ||
        pointerY < rect.top || pointerY > rect.bottom;
    const snap = opts.snapPillToCursor || pointerOutsidePill;

    // Placeholder keeps the slot while the pill floats
    const placeholder = document.createElement('div');
    placeholder.className = 'reorder-placeholder';
    placeholder.style.height = `${rect.height}px`;
    pill.parentNode.insertBefore(placeholder, pill);

    pill.classList.add('dragging');
    pill.style.width = `${rect.width}px`;
    pill.style.height = `${rect.height}px`;
    pill.style.position = 'fixed';
    pill.style.left = `${rect.left}px`;
    pill.style.top = `${rect.top}px`;
    pill.style.zIndex = '10';
    pill.style.pointerEvents = 'none';

    reorderState.dragging = {
        key,
        pill,
        placeholder,
        offsetX: snap ? rect.width / 2 : pointerX - rect.left,
        offsetY: snap ? rect.height / 2 : pointerY - rect.top,
        pointerId: pointerEvent.pointerId
    };

    updateDraggingPillPosition(pointerX, pointerY);

    try {
        if (pointerEvent.pointerId !== undefined) {
            document.body.setPointerCapture?.(pointerEvent.pointerId);
        }
    } catch (_) { /* ignore */ }

    document.addEventListener('pointermove', onReorderPointerMove);
    document.addEventListener('pointerup', onReorderPointerUp);
    document.addEventListener('pointercancel', onReorderPointerUp);
}

function updateDraggingPillPosition(clientX, clientY) {
    const d = reorderState?.dragging;
    if (!d) return;
    d.pill.style.left = `${clientX - d.offsetX}px`;
    d.pill.style.top = `${clientY - d.offsetY}px`;
}

function onReorderPointerMove(e) {
    const d = reorderState?.dragging;
    if (!d) return;
    e.preventDefault();
    updateDraggingPillPosition(e.clientX, e.clientY);

    // Find the placeholder's target index based on pointer Y vs. other pills
    const list = document.getElementById('reorderList');
    if (!list) return;
    const siblings = Array.from(list.children).filter(el =>
        (el.classList.contains('reorder-pill') && el !== d.pill) ||
        el.classList.contains('reorder-placeholder')
    );

    // Target index follows the floating pill's midpoint, not the cursor's Y
    // (the pointer typically grabs the pill off-center).
    const pillRect = d.pill.getBoundingClientRect();
    const pillMidY = pillRect.top + pillRect.height / 2;

    let insertBefore = null;
    for (const sib of siblings) {
        if (sib === d.placeholder) continue;
        const rect = sib.getBoundingClientRect();
        if (pillMidY < rect.top + rect.height / 2) {
            insertBefore = sib;
            break;
        }
    }

    // FLIP animation: measure before mutation
    const pills = Array.from(list.querySelectorAll('.reorder-pill')).filter(p => p !== d.pill);
    const firstRects = new Map(pills.map(p => [p, p.getBoundingClientRect()]));

    if (insertBefore) {
        if (d.placeholder.nextSibling !== insertBefore) {
            list.insertBefore(d.placeholder, insertBefore);
        }
    } else {
        if (list.lastElementChild !== d.placeholder) {
            list.appendChild(d.placeholder);
        }
    }

    // Measure after, animate the delta
    pills.forEach(p => {
        const first = firstRects.get(p);
        const last = p.getBoundingClientRect();
        const dy = first.top - last.top;
        if (dy) {
            p.style.transition = 'none';
            p.style.transform = `translateY(${dy}px)`;
            requestAnimationFrame(() => {
                p.style.transition = 'transform .22s cubic-bezier(.2,.8,.2,1)';
                p.style.transform = '';
            });
        }
    });
}

function onReorderPointerUp(e) {
    const d = reorderState?.dragging;
    if (!d) return;

    // Commit new position: replace placeholder with pill
    const list = document.getElementById('reorderList');
    if (list && d.placeholder.parentNode === list) {
        list.insertBefore(d.pill, d.placeholder);
    }
    d.placeholder.remove();

    // Clear inline floating styles so the pill sits back in flow
    d.pill.classList.remove('dragging');
    d.pill.style.position = '';
    d.pill.style.left = '';
    d.pill.style.top = '';
    d.pill.style.width = '';
    d.pill.style.height = '';
    d.pill.style.zIndex = '';
    d.pill.style.pointerEvents = '';

    try {
        if (d.pointerId !== undefined) {
            document.body.releasePointerCapture?.(d.pointerId);
        }
    } catch (_) { /* ignore */ }

    endReorderDrag();

    // Rebuild reorderState.order from DOM order
    if (list && reorderState) {
        const keys = Array.from(list.querySelectorAll('.reorder-pill')).map(p => p.dataset.key);
        const lookup = new Map(reorderState.order.map(s => [s.key, s]));
        reorderState.order = keys.map(k => lookup.get(k)).filter(Boolean);
        // Refresh data-index + animation-delay staleness by updating indices
        Array.from(list.querySelectorAll('.reorder-pill')).forEach((p, i) => {
            p.dataset.index = String(i);
        });
    }
}

function endReorderDrag() {
    document.removeEventListener('pointermove', onReorderPointerMove);
    document.removeEventListener('pointerup', onReorderPointerUp);
    document.removeEventListener('pointercancel', onReorderPointerUp);
    if (reorderState) reorderState.dragging = null;
}

function closeReorderOverlay() {
    const overlay = document.getElementById('reorderOverlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('reorder-active');
    document.removeEventListener('keydown', onReorderKeyDown);
    overlay.removeEventListener('pointerdown', onReorderOverlayPointerDown);
    endReorderDrag();
    reorderState = null;
}

function cancelReorder() {
    closeReorderOverlay();
}

async function confirmReorder() {
    if (!reorderState) {
        closeReorderOverlay();
        return;
    }
    const newOrder = reorderState.order;

    // No change — just close
    const snap = reorderState.snapshot;
    const unchanged = newOrder.length === snap.length &&
        newOrder.every((s, i) => s.key === snap[i].key);
    if (unchanged) {
        closeReorderOverlay();
        return;
    }

    const sections = newOrder.map((s, index) => ({
        key: s.key,
        visible: s.visible,
        print_visible: s.print_visible !== false,
        sort_order: index,
        display_name: (s.name && s.name !== s.default_name) ? s.name : null
    }));

    try {
        await api('/api/sections/order', { method: 'PUT', body: { sections } });
        // Update globals so subsequent renders see the new order
        sectionOrder = newOrder.map(s => ({ ...s }));
        settingsSectionOrder = newOrder.map(s => ({ ...s }));
        reorderSectionElements();
        // Persist into the active dataset snapshot; otherwise a page reload
        // restores the dataset's saved order and the change appears lost.
        autoSaveActiveDataset();
        toast(t('toast.settings_saved'), 'success');
    } catch (err) {
        toast(t('toast.settings_failed'), 'error');
    } finally {
        closeReorderOverlay();
    }
}

// Delegated handle listener: press-and-drag on any .section-reorder-handle
document.addEventListener('pointerdown', (e) => {
    const handle = e.target.closest && e.target.closest('.section-reorder-handle');
    if (!handle) return;
    if (e.button !== undefined && e.button !== 0) return;
    const key = handle.dataset.sectionKey;
    if (!key) return;
    e.preventDefault();
    openReorderOverlay(key, e);
});

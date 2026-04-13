const JSON_SAFE_PARSE = (str, fallback = []) => {
    try {
        return str ? JSON.parse(str) : fallback;
    } catch (e) {
        return fallback;
    }
};

/**
 * Shared logic for importing CV data into the live database.
 * Used by /api/datasets/:id/load and /api/import.
 * @param {Object} db - The better-sqlite3 database instance
 * @param {Object} data - The CV data to import
 */
function performImport(db, data) {
    db.transaction(() => {
        // Profile
        if (data.profile) {
            const p = data.profile;
            db.prepare(`UPDATE profile SET 
                name = ?, initials = ?, title = ?, subtitle = ?, bio = ?, 
                location = ?, linkedin = ?, email = ?, phone = ?, languages = ? 
                WHERE id = 1`).run(
                p.name || '', p.initials || '', p.title || '', p.subtitle || '', p.bio || '', 
                p.location || '', p.linkedin || '', p.email || '', p.phone || '', p.languages || ''
            );
        }

        // Experiences
        if (data.experiences && Array.isArray(data.experiences)) {
            db.prepare('DELETE FROM experiences').run();
            const stmt = db.prepare(`INSERT INTO experiences (
                job_title, company_name, start_date, end_date, location, 
                country_code, highlights, summary, sort_order, visible, 
                logo_filename, logo_propagate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            data.experiences.forEach((e, idx) => {
                stmt.run(
                    e.job_title || '', e.company_name || '', e.start_date || '', e.end_date || null, e.location || '', 
                    e.country_code || '', JSON.stringify(e.highlights || []), e.summary || null, 
                    idx, e.visible != false ? 1 : 0, e.logo_filename || null, e.logo_propagate ? 1 : 0
                );
            });
        }

        // Volunteer Work
        if (data.volunteer_work && Array.isArray(data.volunteer_work)) {
            db.prepare('DELETE FROM volunteer_work').run();
            const stmt = db.prepare(`INSERT INTO volunteer_work (
                organization, description, roles, sort_order, visible
            ) VALUES (?, ?, ?, ?, ?)`);
            const stripHtml = s => s && typeof s === 'string' ? s.replace(/<[^>]*>/g, '').trim() : '';
            const sanitizeRoles = roles => (roles || []).slice(0, 20).map(r => ({
                title: stripHtml(r.title || '').slice(0, 100),
                start_date: r.start_date || '',
                end_date: r.end_date || ''
            }));
            data.volunteer_work.forEach((v, idx) => {
                stmt.run(
                    stripHtml(v.organization || '').slice(0, 200),
                    v.description ? stripHtml(v.description).slice(0, 2000) : null,
                    JSON.stringify(sanitizeRoles(v.roles)),
                    v.sort_order !== undefined ? v.sort_order : idx,
                    v.visible != false ? 1 : 0
                );
            });
        }

        // Certifications
        if (data.certifications && Array.isArray(data.certifications)) {
            db.prepare('DELETE FROM certifications').run();
            const stmt = db.prepare(`INSERT INTO certifications (
                name, provider, issue_date, expiry_date, credential_id, 
                sort_order, visible, logo_filename, logo_propagate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            data.certifications.forEach((c, idx) => {
                stmt.run(
                    c.name || '', c.provider || '', c.issue_date || '', c.expiry_date || null, c.credential_id || null, 
                    idx, c.visible != false ? 1 : 0, c.logo_filename || null, c.logo_propagate ? 1 : 0
                );
            });
        }

        // Education
        if (data.education && Array.isArray(data.education)) {
            db.prepare('DELETE FROM education').run();
            const stmt = db.prepare(`INSERT INTO education (
                degree_title, institution_name, start_date, end_date, description, 
                sort_order, visible, logo_filename, logo_propagate
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            data.education.forEach((e, idx) => {
                stmt.run(
                    e.degree_title || '', e.institution_name || '', e.start_date || '', e.end_date || null, e.description || null, 
                    idx, e.visible != false ? 1 : 0, e.logo_filename || null, e.logo_propagate ? 1 : 0
                );
            });
        }

        // Skill Categories & Skills
        if (data.skills && Array.isArray(data.skills)) {
            db.prepare('DELETE FROM skills').run();
            db.prepare('DELETE FROM skill_categories').run();
            const catStmt = db.prepare('INSERT INTO skill_categories (name, icon, sort_order, visible) VALUES (?, ?, ?, ?)');
            const skillStmt = db.prepare('INSERT INTO skills (category_id, name, sort_order) VALUES (?, ?, ?)');
            data.skills.forEach((cat, idx) => {
                const res = catStmt.run(cat.name || '', cat.icon || 'default', idx, cat.visible != false ? 1 : 0);
                const categoryId = res.lastInsertRowid;
                if (cat.skills && Array.isArray(cat.skills)) {
                    cat.skills.forEach((skillName, sidx) => {
                        skillStmt.run(categoryId, skillName, sidx);
                    });
                }
            });
        }

        // Projects
        if (data.projects && Array.isArray(data.projects)) {
            db.prepare('DELETE FROM projects').run();
            const stmt = db.prepare('INSERT INTO projects (title, description, technologies, link, sort_order, visible) VALUES (?, ?, ?, ?, ?, ?)');
            data.projects.forEach((p, idx) => {
                stmt.run(p.title || '', p.description || '', JSON.stringify(p.technologies || []), p.link || null, idx, p.visible != false ? 1 : 0);
            });
        }

        // Section Visibility & Order
        if (data.sectionOrder && Array.isArray(data.sectionOrder)) {
            // Check if display_name column exists
            const info = db.prepare("PRAGMA table_info(section_visibility)").all();
            const hasDisplayName = info.some(c => c.name === 'display_name');
            
            db.prepare('DELETE FROM section_visibility').run();
            const baseSql = hasDisplayName 
                ? 'INSERT INTO section_visibility (section_name, visible, sort_order, display_name) VALUES (?, ?, ?, ?)'
                : 'INSERT INTO section_visibility (section_name, visible, sort_order) VALUES (?, ?, ?)';
            const stmt = db.prepare(baseSql);
            
            data.sectionOrder.forEach((s, idx) => {
                // sectionOrder items can be strings (keys) or objects
                const key = typeof s === 'string' ? s : (s.key || s.section_name);
                if (!key) return;
                const isVisible = data.sectionVisibility ? !!data.sectionVisibility[key] : (s.visible != false);
                if (hasDisplayName) {
                    stmt.run(key, isVisible ? 1 : 0, idx, s.display_name || null);
                } else {
                    stmt.run(key, isVisible ? 1 : 0, idx);
                }
            });
        }

        // Custom Sections
        if (data.customSections && Array.isArray(data.customSections)) {
            db.prepare('DELETE FROM custom_section_items').run();
            db.prepare('DELETE FROM custom_sections').run();
            const secStmt = db.prepare('INSERT INTO custom_sections (name, section_key, layout_type, icon, sort_order, visible, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)');
            
            const itemInfo = db.prepare("PRAGMA table_info(custom_section_items)").all();
            const hasIcon = itemInfo.some(c => c.name === 'icon');
            
            const itemSql = hasIcon
                ? 'INSERT INTO custom_section_items (section_id, title, subtitle, description, link, icon, image, sort_order, visible, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                : 'INSERT INTO custom_section_items (section_id, title, subtitle, description, link, image, sort_order, visible, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const itemStmt = db.prepare(itemSql);
            
            data.customSections.forEach((s, sidx) => {
                const res = secStmt.run(s.name || '', s.section_key || `custom_${sidx}`, s.layout_type || 'grid-3', s.icon || 'layers', s.sort_order || sidx, s.visible != false ? 1 : 0, s.metadata ? JSON.stringify(s.metadata) : null);
                const sectionId = res.lastInsertRowid;
                if (s.items && Array.isArray(s.items)) {
                    s.items.forEach((item, iidx) => {
                        if (hasIcon) {
                            itemStmt.run(sectionId, item.title || null, item.subtitle || null, item.description || null, item.link || null, item.icon || null, item.image || null, item.sort_order || iidx, item.visible != false ? 1 : 0, item.metadata ? JSON.stringify(item.metadata) : null);
                        } else {
                            itemStmt.run(sectionId, item.title || null, item.subtitle || null, item.description || null, item.link || null, item.image || null, item.sort_order || iidx, item.visible != false ? 1 : 0, item.metadata ? JSON.stringify(item.metadata) : null);
                        }
                    });
                }
            });
        }
    })();
}

module.exports = { performImport, JSON_SAFE_PARSE };

/* CV Manager - Internationalization Module */

const I18n = {
    locale: 'en',
    translations: {},
    fallback: {},
    loaded: false,

    languages: [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'de', name: 'German', native: 'Deutsch' },
        { code: 'fr', name: 'French', native: 'Français' },
        { code: 'nl', name: 'Dutch', native: 'Nederlands' },
        { code: 'es', name: 'Spanish', native: 'Español' },
        { code: 'it', name: 'Italian', native: 'Italiano' },
        { code: 'pt', name: 'Portuguese', native: 'Português' },
        { code: 'zh', name: 'Chinese', native: '中文' }
    ],

    async init() {
        if (window.STATIC_SITE) {
            // In static mode, read language from pre-loaded data or data.json
            try {
                const res = await fetch('./data.json');
                if (res.ok) {
                    const data = await res.json();
                    const lang = data.settings?.language;
                    if (lang && this.languages.some(l => l.code === lang)) {
                        this.locale = lang;
                    }
                }
            } catch (e) { /* Use default */ }
        } else {
            try {
                const result = await fetch('/api/settings/language').then(r => r.json());
                if (result.value && this.languages.some(l => l.code === result.value)) {
                    this.locale = result.value;
                }
            } catch (e) {
                // Use default
            }
        }
        // Always load English as fallback
        const i18nBase = window.STATIC_SITE ? './shared/i18n' : '/shared/i18n';
        await this.loadTranslations('en', true, i18nBase);
        if (this.locale !== 'en') {
            await this.loadTranslations(this.locale, false, i18nBase);
        }
        this.loaded = true;
        this.refreshUI();
    },

    async loadTranslations(locale, asFallback = false, basePath = null) {
        try {
            const base = basePath || (window.STATIC_SITE ? './shared/i18n' : '/shared/i18n');
            const res = await fetch(`${base}/${locale}.json`);
            if (!res.ok) return;
            const data = await res.json();
            if (asFallback) {
                this.fallback = data;
            }
            if (locale === this.locale) {
                this.translations = data;
            }
        } catch (e) {
            console.warn(`Failed to load translations for ${locale}`);
        }
    },

    async setLocale(locale) {
        if (!this.languages.some(l => l.code === locale)) return;
        this.locale = locale;
        if (locale === 'en') {
            this.translations = this.fallback;
        } else {
            await this.loadTranslations(locale);
        }
        // Save to settings (skip in static mode — no server)
        if (!window.STATIC_SITE) {
            try {
                await fetch('/api/settings/language', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ value: locale })
                });
            } catch (e) {
                // Ignore save errors
            }
        }
        document.documentElement.lang = locale;
        this.refreshUI();
    },

    refreshUI() {
        document.documentElement.lang = this.locale;
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translated = t(key);
            if (translated !== key) {
                el.textContent = translated;
            }
        });
        // Update title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translated = t(key);
            if (translated !== key) {
                el.title = translated;
            }
        });
        // Update placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translated = t(key);
            if (translated !== key) {
                el.placeholder = translated;
            }
        });
    }
};

// Global shorthand
function t(key, params) {
    let str = I18n.translations[key] || I18n.fallback[key] || key;
    if (params) {
        Object.keys(params).forEach(k => {
            str = str.replace(new RegExp(`{{${k}}}`, 'g'), params[k]);
        });
    }
    return str;
}

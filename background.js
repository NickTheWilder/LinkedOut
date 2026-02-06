// Load polyfill for Chrome (Firefox loads it via manifest)
try {
    importScripts('browser-polyfill.min.js');
} catch (e) {
    // Firefox doesn't use importScripts
}

// Use browser API (polyfilled on Chrome, native on Firefox)
const api = typeof browser !== 'undefined' ? browser : chrome;

const DEFAULT_KEYWORDS = ['crypto', 'ai'];

/** Initialize default keywords on install */
api.runtime.onInstalled.addListener(async () => {
    const data = await api.storage.local.get('keywords');
    if (!data.keywords) {
        await api.storage.local.set({ keywords: DEFAULT_KEYWORDS });
    }
});

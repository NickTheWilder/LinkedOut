const DEFAULT_KEYWORDS = ['crypto', 'ai'];
let blockedKeywords = [];

/** Load keywords from browser storage */
async function loadKeywords() {
    const data = await browser.storage.local.get('keywords');
    blockedKeywords = data.keywords ?? DEFAULT_KEYWORDS;
}

/** Returns matched keyword or null (case-insensitive, whole word) */
function findBlockedKeyword(text) {
    for (const keyword of blockedKeywords) {
        const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escapeRegex(keyword)}(?:[^a-zA-Z0-9]|$)`, 'i');
        if (regex.test(text)) {
            return keyword;
        }
    }
    return null;
}

/** Escape special regex characters */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Extract post text content from a post element */
function getPostText(postElement) {
    const textElement = postElement.querySelector('.update-components-text');
    if (textElement) {
        return textElement.textContent || '';
    }

    const breakWords = postElement.querySelector('.break-words');
    if (breakWords) {
        return breakWords.textContent || '';
    }

    return '';
}

/** Hide a post element */
function hidePost(postElement) {
    postElement.style.display = 'none';
}

/** Process a single post - hide if it contains blocked keywords */
function processPost(postElement) {
    if (blockedKeywords.length === 0) return;
    if (postElement.dataset.keywordBlockerHidden) return;
    if (postElement.dataset.keywordBlockerProcessed) return;

    const text = getPostText(postElement);

    postElement.dataset.keywordBlockerProcessed = 'true';

    const matchedKeyword = findBlockedKeyword(text);

    if (matchedKeyword) {
        hidePost(postElement);
        postElement.dataset.keywordBlockerHidden = 'true';
        browser.runtime.sendMessage({ type: 'postBlocked', keyword: matchedKeyword });
    }
}

/** Find and process all posts in the feed */
function processAllPosts() {
    const posts = document.querySelectorAll('div[data-id^="urn:li:activity"]');
    posts.forEach(processPost);
}

/** Set up MutationObserver to handle dynamically loaded posts */
function setupObserver() {
    let debounceTimer = null;
    let lastProcessTime = 0;
    const MIN_INTERVAL = 50;

    const observer = new MutationObserver(() => {
        const now = Date.now();

        if (now - lastProcessTime >= MIN_INTERVAL) {
            lastProcessTime = now;
            processAllPosts();
        } else {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                lastProcessTime = Date.now();
                processAllPosts();
            }, MIN_INTERVAL);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

/** Listen for keyword changes from storage */
function setupStorageListener() {
    browser.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.keywords) {
            blockedKeywords = changes.keywords.newValue ?? DEFAULT_KEYWORDS;
            reprocessAllPosts();
        }
    });
}

/** Clear processed flags and re-check all posts */
function reprocessAllPosts() {
    const posts = document.querySelectorAll('div[data-id^="urn:li:activity"]');
    posts.forEach(post => delete post.dataset.keywordBlockerProcessed);
    processAllPosts();
}

/** Initialize the extension */
async function init() {
    await loadKeywords();
    setupStorageListener();
    processAllPosts();
    setupObserver();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

importScripts('browser-polyfill.min.js');

const DEFAULT_KEYWORDS = ['crypto', 'ai'];

/** Initialize default keywords on install */
browser.runtime.onInstalled.addListener(async () => {
  const data = await browser.storage.local.get('keywords');
  if (!data.keywords) {
    await browser.storage.local.set({ keywords: DEFAULT_KEYWORDS });
  }
});

/** Listen for messages from content script */
browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'postBlocked') {
    incrementBlockCount(message.keyword);
  }
});

/** Increment the block count for a keyword */
async function incrementBlockCount(keyword) {
  const data = await browser.storage.local.get('stats');
  const stats = data.stats || { total: 0, byKeyword: {} };
  
  stats.total += 1;
  stats.byKeyword[keyword] = (stats.byKeyword[keyword] || 0) + 1;
  
  await browser.storage.local.set({ stats });
}

const DEFAULT_KEYWORDS = ['crypto', 'ai'];

/** Load and display keywords */
async function loadKeywords() {
  const data = await browser.storage.local.get('keywords');
  let keywords = data.keywords;
  
  // Initialize storage with defaults if empty
  if (!keywords) {
    keywords = DEFAULT_KEYWORDS;
    await browser.storage.local.set({ keywords });
  }
  
  const container = document.getElementById('keywords');
  
  if (keywords.length === 0) {
    container.innerHTML = '<div class="empty">No keywords</div>';
    return;
  }
  
  container.innerHTML = keywords.map(keyword => `
    <span class="keyword-tag">
      ${escapeHtml(keyword)}
      <button data-keyword="${escapeHtml(keyword)}" title="Remove">&times;</button>
    </span>
  `).join('');
  
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => removeKeyword(btn.dataset.keyword));
  });
}

/** Add a new keyword */
async function addKeyword() {
  const input = document.getElementById('newKeyword');
  const keyword = input.value.trim().toLowerCase();
  
  if (!keyword) return;
  
  const data = await browser.storage.local.get('keywords');
  const keywords = data.keywords || DEFAULT_KEYWORDS;
  
  if (!keywords.includes(keyword)) {
    keywords.push(keyword);
    await browser.storage.local.set({ keywords });
  }
  
  input.value = '';
  loadKeywords();
}

/** Remove a keyword */
async function removeKeyword(keyword) {
  const data = await browser.storage.local.get('keywords');
  let keywords = data.keywords || DEFAULT_KEYWORDS;
  
  keywords = keywords.filter(k => k !== keyword);
  await browser.storage.local.set({ keywords });
  
  loadKeywords();
}

/** Load and display stats */
async function loadStats() {
  const data = await browser.storage.local.get('stats');
  const stats = data.stats || { total: 0, byKeyword: {} };
  const container = document.getElementById('stats');
  
  if (stats.total === 0) {
    container.innerHTML = '<div class="empty">No posts blocked yet</div>';
    return;
  }
  
  const sortedKeywords = Object.entries(stats.byKeyword).sort((a, b) => b[1] - a[1]);
  
  let html = sortedKeywords.map(([keyword, count]) => `
    <div class="stat-row">
      <span class="keyword">${escapeHtml(keyword)}</span>
      <span class="count">${count}</span>
    </div>
  `).join('');
  
  html += `
    <div class="stat-row total">
      <span>Total</span>
      <span>${stats.total}</span>
    </div>
  `;
  
  container.innerHTML = html;
}

/** Clear all stats */
async function clearStats() {
  await browser.storage.local.set({ stats: { total: 0, byKeyword: {} } });
  loadStats();
}

/** Escape HTML to prevent XSS */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.getElementById('addBtn').addEventListener('click', addKeyword);
document.getElementById('newKeyword').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addKeyword();
});
document.getElementById('clear').addEventListener('click', clearStats);

loadKeywords();
loadStats();

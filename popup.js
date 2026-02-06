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
    container.textContent = '';
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No keywords';
    container.appendChild(empty);
    return;
  }
  
  container.textContent = '';
  keywords.forEach(keyword => {
    const tag = document.createElement('span');
    tag.className = 'keyword-tag';
    tag.appendChild(document.createTextNode(keyword));
    
    const btn = document.createElement('button');
    btn.dataset.keyword = keyword;
    btn.title = 'Remove';
    btn.textContent = '\u00D7';
    btn.addEventListener('click', () => removeKeyword(keyword));
    tag.appendChild(btn);
    
    container.appendChild(tag);
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
    container.textContent = '';
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'No posts blocked yet';
    container.appendChild(empty);
    return;
  }
  
  container.textContent = '';
  const sortedKeywords = Object.entries(stats.byKeyword).sort((a, b) => b[1] - a[1]);
  
  sortedKeywords.forEach(([keyword, count]) => {
    const row = document.createElement('div');
    row.className = 'stat-row';
    
    const keywordSpan = document.createElement('span');
    keywordSpan.className = 'keyword';
    keywordSpan.textContent = keyword;
    row.appendChild(keywordSpan);
    
    const countSpan = document.createElement('span');
    countSpan.className = 'count';
    countSpan.textContent = count;
    row.appendChild(countSpan);
    
    container.appendChild(row);
  });
  
  const totalRow = document.createElement('div');
  totalRow.className = 'stat-row total';
  
  const totalLabel = document.createElement('span');
  totalLabel.textContent = 'Total';
  totalRow.appendChild(totalLabel);
  
  const totalCount = document.createElement('span');
  totalCount.textContent = stats.total;
  totalRow.appendChild(totalCount);
  
  container.appendChild(totalRow);
}

/** Clear all stats */
async function clearStats() {
  await browser.storage.local.set({ stats: { total: 0, byKeyword: {} } });
  loadStats();
}

document.getElementById('addBtn').addEventListener('click', addKeyword);
document.getElementById('newKeyword').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addKeyword();
});
document.getElementById('clear').addEventListener('click', clearStats);

loadKeywords();
loadStats();

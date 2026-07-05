let latestData = null;
let activeTab = 'identity';

const contentEl = document.getElementById('content');
const buttons = document.querySelectorAll('#toolbar button[data-tab]');

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    buttons.forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });
});

document.getElementById('copyAll').addEventListener('click', () => {
  if (!latestData) return;
  navigator.clipboard.writeText(JSON.stringify(latestData, null, 2));
});

function render() {
  if (!latestData) {
    contentEl.innerHTML = '<div id="empty">Click the extension icon, then pick an element on the page.</div>';
    return;
  }
  const section = latestData[activeTab];
  contentEl.textContent = typeof section === 'string' ? section : JSON.stringify(section, null, 2);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'EXTRACTED_DATA') {
    latestData = msg.payload;
    render();
  }
});

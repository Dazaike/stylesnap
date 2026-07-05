chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'extractor') return;
  port.onMessage.addListener((msg) => {
    chrome.runtime.sendMessage({ type: 'EXTRACTED_DATA', payload: msg.data });
  });
});

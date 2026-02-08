chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'extract_page_context') {
    return;
  }

  const payload = {
    title: document.title,
    url: window.location.href,
    sampleText: document.body?.innerText.slice(0, 160) ?? '',
    note: 'phase-1 placeholder payload'
  };

  sendResponse(payload);
});

console.log('[ai-plugin] background service worker started');

type ExtractRequest = {
  type: 'popup.extract';
};

chrome.runtime.onMessage.addListener((message: ExtractRequest, _sender, sendResponse) => {
  if (message?.type !== 'popup.extract') {
    return;
  }

  void handleExtraction()
    .then((payload) => sendResponse({ ok: true, payload }))
    .catch((error: unknown) => {
      const reason = error instanceof Error ? error.message : 'Unknown extraction failure';
      sendResponse({ ok: false, error: reason });
    });

  return true;
});

async function handleExtraction() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!activeTab?.id) {
    throw new Error('No active tab available');
  }

  await chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    files: ['content/index.js']
  });

  return chrome.tabs.sendMessage(activeTab.id, {
    type: 'extract_page_context'
  });
}

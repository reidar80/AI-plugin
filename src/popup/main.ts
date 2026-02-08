const extractButton = document.getElementById('extract-button');
const resultNode = document.getElementById('result');

if (!(extractButton instanceof HTMLButtonElement) || !(resultNode instanceof HTMLElement)) {
  throw new Error('Popup UI failed to initialize');
}

extractButton.addEventListener('click', async () => {
  resultNode.textContent = 'Extracting...';

  try {
    const response = await chrome.runtime.sendMessage({ type: 'popup.extract' });

    if (!response?.ok) {
      resultNode.textContent = `Error: ${response?.error ?? 'Unknown error'}`;
      return;
    }

    resultNode.textContent = JSON.stringify(response.payload, null, 2);
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : 'Unknown popup error';
    resultNode.textContent = `Error: ${reason}`;
  }
});

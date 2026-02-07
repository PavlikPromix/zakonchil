document.addEventListener('DOMContentLoaded', () => {
  const botTokenInput = document.getElementById('botToken');
  const userIdInput = document.getElementById('userId');
  const saveBtn = document.getElementById('saveBtn');
  const testBtn = document.getElementById('testBtn');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get(['botToken', 'userId'], (result) => {
    if (result.botToken) botTokenInput.value = result.botToken;
    if (result.userId) userIdInput.value = result.userId;
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const botToken = botTokenInput.value.trim();
    const userId = userIdInput.value.trim();

    if (!botToken || !userId) {
      showStatus('Please fill in both fields.', 'error');
      return;
    }

    chrome.storage.local.set({ botToken, userId }, () => {
      showStatus('Settings saved!', 'success');
    });
  });

  // Test notification
  testBtn.addEventListener('click', () => {
    const botToken = botTokenInput.value.trim();
    const userId = userIdInput.value.trim();

    if (!botToken || !userId) {
      showStatus('Save settings first!', 'error');
      return;
    }

    showStatus('Sending test message...', '');
    
    // Send message to background to handle the fetch
    chrome.runtime.sendMessage({ 
      action: 'TEST_NOTIFICATION',
      data: { botToken, userId }
    }, (response) => {
      if (response && response.success) {
        showStatus('Test message sent!', 'success');
      } else {
        showStatus('Failed: ' + (response ? response.error : 'Unknown error'), 'error');
      }
    });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    setTimeout(() => {
      if (statusDiv.textContent === message) {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
      }
    }, 3000);
  }
});

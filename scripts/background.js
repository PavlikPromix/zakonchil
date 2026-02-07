// background.js - Handles Telegram API communication

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'GENERATION_FINISHED') {
    handleGenerationFinished();
  } else if (request.action === 'TEST_NOTIFICATION') {
    sendTelegramMessage(request.data.botToken, request.data.userId, "🔔 Zakonchil: Test notification is working!")
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

async function handleGenerationFinished() {
  const settings = await chrome.storage.local.get(['botToken', 'userId']);
  
  if (!settings.botToken || !settings.userId) {
    console.error('Zakonchil: Bot Token or User ID not configured.');
    return;
  }

  try {
    await sendTelegramMessage(
      settings.botToken, 
      settings.userId, 
      "✅ ChatGPT закончил генерацию ответа!"
    );
    console.log('Zakonchil: Notification sent to Telegram.');
  } catch (error) {
    console.error('Zakonchil: Failed to send Telegram message:', error);
  }
}

async function sendTelegramMessage(botToken, userId, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: userId,
      text: text
    })
  });

  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(data.description || 'Unknown Telegram API error');
  }
  
  return data;
}

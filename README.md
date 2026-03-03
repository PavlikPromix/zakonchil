# Zakónchil

Zakónchil is a Chrome extension that sends you a Telegram notification as soon as ChatGPT finishes generating its response. 

If you frequently ask ChatGPT complex questions or generate long text that takes a while to complete, you can switch tabs or walk away from your computer. Zakónchil will ping you on Telegram the moment your response is ready!

"Zakónchil" means "Finished" in Russian.

## Features

- **Real-time Detection:** Accurately detects when ChatGPT starts and stops generating text.
- **Telegram Integration:** Sends a direct message to your Telegram account via a custom bot.
- **In-page Toggle:** Injects a convenient on/off switch right into the ChatGPT interface (next to the dictate button) so you can quickly enable or disable notifications for specific prompts.
- **Popup Dashboard:** Easy configuration of your Telegram Bot Token and Chat ID, complete with a test notification button.
- **Customizable Notifications:** Set your own custom notification text.

## Installation

Since this is an unpacked extension, you'll need to install it via Chrome's Developer Mode:

1. Clone or download this repository to your computer.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (the toggle switch in the top right corner).
4. Click on the **Load unpacked** button.
5. Select the `Zakonchil` folder you downloaded.
6. The extension should now appear in your list of extensions! Pin it to your toolbar for easy access.

## Setup Instructions

To receive notifications, you need to create a Telegram bot and get your Chat ID.

### 1. Create a Telegram Bot

1. Open Telegram and search for the **@BotFather**.
2. Send the message `/newbot` to create a new bot.
3. Follow the instructions to give your bot a name and a username.
4. Once created, BotFather will give you an **HTTP API Token** (e.g., `123456789:ABCdefGHIjklMNOpqrSTUvwxYZ`). **Copy this token.**

### 2. Get your User ID (Chat ID)

1. Search for **@userinfobot** or **@GetIDs Bot** in Telegram.
2. Start a chat with the bot.
3. It will reply with your `Id` (a string of numbers like `123456789`). **Copy this ID.**

### 3. Configure the Extension

1. Click the Zakónchil extension icon in your Chrome toolbar to open the popup.
2. Paste the **Bot Token** you got from BotFather.
3. Paste the **User ID** you got from the ID bot.
4. (Optional) Customize the **Notification Text**.
5. Click **Save Settings**.
6. Click **Test Notification** to ensure everything is working. You should receive a message from your bot in Telegram! *(Note: You must start a conversation with your newly created bot in Telegram first before it can send you messages. Go to your bot and press "Start").*

## How to Use

1. Go to [chatgpt.com](https://chatgpt.com) and start a prompt.
2. Look for the Zakónchil toggle switch injected near the input area (next to the voice/dictate button).
3. Ensure it is toggled **ON** (green).
4. Send your prompt to ChatGPT.
5. When ChatGPT finishes typing out its response, you will receive a Telegram message (by default: `"✅ ChatGPT закончил генерацию ответа!"`, or your custom text).

## Permissions

- `storage`: Used to save your Bot Token, User ID, and the toggle state locally on your browser.
- `host_permissions`: 
  - `https://chatgpt.com/`*: Required to monitor the page for generation status and inject the toggle UI.
  - `https://api.telegram.org/`*: Required to send the notification payload to the Telegram API.

## Architecture

- **Manifest V3:** Modern Chrome Extension standard.
- **Content Script (`content.js`):** Uses a `MutationObserver` to watch for ChatGPT's specific CSS classes (`.result-streaming`) and the "Stop generating" button to determine state.
- **Background Worker (`background.js`):** Handles the API requests to Telegram securely in the background.
- **Popup (`popup.js` / `popup.html`):** The user interface for configuration.

// content.js - Monitors ChatGPT for generation completion

let isGenerating = false;
let checkTimeout = null;

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
  // Try to inject the toggle button
  injectNotificationToggle();
  
  // Check for the presence of elements with the 'result-streaming' class
  // ChatGPT adds this class to the current response element while it's being generated
  // or while it is "thinking"
  const streamingElements = document.querySelectorAll('.result-streaming');
  const isCurrentlyStreaming = streamingElements.length > 0;
  
  // Also check if there's a Stop Generating button, which indicates it's still working
  const stopButton = document.querySelector('button[aria-label="Stop generating"]') || 
                     document.querySelector('button[data-testid="stop-button"]');
  
  const isWorking = isCurrentlyStreaming || stopButton !== null;
  
  if (isWorking) {
    if (!isGenerating) {
      console.log('Zakonchil: ChatGPT started generating...');
      isGenerating = true;
    }
    
    // Clear any pending finish checks because it is still working
    if (checkTimeout) {
      clearTimeout(checkTimeout);
      checkTimeout = null;
    }
  } else {
    if (isGenerating && !checkTimeout) {
      // Check if generation actually finished or if it was just a brief pause
      // The gap between "thinking" and "writing" can sometimes be a few seconds
      checkTimeout = setTimeout(() => {
        // Double check just in case
        const stillStreaming = document.querySelectorAll('.result-streaming').length > 0;
        const stillHasStopButton = document.querySelector('button[aria-label="Stop generating"]') || 
                                   document.querySelector('button[data-testid="stop-button"]');
        
        if (!stillStreaming && !stillHasStopButton && isGenerating) {
          console.log('Zakonchil: ChatGPT finished generating!');
          isGenerating = false;
          notifyCompletion();
        }
        checkTimeout = null;
      }, 3000); // 3 seconds debounce to bridge the gap between thinking and writing
    }
  }
});

// Function to send a message to the background script
function notifyCompletion() {
  chrome.runtime.sendMessage({ action: 'GENERATION_FINISHED' });
}

// Function to inject the notification toggle next to the Dictate button
function injectNotificationToggle() {
  // Look for the target container using XPath
  const xpath = '/html/body/div[2]/div[1]/div/div[2]/div/main/div/div/div[2]/div[1]/div/div/div[2]/form/div[2]/div/div[4]/div';
  let targetContainer = null;
  try {
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    targetContainer = result.singleNodeValue;
  } catch (e) {
    // Fallback if XPath fails
  }

  if (!targetContainer) {
    // Look for the Dictate or Voice button using various possible selectors ChatGPT might use
    const dictateButton = document.querySelector('button[aria-label="Dictate"]') || 
                          document.querySelector('button[aria-label="Voice conversation"]') ||
                          document.querySelector('button[aria-label="Voice input"]') ||
                          document.querySelector('button[data-testid="voice-input-button"]');
    
    if (dictateButton) {
      targetContainer = dictateButton.parentNode;
    }
  }
  
  if (!targetContainer) return;

  // Check if we already injected it
  const existingToggle = document.getElementById('zakonchil-notification-toggle');
  if (existingToggle) {
    // Ensure it's still attached to the correct parent (React might re-render)
    if (targetContainer.contains(existingToggle)) {
      return;
    }
    existingToggle.remove();
  }

  // Create toggle container
  const toggleContainer = document.createElement('div');
  toggleContainer.id = 'zakonchil-notification-toggle';
  toggleContainer.style.display = 'flex';
  toggleContainer.style.alignItems = 'center';
  toggleContainer.style.marginLeft = '8px';
  toggleContainer.style.marginRight = '8px';
  toggleContainer.style.cursor = 'pointer';
  toggleContainer.title = 'Enable/Disable Zakonchil Notifications';

  // Create the switch styling (inline so it works independently of page CSS)
  toggleContainer.innerHTML = `
    <label style="position: relative; display: inline-block; width: 32px; height: 18px; margin: 0; cursor: pointer;">
      <input type="checkbox" id="zakonchil-toggle-input" style="opacity: 0; width: 0; height: 0;">
      <span class="zakonchil-slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 18px;">
        <span class="zakonchil-slider-knob" style="position: absolute; content: ''; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%;"></span>
      </span>
    </label>
  `;

  // Insert at the beginning of the target container
  targetContainer.insertBefore(toggleContainer, targetContainer.firstChild);

  const toggleInput = document.getElementById('zakonchil-toggle-input');
  const slider = toggleContainer.querySelector('.zakonchil-slider');
  const knob = toggleContainer.querySelector('.zakonchil-slider-knob');

  // Function to update visual state
  const updateVisualState = (enabled) => {
    toggleInput.checked = enabled;
    if (enabled) {
      slider.style.backgroundColor = '#10a37f'; // ChatGPT green
      knob.style.transform = 'translateX(14px)';
    } else {
      slider.style.backgroundColor = '#ccc';
      knob.style.transform = 'translateX(0)';
    }
  };

  // Load initial state
  chrome.storage.local.get(['notificationsEnabled'], (result) => {
    const enabled = result.notificationsEnabled !== false; // Default true
    updateVisualState(enabled);
  });

  // Handle click to toggle
  toggleInput.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    updateVisualState(enabled);
    chrome.storage.local.set({ notificationsEnabled: enabled });
  });
}

// Listen for storage changes to sync toggle if changed from popup
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.notificationsEnabled) {
    const toggleInput = document.getElementById('zakonchil-toggle-input');
    if (toggleInput) {
      const enabled = changes.notificationsEnabled.newValue;
      toggleInput.checked = enabled;
      
      const slider = document.querySelector('.zakonchil-slider');
      const knob = document.querySelector('.zakonchil-slider-knob');
      if (slider && knob) {
        if (enabled) {
          slider.style.backgroundColor = '#10a37f';
          knob.style.transform = 'translateX(14px)';
        } else {
          slider.style.backgroundColor = '#ccc';
          knob.style.transform = 'translateX(0)';
        }
      }
    }
  }
});

// Start observing the body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});

console.log('Zakonchil: Content script loaded and observing...');

// content.js - Monitors ChatGPT for generation completion

let isGenerating = false;
let checkTimeout = null;

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
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

// Start observing the body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});

console.log('Zakonchil: Content script loaded and observing...');

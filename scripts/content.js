// content.js - Monitors ChatGPT for generation completion

let isGenerating = false;

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutations) => {
  // Check for the presence of elements with the 'result-streaming' class
  // ChatGPT adds this class to the current response element while it's being generated
  const streamingElements = document.querySelectorAll('.result-streaming');
  
  if (streamingElements.length > 0) {
    if (!isGenerating) {
      console.log('Zakonchil: ChatGPT started generating...');
      isGenerating = true;
    }
  } else {
    if (isGenerating) {
      // Check if generation actually finished or if it was just a brief pause
      // Sometimes multiple elements are created, so we wait a tiny bit to be sure
      setTimeout(() => {
        const stillStreaming = document.querySelectorAll('.result-streaming').length > 0;
        if (!stillStreaming && isGenerating) {
          console.log('Zakonchil: ChatGPT finished generating!');
          isGenerating = false;
          notifyCompletion();
        }
      }, 500);
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

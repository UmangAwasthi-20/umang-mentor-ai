// DOM elements
const apiKeyInput = document.getElementById('apiKey');
const modelSelect = document.getElementById('modelSelect');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const clearBtn = document.getElementById('clearBtn');
const messageDiv = document.getElementById('message');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// Image upload for options page
const optionImageUpload = document.getElementById('optionImageUpload');
const optionImagePreviewList = document.getElementById('option-image-preview-list');
const optionSendBtn = document.getElementById('optionSendBtn');
let optionAttachedImages = [];
const MAX_IMAGES = 8;

// Default settings
const DEFAULT_SETTINGS = {
  openrouter_api_key: '',
  selected_model: 'mistralai/mistral-small-3.2-24b-instruct:free'
};

// Initialize the options page
async function initialize() {
  try {
    // Load saved settings
    const result = await chrome.storage.local.get(['openrouter_api_key', 'selected_model']);
    
    // Set form values
    apiKeyInput.value = result.openrouter_api_key || '';
    modelSelect.value = result.selected_model || DEFAULT_SETTINGS.selected_model;
    
    // Update status indicator
    updateStatusIndicator(!!result.openrouter_api_key);
    
  } catch (error) {
    console.error('Error loading settings:', error);
    showMessage('Error loading settings. Please try refreshing the page.', 'error');
  }
}

// Save settings
async function saveSettings() {
  const apiKey = apiKeyInput.value.trim();
  const selectedModel = modelSelect.value;
  
  // Validate API key
  if (!apiKey) {
    showMessage('Please enter your OpenRouter API key.', 'error');
    return;
  }
  
  if (!apiKey.startsWith('sk-or-v1-')) {
    showMessage('Invalid API key format. Please check your OpenRouter API key.', 'error');
    return;
  }
  
  try {
    // Save to storage
    await chrome.storage.local.set({
      openrouter_api_key: apiKey,
      selected_model: selectedModel
    });
    
    // Update status
    updateStatusIndicator(true);
    
    showMessage('Settings saved successfully!', 'success');
    
    // Clear message after 3 seconds
    setTimeout(() => {
      hideMessage();
    }, 3000);
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showMessage('Error saving settings. Please try again.', 'error');
  }
}

// Test API connection
async function testConnection() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showMessage('Please enter your API key first.', 'error');
    return;
  }
  
  if (!apiKey.startsWith('sk-or-v1-')) {
    showMessage('Invalid API key format.', 'error');
    return;
  }
  
  try {
    // Disable buttons during test
    testBtn.disabled = true;
    testBtn.textContent = '🧪 Testing...';
    
    // Test the connection by sending a simple request
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelSelect.value,
        messages: [
          {
            role: 'user',
            content: 'Hello! This is a test message from Umang Mentor AI.'
          }
        ],
        max_tokens: 50
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      showMessage('✅ Connection successful! Your API key is working.', 'success');
      updateStatusIndicator(true);
    } else {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = '❌ Connection failed.';
      
      if (response.status === 401) {
        errorMessage = '❌ Invalid API key. Please check your OpenRouter API key.';
      } else if (response.status === 429) {
        errorMessage = '❌ Rate limit exceeded. Please try again later.';
      } else if (response.status === 402) {
        errorMessage = '❌ Insufficient credits. Please add credits to your OpenRouter account.';
      } else {
        errorMessage = `❌ Error ${response.status}: ${errorData.error?.message || response.statusText}`;
      }
      
      showMessage(errorMessage, 'error');
      updateStatusIndicator(false);
    }
    
  } catch (error) {
    console.error('Connection test error:', error);
    showMessage('❌ Connection test failed. Please check your internet connection.', 'error');
    updateStatusIndicator(false);
  } finally {
    // Re-enable buttons
    testBtn.disabled = false;
    testBtn.textContent = '🧪 Test Connection';
  }
}

// Clear all data
async function clearData() {
  if (!confirm('Are you sure you want to clear all settings? This will remove your API key and reset all preferences.')) {
    return;
  }
  
  try {
    // Clear storage
    await chrome.storage.local.clear();
    
    // Reset form
    apiKeyInput.value = '';
    modelSelect.value = DEFAULT_SETTINGS.selected_model;
    
    // Update status
    updateStatusIndicator(false);
    
    showMessage('All data cleared successfully.', 'success');
    
    setTimeout(() => {
      hideMessage();
    }, 3000);
    
  } catch (error) {
    console.error('Error clearing data:', error);
    showMessage('Error clearing data. Please try again.', 'error');
  }
}

// Update status indicator
function updateStatusIndicator(isConnected) {
  const statusDot = statusIndicator.querySelector('.status-dot');
  
  if (isConnected) {
    statusIndicator.className = 'status-indicator connected';
    statusDot.className = 'status-dot connected';
    statusText.textContent = 'Connected';
  } else {
    statusIndicator.className = 'status-indicator disconnected';
    statusDot.className = 'status-dot disconnected';
    statusText.textContent = 'Not configured';
  }
}

// Show message
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  // Scroll to message
  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Hide message
function hideMessage() {
  messageDiv.style.display = 'none';
}

// Toggle API key visibility
function toggleApiKeyVisibility() {
  const type = apiKeyInput.type === 'password' ? 'text' : 'password';
  apiKeyInput.type = type;
}

// Event listeners
saveBtn.addEventListener('click', saveSettings);
testBtn.addEventListener('click', testConnection);
clearBtn.addEventListener('click', clearData);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 's') {
      e.preventDefault();
      saveSettings();
    }
  }
});

// Auto-save on input change (with debounce)
let saveTimeout;
apiKeyInput.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (apiKeyInput.value.trim() && apiKeyInput.value.startsWith('sk-or-v1-')) {
      saveSettings();
    }
  }, 1000);
});

modelSelect.addEventListener('change', () => {
  saveSettings();
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initialize);

// Handle page visibility change (for when user switches tabs)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Reload settings when page becomes visible
    initialize();
  }
});

optionImageUpload.addEventListener('change', handleOptionImageUpload);
optionSendBtn.addEventListener('click', sendOptionImagesToAI);

function handleOptionImageUpload(e) {
  setTimeout(() => {
    const files = Array.from(e.target.files);
    if (optionAttachedImages.length + files.length > MAX_IMAGES) {
      showMessage(`❌ You can attach up to ${MAX_IMAGES} images per message.`, 'error');
      return;
    }
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      optionAttachedImages.push(file);
    }
    renderOptionImagePreviews();
    optionImageUpload.value = '';
  }, 10);
}

function renderOptionImagePreviews() {
  optionImagePreviewList.innerHTML = '';
  optionAttachedImages.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'image-preview';
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-image-btn';
      removeBtn.innerHTML = '×';
      removeBtn.onclick = () => {
        optionAttachedImages.splice(idx, 1);
        renderOptionImagePreviews();
      };
      wrapper.appendChild(img);
      wrapper.appendChild(removeBtn);
      optionImagePreviewList.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
  });
}

function clearOptionImagePreviews() {
  optionAttachedImages = [];
  optionImagePreviewList.innerHTML = '';
}

function fileToBase64Payload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        type: 'image',
        data: reader.result.split(',')[1],
        mime_type: file.type,
        name: file.name
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function sendOptionImagesToAI() {
  if (optionAttachedImages.length === 0) {
    showMessage('Please select at least one image to send.', 'error');
    return;
  }
  optionSendBtn.disabled = true;
  optionSendBtn.textContent = 'Sending...';
  try {
    const imagePayloads = await Promise.all(optionAttachedImages.map(fileToBase64Payload));
    // Use a default prompt or ask user for a prompt (could add a text input if desired)
    const prompt = 'Please analyze the attached images.';
    const response = await chrome.runtime.sendMessage({
      action: 'getAIResponse',
      prompt,
      images: imagePayloads
    });
    if (response && response.ok) {
      showMessage('✅ Images sent! AI response: ' + (response.text || ''), 'success');
    } else {
      showMessage(response?.text || '❌ An error occurred. Please try again.', 'error');
    }
  } catch (error) {
    showMessage('❌ Failed to send images. Please try again.', 'error');
  } finally {
    optionSendBtn.disabled = false;
    optionSendBtn.textContent = 'Send with Images';
    clearOptionImagePreviews();
  }
} 
import { fetchWithRetry } from './helpers/backoff.js';

// API key should be stored in chrome.storage.local and set by user
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'mistralai/mistral-small-3.2-24b-instruct:free';

// JEE-specific system prompt
const SYSTEM_PROMPT = `You are Umang Mentor AI, a specialized tutor for JEE (Joint Entrance Examination) and board exam preparation. 

Your expertise includes:
- Physics, Chemistry, and Mathematics for JEE Main & Advanced
- Problem-solving strategies and step-by-step explanations
- Board exam preparation guidance
- Study tips and time management
- Concept clarification with examples

Always provide:
1. Clear, step-by-step explanations
2. Relevant formulas and concepts
3. Practice tips when appropriate
4. Encouraging and supportive responses

Keep responses concise but comprehensive, suitable for students preparing for competitive exams.`;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action !== 'getAIResponse') return;

  (async () => {
    try {
      // Get API key and model from storage
      const result = await chrome.storage.local.get(['openrouter_api_key', 'selected_model']);
      const apiKey = result.openrouter_api_key;
      const selectedModel = result.selected_model || DEFAULT_MODEL;
      
      if (!apiKey) {
        sendResponse({ 
          ok: false, 
          text: '❌ API key not found. Please set your OpenRouter API key in the extension options (right-click extension icon → Options).' 
        });
        return;
      }

      // Build message array with optional image attachments
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
      ];
      // User message with or without images
      if (msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
        // Mistral expects: content: [{ type: 'text', text: ... }, { type: 'image', ... }, ...]
        const content = [
          { type: 'text', text: msg.prompt || '' },
          ...msg.images.map(img => ({ type: 'image', data: img.data, mime_type: img.mime_type, name: img.name }))
        ];
        messages.push({ role: 'user', content });
      } else {
        messages.push({ role: 'user', content: msg.prompt });
      }

      const body = {
        model: selectedModel,
        messages,
        max_tokens: 1000,
        temperature: 0.7
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      };

      console.log('🔍 Sending request to OpenRouter...');
      
      const data = await fetchWithRetry(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      console.log('✅ OpenRouter response received');
      const text = data.choices?.[0]?.message?.content || 'No response received';
      sendResponse({ ok: true, text });
    } catch (err) {
      console.error('❌ OpenRouter error:', err);
      let errorMessage = 'An error occurred while processing your request.';
      
      if (err.message.includes('401')) {
        errorMessage = '❌ Invalid API key. Please check your OpenRouter API key in the options page.';
      } else if (err.message.includes('429')) {
        errorMessage = '❌ Rate limit exceeded. Please try again in a moment.';
      } else if (err.message.includes('402')) {
        errorMessage = '❌ Insufficient credits. Please add credits to your OpenRouter account.';
      } else if (err.message.includes('503')) {
        errorMessage = '❌ Service temporarily unavailable. Please try again.';
      }
      
      sendResponse({ ok: false, text: errorMessage });
    }
  })();

  return true; // Keep port open for async response
});

// Handle API key storage
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'setApiKey') {
    chrome.storage.local.set({ openrouter_api_key: msg.apiKey }, () => {
      sendResponse({ ok: true });
    });
    return true;
  }
  
  if (msg.action === 'getApiKey') {
    chrome.storage.local.get(['openrouter_api_key'], (result) => {
      sendResponse({ apiKey: result.openrouter_api_key || '' });
    });
    return true;
  }
  
  if (msg.action === 'getSettings') {
    chrome.storage.local.get(['openrouter_api_key', 'selected_model'], (result) => {
      sendResponse({ 
        apiKey: result.openrouter_api_key || '',
        selectedModel: result.selected_model || DEFAULT_MODEL
      });
    });
    return true;
  }
});

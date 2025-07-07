const chatWindow = document.getElementById('chat-window');
const userInput  = document.getElementById('user-input');
const sendBtn    = document.getElementById('send-btn');
const loading    = document.getElementById('loading');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const mainContent = document.querySelector('.main-content');
const apiKeyInput = document.getElementById('api-key-input');
const saveBtn = document.getElementById('save-btn');
const backBtn = document.getElementById('back-btn');
const settingsMessage = document.getElementById('settings-message');
const imageUpload = document.getElementById('image-upload');
const imagePreviewList = document.getElementById('image-preview-list');
const clearChatBtn = document.getElementById('clear-chat-btn');

let isSettingsOpen = false;
let conversationHistory = [];
let attachedImages = [];
const MAX_IMAGES = 8;

async function initialize() {
  const result = await chrome.runtime.sendMessage({ action: 'getSettings' });
  if (!result.apiKey) {
    showApiKeyPrompt();
  } else {
    apiKeyInput.value = result.apiKey;
  }
}

function showApiKeyPrompt() {
  const welcomeMessage = document.querySelector('.welcome-message');
  if (welcomeMessage) {
    welcomeMessage.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h3 style="color: #667eea; margin-bottom: 10px;">🔑 Setup Required</h3>
        <p style="color: #666; margin-bottom: 15px;">
          To get started, you need to configure your OpenRouter API key.
        </p>
        <button id="openOptionsBtn" style="
          background: #667eea; 
          color: white; 
          border: none; 
          padding: 10px 20px; 
          border-radius: 6px; 
          cursor: pointer;
          font-size: 14px;
        ">⚙️ Open Options</button>
        <p style="font-size: 12px; color: #999; margin-top: 10px;">
          Or right-click the extension icon → Options
        </p>
      </div>
    `;
    
    document.getElementById('openOptionsBtn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
}

// Typewriter effect for AI response
async function typewriterAddMessage(fullText, sender, isHtml = false) {
  const div = document.createElement('div');
  div.className = `message ${sender}-message`;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  if (isHtml) {
    // Instantly insert full HTML for AI responses so KaTeX renders correctly
    div.innerHTML = fullText;
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return;
  }
  // Only use typewriter for plain text
  fullText = escapeHtml(fullText).replace(/\n/g, '<br>');
  let i = 0;
  function typeNext() {
    div.innerHTML = fullText.slice(0, i);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    if (i < fullText.length) {
      i += 8 + Math.floor(Math.random() * 4); // much faster
      setTimeout(typeNext, 2 + Math.random() * 8); // much faster
    } else {
      div.innerHTML = fullText;
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }
  typeNext();
}

function addMessage(text, sender, isHtml = false, editable = false) {
  const div = document.createElement('div');
  div.className = `message ${sender}-message`;
  if (isHtml) {
    div.innerHTML = text;
  } else {
    const sanitizedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    div.innerHTML = sanitizedText;
  }
  // Only show edit icon on the most recent user message
  if (editable && sender === 'user') {
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.title = 'Edit';
    editBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5zm12.71-7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.76 3.76 1.83-1.83z" fill="#888"/></svg>';
    editBtn.onclick = () => {
      userInput.value = text;
      userInput.focus();
    };
    div.appendChild(editBtn);
  }
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  conversationHistory.push({ role: sender, content: text });
}

function renderAIResponse(rawText) {
  // Remove all HTML tags except <br> (to preserve line breaks)
  let text = rawText.replace(/<(?!br\b)[^>]+>/g, '');

  // Parse markdown to HTML (bold, italics, code, lists, etc.)
  if (window.marked) {
    text = marked.parse(text, { breaks: true });
  } else {
    // Fallback: simple bold/italics/code regex
    text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
               .replace(/\*(.+?)\*/g, '<i>$1</i>')
               .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  // Section headings to detect
  const sectionTitles = [
    'Mechanism', 'Example', 'Key Points', 'Final Product', 'Applications', 'Limitations', 'Practice Tip', 'Summary', 'Final Answer', 'Overall Reaction', 'Step', 'Product', 'Reactants', 'Reaction', 'Explanation'
  ];

  // Split into lines for block processing
  let lines = text.split(/<br\s*\/?>/i);
  let blocks = [];
  let currentSection = null;
  let currentContent = [];

  function pushSection() {
    if (currentSection || currentContent.length > 0) {
      let html = '';
      if (currentSection) {
        html += `<div class="ai-section-title">${currentSection}</div>`;
      }
      html += currentContent.map(renderChemLine).join('');
      // Subject detection
      let blockClass = 'ai-section';
      const sectionText = (currentSection || '').toLowerCase() + ' ' + currentContent.join(' ').toLowerCase();
      if (/physics|velocity|force|acceleration|vector|motion|energy|work|power|newton|kinematics|dynamics|projectile|gravity|friction|momentum|impulse|circular|rotation|magnet|electric|field|current|circuit|wave|oscillation|thermo|fluid|pressure|optics|sound|relativity|quantum/.test(sectionText)) {
        blockClass = 'ai-physics';
      } else if (/chemistry|reaction|mole|compound|element|atom|molecule|bond|acid|base|salt|organic|inorganic|reimer|tiemann|carbene|phenol|aldehyde|ester|ketone|amine|aromatic|alkane|alkene|alkyne|hydrocarbon|oxidation|reduction|titration|stoichiometry|equilibrium|ion|anion|cation|solubility|precipitate|electrolysis|polymer|synthesis|hydrolysis|esterification|nucleophile|electrophile|substitution|addition|elimination|isomer|chirality|enantiomer|diastereomer|racemic|reagent|solvent|product|reactant|yield|enthalpy|entropy|gibbs|lewis|brønsted|arrhenius|coordination|complex|transition|metal|halogen|alkali|alkaline|earth|alkali|alkaline|earth|halide|nitrate|sulfate|carbonate|phosphate|hydroxide|oxide|peroxide|superoxide|ozone|ammonia|urea|cyanide|thiol|ether|epoxide|phenol|aniline|benzene|toluene|xylene|styrene|phenanthrene|naphthalene|anthracene|pyridine|pyrrole|furan|thiophene|imidazole|purine|pyrimidine|nucleic|amino|peptide|protein|enzyme|carbohydrate|lipid|fatty|acid|sugar|glucose|fructose|sucrose|lactose|cellulose|starch|glycogen|chitin|pectin|hemicellulose|lignin|chlorophyll|hemoglobin|myoglobin|cytochrome|ferrocene|fullerene|graphene|nanotube|zeolite|clay|mineral|ore|alloy|ceramic|glass|polymer|plastic|rubber|resin|adhesive|paint|dye|pigment|ink|detergent|soap|surfactant|emulsion|colloid|gel|sol|foam|aerosol|suspension|precipitate|crystal|amorphous|solid|liquid|gas|plasma|solution|mixture|homogeneous|heterogeneous|phase|transition|melting|freezing|boiling|condensation|sublimation|deposition|evaporation|distillation|filtration|centrifugation|chromatography|spectroscopy|mass|spectrometry|nmr|ir|uv|visible|x-ray|diffraction|microscopy|titration|calorimetry|potentiometry|conductometry|polarimetry|refractometry|thermogravimetry|dsc|tga|thermal|analysis|surface|area|porosity|adsorption|desorption|isotherm|BET|Langmuir|Freundlich|Temkin|Dubinin|Radushkevich|Brunauer|Emmett|Teller|Langmuir|Freundlich|Temkin|Dubinin|Radushkevich|Brunauer|Emmett|Teller|Langmuir|Freundlich|Temkin|Dubinin|Radushkevich|Brunauer|Emmett|Teller/.test(sectionText)) {
        blockClass = 'ai-chemistry';
      } else if (/math|mathematics|algebra|geometry|calculus|integral|derivative|sum|product|limit|function|equation|theorem|proof|vector|matrix|determinant|eigenvalue|eigenvector|logarithm|exponential|trigonometry|sine|cosine|tangent|cotangent|secant|cosecant|series|sequence|permutation|combination|probability|statistics|mean|median|mode|variance|standard deviation|distribution|binomial|normal|poisson|chi-square|regression|correlation|random|variable|sample|population|hypothesis|test|confidence|interval|z-score|t-score|p-value|f-test|anova|bayes|bayesian|markov|monte carlo|simulation|optimization|linear|nonlinear|differential|equation|partial|ordinary|laplace|fourier|transform|discrete|continuous|graph|network|node|edge|vertex|path|cycle|tree|spanning|connected|component|clique|planar|bipartite|directed|undirected|weighted|unweighted|adjacency|incidence|matrix|degree|centrality|betweenness|closeness|eigenvector|pagerank|community|detection|modularity|partition|cut|flow|matching|cover|coloring|chromatic|number|independent|set|dominating|hamiltonian|eulerian|tour|walk|trail|circuit|cycle|path|distance|diameter|radius|center|periphery|bridge|articulation|point|block|component|core|shell|k-core|k-shell|clique|core|shell|k-core|k-shell|clique|core|shell|k-core|k-shell|clique/.test(sectionText)) {
        blockClass = 'ai-math';
      } else if (currentSection && /final answer|summary|answer|conclusion/i.test(currentSection)) {
        blockClass = 'ai-answer';
      }
      blocks.push(`<div class="${blockClass}">${html}</div>`);
    }
    currentSection = null;
    currentContent = [];
  }

  function renderChemLine(line) {
    // If a line contains a reaction and other text, split and render separately
    const reactionRegex = /(.*?)(\s(?:→|->|⇒|=>)\s.*)/;
    if (reactionRegex.test(line)) {
      const parts = line.split(/(\s(?:→|->|⇒|=>)\s.*)/);
      let html = '';
      if (parts[0].trim()) {
        html += `<div>${parts[0].trim()}</div>`;
      }
      for (let i = 1; i < parts.length; ++i) {
        if (parts[i] && /\s(?:→|->|⇒|=>)\s/.test(parts[i])) {
          html += `<div class="chem-reaction">${renderMathBlocks(parts[i].trim())}</div>`;
        } else if (parts[i] && parts[i].trim()) {
          html += `<div>${parts[i].trim()}</div>`;
        }
      }
      return html;
    }
    // If the whole line is a reaction
    if (/^.*\s(→|->|⇒|=>)\s.*$/.test(line.trim())) {
      return `<div class="chem-reaction">${renderMathBlocks(line.trim())}</div>`;
    }
    // Render math/chemistry blocks
    line = renderMathBlocks(line);
    // Add <br> for plain lines
    return `<div>${line}</div>`;
  }

  // Universal math/chemistry rendering
  function renderMathBlocks(str) {
    // Preprocess: Convert [ ... ] to $...$ if it looks like math
    str = str.replace(/\[([^\]]+)\]/g, (match, inner) => {
      // Only wrap if it looks like math (contains =, +, -, ^, \\ or \)
      if (/[=+\-^\\]/.test(inner)) {
        return `$${inner}$`;
      }
      return match;
    });
    // Preprocess: Convert [ ... ] (markdown style) to $...$ if it looks like math
    str = str.replace(/\[([^\]]+)\]/g, (match, inner) => {
      if (/[=+\-^\\]/.test(inner)) {
        return `$${inner}$`;
      }
      return match;
    });
    // Preprocess: bare LaTeX like \sqrt{...} not inside $...$
    str = str.replace(/(^|\s)(\\[a-zA-Z]+\{[^}]+\})/g, (match, pre, latex) => {
      // Only wrap if not already inside $...$
      if (!/\$[^$]*$/.test(pre)) {
        return `${pre}$${latex}$`;
      }
      return match;
    });
    // Render \ce{...} (chemistry)
    str = str.replace(/\\ce\{([^}]+)\}/g, (match, ce) => {
      if (window.katex) {
        try {
          return katex.renderToString(`\\ce{${ce}}`, { throwOnError: false });
        } catch {
          return `<code>${ce}</code>`;
        }
      } else {
        return `<code>${ce}</code>`;
      }
    });
    // Render $$...$$ (display math)
    str = str.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
      if (window.katex) {
        try {
          return katex.renderToString(math, { throwOnError: false, displayMode: true });
        } catch {
          return `<pre>${math}</pre>`;
        }
      } else {
        return `<pre>${math}</pre>`;
      }
    });
    // Render $...$ (inline math)
    str = str.replace(/\$([^$]+)\$/g, (match, math) => {
      if (window.katex) {
        try {
          return katex.renderToString(math, { throwOnError: false });
        } catch {
          return `<code>${math}</code>`;
        }
      } else {
        return `<code>${math}</code>`;
      }
    });
    // Render \[...\] (display math)
    str = str.replace(/\\\[([\s\S]+?)\\\]/g, (match, math) => {
      if (window.katex) {
        try {
          return katex.renderToString(math, { throwOnError: false, displayMode: true });
        } catch {
          return `<pre>${math}</pre>`;
        }
      } else {
        return `<pre>${math}</pre>`;
      }
    });
    // Render \(...\) (inline math)
    str = str.replace(/\\\(([^)]+)\\\)/g, (match, math) => {
      if (window.katex) {
        try {
          return katex.renderToString(math, { throwOnError: false });
        } catch {
          return `<code>${math}</code>`;
        }
      } else {
        return `<code>${math}</code>`;
      }
    });
    return str;
  }

  // After all blocks, if the last block contains a final answer pattern, wrap it in green
  function finalizeBlocks() {
    if (blocks.length > 0) {
      const answerPattern = /(the set\s*A\s*is|the answer is|final answer|summary)/i;
      let lastBlock = blocks[blocks.length - 1];
      if (!/ai-answer/.test(lastBlock) && answerPattern.test(lastBlock)) {
        blocks[blocks.length - 1] = lastBlock.replace('ai-section', 'ai-answer');
      }
    }
  }

  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i].trim();
    if (!line) continue;
    // Section heading
    let matched = sectionTitles.find(title => line.toLowerCase().startsWith(title.toLowerCase()));
    if (matched) {
      pushSection();
      currentSection = line;
    } else {
      currentContent.push(line);
    }
  }
  pushSection();
  finalizeBlocks();

  return blocks.join('');
}

function renderMath(math) {
  if (window.katex) {
    try {
      return katex.renderToString(math, { throwOnError: false });
    } catch {
      return `<span style="font-family:monospace;background:#f4f4f4;padding:2px 6px;border-radius:4px;">${escapeHtml(math)}</span>`;
    }
  } else {
    return `<span style="font-family:monospace;background:#f4f4f4;padding:2px 6px;border-radius:4px;">${escapeHtml(math)}</span>`;
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function getAIResponse(prompt) {
  if (!prompt.trim() && attachedImages.length === 0) return;
  
  loading.style.display = 'block';
  sendBtn.disabled = true;
  userInput.disabled = true;
  imageUpload.disabled = true;

  try {
    // Prepare image data as base64
    const imagePayloads = await Promise.all(attachedImages.map(fileToBase64Payload));
    const response = await chrome.runtime.sendMessage({
      action: 'getAIResponse',
      prompt: prompt.trim(),
      images: imagePayloads
    });
    
    if (response && response.ok) {
      // Typewriter effect for AI response
      typewriterAddMessage(renderAIResponse(response.text), 'ai', true);
    } else {
      addMessage(response?.text || '❌ An error occurred. Please try again.', 'ai');
    }
  } catch (error) {
    console.error('Error getting AI response:', error);
    addMessage('❌ Failed to get response. Please check your connection and try again.', 'ai');
  } finally {
    loading.style.display = 'none';
    sendBtn.disabled = false;
    userInput.disabled = false;
    imageUpload.disabled = false;
    userInput.focus();
    clearImagePreviews();
  }
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text && attachedImages.length === 0) return;
  
  if (text.length > 1000) {
    addMessage('❌ Message too long. Please keep it under 1000 characters.', 'ai');
    return;
  }
  
  addMessage(text, 'user', false, true);
  userInput.value = '';
  getAIResponse(text);
}

function showSettings() {
  isSettingsOpen = true;
  mainContent.style.display = 'none';
  settingsPanel.style.display = 'block';
  apiKeyInput.focus();
}

function hideSettings() {
  isSettingsOpen = false;
  mainContent.style.display = 'flex';
  settingsPanel.style.display = 'none';
  userInput.focus();
}

async function saveApiKey() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    showSettingsMessage('❌ Please enter your API key.', 'error');
    return;
  }
  
  if (!apiKey.startsWith('sk-or-v1-')) {
    showSettingsMessage('❌ Invalid API key format. Please check your OpenRouter API key.', 'error');
    return;
  }
  
  try {
    await chrome.runtime.sendMessage({ action: 'setApiKey', apiKey });
    showSettingsMessage('✅ API key saved successfully!', 'success');
    
    setTimeout(() => {
      hideSettings();
      location.reload();
    }, 1500);
  } catch (error) {
    showSettingsMessage('❌ Failed to save API key. Please try again.', 'error');
  }
}

function showSettingsMessage(message, type) {
  settingsMessage.innerHTML = `<div class="${type}-message">${message}</div>`;
  setTimeout(() => {
    settingsMessage.innerHTML = '';
  }, 3000);
}

// Image upload logic
imageUpload.addEventListener('change', handleImageUpload);

function handleImageUpload(e) {
  // Use setTimeout to defer processing, reducing risk of popup closing
  setTimeout(() => {
    const files = Array.from(e.target.files);
    if (attachedImages.length + files.length > MAX_IMAGES) {
      addMessage(`❌ You can attach up to ${MAX_IMAGES} images per message.`, 'ai');
      return;
    }
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      attachedImages.push(file);
    }
    renderImagePreviews();
    imageUpload.value = '';
  }, 10);
}

function renderImagePreviews() {
  imagePreviewList.innerHTML = '';
  attachedImages.forEach((file, idx) => {
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
        attachedImages.splice(idx, 1);
        renderImagePreviews();
      };
      wrapper.appendChild(img);
      wrapper.appendChild(removeBtn);
      imagePreviewList.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
  });
}

function clearImagePreviews() {
  attachedImages = [];
  imagePreviewList.innerHTML = '';
}

function fileToBase64Payload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Mistral expects: { type: 'image', data: base64, mime_type: ... }
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

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

settingsBtn.addEventListener('click', showSettings);
backBtn.addEventListener('click', hideSettings);
saveBtn.addEventListener('click', saveApiKey);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isSettingsOpen) {
    hideSettings();
  }
});

document.addEventListener('DOMContentLoaded', initialize);

window.addEventListener('focus', async () => {
  if (!isSettingsOpen) {
    const result = await chrome.runtime.sendMessage({ action: 'getSettings' });
    if (!result.apiKey) {
      showApiKeyPrompt();
    }
  }
});

// Detect if popup is closed after file dialog (fallback warning)
window.addEventListener('blur', () => {
  setTimeout(() => {
    if (document.visibilityState === 'hidden') {
      // Optionally, you could store a flag in storage to show a warning next time
      // But Chrome popups can't persist state after closing
      // So, best practice: recommend using the options page for image uploads if this keeps happening
    }
  }, 200);
});

clearChatBtn.addEventListener('click', () => {
  chatWindow.innerHTML = '';
  conversationHistory = [];
  // Show welcome message again
  const welcomeMessage = document.createElement('div');
  welcomeMessage.className = 'welcome-message';
  welcomeMessage.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h3 style="color: #667eea; margin-bottom: 10px;">🎓 Welcome to Umang Mentor AI</h3>
      <p style="color: #666; margin-bottom: 15px;">
        Ask me anything about JEE, Boards, Physics, Chemistry, or Math!
      </p>
    </div>
  `;
  chatWindow.appendChild(welcomeMessage);
});

// Ensure only the most recent user message is editable
function updateEditableUserMessage() {
  const userMessages = Array.from(chatWindow.querySelectorAll('.user-message'));
  userMessages.forEach((msg, idx) => {
    const editBtn = msg.querySelector('.edit-btn');
    if (editBtn) editBtn.remove();
    if (idx === userMessages.length - 1) {
      // Add edit icon to the last user message
      const text = conversationHistory.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.title = 'Edit';
      editBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5zm12.71-7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.76 3.76 1.83-1.83z" fill="#888"/></svg>';
      editBtn.onclick = () => {
        userInput.value = text;
        userInput.focus();
      };
      msg.appendChild(editBtn);
    }
  });
}

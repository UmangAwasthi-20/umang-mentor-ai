# 🎓 Umang Mentor AI

A Chrome extension that provides AI-powered tutoring for JEE (Joint Entrance Examination) and board exam preparation. Get instant help with Physics, Chemistry, and Mathematics concepts, problem-solving strategies, and study guidance.

## ✨ Features

- **🎯 JEE-Specific Tutoring**: Specialized AI trained for JEE Main & Advanced preparation
- **📚 Multi-Subject Support**: Physics, Chemistry, and Mathematics
- **💡 Step-by-Step Explanations**: Clear, detailed problem-solving approaches
- **⏰ Study Tips & Time Management**: Personalized guidance for exam preparation
- **🔒 Secure**: Your API key is stored locally and never shared
- **🎨 Modern UI**: Clean, intuitive interface with smooth animations
- **⚡ Fast Responses**: Optimized for quick, helpful responses
- **⚙️ Dedicated Options Page**: Easy configuration and API key management
- **🧪 Connection Testing**: Built-in tools to verify your API setup
- **🔄 Multiple AI Models**: Choose from different AI models for responses

## 🚀 Installation

### Method 1: Load Unpacked Extension (Development)

1. **Clone or Download** this repository
   ```bash
   git clone https://github.com/yourusername/umang-mentor-ai.git
   cd umang-mentor-ai
   ```

2. **Open Chrome** and navigate to `chrome://extensions/`

3. **Enable Developer Mode** by toggling the switch in the top-right corner

4. **Click "Load unpacked"** and select the `extension` folder from this repository

5. **Pin the extension** to your toolbar for easy access

### Method 2: Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon for easy installation.

## ⚙️ Setup

### 1. Get Your OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account or sign in
3. Navigate to your [API Keys](https://openrouter.ai/keys) page
4. Create a new API key
5. Copy the key (starts with `sk-or-v1-`)

### 2. Configure the Extension

**Method 1: Options Page (Recommended)**
1. **Right-click the extension icon** in your Chrome toolbar
2. **Select "Options"** from the context menu
3. **Paste your API key** in the input field
4. **Click "Save Settings"** to store your key securely
5. **Test the connection** using the "Test Connection" button

**Method 2: Popup Settings**
1. **Click the extension icon** in your Chrome toolbar
2. **Click the settings gear (⚙️)** in the top-right corner
3. **Paste your API key** in the input field
4. **Click "Save"** to store your key securely

## 📖 Usage

### Getting Started

1. **Click the extension icon** in your Chrome toolbar
2. **Ask any question** about JEE topics:
   - Physics concepts and problems
   - Chemistry reactions and mechanisms
   - Mathematics formulas and solutions
   - Study strategies and time management

### Example Questions

- *"Explain the concept of projectile motion with examples"*
- *"How do I solve quadratic equations using the quadratic formula?"*
- *"What are the key points to remember for organic chemistry reactions?"*
- *"Give me tips for managing time during JEE preparation"*
- *"Explain the concept of limits in calculus"*

### Tips for Best Results

- **Be specific**: Instead of "help with physics", ask "explain Newton's laws of motion"
- **Include context**: Mention if you're preparing for JEE Main or Advanced
- **Ask for examples**: Request step-by-step solutions for better understanding
- **Use follow-up questions**: Build on previous responses for deeper learning

## 🔧 Technical Details

### Architecture

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Chrome Extension Service Worker
- **AI Provider**: OpenRouter API with Mistral AI model
- **Storage**: Chrome Storage API for secure API key storage

### Files Structure

```
extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI interface
├── popup.js              # Frontend logic
├── options.html          # Options page for settings
├── options.js            # Options page logic
├── bg.js                 # Background service worker
├── helpers/
│   └── backoff.js        # Retry logic for API calls
└── icons/
    ├── 16.png            # Extension icons
    ├── 32.png
    └── 128.png
```

### Permissions

- `storage`: To securely store your API key
- `host_permissions`: To communicate with OpenRouter API

## 🛠️ Development

### Prerequisites

- Google Chrome browser
- Basic knowledge of HTML, CSS, and JavaScript
- OpenRouter API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/umang-mentor-ai.git
   cd umang-mentor-ai
   ```

2. **Load the extension** in Chrome (see Installation section)

3. **Make changes** to the code

4. **Reload the extension** in `chrome://extensions/` to see changes

### Building for Production

1. **Test thoroughly** in development mode
2. **Update version** in `manifest.json`
3. **Zip the extension folder** for distribution
4. **Submit to Chrome Web Store** (if publishing)

## 🔒 Security & Privacy

- **API Key Storage**: Your OpenRouter API key is stored locally using Chrome's secure storage
- **No Data Collection**: The extension doesn't collect or store any personal data
- **Secure Communication**: All API calls use HTTPS
- **Local Processing**: All processing happens locally in your browser

## 🐛 Troubleshooting

### Common Issues

**"API key not found"**
- Make sure you've entered your OpenRouter API key in the options page
- Right-click the extension icon → Options to configure
- Check that the key starts with `sk-or-v1-`

**"Invalid API key"**
- Verify your API key is correct
- Use the "Test Connection" button in the options page
- Ensure you have sufficient credits in your OpenRouter account

**"Rate limit exceeded"**
- Wait a few moments before trying again
- Consider upgrading your OpenRouter plan for higher limits

**Extension not loading**
- Check that Developer Mode is enabled in Chrome
- Ensure all files are present in the extension folder
- Try reloading the extension

### Getting Help

If you encounter issues:

1. **Check the console** for error messages (F12 → Console)
2. **Verify your API key** is correctly set
3. **Test your API key** on the OpenRouter website
4. **Create an issue** on GitHub with details

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter** for providing the AI API infrastructure
- **Mistral AI** for the powerful language model
- **Chrome Extensions Team** for the excellent platform
- **JEE Community** for inspiration and feedback

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/umang-mentor-ai/issues)
- **Email**: support@umangmentor.ai
- **Documentation**: [Wiki](https://github.com/yourusername/umang-mentor-ai/wiki)

---

**Made with ❤️ for JEE aspirants**

*Empowering students to achieve their dreams through AI-powered learning*

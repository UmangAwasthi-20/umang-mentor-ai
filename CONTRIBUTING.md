# Contributing to Umang Mentor AI

Thank you for your interest in contributing to Umang Mentor AI! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** to see if the bug has already been reported
2. **Create a new issue** with a clear title and description
3. **Include steps to reproduce** the bug
4. **Add screenshots** if applicable
5. **Specify your browser version** and extension version

### Suggesting Features

1. **Check existing issues** to see if the feature has already been suggested
2. **Create a new issue** with the "enhancement" label
3. **Describe the feature** in detail
4. **Explain the benefits** for JEE students
5. **Provide examples** of how it would work

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following the coding guidelines
4. **Test your changes** thoroughly
5. **Commit your changes** with clear commit messages
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Create a Pull Request** with a detailed description

## 🛠️ Development Setup

### Prerequisites

- Google Chrome browser
- Basic knowledge of HTML, CSS, and JavaScript
- Git for version control
- OpenRouter API key for testing

### Local Development

1. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/umang-mentor-ai.git
   cd umang-mentor-ai
   ```

2. **Load the extension** in Chrome:
   - Open `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Make your changes**

4. **Test thoroughly**:
   - Test with different API keys
   - Test error scenarios
   - Test UI responsiveness
   - Test accessibility features

5. **Reload the extension** to see changes

## 📝 Coding Guidelines

### JavaScript

- Use **ES6+ features** (arrow functions, const/let, template literals)
- Follow **camelCase** for variables and functions
- Use **PascalCase** for classes
- Add **JSDoc comments** for functions
- Handle **errors gracefully** with try-catch blocks
- Use **async/await** for asynchronous operations

### HTML

- Use **semantic HTML5** elements
- Include **proper ARIA labels** for accessibility
- Keep **structure clean** and well-organized
- Use **meaningful class names**

### CSS

- Use **flexbox** and **CSS Grid** for layouts
- Follow **BEM methodology** for class naming
- Use **CSS custom properties** for theming
- Ensure **responsive design**
- Include **hover and focus states**

### General

- **Keep functions small** and focused
- **Add comments** for complex logic
- **Use meaningful variable names**
- **Follow existing code style**
- **Test edge cases**

## 🧪 Testing Guidelines

### Manual Testing

1. **API Key Management**:
   - Test setting/updating API key
   - Test invalid API key handling
   - Test missing API key scenarios

2. **Chat Functionality**:
   - Test message sending/receiving
   - Test long messages
   - Test special characters
   - Test error responses

3. **UI/UX**:
   - Test responsive design
   - Test keyboard navigation
   - Test accessibility features
   - Test loading states

4. **Error Handling**:
   - Test network errors
   - Test API rate limits
   - Test invalid responses

### Automated Testing (Future)

We plan to add automated testing using:
- **Jest** for unit tests
- **Puppeteer** for integration tests
- **ESLint** for code quality
- **Prettier** for code formatting

## 📋 Pull Request Guidelines

### Before Submitting

1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Check for linting errors**
4. **Ensure all tests pass**
5. **Update version** in `manifest.json` if needed

### PR Description

Include:
- **Summary** of changes
- **Motivation** for the change
- **Testing details**
- **Screenshots** (if UI changes)
- **Related issues**

### Code Review

- **Address review comments** promptly
- **Make requested changes**
- **Add tests** if suggested
- **Update documentation** if needed

## 🏷️ Issue Labels

We use the following labels:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issues
- `priority: low` - Low priority issues

## 📞 Getting Help

If you need help:

1. **Check the documentation** in the README
2. **Search existing issues** for similar problems
3. **Ask in discussions** or create an issue
4. **Join our community** (details coming soon)

## 🎉 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes**
- **Project documentation**

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Umang Mentor AI! 🎓 
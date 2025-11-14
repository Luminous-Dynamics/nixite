# Contributing to Nixite

Thank you for your interest in contributing to Nixite! We welcome contributions from everyone.

## 🎯 Ways to Contribute

### 1. Add New Packages
Help expand our package database by adding new packages to `nixite-packages.json`:

```json
{
  "id": "package-nixos-name",
  "name": "Display Name",
  "description": "Brief, clear description of what this does",
  "category": "create|connect|grow|work|play|secure|manage|serve"
}
```

**Package Guidelines:**
- Use the official NixOS package name for the `id` field
- Write descriptions that explain **what** the package does, not just **what** it is
- Descriptions should be helpful for non-technical users
- Assign to the most appropriate category

### 2. Improve Documentation
- Fix typos or unclear instructions
- Add usage examples
- Translate documentation to other languages
- Improve code comments

### 3. Fix Bugs
- Check our [Issues](https://github.com/Luminous-Dynamics/nixite/issues) page
- Comment on the issue you want to work on
- Submit a fix with a clear description

### 4. Suggest Features
- Open an issue describing your feature idea
- Explain the use case and benefits
- Be open to feedback and discussion

### 5. Improve Accessibility
We're committed to making Nixite accessible to everyone:
- Test with screen readers
- Improve keyboard navigation
- Enhance color contrast
- Add ARIA labels where needed

## 🚀 Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/nixite.git
   cd nixite
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Test thoroughly
   - Update documentation if needed

4. **Test your changes**
   ```bash
   # Start the development server
   ./start.sh

   # Open http://localhost:8000 and test your changes
   ```

## 📝 Commit Guidelines

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding tests
- **chore**: Maintenance tasks

### Examples
```
feat(packages): add 10 new creative applications

Added popular creative tools including Krita, Darktable,
and GIMP plugins to enhance the Create category.

Closes #123
```

```
fix(voice): improve voice recognition accuracy

Updated voice input to better handle natural language
queries and added fallback for unsupported browsers.
```

## 🔍 Code Review Process

1. Submit your pull request
2. Maintainers will review within 48 hours
3. Address any feedback
4. Once approved, we'll merge!

## 📋 Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code follows existing style and patterns
- [ ] All tests pass (if applicable)
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] No merge conflicts with main branch
- [ ] Changes are focused and not too large
- [ ] Screenshots included for UI changes

## 🎨 Code Style

### JavaScript
- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing patterns in the codebase
- Use ES6+ features appropriately

### HTML/CSS
- Maintain semantic HTML structure
- Use existing CSS variables for theming
- Ensure responsive design
- Test on multiple browsers

### Package Data
- Alphabetize packages within categories
- Keep descriptions concise (under 100 characters)
- Verify package names against NixOS package search

## ❓ Questions?

- Open an issue for questions
- Tag with `question` label
- We're here to help!

## 📜 Code of Conduct

### Our Standards

- **Be welcoming**: We welcome contributors of all backgrounds and experience levels
- **Be respectful**: Treat others with respect and consideration
- **Be constructive**: Provide constructive feedback
- **Be patient**: Remember that everyone is learning

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling or insulting comments
- Personal attacks
- Publishing private information

## 🙏 Recognition

All contributors will be recognized in our:
- README.md contributors section
- Release notes for their contributions
- Special thanks in major releases

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for making Nixite better! 💜

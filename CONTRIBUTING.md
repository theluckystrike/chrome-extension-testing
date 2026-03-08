# Contributing to chrome-extension-testing

Thank you for your interest in contributing to chrome-extension-testing! This guide will help you get started with forking, setting up, and contributing to this project.

## How to Fork and Clone

1. **Fork the repository**: Click the "Fork" button on the [chrome-extension-testing GitHub page](https://github.com/theluckystrike/chrome-extension-testing)
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/chrome-extension-testing.git
   cd chrome-extension-testing
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/theluckystrike/chrome-extension-testing.git
   ```

## Development Setup

1. **Install Node.js**: Ensure you have Node.js 18+ installed
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run tests** to verify everything is working:
   ```bash
   npm test
   ```
4. **Run linting** to check code style:
   ```bash
   npm run lint
   ```

## Code Style Guidelines

- Written in TypeScript with strict mode enabled
- Follow the existing patterns in `src/mocks/` for new mock classes
- All public methods should have JSDoc comments
- Keep mock APIs consistent with the real Chrome extension API signatures
- Use Promises instead of callbacks to match Manifest V3 conventions
- Run `npm run lint` and fix any issues before committing

## How to Submit PRs

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes in the `src/` directory
3. Run `npm test` to verify nothing is broken
4. Run `npm run lint` to check code style
5. Commit your changes with a clear, descriptive message:
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```
6. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a Pull Request against the `main` branch
8. Fill out the PR template with all relevant details

## Issue Reporting Guidelines

When reporting issues, please include:

- **Clear description**: Describe the problem in detail
- **Version information**: Include the version of chrome-extension-testing, Node.js, and any relevant dependencies
- **Steps to reproduce**: Provide minimal, reproducible steps if possible
- **Expected vs actual behavior**: Explain what you expected to happen vs what actually happened
- **Environment details**: Include your OS, browser version, etc.

**Before reporting**: Check existing issues to avoid duplicates.

---

Built at [zovo.one](https://zovo.one) by [theluckystrike](https://github.com/theluckystrike)

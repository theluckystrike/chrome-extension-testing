# Contributing to chrome-extension-testing

Thanks for your interest in contributing. This document covers everything you need to get started.

REPORTING ISSUES

Open an issue on GitHub with a clear description of the problem. Include the version of chrome-extension-testing you are using, your Node and Jest versions, and a minimal reproduction if possible. Check existing issues before opening a new one.

DEVELOPMENT WORKFLOW

1. Fork and clone the repository
2. Install dependencies with npm install
3. Create a feature branch from main
4. Make your changes in the src/ directory
5. Run npm test to verify nothing is broken
6. Run npm run lint to check code style
7. Commit your changes with a clear message
8. Push your branch and open a pull request against main

CODE STYLE

- Written in TypeScript with strict mode enabled
- Follow the existing patterns in src/mocks/ for new mock classes
- All public methods should have JSDoc comments
- Keep mock APIs consistent with the real Chrome extension API signatures
- Use Promises instead of callbacks to match Manifest V3 conventions

TESTING

Run the full test suite with npm test. When adding a new mock or feature, include tests that cover the happy path and at least one edge case. Tests use Jest 29+.

LICENSE

By contributing you agree that your contributions will be licensed under the MIT license that covers this project.

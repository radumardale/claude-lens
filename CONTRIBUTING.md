# Contributing to claude-lens

Thanks for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/radumardale/claude-lens.git
   cd claude-lens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev           # Launch TUI
   npm run dev -- scan   # Run scan command
   ```

4. **Run tests**
   ```bash
   npm test              # Run all tests
   npm run test:watch    # Watch mode
   ```

5. **Type checking**
   ```bash
   npm run typecheck
   ```

## Project Structure

```
src/
├── cli/commands/     # CLI command handlers
├── scanner/          # Component discovery
├── actions/          # Enable/disable operations
├── tui/              # React/Ink terminal UI
│   ├── views/        # Full-screen views
│   ├── components/   # Reusable UI components
│   └── hooks/        # React hooks
├── formatters/       # Output formatting
├── types/            # TypeScript interfaces
└── utils/            # Shared utilities
```

## Making Changes

### Before You Start

- Check existing [issues](https://github.com/radumardale/claude-lens/issues) to see if someone is already working on it
- For larger changes, open an issue first to discuss the approach

### Code Style

- TypeScript strict mode is enabled
- Use meaningful variable and function names
- Keep functions focused and small
- Add types for all function parameters and return values
- Avoid adding comments unless the logic is non-obvious

### Commits

- Use [conventional commits](https://www.conventionalcommits.org/):
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for code changes that don't add features or fix bugs
  - `docs:` for documentation changes
  - `test:` for test changes
- Keep commits focused and atomic
- Write clear, concise commit messages

### Pull Requests

1. Fork the repository and create a branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Ensure type checking passes: `npm run typecheck`
5. Push to your fork and submit a pull request

### PR Guidelines

- Keep PRs focused on a single change
- Include a clear description of what the PR does
- Link to any related issues
- Be responsive to feedback

## Testing

- Add tests for new functionality
- Tests live in `src/__tests__/`
- Run the full test suite before submitting a PR

## Questions?

Feel free to open an issue if you have questions or need help getting started.

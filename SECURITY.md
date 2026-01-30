# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in claude-lens, please report it responsibly.

**Do not open a public issue for security vulnerabilities.**

Instead, please email the maintainer directly or use GitHub's private vulnerability reporting feature.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 1 week
- **Resolution timeline**: Depends on severity, but typically within 30 days

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.2   | :x:                |

## Security Considerations

claude-lens is a local CLI tool that:

- Reads Claude Code configuration files from your filesystem
- Does not make network requests (except for npm updates)
- Does not collect or transmit any data
- Stores its own configuration in `~/.claude-lens/`

The tool only modifies files when you explicitly enable/disable or delete components.

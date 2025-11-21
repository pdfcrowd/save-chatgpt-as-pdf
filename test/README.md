# Test Suite for Save ChatGPT as PDF Extension

## Overview

This test suite provides comprehensive testing for the Chrome extension,
focusing on the compression features and DOM manipulation added in recent
commits.

## Quick Start

```bash
# Install dependencies (first time only)
make install

# Run tests
make test

# Run with coverage
make test-coverage

# Watch mode for development
make test-watch
```

## Test Structure

### Fixtures (`fixtures/`)
- `chat.html` - Large real-world ChatGPT conversation example
- `simple-chat.html` - Basic chat structure for quick tests

### Unit Tests (`unit/`)
- `compression.test.js` - Tests for data compression/decompression

## Key Test Coverage

### Compression (from commit a206816)
- Data compression when size > 500KB threshold
- Gzip compression and base64 encoding
- Round-trip compression/decompression integrity
- Handling of Unicode and special characters

### DOM Cleanup (from commit a206816)
- Removal of scripts and styles
- Removal of `.absolute.z-0`, `.absolute.z-1` elements
- Removal of `#AIPRM__sidebar`
- Preservation of chat content

## Available Commands

### Using makefile
```bash
make help           # Show all available commands
make install        # Install dependencies
make test           # Run all tests
make test-watch     # Run tests in watch mode
make test-coverage  # Run with coverage report
make test-unit      # Run only unit tests
make lint           # Run linting checks
make clean          # Clean test artifacts
```

### Using npm directly
```bash
npm test            # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage
```

## Testing Approach

Since ChatGPT.com has anti-automation protections, we use:
1. Mock HTML fixtures that replicate ChatGPT's DOM structure
2. JSDOM for browser environment simulation
3. Mocked Chrome extension APIs

## Chrome API Mocks

The test setup provides mocks for:
- `chrome.runtime.*`
- `chrome.storage.*`
- `chrome.tabs.*`
- `chrome.action.*`

## Notes

- Tests are isolated and don't require a running Chrome instance
- The test folder is added to `.gitignore` to keep it local
- Coverage reports are generated in `test/coverage/`
- All dependencies are contained within this test folder

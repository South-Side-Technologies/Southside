# Playwright CLI Commands Reference

## Overview
Playwright CLI provides useful commands for testing and debugging. Use `--headed` flag to always see the browser window.

## Important: Testing URL
Always test against the production/staging URL, NOT localhost:
```bash
https://southside.brandonslab.work
```

This URL is configured in `playwright.config.ts` as the baseURL.

## Main Commands

### Open Browser
```bash
# Open page in specified browser with headed mode
npx playwright open --headed [url]

# Open in Chromium (headed)
npx playwright cr --headed [url]

# Open in Firefox (headed)
npx playwright ff --headed [url]

# Open in WebKit (headed)
npx playwright wk --headed [url]
```

### Code Generation
```bash
# Open page and generate code for user actions
npx playwright codegen --headed [url]
```

### Screenshots & PDFs
```bash
# Capture a page screenshot
npx playwright screenshot [options] <url> <filename>

# Example:
npx playwright screenshot https://example.com screenshot.png

# Save page as PDF
npx playwright pdf [options] <url> <filename>

# Example:
npx playwright pdf https://example.com page.pdf
```

### Testing
```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/example.spec.ts

# Run tests matching pattern
npx playwright test [test-filter...]

# Run tests in debug mode
npx playwright test --debug

# Run tests with UI mode (interactive)
npx playwright test --ui
```

### Browser Management
```bash
# Install browsers
npx playwright install

# Install specific browser
npx playwright install chromium

# Install browser dependencies
npx playwright install-deps

# Uninstall browsers
npx playwright uninstall
```

### Debugging & Reporting
```bash
# Show trace viewer
npx playwright show-trace [trace-file]

# Show HTML test report
npx playwright show-report

# Merge multiple reports
npx playwright merge-reports [dir]
```

### Utility Commands
```bash
# Clear build and test caches
npx playwright clear-cache

# Get version
npx playwright --version

# Show help for specific command
npx playwright help [command]
```

## Common Flags

| Flag | Description |
|------|-------------|
| `--headed` | Run in headed mode (see browser window) |
| `--debug` | Run in debug mode with inspector |
| `--ui` | Run with interactive UI mode |
| `-b, --browser` | Specify browser (chromium, firefox, webkit) |
| `--retries [num]` | Retry failed tests |
| `--timeout [ms]` | Set test timeout |
| `--workers [num]` | Number of parallel workers |

## Typical Workflow

1. **Generate tests** (interactive):
   ```bash
   npx playwright codegen --headed https://southside.brandonslab.work
   ```

2. **Run tests in headed mode**:
   ```bash
   npx playwright test --headed
   ```

3. **Debug a specific test**:
   ```bash
   npx playwright test tests/example.spec.ts --headed --debug
   ```

4. **View test report**:
   ```bash
   npx playwright show-report
   ```

## Notes
- `--headed` flag makes browser visible (default is headless)
- `--debug` opens Playwright Inspector for step-by-step debugging
- `--ui` provides interactive test runner UI
- Use `npx playwright help [command]` for detailed help on any command

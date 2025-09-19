# unpkg-white-list Repository

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

This is a Node.js project that maintains allowlists for unpkg functionality on npmmirror.com. The repository manages whitelisted packages and scopes in the main `package.json` file to prevent security issues with unpkg access.

## Working Effectively

### Initial Setup
- Run `npm install` - takes approximately 1 second (up to 7 seconds on first install). NEVER CANCEL. Set timeout to 30+ seconds.
- No build step required - this project manages JSON configuration files.

### Testing
- Run `npm test` - validates all allowlisted packages and scopes. Takes approximately 1-2 seconds but can take longer as the whitelist grows. NEVER CANCEL. Set timeout to 60+ seconds.
  - Validates 6200+ packages in allowPackages section
  - Validates 250+ scopes in allowScopes section
  - Checks for duplicates and semver compliance
- Run `npm run ci` - alias for npm test

### Linting
- Run `npm run lint` - uses ESLint with JSON validation. Takes 1-2 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
- ALWAYS run linting before committing changes or CI will fail
- ESLint validates JSON syntax and enforces alphabetical sorting of packages and scopes

### Adding Packages and Scopes
- Add a new package: `npm run add -- "--pkg={package-name}:{version-range}"`
  - Example: `npm run add -- "--pkg=lodash:*"`
  - Example: `npm run add -- "--pkg=react:^18.0.0"`
- Add a new scope: `npm run add -- "--scope=@{scope-name}"`
  - Example: `npm run add -- "--scope=@babel"`
  - Example: `npm run add -- "--scope=@types"`
- View help: `npm run add -- "--help"`

### Debug Mode
- Use `DEBUG=true` environment variable for verbose output when adding packages/scopes
  - Example: `DEBUG=true npm run add -- "--pkg=test-package:*"`
  - Creates `package_draft.json` instead of modifying main `package.json`

## Validation Requirements

### Manual Testing Scenarios
After making changes to allowPackages or allowScopes:
1. ALWAYS run `npm test` to validate all entries
2. ALWAYS run `npm run lint` to ensure proper formatting
3. Verify the package.json file structure remains intact
4. Check that new packages follow semver format requirements
5. Ensure scopes start with '@' prefix
6. Confirm no duplicate entries exist

### Common Validation Commands
```bash
# Full validation sequence (NEVER CANCEL these commands)
npm install     # 30+ second timeout
npm test       # 60+ second timeout  
npm run lint   # 30+ second timeout
```

## Repository Structure

### Key Files
- `package.json` - Main configuration containing allowPackages and allowScopes
- `scripts/generate.js` - CLI tool for adding new packages and scopes
- `test/index.js` - Validation tests for packages and scopes
- `eslint.config.mjs` - ESLint configuration with JSON validation rules
- `.github/workflows/nodejs.yml` - CI pipeline using node-modules/github-actions

### Important Sections in package.json
- `allowPackages` - Object mapping package names to version ranges
- `allowScopes` - Array of npm scopes (organizations) starting with '@'
- Both sections are automatically sorted alphabetically

## CI/CD Pipeline

### GitHub Actions
- Uses `node-modules/github-actions/.github/workflows/node-test.yml@master`
- Runs on Node.js 20 with ubuntu-latest
- Triggers on push to master, pull requests, and merge groups
- Automatic release workflow publishes to npm on master branch changes

### Timing Expectations
- npm install: ~1 second (up to 7 seconds on first install)
- npm test: ~1-2 seconds (may increase with more packages)
- npm run lint: ~1-2 seconds
- Total CI run: ~10-30 seconds

## Common Tasks

### Repository Root Contents
```
.
├── .github/
│   └── workflows/
│       ├── nodejs.yml
│       └── release.yml
├── scripts/
│   └── generate.js
├── test/
│   └── index.js
├── CHANGELOG.md
├── README.md
├── package.json (18,900+ lines with allowlists)
├── eslint.config.mjs
└── LICENSE
```

### Package.json Structure
- Lines 1-33: Standard npm package metadata
- Lines 34-283: allowScopes array (250+ entries)
- Lines 284-18924: allowPackages object (6200+ entries)

## Error Prevention

### Common Pitfalls
- Do NOT manually edit package.json allowPackages/allowScopes - use the generate script
- Do NOT add packages without proper semver version ranges (will error: "Invalid version range")
- Do NOT add scopes without '@' prefix  
- Do NOT add duplicate packages (will error: "Package {name} already exists")
- Do NOT skip linting - it enforces critical sorting requirements
- Do NOT cancel long-running validation commands

### Validation Failures
- If tests fail, check for:
  - Invalid semver ranges in package versions
  - Duplicate package names
  - Missing '@' prefix on scopes
  - Packages that should be covered by existing scopes
- Run `DEBUG=true npm run add` to test changes without modifying main package.json

### Required Commands Before Commit
```bash
npm run lint    # NEVER CANCEL - 30+ second timeout
npm test       # NEVER CANCEL - 60+ second timeout
```

Both must pass for CI to succeed. The project has zero tolerance for linting or test failures.
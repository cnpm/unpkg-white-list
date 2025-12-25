module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of these (semantic-release compatible)
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature (triggers minor release)
        'fix',      // Bug fix (triggers patch release)
        'docs',     // Documentation only changes
        'style',    // Changes that don't affect meaning (formatting, etc)
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvements (triggers patch release)
        'test',     // Adding or updating tests
        'build',    // Changes to build system or dependencies
        'ci',       // Changes to CI configuration files
        'chore',    // Other changes that don't modify src or test files
        'revert',   // Reverts a previous commit
      ],
    ],
    // Subject case should be lower case
    'subject-case': [2, 'never', ['upper-case', 'pascal-case']],
    // Type is required
    'type-empty': [2, 'never'],
    // Subject is required
    'subject-empty': [2, 'never'],
    // Body should have a blank line before it
    'body-leading-blank': [1, 'always'],
    // Footer should have a blank line before it
    'footer-leading-blank': [1, 'always'],
    // Maximum header length
    'header-max-length': [2, 'always', 100],
  },
};

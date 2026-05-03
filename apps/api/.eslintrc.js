module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'boundaries'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:boundaries/recommended',
  ],
  settings: {
    'boundaries/elements': [
      { type: 'core', pattern: 'src/modules/*/core' },
      { type: 'ports', pattern: 'src/modules/*/ports' },
      { type: 'adapters', pattern: 'src/modules/*/adapters' },
      { type: 'application', pattern: 'src/modules/*/application' },
      { type: 'shared', pattern: 'src/shared/**' },
    ],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            from: 'core',
            allow: ['core'], // Core is pure
          },
          {
            from: 'ports',
            allow: ['core', 'ports'],
          },
          {
            from: 'application',
            allow: ['core', 'ports', 'application'],
          },
          {
            from: 'adapters',
            allow: ['core', 'ports', 'shared'],
          },
        ],
      },
    ],
  },
};

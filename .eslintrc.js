module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 13,
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint', 'simple-import-sort', 'prettier'],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        semi: false,
        singleQuote: true,
        trailingComma: 'none'
      }
    ],
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn'
  },

  settings: {
    react: {
      version: 'detect'
    }
  }
}

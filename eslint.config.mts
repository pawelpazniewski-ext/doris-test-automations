import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPlaywright from 'eslint-plugin-playwright';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  { ignores: ['node_modules/**', 'dist/**', 'playwright-report/**', 'test-results/**', 'package-lock.json', 'global-setup.ts', 'salesforce.util.ts'] },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
        },
      ],

      'no-unused-private-class-members': 'warn',

      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],

      'no-restricted-syntax': [
        'error',
        {
          selector: "AwaitExpression > CallExpression[callee.object.name='page'][callee.property.name='pause'], CallExpression[callee.object.name='page'][callee.property.name='pause']",
          message: "Usuń 'await page.pause()' lub 'page.pause()'",
        },
        {
          selector: "MemberExpression[property.name='only'][object.name='test']",
          message: 'Usuń test.only przed mergem do main!',
        },
      ],
      'max-len': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts', 'tests/**/*.ts'],
    plugins: { playwright: eslintPluginPlaywright },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'playwright/no-nested-step': 'off',
      'playwright/valid-title': 'off',
      'playwright/expect-expect': 'off',
    },
  },
  prettierRecommended,
];

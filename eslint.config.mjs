// Reglas de eslint-config-bloq (el preset del monorepo de Hemi) traducidas a flat config,
// encima de las de Next 16. bloq 4.8.2 solo soporta ESLint 8 y eslint-config-next 16 pide ESLint 9.
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import checkFile from 'eslint-plugin-check-file'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import markdownlint from 'eslint-plugin-markdownlint'
import markdownlintParser from 'eslint-plugin-markdownlint/parser.js'
import preferArrow from 'eslint-plugin-prefer-arrow'
import promise from 'eslint-plugin-promise'
import react from 'eslint-plugin-react'
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys'

const jsFiles = ['**/*.{js,jsx,mjs,ts,tsx}']

// bloq (index): eslint:recommended + promise/recommended + estas reglas
const bloqBase = {
  files: jsFiles,
  plugins: {
    'prefer-arrow': preferArrow,
    promise,
    'sort-destructure-keys': sortDestructureKeys,
  },
  rules: {
    ...promise.configs['flat/recommended'].rules,
    'arrow-body-style': ['warn', 'never'],
    'camelcase': ['warn', { properties: 'never' }],
    'complexity': ['warn', 10],
    'consistent-return': 'warn',
    'curly': ['warn', 'all'],
    'eqeqeq': ['error', 'always'],
    'max-params': ['warn', 4],
    'new-cap': ['warn', { capIsNewExceptionPattern: '^Big$' }],
    'no-alert': 'warn',
    'no-console': 'warn',
    'no-else-return': 'warn',
    'no-multi-assign': 'error',
    'no-param-reassign': 'warn',
    'no-return-assign': 'warn',
    'no-shadow': 'warn',
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    'no-use-before-define': 'error',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'prefer-arrow/prefer-arrow-functions': [
      'warn',
      { disallowPrototype: false, singleReturnOnly: true },
    ],
    'prefer-template': 'warn',
    'promise/always-return': 'off',
    'promise/catch-or-return': ['error', { allowFinally: true }],
    'promise/no-nesting': 'off',
    'sort-destructure-keys/sort-destructure-keys': [
      'warn',
      { caseSensitive: false },
    ],
    'sort-keys': ['warn', 'asc', { caseSensitive: false, natural: true }],
    'strict': ['error', 'safe'],
  },
}

// bloq/esm
const bloqEsm = {
  files: jsFiles,
  rules: {
    'import/order': [
      'warn',
      {
        'alphabetize': { caseInsensitive: true, order: 'asc' },
        'groups': [['builtin', 'external'], ['internal', 'parent'], 'sibling'],
        'newlines-between': 'always',
      },
    ],
    'no-duplicate-imports': 'warn',
    'sort-imports': 'off',
  },
}

// bloq/react (los plugins ya los registra eslint-config-next)
const bloqReact = {
  files: ['src/**/*.{js,jsx,ts,tsx}'],
  rules: {
    ...react.configs.flat.recommended.rules,
    ...jsxA11y.flatConfigs.recommended.rules,
    'react/jsx-sort-props': 'warn',
    'react/no-unknown-property': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/incompatible-library': 'off',
    'react-hooks/refs': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/set-state-in-effect': 'off',
  },
}

// bloq/typescript y el override de src del prompt
const bloqTypescript = {
  files: ['**/*.{ts,tsx}'],
  rules: {
    '@typescript-eslint/no-shadow': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { ignoreRestSiblings: true },
    ],
    'no-shadow': 'off',
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
  },
}

// Convenciones del equipo que antes vivían solo en el CLAUDE.md
const conventions = {
  files: ['src/**/*.{ts,tsx}'],
  plugins: {
    '@eslint-community/eslint-comments': eslintComments,
    'check-file': checkFile,
  },
  rules: {
    // Un eslint-disable siempre dice por qué: `// eslint-disable-next-line regla -- motivo`
    '@eslint-community/eslint-comments/require-description': 'error',
    // T[] y no Array<T>
    '@typescript-eslint/array-type': ['error', { default: 'array' }],
    // type y no interface
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    // unknown y no any
    '@typescript-eslint/no-explicit-any': 'error',
    // Nombres de archivo en camelCase (page, layout y route ya lo cumplen)
    'check-file/filename-naming-convention': [
      'error',
      { 'src/**/*.{ts,tsx}': 'CAMEL_CASE' },
      { ignoreMiddleExtensions: true },
    ],
    // Desde 3 parámetros, un objeto
    'max-params': ['error', 2],
    'no-restricted-syntax': [
      'error',
      {
        message:
          'Una función con más de un statement va como `function`, no como arrow.',
        selector:
          'VariableDeclarator > ArrowFunctionExpression[body.type="BlockStatement"]',
      },
      {
        message:
          'Sin tipo de retorno explícito: dejá que TypeScript lo infiera.',
        selector: ':function[returnType]',
      },
      {
        message:
          'Exportá inline (`export function` / `export const`), no con una lista aparte.',
        selector: 'ExportNamedDeclaration[declaration=null][source=null]',
      },
      {
        message: 'Usá filter/map/reduce en lugar de un loop.',
        selector:
          'ForStatement, ForInStatement, ForOfStatement, WhileStatement, DoWhileStatement',
      },
    ],
  },
}

// bloq/markdown y las reglas del prompt
const markdown = {
  files: ['**/*.md'],
  languageOptions: { parser: markdownlintParser },
  plugins: { markdownlint },
  rules: {
    ...markdownlint.configs.recommended.rules,
    'markdownlint/md001': 'warn',
    'markdownlint/md004': ['warn', { style: 'dash' }],
    'markdownlint/md010': 'warn',
    'markdownlint/md013': 'off',
    'markdownlint/md014': 'warn',
    'markdownlint/md024': ['warn', { siblings_only: true }],
    'markdownlint/md028': 'warn',
    'markdownlint/md029': 'warn',
    'markdownlint/md033': ['warn', { allowed_elements: ['br', 'img'] }],
    'markdownlint/md034': 'warn',
    'markdownlint/md040': 'warn',
    'markdownlint/md041': 'warn',
    'markdownlint/md045': 'warn',
  },
}

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  bloqBase,
  bloqEsm,
  bloqReact,
  bloqTypescript,
  conventions,
  prettier,
  markdown,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
    // `next dev` reescribe su bloque
    'AGENTS.md',
    // Solo importa AGENTS.md (`@AGENTS.md`)
    'CLAUDE.md',
  ]),
])

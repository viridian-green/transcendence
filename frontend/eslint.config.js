import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-plugin-prettier';

export default defineConfig([
	globalIgnores(['dist', 'node_modules', 'build']),
	{
		files: ['**/*.{ts,tsx,js,jsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			sourceType: 'module',
		},
		plugins: {
			prettier,
		},
		rules: {
			'prettier/prettier': 'error',
			semi: ['warn', 'always'],
		},
	},
]);

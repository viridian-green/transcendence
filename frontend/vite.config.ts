import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	base: '/',
	plugins: [tailwindcss(), react(), tsConfigPaths()],
	preview: {
		port: 8080,
		strictPort: true,
	},
	server: {
		port: 5173,
		strictPort: true,
		host: true,
		origin: 'http://0.0.0.0:5173',
	},
});

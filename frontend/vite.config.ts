import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

const isDocker = process.env.DOCKER === 'true';

export default defineConfig({
	base: '/',
	plugins: [react(), tsConfigPaths(), tailwindcss()],
	preview: {
		port: 8080,
		strictPort: true,
	},
	server: {
		port: 5173,
		strictPort: true,
		// this is crucial, because Docker can not bind to localhost
		host: isDocker ? '0.0.0.0' : '127.0.0.1',
		//host: true
	},
});

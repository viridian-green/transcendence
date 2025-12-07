/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				retro: ['Retro', 'sans-serif'],
				'retro-large': ['Retro Large', 'sans-serif'],
				'retro-slim': ['Retro Slim', 'sans-serif'],
			},
		},
	},
	plugins: [],
};

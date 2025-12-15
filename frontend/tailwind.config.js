/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				retro: ['Retro', 'sans-serif'],
				bit: ['Bit', 'sans-serif'],
				'bit-large': ['Bit Large', 'sans-serif'],
				'bit-slim': ['Bit Slim', 'sans-serif'],
			},
		},
	},
	plugins: [],
};

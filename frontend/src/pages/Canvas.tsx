import { useEffect, useRef } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 8;

const Canvas = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Initial centered state
	const stateRef = useRef({
		ball: {
			x: CANVAS_WIDTH / 2,
			y: CANVAS_HEIGHT / 2,
		},
		paddles: {
			left: {
				y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
			},
			right: {
				y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
			},
		},
		scores: {
			left: 0,
			right: 0,
		},
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		// maybe return an error message here

		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;

		const draw = () => {
			const { ball, paddles, scores } = stateRef.current;

			// Background
			ctx.fillStyle =
				getComputedStyle(document.documentElement).getPropertyValue('--color-bg') ||
				'#121212';
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			// Net
			ctx.fillStyle =
				getComputedStyle(document.documentElement).getPropertyValue('--color-border') ||
				'#2a2a2a';
			for (let y = 0; y < CANVAS_HEIGHT; y += 24) {
				ctx.fillRect(CANVAS_WIDTH / 2 - 2, y, 6, 12);
			}

			// Ball
			ctx.fillStyle =
				getComputedStyle(document.documentElement).getPropertyValue(
					'--color-accent-pink',
				) || '#e60076';
			ctx.beginPath();
			ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
			ctx.fill();

			// Paddles
			ctx.fillStyle =
				getComputedStyle(document.documentElement).getPropertyValue(
					'--color-accent-pink',
				) || '#e60076';
			ctx.fillRect(20, paddles.left.y, PADDLE_WIDTH, PADDLE_HEIGHT);
			ctx.fillRect(
				CANVAS_WIDTH - 20 - PADDLE_WIDTH,
				paddles.right.y,
				PADDLE_WIDTH,
				PADDLE_HEIGHT,
			);

			// Scores
			ctx.fillStyle =
				getComputedStyle(document.documentElement).getPropertyValue(
					'--color-text-primary',
				) || '##d4d4d4';
			ctx.font = '32px Retro, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(`${scores.left}`, CANVAS_WIDTH / 4, 48);
			ctx.fillText(`${scores.right}`, (CANVAS_WIDTH / 4) * 3, 48);
		};

		const loop = () => {
			draw();
			requestAnimationFrame(loop);
		};

		loop();
	}, []);

	return <canvas ref={canvasRef} className='border-border rounded-xl border-6 shadow-lg' />;
};

export default Canvas;

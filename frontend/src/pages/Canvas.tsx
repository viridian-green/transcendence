import type { GameState } from '@/shared.types';
import { useEffect, useRef } from 'react';

// TODO export to shared const file
export const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 8;

interface CanvasProps {
	gameState: GameState | null;
}

const Canvas = ({ gameState }: CanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;

		const draw = () => {
			ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			// Background
			ctx.fillStyle = '#121212';
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			// Net
			ctx.fillStyle = '#2a2a2a';
			for (let y = 0; y < CANVAS_HEIGHT; y += 24) {
				ctx.fillRect(CANVAS_WIDTH / 2 - 2, y, 6, 12);
			}

			// Show loading state if no game state yet
			if (!gameState) {
				ctx.fillStyle = '#d4d4d4';
				ctx.font = '24px Retro, sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText('Waiting for game...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
				return;
			}

			// Countdown overlay
			if (gameState.phase === 'countdown') {
				ctx.fillStyle = '#e60076';
				ctx.font = '96px Retro, sans-serif';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(String(gameState.countdown), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
			}

			// Ball (hide during countdown)
			if (gameState.phase !== 'countdown') {
				ctx.fillStyle = '#e60076';
				ctx.beginPath();
				ctx.arc(gameState.ball.x, gameState.ball.y, BALL_RADIUS, 0, Math.PI * 2);
				ctx.fill();
			}

			// Paddles
			ctx.fillStyle = '#e60076';
			ctx.fillRect(20, gameState.paddles.left.y, PADDLE_WIDTH, PADDLE_HEIGHT);
			ctx.fillRect(
				CANVAS_WIDTH - 20 - PADDLE_WIDTH,
				gameState.paddles.right.y,
				PADDLE_WIDTH,
				PADDLE_HEIGHT,
			);

			// Scores
			ctx.fillStyle = '#d4d4d4';
			ctx.font = '32px Retro, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(`${gameState.scores.left}`, CANVAS_WIDTH / 4, 48);
			ctx.fillText(`${gameState.scores.right}`, (CANVAS_WIDTH / 4) * 3, 48);
		};

		draw();
	}, [gameState]);

	return (
		<canvas
			ref={canvasRef}
			className='border-border rounded-xl border-6 shadow-lg h-auto w-full max-w-full'
		/>
	);
};

export default Canvas;

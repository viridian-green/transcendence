import type { GamePhase } from '@/shared.types';
import { useEffect, useRef } from 'react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 8;

interface CanvasProps {
	gamePhase: GamePhase;
	setGamePhase: (gamePhase: GamePhase) => void;
}

const Canvas = ({ gamePhase, setGamePhase }: CanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const sequence = ['3', '2', '1', 'GO!'] as const;

	const sequenceIndexRef = useRef(0);
	const phaseStartTimeRef = useRef(0);

	useEffect(() => {
		setGamePhase('countdown');
		sequenceIndexRef.current = 0;
		phaseStartTimeRef.current = performance.now();
	}, [setGamePhase]);

	const updateSequence = () => {
		const now = performance.now();
		const elapsed = now - phaseStartTimeRef.current;

		if (elapsed >= 1000) {
			sequenceIndexRef.current += 1;
			phaseStartTimeRef.current = now;

			if (sequenceIndexRef.current >= sequence.length) {
				setGamePhase('playing');
			}
		}
	};

	const drawSequence = (ctx: CanvasRenderingContext2D, text: string, elapsed: number) => {
		const progress = Math.min(elapsed / 1000, 1);

		const scale = 0.8 + progress * 0.3;

		ctx.save();
		ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		ctx.scale(scale, scale);

		ctx.fillStyle = '#e60076';
		ctx.font = '96px Retro, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, 0, 0);

		ctx.restore();
	};

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

			ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			// Background
			ctx.fillStyle = '#121212';
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			// Net
			ctx.fillStyle = '#2a2a2a';
			for (let y = 0; y < CANVAS_HEIGHT; y += 24) {
				ctx.fillRect(CANVAS_WIDTH / 2 - 2, y, 6, 12);
			}

			// Ball
			ctx.fillStyle = gamePhase !== 'countdown' ? '#e60076' : 'rgba(0, 0, 0, 0)';
			ctx.beginPath();
			ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
			ctx.fill();

			// Paddles
			ctx.fillStyle = '#e60076';
			ctx.fillRect(20, paddles.left.y, PADDLE_WIDTH, PADDLE_HEIGHT);
			ctx.fillRect(
				CANVAS_WIDTH - 20 - PADDLE_WIDTH,
				paddles.right.y,
				PADDLE_WIDTH,
				PADDLE_HEIGHT,
			);

			// Scores
			ctx.fillStyle = '#d4d4d4';
			ctx.font = '32px Retro, sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(`${scores.left}`, CANVAS_WIDTH / 4, 48);
			ctx.fillText(`${scores.right}`, (CANVAS_WIDTH / 4) * 3, 48);
		};

		const loop = () => {
			draw();

			if (gamePhase !== 'playing') {
				updateSequence();

				const elapsed = performance.now() - phaseStartTimeRef.current;
				const text = sequence[sequenceIndexRef.current];

				if (text) {
					drawSequence(ctx, text, elapsed);
				}
			}

			requestAnimationFrame(loop);
		};

		loop();
	}, []);

	return <canvas ref={canvasRef} className='border-border rounded-xl border-6 shadow-lg' />;
};

export default Canvas;

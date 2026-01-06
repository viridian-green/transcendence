import { PinkButton } from '@/components';
import Canvas from './Canvas';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GameState } from '@/shared.types';

// TODO remove
const fakeGameStatePlaying: GameState = {
	phase: 'playing',
	ball: {
		x: 400, // Center horizontally
		y: 200, // Center vertically
	},
	paddles: {
		left: {
			y: 160, // Center vertically (200 - 80/2)
		},
		right: {
			y: 160, // Center vertically
		},
	},
	scores: {
		left: 3,
		right: 5,
	},
};

// TODO remove
const fakeGameStateCountdown: GameState = {
	phase: 'countdown',
	countdownText: '3',
	ball: {
		x: 400, // Center horizontally
		y: 200, // Center vertically
	},
	paddles: {
		left: {
			y: 160, // Center vertically (200 - 80/2)
		},
		right: {
			y: 160, // Center vertically
		},
	},
	scores: {
		left: 3,
		right: 5,
	},
};

const Game = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const leftPlayer = state?.leftPlayer ?? 'Player 1';
	const rightPlayer = state?.rightPlayer ?? 'Player 2';

	// TODO set to null
	const [gameState, setGameState] = useState<GameState>(fakeGameStatePlaying);
	// TODO remove
	console.log(setGameState, fakeGameStateCountdown);

	useEffect(() => {
		// TODO: Initialize WebSocket connection here
		const ws = new WebSocket("ws://localhost:3000/game");

		ws.onopen = () => {
		console.log("WS connected");
		ws.send(JSON.stringify({ type: 'PING' }));
		};

		ws.onmessage = (e) => console.log("message:", e.data);
		ws.onerror = (e) => console.error("WS error", e);
		ws.onclose = () => console.log("WS closed");

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.code === 'Escape') {
				navigate('/home');
			} else if (event.code === 'Space') {
				// handle paused state
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [navigate]);

	const handlePauseToggle = () => {
		// TODO: Send pause/resume command to server via WebSocket
		// ws.send(JSON.stringify({ type: 'TOGGLE_PAUSE' }));
	};

	useEffect(() => {
		if (gameState?.phase === 'ended') {
			const winner =
				gameState.scores.left > gameState.scores.right ? leftPlayer : rightPlayer;

			navigate('/game-end', {
				state: {
					gameEndData: {
						winner,
						leftPlayer,
						rightPlayer,
						scores: gameState.scores,
					},
				},
			});
		}
	}, [gameState, navigate, leftPlayer, rightPlayer]);

	return (
		<div className='bg-bg flex min-h-screen flex-col items-center justify-center gap-4'>
			<h1 className='text-accent-pink font-retro mb-4 text-4xl font-bold'>Game Room</h1>
			<div className='flex w-[800px] justify-between'>
				<p>{leftPlayer}</p>
				<p>{rightPlayer}</p>
			</div>
			<Canvas gameState={gameState} />
			<PinkButton
				className='text-accent-pink'
				text={gameState?.phase === 'paused' ? 'Resume' : 'Pause'}
				onClick={handlePauseToggle}
			/>
		</div>
	);
};

export default Game;

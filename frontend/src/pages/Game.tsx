import { PinkButton } from '@/components';
import Canvas from './Canvas';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GameState } from '@/shared.types';

// TODO remove - leaving it here for reference until game state from server is integrated
// const fakeGameStatePlaying: GameState = {
// 	phase: 'playing',
// 	ball: {
// 		x: 400, // Center horizontally
// 		y: 200, // Center vertically
// 	},
// 	paddles: {
// 		left: {
// 			y: 160, // Center vertically (200 - 80/2)
// 		},
// 		right: {
// 			y: 160, // Center vertically
// 		},
// 	},
// 	scores: {
// 		left: 3,
// 		right: 5,
// 	},
// };

// TODO remove - leaving it here for reference until countdown is implemented
// const fakeGameStateCountdown: GameState = {
// 	phase: 'countdown',
// 	countdownText: '3',
// 	ball: {
// 		x: 400, // Center horizontally
// 		y: 200, // Center vertically
// 	},
// 	paddles: {
// 		left: {
// 			y: 160, // Center vertically (200 - 80/2)
// 		},
// 		right: {
// 			y: 160, // Center vertically
// 		},
// 	},
// 	scores: {
// 		left: 0,
// 		right: 0,
// 	},
// };

const Game = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const leftPlayer = state?.leftPlayer ?? 'Player 1';
	const rightPlayer = state?.rightPlayer ?? 'Player 2';

	// game state from server
	const [gameState, setGameState] = useState<GameState | null>(null);

	// websocket reference
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		// FIXME - connect to WebSocket server, use proper URL
		const ws = new WebSocket('wss://localhost:3000/ws/game');
		wsRef.current = ws;

		ws.onopen = () => {
			console.log('Connected to game server');
		};

		ws.onmessage = (event) => {
		const msg = JSON.parse(event.data);
			if (msg.type === 'STATE') {
				setGameState(msg.payload);
			}
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		return () => {
			ws.close();
			wsRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (!wsRef.current) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			const ws = wsRef.current!;

			switch (event.code) {
				case 'KeyW':
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: {
								player: 'left',
								key: 'up',
							},
						}),
					);
					break;
				case 'KeyS':
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: {
								player: 'left',
								key: 'down',
							},
						}),
					);
					break;
				case 'ArrowUp':
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: {
								player: 'right',
								key: 'up',
							},
						}),
					);
					break;
				case 'ArrowDown':
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: {
								player: 'right',
								key: 'down',
							},
						}),
					);
					break;
				case 'Escape':
					navigate('/home');
					break;
				case 'Space':
					ws.send(JSON.stringify({ type: 'TOGGLE_PAUSE' }));
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [navigate]);

	const handlePauseToggle = () => {
		if (!wsRef.current) return;
		wsRef.current?.send(JSON.stringify({ type: 'TOGGLE_PAUSE' }));
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

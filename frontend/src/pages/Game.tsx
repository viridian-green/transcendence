import { PinkButton } from '@/components';
import Canvas from './Canvas';
import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import type { GameState } from '@/shared.types';

const Game = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const leftPlayer = state?.leftPlayer ?? 'Player 1';
	const rightPlayer = state?.rightPlayer ?? 'Player 2';
	const mode = state?.mode ?? 'local'; // Default to local if not provided
	const { gameId } = useParams<{ gameId: string }>();

	const [gameState, setGameState] = useState<GameState | null>(null);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		// Prevent scrolling while in game -> hide overflow
		// document.body.style.overflow = 'hidden';

		if (!gameId) {
			navigate('/game-start', { replace: true });
			console.warn('No gameId in params');
			return;
		}

		const ws = new WebSocket(`ws://localhost:3000/game/${gameId}?mode=${mode}`);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log('Connected to game server');
			ws.send(JSON.stringify({ type: 'RESET_GAME' }));
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

		ws.onclose = () => {
			console.log('WebSocket closed');
			wsRef.current = null;
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (ws.readyState !== WebSocket.OPEN) return;
			if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
				// Prevent scrolling the page
				event.preventDefault();
			}
			// Avoid repeating events if key is held down
			if (event.repeat) return;

			switch (event.key) {
				case 'w':
				case 'W':
					if (mode === 'AI') break; // Disable W/S keys for AI mode
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: { playerIndex: 0, direction: 'up' },
						}),
					);
					break;

				case 's':
				case 'S':
					if (mode === 'AI') break; // Disable W/S keys for AI mode
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: { playerIndex: 0, direction: 'down' },
						}),
					);
					break;

				case 'ArrowUp':
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: { playerIndex: 1, direction: 'up' },
						}),
					);
					break;

				case 'ArrowDown':
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: { playerIndex: 1, direction: 'down' },
						}),
					);
					break;
				case ' ':
					// TODO: handle pause on the server (send back pause state)
					ws.send(
						JSON.stringify({
							type: 'TOGGLE_PAUSE',
						}),
					);
					break;
				case 'Escape':
					// TODO check with Adele if this is the desired behavior
					ws.close();
					wsRef.current = null;
					navigate('/home');
					break;
				default:
					break;
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			if (ws.readyState !== WebSocket.OPEN) return;

			switch (event.key) {
				case 'w':
				case 'W':
				case 's':
				case 'S':
					if (mode === 'AI') break;
					ws.send(
						JSON.stringify({
							type: 'STOP_PADDLE',
							payload: { playerIndex: 0 },
						}),
					);
					break;

				case 'ArrowUp':
				case 'ArrowDown':
					ws.send(
						JSON.stringify({
							type: 'STOP_PADDLE',
							payload: { playerIndex: 1 },
						}),
					);
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown, { capture: true });
		window.addEventListener('keyup', handleKeyUp, { capture: true });

		return () => {
			window.removeEventListener('keydown', handleKeyDown, { capture: true });
			window.removeEventListener('keyup', handleKeyUp, { capture: true });
			ws.close();
			wsRef.current = null;
		};
	}, [navigate, gameId, mode]);

	const handlePauseToggle = () => {
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
					mode,
				},
			});
		}
	}, [gameState, navigate, leftPlayer, rightPlayer, mode]);

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

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
	const side: 'left' | 'right' = state?.side ?? 'left';
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

		const wsUrl = `wss://${window.location.host}/api/game/${gameId}?mode=${mode}`;

		// console.log('[GAME SOCKET] connecting to', wsUrl);
		const ws = new WebSocket(wsUrl);
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

			if (msg.type === 'OPPONENT_LEFT') {
				alert('Opponent left the game.');
				navigate('/remote');
				return;
			}
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		ws.onclose = () => {
			console.log('WebSocket closed');
			if (wsRef.current === ws) {
				wsRef.current = null;
			}
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
					if (mode === 'AI' || mode === 'remote') break;
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: { playerIndex: 0, direction: 'up' },
						}),
					);
					break;

				case 's':
				case 'S':
					if (mode === 'AI' || mode === 'remote') break;
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: { playerIndex: 0, direction: 'down' },
						}),
					);
					break;

				case 'ArrowUp':
					if (mode === 'remote' && side === 'left') {
						ws.send(
							JSON.stringify({
								type: 'MOVE_PADDLE',
								payload: { playerIndex: 0, direction: 'up' },
							}),
						);
						break;
					}
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: { playerIndex: 1, direction: 'up' },
						}),
					);
					break;

				case 'ArrowDown':
					if (mode === 'remote' && side === 'left') {
						ws.send(
							JSON.stringify({
								type: 'MOVE_PADDLE',
								payload: { playerIndex: 0, direction: 'down' },
							}),
						);
						break;
					}
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: { playerIndex: 1, direction: 'down' },
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
					if (mode === 'AI' || mode === 'remote') break;
					ws.send(
						JSON.stringify({
							type: 'STOP_PADDLE',
							payload: { playerIndex: 0 },
						}),
					);
					break;

				case 'ArrowUp':
				case 'ArrowDown':
					if (mode === 'remote' && side === 'left') {
						ws.send(
							JSON.stringify({
								type: 'STOP_PADDLE',
								payload: { playerIndex: 0 },
							}),
						);
						break;
					}
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
		<div className='flex flex-1 flex-col items-center justify-center gap-6 p-4'>
			<h1 className='text-accent-pink font-retro text-4xl font-bold'>Game Room</h1>
			<div className='flex w-full max-w-[800px] justify-between px-2'>
				<p>{leftPlayer}</p>
				<p>{rightPlayer}</p>
			</div>

			<div className='flex w-full max-w-[800px] justify-center'>
				<Canvas gameState={gameState} />
			</div>

			{/* Mobile Controls */}
			<div className='flex w-full max-w-[800px] justify-between px-4 xl:hidden'>
				{/* Left Player Controls - Only show if not AI mode */}
				<div className='flex touch-none flex-col gap-4'>
					{mode !== 'AI' && (
						<>
							<button
								type='button'
								className='flex h-16 w-16 touch-none items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition-colors select-none active:bg-white/20'
								onContextMenu={(e) => e.preventDefault()}
								onPointerDown={(e) => {
									e.preventDefault();
									if (wsRef.current?.readyState === WebSocket.OPEN) {
										wsRef.current.send(
											JSON.stringify({
												type: 'MOVE_PADDLE',
												payload: { playerIndex: 0, direction: 'up' },
											}),
										);
									}
								}}
								onPointerUp={(e) => {
									e.preventDefault();
									if (wsRef.current?.readyState === WebSocket.OPEN) {
										wsRef.current.send(
											JSON.stringify({
												type: 'STOP_PADDLE',
												payload: { playerIndex: 0 },
											}),
										);
									}
								}}
								onPointerLeave={(e) => {
									e.preventDefault();
									if (wsRef.current?.readyState === WebSocket.OPEN) {
										wsRef.current.send(
											JSON.stringify({
												type: 'STOP_PADDLE',
												payload: { playerIndex: 0 },
											}),
										);
									}
								}}
							>
								↑
							</button>
							<button
								type='button'
								className='flex h-16 w-16 touch-none items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition-colors select-none active:bg-white/20'
								onContextMenu={(e) => e.preventDefault()}
								onPointerDown={(e) => {
									e.preventDefault();
									if (wsRef.current?.readyState === WebSocket.OPEN) {
										wsRef.current.send(
											JSON.stringify({
												type: 'MOVE_PADDLE',
												payload: { playerIndex: 0, direction: 'down' },
											}),
										);
									}
								}}
								onPointerUp={(e) => {
									e.preventDefault();
									if (wsRef.current?.readyState === WebSocket.OPEN) {
										wsRef.current.send(
											JSON.stringify({
												type: 'STOP_PADDLE',
												payload: { playerIndex: 0 },
											}),
										);
									}
								}}
								onPointerLeave={(e) => {
									e.preventDefault();
									if (wsRef.current?.readyState === WebSocket.OPEN) {
										wsRef.current.send(
											JSON.stringify({
												type: 'STOP_PADDLE',
												payload: { playerIndex: 0 },
											}),
										);
									}
								}}
							>
								↓
							</button>
						</>
					)}
				</div>

				{/* Right Player Controls */}
				<div className='flex touch-none flex-col gap-4'>
					<button
						type='button'
						className='flex h-16 w-16 touch-none items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition-colors select-none active:bg-white/20'
						onContextMenu={(e) => e.preventDefault()}
						onPointerDown={(e) => {
							e.preventDefault();
							//console.log('Botton Pressed - State:', wsRef.current?.readyState);
							if (wsRef.current?.readyState === WebSocket.OPEN) {
								wsRef.current.send(
									JSON.stringify({
										type: 'MOVE_PADDLE',
										payload: { playerIndex: 1, direction: 'up' },
									}),
								);
							}
						}}
						onPointerUp={(e) => {
							e.preventDefault();
							//console.log('Botton Released');
							if (wsRef.current?.readyState === WebSocket.OPEN) {
								wsRef.current.send(
									JSON.stringify({
										type: 'STOP_PADDLE',
										payload: { playerIndex: 1 },
									}),
								);
							}
						}}
						onPointerLeave={(e) => {
							e.preventDefault();
							if (wsRef.current?.readyState === WebSocket.OPEN) {
								wsRef.current.send(
									JSON.stringify({
										type: 'STOP_PADDLE',
										payload: { playerIndex: 1 },
									}),
								);
							}
						}}
					>
						↑
					</button>
					<button
						type='button'
						className='flex h-16 w-16 touch-none items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl text-white transition-colors select-none active:bg-white/20'
						onContextMenu={(e) => e.preventDefault()}
						onPointerDown={(e) => {
							e.preventDefault();
							if (wsRef.current?.readyState === WebSocket.OPEN) {
								wsRef.current.send(
									JSON.stringify({
										type: 'MOVE_PADDLE',
										payload: { playerIndex: 1, direction: 'down' },
									}),
								);
							}
						}}
						onPointerUp={(e) => {
							e.preventDefault();
							if (wsRef.current?.readyState === WebSocket.OPEN) {
								wsRef.current.send(
									JSON.stringify({
										type: 'STOP_PADDLE',
										payload: { playerIndex: 1 },
									}),
								);
							}
						}}
						onPointerLeave={(e) => {
							e.preventDefault();
							if (wsRef.current?.readyState === WebSocket.OPEN) {
								wsRef.current.send(
									JSON.stringify({
										type: 'STOP_PADDLE',
										payload: { playerIndex: 1 },
									}),
								);
							}
						}}
					>
						↓
					</button>
				</div>
			</div>
		</div>
	);
};

export default Game;

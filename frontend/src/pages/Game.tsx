import { PinkButton } from '@/components';
import Canvas from './Canvas';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GameState } from '@/shared.types';

	const Game = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const leftPlayer = state?.leftPlayer ?? 'Player 1';
  const rightPlayer = state?.rightPlayer ?? 'Player 2';

  const [gameState, setGameState] = useState<GameState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // 1. Open / close WebSocket
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ws = new WebSocket('ws://localhost:3000/game');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to game server');
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
	  console.log('WS message:', msg);
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

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, []);


		useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
			const ws = wsRef.current;

			if (!ws || ws.readyState !== WebSocket.OPEN) return;

			switch (event.code) {
				case 'KeyW':
					ws.send(
						JSON.stringify({
							type: 'MOVE_PADDLE',
							payload: {
								player: 'left',
								direction: 'up',
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
								direction: 'down',
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
								direction: 'up',
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
								direction: 'down',
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

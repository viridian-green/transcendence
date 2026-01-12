import { PinkButton } from '@/components';
import Canvas from './Canvas';
import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import type { GameState } from '@/shared.types';
import { nanoid } from 'nanoid';

const Game = () => {
  
  const navigate = useNavigate();
  const { state } = useLocation();
  const { gameId } = useParams<{ gameId: string }>();
  const leftPlayer = state?.leftPlayer ?? 'Player 1';
  const rightPlayer = state?.rightPlayer ?? 'Player 2';

  const [gameState, setGameState] = useState<GameState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

     if (!gameId) {
      navigate('/game-start', { replace: true });
      console.warn('No gameId in params');
     }
  }, [gameId, navigate]);

    useEffect(() => {

    if (typeof window === 'undefined') return;

    if (!gameId) return;

    setGameState(null);

    const ws = new WebSocket(`ws://localhost:3000/game/${gameId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to game server');
       ws.send(JSON.stringify({ type: 'RESET_GAME' }));
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
  }, [gameId]);

  

useEffect(() => {
const handleKeyDown = (event: KeyboardEvent) => {
  const ws = wsRef.current;
  if (!ws || ws.readyState !== WebSocket.OPEN) return;


  switch (event.code) {
    case 'KeyW':
      ws.send(JSON.stringify({
        type: 'MOVE_PADDLE',
        payload: { playerIndex: 0, direction: 'up' },
      }));
      break;
    case 'KeyS':
      ws.send(JSON.stringify({
        type: 'MOVE_PADDLE',
        payload: { playerIndex: 0, direction: 'down' },
      }));
      break;
    case 'ArrowUp':
        ws.send(JSON.stringify({
          type: 'MOVE_PADDLE',
          payload: { playerIndex: 1, direction: 'up' },
        }));
        break;
      case 'ArrowDown':
        ws.send(JSON.stringify({
          type: 'MOVE_PADDLE',
          payload: { playerIndex: 1, direction: 'down' },
        }));
        break;
      default:
        break;
   
	console.log('keydown', event.code, ws?.readyState);
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

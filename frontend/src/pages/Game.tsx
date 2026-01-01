import { PinkButton } from '@/components';
import Canvas from './Canvas';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GamePhase } from '@/shared.types';

const Game = () => {
	const navigate = useNavigate();
	const { state } = useLocation();
	const { user } = useAuth();
	const opponent = state?.opponent;

	const [gamePhase, setGamePhase] = useState<GamePhase>('countdown');

	const leftPlayer = user?.username || 'Player 1';
	const rightPlayer = opponent ?? 'Player 2';

	useEffect(() => {
		// TODO: Initialize WebSocket connection here
		// const ws = new WebSocket('your-websocket-url');
		//
		// ws.onmessage = (event) => {
		//   const newGameState = JSON.parse(event.data);
		//   setGameState(newGameState);
		// };
		//
		// return () => ws.close();

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.code === 'Space') {
				setGamePhase((prev) => (prev === 'paused' ? 'playing' : 'paused'));
			}
			if (event.code === 'Escape') {
				navigate('/home');
			}
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [navigate]);

	const togglePause = () => {
		setGamePhase((prev) => (prev === 'paused' ? 'playing' : 'paused'));
	};

	if (gamePhase === 'ended') {
		navigate('/game-end');
	}

	return (
		<div className='bg-bg flex min-h-screen flex-col items-center justify-center gap-4'>
			<h1 className='text-accent-pink font-retro mb-4 text-4xl font-bold'>Game Room</h1>
			<div className='flex w-[800px] justify-between'>
				<p>{leftPlayer}</p>
				<p>{rightPlayer}</p>
			</div>
			<Canvas gamePhase={gamePhase} setGamePhase={setGamePhase} />
			<PinkButton text={gamePhase === 'paused' ? 'Resume' : 'Pause'} onClick={togglePause} />
		</div>
	);
};

export default Game;

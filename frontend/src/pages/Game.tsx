import { PinkButton } from '@/components';
import Canvas from './Canvas';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const Game = () => {
	const [pauseButtonText, setPauseButtonText] = useState('Pause');
	const { user } = useAuth();
	const alias1 = user?.username || 'Player 1';
	const alias2 = 'Player 2'; // This should be replaced with the actual opponent's alias

	const handlePauseClick = () => {
		if (pauseButtonText === 'Pause') {
			setPauseButtonText('Resume');
			// Add logic to pause the game
		} else {
			setPauseButtonText('Pause');
			// Add logic to resume the game
		}
	};

	return (
		<div className='bg-bg flex min-h-screen flex-col items-center justify-center gap-4'>
			<h1 className='text-accent-pink font-retro mb-4 text-4xl font-bold'>Game Room</h1>
			<div className='flex gap-[650px]'>
				<p>{alias1}</p>
				<p>{alias2}</p>
			</div>
			<Canvas />
			<PinkButton text={pauseButtonText} onClick={handlePauseClick} />
		</div>
	);
};

export default Game;

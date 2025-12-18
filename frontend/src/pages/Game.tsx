import type { FC } from 'react';

const Game: FC = () => {
	return (
		<>
			<div className='text-center text-2xl font-bold'>Pong</div>
			<div className='flex justify-center'>
				<iframe
					src='/api/game/'
					title='Pong Game'
					width='800'
					height='600'
					style={{ border: 'none' }}
				/>
			</div>
		</>
	);
};

export default Game;

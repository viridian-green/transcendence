import { PinkButton } from '@/components';
import { useNavigate } from 'react-router-dom';

const GameStart = () => {
	const navigate = useNavigate();
	const handleStartGame = () => {
		navigate('/game');
	};

	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-6'>
			<section className='flex flex-col items-center justify-center gap-6'>
				<p className='text-accent-pink font-retro text-6xl font-bold'>Game Start</p>
				<label htmlFor='opponent' className='text-2xl'>
					Who are you playing with?
				</label>
				<input
					id='opponent'
					type='text'
					placeholder="Enter opponent's alias"
					className='border-border text-text-secondary w-64 rounded-md border-2 p-2'
				/>
				<div className='flex items-center justify-center gap-10'>
					<div className='flex flex-col items-center gap-2'>
						<p className='text-2xl'>You: </p>
						<p className='text-2xl'>Left Paddle</p>
						<div className='flex gap-1'>
							<kbd className='bg-background rounded border px-2 py-1 text-sm shadow-sm'>
								W
							</kbd>
							<kbd className='bg-background rounded border px-2 py-1 text-sm shadow-sm'>
								S
							</kbd>
						</div>
					</div>
					<div className='flex flex-col items-center gap-2'>
						<p className='text-2xl'>Opponent: </p>
						<p className='text-2xl'>Right Paddle</p>
						<p className='text-2xl'>Up and Down keys</p>
					</div>
				</div>
				<p className='text-2xl'>First to X points wins!</p>
				<PinkButton
					text='Start Game'
					onClick={() => {
						handleStartGame();
					}}
				/>
			</section>
		</div>
	);
};

export default GameStart;

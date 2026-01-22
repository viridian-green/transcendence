import { PinkButton } from '@/components';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';

const AIGameStart = () => {
	const navigate = useNavigate();

	const leftPlayer = 'AI';
	const rightPlayer = 'You';

	const handleAIStartGame = () => {
		const gameId = nanoid();
		navigate(`/game/${gameId}`, {
			state: {
				leftPlayer,
				rightPlayer,
				mode: 'AI',
			},
		});
	};

	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-6'>
			<section className='flex flex-col items-center justify-center gap-6'>
				<p className='text-accent-pink font-retro text-6xl font-bold'>Game Start</p>

				<div className='flex items-stretch justify-center gap-10'>
					<div className='bg-surface border-border shadow-elevated flex min-w-54 flex-col items-center justify-start gap-2 rounded-lg px-6 py-4 shadow'>
						<p className='text-2xl'>{leftPlayer}</p>
						<div className='flex w-full items-center justify-between'>
							<p className='text-text-secondary'>Paddle:</p>
							<p className='text-xl'>Left</p>
						</div>
					</div>

					<div className='bg-surface border-border shadow-elevated flex min-w-54 flex-col items-center justify-start gap-2 rounded-lg px-6 py-4 shadow'>
						<p className='text-2xl'>{rightPlayer}</p>
						<div className='flex w-full items-center justify-between'>
							<p className='text-text-secondary'>Paddle:</p>
							<p className='text-xl'>Right</p>
						</div>
						<div className='flex w-full items-center justify-between'>
							<p className='text-text-secondary'>Controls:</p>
							<div className='flex gap-1'>
								<kbd className='bg-background rounded border px-2 py-1 text-sm shadow-sm'>
									&uarr;
								</kbd>
								<kbd className='bg-background rounded border px-2 py-1 text-sm shadow-sm'>
									&darr;
								</kbd>
							</div>
						</div>
					</div>
				</div>
				<p className='text-xl'>First to score 11 points wins!</p>
				
				<PinkButton
					text='Start Game'
					onClick={() => {
						handleAIStartGame();
					}}
					className='text-accent-pink'
				/>
			</section>
		</div>
	);
};

export default AIGameStart;

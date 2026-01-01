import { ErrorMessage, PinkButton } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// TODO the logic here is that the logged in user always plays with w and s keys, maybe randomize logic
const GameStart = () => {
	const navigate = useNavigate();
	const [opponent, setOpponent] = useState('');
	const { user } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const handleStartGame = () => {
		if (opponent.length === 0) {
			setError('Please provide an alias for your opponent');
			return;
		}
		navigate('/game', { state: { opponent } });
	};

	const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setOpponent(e.target.value);
		if (error) {
			setError(null);
		}
	};

	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-6'>
			<section className='flex flex-col items-center justify-center gap-6'>
				<p className='text-accent-pink font-retro text-6xl font-bold'>Game Start</p>
				<label htmlFor='opponent' className='text-2xl'>
					Who are you playing with?
				</label>
				<input
					className='border-border text-text-secondary w-64 rounded-md border-2 p-2'
					id='opponent'
					type='text'
					placeholder="Enter opponent's alias"
					value={opponent}
					onChange={(e) => handleValueChange(e)}
				/>
				<div className='flex items-center justify-center gap-10'>
					<div className='bg-surface border-border shadow-elevated flex min-w-54 flex-col items-center gap-2 rounded-lg px-6 py-4 shadow'>
						<p className='text-2xl'>{user?.username ?? 'You'}</p>
						<div className='flex w-full items-center justify-between'>
							<p className='text-text-secondary'>Paddle:</p>
							<p className='text-xl'>Left</p>
						</div>
						<div className='flex w-full items-center justify-between'>
							<p className='text-text-secondary'>Controls:</p>
							<div className='flex gap-1'>
								<kbd className='bg-background rounded border px-2 py-1 text-sm shadow-sm'>
									W
								</kbd>
								<kbd className='bg-background rounded border px-2 py-1 text-sm shadow-sm'>
									S
								</kbd>
							</div>
						</div>
					</div>
					<div className='bg-surface border-border shadow-elevated flex min-w-54 flex-col items-center gap-2 rounded-lg px-6 py-4 shadow'>
						<p className='text-2xl'>{opponent.length > 0 ? opponent : 'Opponent'}</p>
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
				<p className='text-xl'>First to X points wins!</p>
				{error && <ErrorMessage message={error} />}
				<PinkButton
					text='Start Game'
					onClick={() => {
						handleStartGame();
					}}
					className='text-accent-pink'
				/>
			</section>
		</div>
	);
};

export default GameStart;

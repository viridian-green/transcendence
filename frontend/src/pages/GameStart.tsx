import { ErrorMessage, PinkButton } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';

type AliasAndPosition = {
	position: 'left' | 'right';
	alias: string;
};

const GameStart = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [opponent, setOpponent] = useState<AliasAndPosition>({ position: 'right', alias: '' });
	const opponentAlias = opponent.alias || 'Opponent';
	const loginUser: AliasAndPosition = useMemo(
		() => ({
			alias: user?.username ?? 'You',
			position: opponent.position === 'left' ? 'left' : 'right',
		}),
		[opponent, user],
	);
	const leftPlayer = opponent.position === 'left' ? opponentAlias : loginUser.alias;
	const rightPlayer = opponent.position === 'right' ? opponentAlias : loginUser.alias;
	const [error, setError] = useState<string | null>(null);
	const handleStartGame = () => {
		if (opponent.alias.length === 0) {
			setError('Please provide an alias for your opponent');
			return;
		}
		if (opponent.alias === user?.username) {
			setError('Please provide a different alias');
			return;
		}
		const gameId = nanoid();
		navigate(`/game/${gameId}`, { state: { leftPlayer, rightPlayer, mode: 'classic',
      side: loginUser.position   } });
	};

	const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setOpponent((prev) => ({ ...prev, alias: e.target.value }));
		if (error) {
			setError(null);
		}
	};

	const handleSideChange = () => {
		switch (opponent.position) {
			case 'right':
				setOpponent((prev) => ({ ...prev, position: 'left' }));
				break;
			case 'left':
				setOpponent((prev) => ({ ...prev, position: 'right' }));
		}
	};

	return (
		<div className='flex flex-1 flex-col items-center justify-center gap-6 p-4'>
			<section className='flex flex-col items-center justify-center gap-6'>
				<p className='text-accent-pink font-retro text-4xl font-bold text-center'>Game Start</p>
				<label htmlFor='opponent' className='text-2xl'>
					Who are you playing with?
				</label>
				<input
					className='border-border text-text-secondary w-64 rounded-md border-2 p-2'
					id='opponent'
					type='text'
					placeholder="Enter opponent's alias"
					value={opponent.alias}
					onChange={(e) => handleValueChange(e)}
				/>
				<div className='flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10'>
					<div className='bg-surface border-border shadow-elevated flex min-w-54 flex-col items-center gap-2 rounded-lg border px-6 py-4 shadow'>
						<p className='text-2xl'>{leftPlayer}</p>
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
					<button
						type='button'
						className='border-accent-pink text-accent-pink hover:bg-accent-pink hover:text-bg rounded-lg border px-2 text-2xl font-bold rotate-90 md:rotate-0'
						onClick={handleSideChange}
					>
						&harr;
					</button>
					<div className='bg-surface border-border shadow-elevated flex min-w-54 flex-col items-center gap-2 rounded-lg border px-6 py-4 shadow'>
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
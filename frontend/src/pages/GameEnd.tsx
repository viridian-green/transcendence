import { useLocation, useNavigate } from 'react-router-dom';
import { PinkButton } from '@components/index';
import './Home.css';
import confetti from '@hiseb/confetti';
import { useEffect } from 'react';
import { nanoid } from 'nanoid';

const GameEnd = () => {
	const navigate = useNavigate();
	const state = useLocation().state;
	const winnerAlias = state?.gameEndData?.winner;
	const leftPlayerScore = state?.gameEndData?.scores?.left;
	const rightPlayerScore = state?.gameEndData?.scores?.right;
	const leftPlayer = state?.gameEndData?.leftPlayer;
	const rightPlayer = state?.gameEndData?.rightPlayer;

	const handleGameStart = () => {
		const gameId = nanoid();
		navigate(`/game/${gameId}`, { state: { leftPlayer, rightPlayer } });
	};

	const handleHome = () => {
		navigate('/home');
	};

	useEffect(
		() =>
			confetti({
				count: 200,
				size: 1,
				velocity: 300,
				fade: true,
			}),
		[],
	);

	useEffect(() => {
		if (!state || !state.gameEndData) {
			// If no state is passed, redirect to home
			navigate('/home', { replace: true });
		}
	}, [navigate, state]);

	if (!state || !state.gameEndData) {
		return null;
	}

	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-6'>
			<section className='flex flex-col items-center justify-center gap-6'>
				<p className='text-accent-pink font-retro text-6xl font-bold'>Winner</p>
				<p className='text-accent-amber text-2xl'>{winnerAlias}</p>
				<p className='text-2xl'>
					{`${leftPlayerScore} : ${rightPlayerScore}`}
				</p>

				</p>
				<div className='flex flex-row justify-center gap-20 text-center text-xl'>
					<PinkButton text='Home' onClick={handleHome} />
					<PinkButton text='New Game' onClick={handleGameStart} />
				</div>
			</section>
		</div>
	);
};

export default GameEnd;

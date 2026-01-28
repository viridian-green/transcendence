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
		if (state.mode === 'AI') {
			navigate(`/game/${gameId}`, {
				state: {
					leftPlayer: 'AI',
					rightPlayer: 'You',
					mode: 'AI',
				},
			});
		} else {
			navigate(`/game/${gameId}`, { state: { leftPlayer, rightPlayer } });
		}
	};

	const handleHome = () => {
		navigate('/home');
	};

	useEffect(() => {
		if (!state || !state.gameEndData) {
			// If no state is passed, redirect to home
			navigate('/home', { replace: true });
			return;
		}
		confetti({
			count: 200,
			size: 1,
			velocity: 300,
			fade: true,
		});
	}, [navigate, state]);

	if (!state || !state.gameEndData) {
		return null;
	}

	return (
		<div className='flex flex-1 flex-col items-center justify-center gap-6 p-4'>
			<p className='text-accent-pink font-retro text-4xl font-bold'>Winner</p>
			<p className='text-accent-amber text-2xl'>{winnerAlias}</p>
			<p className='text-2xl'>{`${leftPlayerScore} : ${rightPlayerScore}`}</p>
			<div className='flex flex-col md:flex-row items-center justify-center gap-6 md:gap-20 text-center text-xl'>
				<PinkButton text='Home' onClick={handleHome} />
				<PinkButton text='New Game' onClick={handleGameStart} />
			</div>
		</div>
	);
};

export default GameEnd;

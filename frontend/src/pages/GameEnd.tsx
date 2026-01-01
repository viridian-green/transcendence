import { useNavigate } from 'react-router-dom';
import { PinkButton } from '@components/index';
import './Home.css';
import confetti from '@hiseb/confetti';
import { useEffect } from 'react';

const GameEnd = () => {
	const navigate = useNavigate();
	// TODO replace fake data by state from location
	const winnerAlias = 'Player'; // Replace with actual winner's alias
	const winnerScore = 10; // Replace with actual score
	const loserScore = 8; // Replace with actual score

	const handleGameStart = () => {
		navigate('/game');
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

	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-6'>
			<section className='flex flex-col items-center justify-center gap-6'>
				<p className='text-accent-pink font-retro text-6xl font-bold'>Winner</p>
				<p className='text-accent-amber text-2xl'>{winnerAlias}</p>
				<p className='text-2xl'>
					{winnerScore} : {loserScore}
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

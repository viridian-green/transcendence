import { useNavigate } from 'react-router-dom';
import { PinkButton } from '@components/index';
import './Home.css';
import confetti from 'node_modules/@hiseb/confetti/dist';

const GameEnd = () => {
	const navigate = useNavigate();
	const alias = 'Player'; // Replace with actual winner's alias
	const score1 = 10; // Replace with actual score
	const score2 = 8; // Replace with actual score

	const handleGameStart = () => {
		navigate('/game');
	};

	const handleHome = () => {
		navigate('/home');
	};

	confetti({
		count: 200,
		size: 1,
		velocity: 300,
		fade: true,
	});

	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-6'>
			<section className='flex flex-col items-center justify-center gap-6'>
				<p className='text-accent-pink font-retro text-6xl font-bold'>Winner</p>
				<p className='text-2xl'>{alias}</p>
				<p className='text-2xl'>
					{score1} : {score2}
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

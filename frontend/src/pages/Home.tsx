import { useEffect, useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { PinkButton } from '@components/index';
import { useAuth } from '@hooks/useAuth';
import './Home.css';

const Home: FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const welcomeMessage = user ? `Welcome, ${user.username}!` : 'Welcome!';

	const handleLocalGameStart = () => {
		navigate('/game');
	};

	const [showWelcome, setShowWelcome] = useState(true);
	const [fadeIn, setFadeIn] = useState(true);
	const [showRest, setShowRest] = useState(false);

	useEffect(() => {
		// Wait for slideIn and slideOut animation to finish
		const timer1 = setTimeout(() => {
			setShowWelcome(false);
		}, 1200); // 0.6s animation + 0.6s delay

		const timer2 = setTimeout(() => {
			setFadeIn(false); // triggers slideOut
		}, 600);

		// Show rest after welcome disappears
		const timer3 = setTimeout(() => {
			setShowRest(true);
		}, 1800);

		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
			clearTimeout(timer3);
		};
	}, []);

	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-6'>
			{showWelcome && (
				<section
					className={
						`flex items-center justify-center gap-4` +
						(fadeIn ? ' animate-slide-in' : ' animate-slide-out')
					}
				>
					<h1 className='text-accent-pink font-retro text-center text-6xl font-bold'>
						{welcomeMessage}
					</h1>
					<svg
						fill='#e60076'
						version='1.1'
						xmlns='http://www.w3.org/2000/svg'
						xmlnsXlink='http://www.w3.org/1999/xlink'
						width='64px'
						height='64px'
						viewBox='0 0 21 30'
						xmlSpace='preserve'
						transform='rotate(45)matrix(1, 0, 0, 1, 0, 0)'
					>
						<g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
						<g
							id='SVGRepo_tracerCarrier'
							strokeLinecap='round'
							strokeLinejoin='round'
							stroke='#CCCCCC'
							strokeWidth='0.126'
						></g>
						<g id='SVGRepo_iconCarrier'>
							{' '}
							<g id='pin-pong'>
								{' '}
								<path d='M21,10.5C21,4.7,16.3,0,10.5,0S0,4.7,0,10.5c0,2.457,0.85,4.711,2.264,6.5h16.473C20.15,15.211,21,12.957,21,10.5z'></path>{' '}
								<path d='M17.843,18H3.157c1.407,1.377,3.199,2.361,5.2,2.777l-0.764,7.865c-0.038,0.346,0.072,0.691,0.305,0.95 C8.13,29.852,8.461,30,8.809,30h3.381c0.348,0,0.679-0.148,0.91-0.407c0.232-0.259,0.343-0.604,0.305-0.95l-0.764-7.864 C14.643,20.362,16.436,19.378,17.843,18z'></path>{' '}
								<circle cx='18.999' cy='24' r='2'></circle>{' '}
							</g>{' '}
							<g id='Layer_1'> </g>{' '}
						</g>
					</svg>
				</section>
			)}
			{showRest && (
				<section className='animate-fade-in flex flex-col items-center justify-center gap-6'>
					<p className='text-2xl'>Choose your game mode:</p>
					<div className='flex flex-row justify-center gap-20 text-center text-xl'>
						<PinkButton
							text='AI Opponent'
							onClick={() => {
								alert('TBD');
							}}
						/>
						<PinkButton text='Local' onClick={handleLocalGameStart} />
						<PinkButton
							text='Remote'
							onClick={() => {
								alert('TBD');
							}}
						/>
					</div>
				</section>
			)}
		</div>
	);
};

export default Home;

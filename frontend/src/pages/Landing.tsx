import { useNavigate } from 'react-router-dom';
import { PinkButton } from '@components/index';
import './index.css';

const Landing = () => {
	const navigate = useNavigate();

	return (
		<div className='mb-2 flex min-h-screen flex-col items-center justify-center text-pink-600'>
			<h1 className='font-retro mb-2 text-4xl'>Retroscendence</h1>
			<p className='mb-8 text-xl'>A retro pong experience</p>

			<div className='flex flex-col gap-4 text-xl'>
				<PinkButton text='Login' onClick={() => navigate('/login')} />
				<PinkButton text='Register' onClick={() => navigate('/signup')} />
			</div>
		</div>
	);
};

export default Landing;

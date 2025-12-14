import { useNavigate } from 'react-router-dom';
import { PinkButton } from '../components';
import './index.css';

const Landing = () => {
	const navigate = useNavigate();

	return (
		<div className='powerOn flex min-h-screen flex-col items-center justify-center text-pink-600'>
			<h1 className='font-retro pink-shadow mb-2 text-4xl'>Retroscendence</h1>
			<p className='mb-8 text-sm'>A retro pong experience</p>

			<div className='flex flex-col gap-4'>
				<PinkButton text='Login' onClick={() => navigate('/login')} />
				<PinkButton text='Signup' onClick={() => navigate('/signup')} />
			</div>
		</div>
	);
};

export default Landing;

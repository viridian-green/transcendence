import { useNavigate } from 'react-router-dom';
import { PinkButton } from '@components/index';
import './index.css';
import BlackSphere from '../components/BlackSphere';
import PinkSphere from '../components/PinkSphere';
import './Landing.css';

const Landing = () => {
	const navigate = useNavigate();

	return (
		<div className='text-accent-pink relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4'>
			{/* Animated Background Spheres with Pixelated Effect */}
			<div className='pointer-events-none absolute inset-0'>
				{/* Black Sphere - Top Left */}
				<div className='animate-float absolute -top-32 -left-32 h-64 w-64 opacity-80'>
					<BlackSphere />
				</div>

				{/* Pink Sphere - Top Right */}
				<div className='animate-float-delayed absolute top-10 -right-20 h-48 w-48 opacity-70'>
					<PinkSphere />
				</div>

				{/* Black Sphere - Bottom Left */}
				<div className='animate-float absolute -bottom-20 left-20 h-56 w-56 opacity-60'>
					<BlackSphere />
				</div>

				{/* Pink Sphere - Bottom Right */}
				<div className='animate-float-delayed absolute -right-32 -bottom-32 h-80 w-80 opacity-70'>
					<PinkSphere />
				</div>

				{/* Pink Sphere - Center Left */}
				<div className='animate-float absolute top-1/2 left-0 h-40 w-40 -translate-y-1/2 opacity-50'>
					<PinkSphere />
				</div>

				{/* Black Sphere - Center Right */}
				<div className='animate-float-delayed absolute top-1/3 right-10 h-36 w-36 opacity-60'>
					<BlackSphere />
				</div>
			</div>
			<div className='z-10 flex flex-col items-center justify-center'>
				<h1 className='font-retro mb-2 text-6xl'>Retroscendence</h1>
				<p className='mb-8 text-xl font-medium'>A retro pong experience</p>

				<div className='flex flex-col gap-4 text-xl font-medium'>
					<PinkButton text='Login' onClick={() => navigate('/login')} />
					<PinkButton text='Register' onClick={() => navigate('/register')} />
				</div>
			</div>
		</div>
	);
};

export default Landing;

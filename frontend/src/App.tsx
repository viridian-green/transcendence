import { Suspense } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import { Home, About, NotFound, Loading, Game, Landing, Login, Signup } from '@pages/index';
import { Avatar } from '@components/index';

function App() {
	const location = useLocation();
	const hasAvatar =
		location.pathname !== '/' &&
		location.pathname !== '/login' &&
		location.pathname !== '/signup';

	return (
		<div className='flex min-h-screen flex-col bg-black text-pink-600'>
			{hasAvatar && (
				<nav className='font-bit-slim flex justify-end p-6'>
					{/* <Link to='/'>Home</Link>
				<Link to='/about'>About</Link>
				<Link to='/game'>Pong</Link> */}
					<Link to='/profile'>{<Avatar />}</Link>
				</nav>
			)}

			<main className='flex-1'>
				<Suspense fallback={<Loading />}>
					<Routes>
						<Route path='/' element={<Landing />} />
						<Route path='/login' element={<Login />} />
						<Route path='/signup' element={<Signup />} />
						<Route path='/home' element={<Home />} />
						<Route path='/about' element={<About />} />
						<Route path='/game/*' element={<Game />} />
						<Route path='*' element={<NotFound />} />
					</Routes>
				</Suspense>
			</main>
		</div>
	);
}

export default App;

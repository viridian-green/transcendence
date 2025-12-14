import { Suspense } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import './App.css';
import { Home, About, NotFound, Loading, Game } from '@/src/pages/index';

function App() {
	return (
		<div className='min-h-screen bg-black p-6 text-pink-600'>
			<nav className='font-retro-slim space-x-4'>
				<Link to='/'>Home</Link>
				<Link to='/about'>About</Link>
				<Link to='/game'>Pong</Link>
			</nav>

			<main className='mt-6'>
				<Suspense fallback={<Loading />}>
					<Routes>
						<Route path='/' element={<Home />} />
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

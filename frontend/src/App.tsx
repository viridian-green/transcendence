import { Suspense } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import {
	Home,
	About,
	NotFound,
	Loading,
	Game,
	Landing,
	Login,
	Registration,
	ProtectedRoute,
	Chat,
} from '@pages/index';
import { Avatar } from '@components/index';

function App() {
	const location = useLocation();
	const hasAvatar =
		location.pathname !== '/' &&
		location.pathname !== '/login' &&
		location.pathname !== '/register';

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
						<Route path='/register' element={<Registration />} />
						<Route
							path='/home'
							element={
								<ProtectedRoute>
									<Home />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/game/*'
							element={
								<ProtectedRoute>
									<Game />
								</ProtectedRoute>
							}
						/>
						{/* TODO: create about page and put it in a footer or navbar */}
						<Route path='/about' element={<About />} />
						<Route path='/chat' element={<Chat />} />
						<Route path='*' element={<NotFound />} />
					</Routes>
				</Suspense>
			</main>
		</div>
	);
}

export default App;

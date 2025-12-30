import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
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
} from '@pages/index';
import TopRightAvatar from './pages/TopRightAvatar';
import { useAuth } from './hooks/useAuth';

function App() {
	const { isLoggedIn, isLoading } = useAuth();

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className='min-h-screen'>
			{isLoggedIn && (
				<nav className='fixed top-0 right-0 z-50 p-6'>
					{/* <Link to='/'>Home</Link>
						<Link to='/about'>About</Link>
						<Link to='/game'>Pong</Link>
						<Link to='/profile'>{<Avatar />}</Link> 
					*/}
					<TopRightAvatar />
				</nav>
			)}

			<main className='h-screen'>
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
						<Route path='*' element={<NotFound />} />
					</Routes>
				</Suspense>
			</main>
		</div>
	);
}

export default App;

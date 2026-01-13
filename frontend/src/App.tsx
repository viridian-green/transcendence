import { Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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
	PublicOnlyRoute,
	PrivacyPolicy,
	TermsOfService,
	GameEnd,
	GameStart,
} from '@pages/index';
import TopRightAvatar from './pages/TopRightAvatar';
import { useAuth } from './hooks/useAuth';

function App() {
	const { isLoggedIn, isLoading } = useAuth();

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className='flex min-h-screen flex-col'>
			{isLoggedIn && (
				<nav className='fixed top-0 right-0 z-50 p-6'>
					<TopRightAvatar />
				</nav>
			)}

			<main className='flex-grow"'>
				<Suspense fallback={<Loading />}>
					<Routes>
						<Route
							path='/'
							element={
								<PublicOnlyRoute>
									<Landing />
								</PublicOnlyRoute>
							}
						/>
						<Route
							path='/login'
							element={
								<PublicOnlyRoute>
									<Login />
								</PublicOnlyRoute>
							}
						/>
						<Route
							path='/register'
							element={
								<PublicOnlyRoute>
									<Registration />
								</PublicOnlyRoute>
							}
						/>
						<Route
							path='/home'
							element={
								<ProtectedRoute>
									<Home />
								</ProtectedRoute>
							}
						/>
						{/* <Route
							path='/game/:gameId'
							element={
								<ProtectedRoute>
									<Game />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/game-start'
							element={
								<PublicOnlyRoute>
									<GameStart />
								</PublicOnlyRoute>
							}
						/> */}
						{/* <Route
							path='/game-end'
							element={
								<PublicOnlyRoute>
									<GameEnd />
								</PublicOnlyRoute>
							}
						/> */}
						{/* TODO: create about page and put it in a footer or navbar */}
						<Route path='/about' element={<About />} />
						<Route path='/privacy-policy' element={<PrivacyPolicy />} />
						<Route path='/terms-of-service' element={<TermsOfService />} />
						<Route path='*' element={<NotFound />} />
						{/* test routes without login, remove when releasing */}
						<Route path='/game/:gameId' element={<Game />} />
						<Route path='/game-start' element={<GameStart />} />
						<Route path='/game-end' element={<GameEnd />} />
					</Routes>
				</Suspense>
			</main>
			<footer className='border-border text-text-muted space-x-2 border-t p-6 text-center'>
				<Link to='/privacy-policy' className='hover:text-text-secondary'>
					Privacy Policy
				</Link>
				<span>|</span>
				<Link to='/terms-of-service' className='hover:text-text-secondary'>
					Terms of Service
				</Link>
			</footer>
		</div>
	);
}

export default App;

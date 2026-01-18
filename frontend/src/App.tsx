import { Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
	Home,
	NotFound,
	Loading,
	Game,
	Landing,
	Login,
	About,
	Registration,
	ProtectedRoute,
	PublicOnlyRoute,
	GameEnd,
	GameStart,
	Chat,
	Remote,
	TermsOfService,
	PrivacyPolicy,
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

			<main className='flex-grow'>
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
							path='/remote'
							element={
								<ProtectedRoute>
									<Remote />
								</ProtectedRoute>
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
						<Route
							path='/chat'
							element={
								<ProtectedRoute>
									<Chat />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/game-start'
							element={
								<ProtectedRoute>
									<GameStart />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/game/:gameId'
							element={
								<ProtectedRoute>
									<Game />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/game-end'
							element={
								<ProtectedRoute>
									<GameEnd />
								</ProtectedRoute>
							}
						/>
						<Route path='/about' element={<About />} />
						<Route
							path='/chat'
							element={
								<ProtectedRoute>
									<Chat />
								</ProtectedRoute>
							}
						/>
						{/* test routes without login, TODO: remove when releasing */}
						<Route path='/game/:gameId' element={<Game />} />
						<Route path='/game-start' element={<GameStart />} />
						<Route path='/game-end' element={<GameEnd />} />
						<Route path='/test/home' element={<Home />} />
						{/* TODO keep it at the bottom */}
						<Route path='/privacy-policy' element={<PrivacyPolicy />} />
						<Route path='/terms-of-service' element={<TermsOfService />} />
						{/* Keep here the test routes without login, TODO: remove when releasing */}
						{/* Keep catchall (*) at the bottom */}
						<Route path='*' element={<NotFound />} />
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

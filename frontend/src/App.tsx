import { Suspense } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
	Home,
	NotFound,
	Loading,
	Game,
	Landing,
	Login,
	Registration,
	ProtectedRoute,
	PublicOnlyRoute,
	GameEnd,
	GameStart,
	AIGameStart,
	Chat,
	TermsOfService,
	PrivacyPolicy,
	Profile,
	ProfileSettings,
} from '@pages/index';
import TopRightAvatar from './pages/TopRightAvatar';
import { useAuth } from './hooks/useAuth';

function App() {
	const { isLoggedIn, isLoading } = useAuth();
	const location = useLocation();
	const showTopAvatar =
		location.pathname !== '/profile' && location.pathname !== '/settings' && isLoggedIn;

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className='flex min-h-screen flex-col'>
			{showTopAvatar && (
				<nav className='bg-surface border-border sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6'>
					<button
						className='font-retro text-accent-pink no-scale text-xl leading-none'
						onClick={() => (window.location.href = '/home')}
						type='button'
					>
						Retroscendence
					</button>
					<TopRightAvatar />
				</nav>
			)}

			<main className='grow'>
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
							path='/AI-game-start'
							element={
								<ProtectedRoute>
									<AIGameStart />
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
						<Route
							path='/profile'
							element={
								<ProtectedRoute>
									<Profile />
								</ProtectedRoute>
							}
						/>
						<Route
							path='/settings'
							element={
								<ProtectedRoute>
									<ProfileSettings />
								</ProtectedRoute>
							}
						/>
						<Route path='/privacy-policy' element={<PrivacyPolicy />} />
						<Route path='/terms-of-service' element={<TermsOfService />} />
						{/* Keep here the test routes without login, TODO: remove when releasing */}
						{/* Keep catchall (*) at the bottom */}
						<Route path='*' element={<NotFound />} />
					</Routes>
				</Suspense>
			</main>
			<footer className='border-border bg-surface text-text-muted flex h-16 items-center justify-center gap-2 border-t px-6 text-center text-sm'>
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

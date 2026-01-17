import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
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
	Chat,
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
					<TopRightAvatar />
				</nav>
			)}

			<main className='h-screen'>
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
						{/* Keep here the test routes without login, TODO: remove when releasing */}
						{/* Keep catchall (*) at the bottom */}
						<Route path='*' element={<NotFound />} />
					</Routes>
				</Suspense>
			</main>
		</div>
	);
}

export default App;

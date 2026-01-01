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
	PublicOnlyRoute,
	PrivacyPolicy,
	TermsOfService,
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
							path='/game/*'
							element={
								<ProtectedRoute>
									<Game />
								</ProtectedRoute>
							}
						/>
						{/* TODO: create about page and put it in a footer or navbar */}
						<Route path='/about' element={<About />} />
						<Route path='/privacy-policy' element={<PrivacyPolicy />} />
						<Route path='/terms-of-service' element={<TermsOfService />} />
						<Route path='*' element={<NotFound />} />
					</Routes>
				</Suspense>
			</main>
			{/* <footer className='text-center'>
				<Link to='/terms' className='border-r p-2 mr-2'>Terms of Service</Link>
				<Link to='/privacy'>Privacy Policy</Link>
			</footer> */}
		</div>
	);
}

export default App;

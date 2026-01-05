import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import Loading from './Loading';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return <Loading />;
	}

	if (!user) {
		return <Navigate to='/login' replace />;
	}

	return <>{children}</>;
}

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/shared.types';

interface AuthContextType {
	user: User | null;
	login: (username: string, password: string) => Promise<void>;
	register: (email: string, username: string, password: string) => Promise<void>;
	signout: () => Promise<void>;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		checkAuth();
	}, []);

	// Used to check the session status with the server
	const checkAuth = async () => {
		try {
			const response = await fetch('/api/users/me', {
				credentials: 'include',
			});
			const data = await response.json();
			setUser(data);
		} catch (error) {
			console.error('Failed to check auth status:', error);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	};

	// Used to log in a user, create a session, and store the user data in the context
	const login = async (username: string, password: string) => {
		const response = await fetch('/api/users/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ username, password }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to log in');
		}

		const data = await response.json();
		setUser(data);
	};

	// Used to register a new user, create a session, and store the user data in the context
	const register = async (email: string, username: string, password: string) => {
		const response = await fetch('/api/users/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ email, username, password }),
		});

		console.log(response.body);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to register');
		}

		const data = await response.json();
		setUser(data);
	};

	// Used to sign out a user and clear the user data from the context
	const signout = async () => {
		await fetch('/api/users/signout', {
			method: 'POST',
			credentials: 'include',
		});
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login, register, signout, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

// Custom hook to access the auth context from any component
export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

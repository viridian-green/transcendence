/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/shared.types';

interface AuthContextType {
	user: User | null;
	login: (username: string, password: string) => Promise<void>;
	register: (email: string, username: string, password: string) => Promise<void>;
	signout: () => Promise<void>;
	isLoading: boolean;
	isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
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
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'No user found');
			}
			const data = await response.json();
			setUser(data);
			setIsLoggedIn(true);
		} catch (error) {
			console.error('Failed to check auth status:', error);
			setUser(null);
			setIsLoggedIn(false);
		} finally {
			setIsLoading(false);
		}
	};

	// Used to log in a user, create a session, and store the user data in the context
	const login = async (username: string, password: string) => {
		const response = await fetch('/api/auth/login', {
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
		setIsLoggedIn(true);
	};

	// Used to register a new user, create a session, and store the user data in the context
	const register = async (email: string, username: string, password: string) => {
		const response = await fetch('/api/auth/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ email, username, password }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to register');
		}

		const data = await response.json();
		setUser(data);
		setIsLoggedIn(true);
	};

	// Used to sign out a user and clear the user data from the context
	const signout = async () => {
		await fetch('/api/auth/signout', {
			method: 'POST',
			credentials: 'include',
		});
		setUser(null);
		setIsLoggedIn(false);
	};

	return (
		<AuthContext.Provider value={{ user, login, register, signout, isLoading, isLoggedIn }}>
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

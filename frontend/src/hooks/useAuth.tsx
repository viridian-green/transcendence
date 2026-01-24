/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/shared.types';
import { loginSessionStorageKey } from '@/const';
import { authErroMapper } from '@/pages/auth/utils';

interface AuthContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	login: (username: string, password: string) => Promise<void>;
	register: (email: string, username: string, password: string) => Promise<void>;
	signout: () => Promise<void>;
	isLoading: boolean;
	isLoggedIn: boolean;
	avatarUrl: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAvatar = async (fileName: string) => {
	const res = await fetch(`/api/avatars/${fileName}`, {
		method: 'GET',
		credentials: 'include',
	});
	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.error || 'Failed to fetch avatar');
	}
	const avatar = await res.blob();
	return URL.createObjectURL(avatar);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

	useEffect(() => {
		checkAuth();
	}, []);

	useEffect(() => {
		let objectURL: string | null = null;
		if (!isLoggedIn || !user?.avatar) {
			setAvatarUrl(null);
			return;
		}

		let active = true;

		getAvatar(user.avatar)
			.then((url) => {
				objectURL = url;
				if (active) setAvatarUrl(url);
			})
			.catch(() => {
				setAvatarUrl(null);
			});

		return () => {
			// cleanup avatar URL object when user or avatar changes to prevent memory leaks
			if (objectURL) URL.revokeObjectURL(objectURL);
			active = false;
		};
	}, [isLoggedIn, user?.avatar]);

	// Used to check the session status with the server
	const checkAuth = async () => {
		try {
			const response = await fetch('/api/users/me', {
				credentials: 'include',
			});

			// NOT logged in → normal state
			if (response.status === 401) {
				setUser(null);
				setIsLoggedIn(false);
				return;
			}

			if (!response.ok) {
				throw new Error('Failed to check auth');
			}

			const data = await response.json();
			setUser(data);
			setIsLoggedIn(true);
		} catch (error) {
			console.error('Auth check failed:', error);
			setUser(null);
			setIsLoggedIn(false);
		} finally {
			setIsLoading(false);
		}
	};

	// Used to log in a user, create a session, and store the user data in the context
	const login = async (email: string, password: string) => {
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({ email, password }),
		});

		if (!response.ok) {
			const message = authErroMapper(response.status);
			throw new Error(message);
		}

		const data = await response.json();
		setUser(data);
		setIsLoggedIn(true);

		await checkAuth();
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
			const message = authErroMapper(response.status);
			throw new Error(message);
		}

		const data = await response.json();
		setUser(data);
		setIsLoggedIn(true);

		await checkAuth();
	};

	// Used to sign out a user and clear the user data from the context
	const signout = async () => {
		await fetch('/api/auth/signout', {
			method: 'POST',
			credentials: 'include',
		});
		setUser(null);
		sessionStorage.removeItem(loginSessionStorageKey);
		setIsLoggedIn(false);
	};

	return (
		<AuthContext.Provider
			value={{ user, setUser, login, register, signout, isLoading, isLoggedIn, avatarUrl }}
		>
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

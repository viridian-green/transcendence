import type { User as UserProfile, User } from '@/shared.types';
import { useAuth } from './useAuth';

export function useUserProfile() {
	const { setUser } = useAuth();

	const updateProfile = async (payload: UserProfile) => {
		const response = await fetch('/api/users/me', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: payload.username,
				email: payload.email,
				bio: payload.bio,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to update profile');
		}

		const user = await response.json();
		setUser(user);
		return user;
	};

	const updatePassword = async (password: string) => {
		const response = await fetch('/api/users/me', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ password }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to update profile');
		}

		const user = await response.json();
		setUser(user);
		return user;
	};

	const updateAvatar = async (file: File) => {
		const formData = new FormData();
		formData.append('avatar', file);

		const res = await fetch('/api/users/me/avatar', {
			method: 'POST',
			body: formData,
			credentials: 'include',
		});

		if (!res.ok) {
			const err = await res.json();
			throw new Error(err.error || 'Failed to upload avatar');
		}

		const { avatar }: { avatar: string } = await res.json();
		setUser((prev: User | null) => (prev ? ({ ...prev, avatar } as User) : prev));

		return avatar;
	};

	return {
		updateProfile,
		updateAvatar,
		updatePassword,
	};
}

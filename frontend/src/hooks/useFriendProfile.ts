import { useEffect, useRef, useState } from 'react';
import type { User } from '@/shared.types';
import { getAvatar } from './useAvatar';

export function useFriendProfile(userId?: string | number) {
	const [friend, setFriend] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const avatarUrlRef = useRef<string | null>(null);

	const fetchAvatar = async (user: User) => {
		// Revoke previous avatar URL if it exists
		if (avatarUrlRef.current) {
			URL.revokeObjectURL(avatarUrlRef.current);
		}

		// Use timestamp to force refresh and prevent caching
		try {
			const url = await getAvatar(user.avatar ?? 'default.png', Date.now().toString());
			avatarUrlRef.current = url;
			user.avatar = url;
		} catch {
			// silently ignore avatar fetch errors
		}
	};

	useEffect(() => {
		if (!userId) {
			setFriend(null);
			setLoading(false);
			setError(null);
			return;
		}

		const fetchFriend = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/users/${userId}`, {
					credentials: 'include',
				});
				if (!res.ok) throw new Error('Failed to fetch friend');
				const data = await res.json();
				if (!data || !data.user) {
					throw new Error('User not found');
				}
				const user = data.user;
				await fetchAvatar(user);
				setFriend(user);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error');
				setFriend(null);
			} finally {
				setLoading(false);
			}
		};

		fetchFriend();

		return () => {
			if (avatarUrlRef.current) {
				URL.revokeObjectURL(avatarUrlRef.current);
				avatarUrlRef.current = null;
			}
		};
	}, [userId]);

	return { friend, loading, error };
}

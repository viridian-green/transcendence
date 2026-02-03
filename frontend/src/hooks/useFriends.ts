import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@/shared.types';
import { getAvatar } from './useAvatar';

export function useFriends(userId?: string | number) {
	const [friends, setFriends] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const cleanupFns = useRef<(() => void)[]>([]);
	const avatarUrls = useRef<Map<number, string>>(new Map());

	const fetchAvatar = async (user: User) => {
		let objectURL: string | null = null;
		// Revoke previous avatar URL if it exists
		if (avatarUrls.current.has(user.id)) {
			URL.revokeObjectURL(avatarUrls.current.get(user.id)!);
			avatarUrls.current.delete(user.id);
		}

		// Use timestamp to force refresh and prevent caching
		await getAvatar(user.avatar ?? 'default.png', Date.now().toString())
			.then((url) => {
				objectURL = url;
				user.avatar = url;
				avatarUrls.current.set(user.id, url);
				cleanupFns.current.push(() => URL.revokeObjectURL(objectURL!));
			})
			.catch(() => {});
	};

	useEffect(() => {
		const cleanupFnsArray: (() => void)[] = cleanupFns.current;
		if (!userId) {
			setFriends([]);
			setLoading(false);
			setError(null);
			return;
		}
		const fetchFriends = async () => {
			setLoading(true);
			setError(null);
			try {
				// If userId is provided, fetch that user's friends, otherwise fetch current user's friends
				const url = userId ? `/api/users/friends/${userId}` : '/api/users/friends';
				const res = await fetch(url, { credentials: 'include' });
				if (!res.ok) throw new Error('Failed to fetch friends');
				const data = await res.json();
				await Promise.all((Array.isArray(data) ? data : data.friends).map(fetchAvatar));
				setFriends(Array.isArray(data) ? data : data.friends);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error');
				setFriends([]);
			} finally {
				setLoading(false);
			}
		};
		fetchFriends();
		return () => {
			cleanupFnsArray.forEach((fn) => fn());
		};
	}, [userId, refreshTrigger]);

	const refetch = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

	async function deleteFriend(friendId: number) {
		try {
			const response = await fetch(`/api/users/friends/${friendId}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			if (!response.ok) throw new Error('Failed to delete friend');
		} catch {
			throw new Error('Failed to delete friend, please try again later.');
		}
		setFriends((prevFriends) => prevFriends.filter((friend) => friend.id !== friendId));
	}

	return { friends, loading, error, deleteFriend, refetch };
}

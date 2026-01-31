import { useEffect, useRef, useState } from 'react';
import type { User } from '@/shared.types';
import { getAvatar } from './useAvatar';

export function useFriends(userId?: string | number) {
	const [friends, setFriends] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const cleanupFns = useRef<(() => void)[]>([]);

	const fetchAvatars = async (user: User) => {
		let objectURL: string | null = null;

		// Use timestamp to force refresh and prevent caching
		await getAvatar(user.avatar ?? 'default.png', Date.now().toString())
			.then((url) => {
				objectURL = url;
				user.avatar = url;
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
				const res = await fetch('/api/users/friends', { credentials: 'include' });
				if (!res.ok) throw new Error('Failed to fetch friends');
				const data = await res.json();
				await Promise.all((Array.isArray(data) ? data : data.friends).map(fetchAvatars));
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
	}, [userId]);

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

	// async function addFriend(friendId: number) {
	// 	try {
	// 		const response = await fetch(`/api/users/friends/${friendId}`, { method: 'POST', credentials: 'include' });
	// 		if (!response.ok) throw new Error('Failed to add friend');
	// 		const friendshipId = await response.json();
	// 		console.log('Friend added with ID:', friendshipId);
	// 		return friendshipId;
	// 	} catch {
	// 		throw new Error('Failed to add friend, please try again later.');
	// 	}
	// }

	return { friends, loading, error, deleteFriend };
}

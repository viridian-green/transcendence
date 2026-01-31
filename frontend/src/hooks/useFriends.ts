import { useEffect, useState } from 'react';
import type { User } from '@/shared.types';

export function useFriends(userId?: string | number) {
	const [friends, setFriends] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
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
				setFriends(Array.isArray(data) ? data : data.friends);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error');
				setFriends([]);
			} finally {
				setLoading(false);
			}
		};
		fetchFriends();
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

	return { friends, loading, error, deleteFriend, addFriend };
}

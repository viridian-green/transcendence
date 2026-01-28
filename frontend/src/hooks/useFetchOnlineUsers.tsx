import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

export type OnlineUser = {
	id: string;
	username: string;
};

export function useFetchOnlineUsers(currentUserId?: string, socket?: Socket) {
	const [users, setUsers] = useState<OnlineUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch function defined outside useEffect for reuse
	const fetchOnlineUsers = async () => {
		if (!currentUserId) {
			setUsers([]);
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			setError(null);
			const response = await fetch('/api/presence/online-users', {
				credentials: 'include',
			});
			const data = await response.json();
			const usersList = Array.isArray(data) ? data : data.users;
			if (usersList && usersList.length && typeof usersList[0] === 'string') {
				// If only IDs are returned, fetch user details
				const ids = usersList;
				const detailsRes = await fetch(`/api/users?ids=${ids.join(',')}`);
				if (!detailsRes.ok) throw new Error('Failed to fetch user details');
				const details = await detailsRes.json();
				if (details && Array.isArray(details.users)) {
					setUsers(details.users);
				} else {
					setUsers([]);
				}
			} else if (usersList && usersList.length && usersList[0].username) {
				setUsers(usersList);
			} else {
				setUsers([]);
			}
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('Unknown error');
			}
			setUsers([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOnlineUsers();

		if (socket) {
			socket.on('onlineUsersUpdated', fetchOnlineUsers);
			return () => {
				socket.off('onlineUsersUpdated', fetchOnlineUsers);
			};
		}
		// eslint-disable-next-line
	}, [currentUserId, socket]);

	return { users, loading, error };
}

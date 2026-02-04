import { useEffect, useState } from 'react';

export type BusyUser = {
	id: string;
	username: string;
};

// Accepts a native WebSocket instance (not socket.io-client)
export function useFetchBusyUsers(currentUserId?: string, socket?: WebSocket | null) {
	const [users, setUsers] = useState<BusyUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch function defined outside useEffect for reuse
	const fetchBusyUsers = async () => {
		if (!currentUserId) {
			setUsers([]);
			setLoading(false);
			return;
		}
		try {
			setLoading(true);
			setError(null);
			const response = await fetch('/api/presence/busy-users', {
				credentials: 'include',
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.message || 'Failed to fetch busy users');
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
		fetchBusyUsers();

		if (socket) {
			// Native WebSocket: listen for 'message' events
			const handler = (event: MessageEvent) => {
				const data = JSON.parse(event.data);
				if (data.type === 'onlineUsersUpdated') {
					fetchBusyUsers();
				}
			};
			socket.addEventListener('message', handler);
			return () => {
				socket.removeEventListener('message', handler);
			};
		}
		// eslint-disable-next-line
	}, [currentUserId, socket]);

	return { users, loading, error };
}

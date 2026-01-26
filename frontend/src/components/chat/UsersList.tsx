import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type User = {
	id: string;
	username: string;
	// Add avatar or other fields if needed
};

interface UsersListProps {
	onUserClick: (user: User) => void;
	currentUserId: string;
}

const socket: Socket = io('/api/chat', { autoConnect: true }); // Adjust path/URL as needed

const UsersList: React.FC<UsersListProps> = ({ onUserClick, currentUserId }) => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch('api/chat/online-users');
			if (!response.ok) throw new Error('Failed to fetch online users');
			const data = await response.json();
			const ids: string[] = data.users || [];

			if (ids.length === 0) {
				setUsers([]);
				return;
			}

			const detailsRes = await fetch(`/api/users?ids=${ids.join(',')}`);
			if (!detailsRes.ok) throw new Error('Failed to fetch user details');
			const details = await detailsRes.json();
			const filteredUsers = details.users.filter((user: User) => user.id !== currentUserId);
			setUsers(filteredUsers || []);
		} catch (err: any) {
			setError(err.message || 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(); // Initial load

		// Listen for onlineUsersUpdated event from chat-service
		socket.on('onlineUsersUpdated', fetchUsers);

		return () => {
			socket.off('onlineUsersUpdated', fetchUsers);
		};
	}, []);

	if (loading) return <div>Loading online users...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div>
			<h2 className='private-message -4 mb-4 rounded-lg bg-stone-800 p-4 text-white'>
				Online Users <span role='img' aria-label='friends' title='Friends'></span>
			</h2>
			{users.length === 0 ? (
				<div>No users online.</div>
			) : (
				<ul>
					{users.map((user) => (
						<li
							key={user.id}
							onClick={() => onUserClick(user)}
							className='cursor-pointer px-4 py-2 hover:bg-pink-700'
						>
							{user.username}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default UsersList;

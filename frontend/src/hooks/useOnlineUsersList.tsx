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

export function useOnlineUsersList(currentUserId?: string) {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchOnlineUsers() {
			try {
				setLoading(true);
				setError(null);
				const response = await fetch('/api/presence/online-users', {
					credentials: 'include',
				});
				const data = await response.json();
				let usersList = Array.isArray(data) ? data : data.users;
				if (usersList && usersList.length && usersList[0].username) {
					setUsers(
						usersList.filter((u: User) => !currentUserId || u.id !== currentUserId)
					);
				} else {
					setUsers([]);
				}
			} catch (err: any) {
				setError(err.message || 'Unknown error');
				setUsers([]);
			} finally {
				setLoading(false);
			}
		}
		fetchOnlineUsers();
		// Optionally, add websocket or polling for live updates
	}, [currentUserId]);

	return { users, loading, error };
}

const UsersList: React.FC<UsersListProps> = ({ onUserClick, currentUserId }) => {
	const { users, loading, error } = useOnlineUsersList(currentUserId);

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

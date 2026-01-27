import React from 'react';

type User = {
  id: string;
  username: string;
  // Add avatar or other fields if needed
};

interface UsersListProps {
	users: User[];
	loading: boolean;
	error: string | null;
	onUserClick: (user: User) => void;
	currentUserId: string;
}

const UsersList: React.FC<UsersListProps> = ({ users, loading, error, onUserClick }) => {
	if (loading) return <div>Loading online users...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="m-4 text-white flex flex-col gap-4">
			<div className="chat-labels relative flex items-center">
				<h3 className='private-message text-xs text-white uppercase m-0'>
					Online Users
				</h3>
				<hr className="flex-1 ml-2 border-t" />
			</div>
			{users.length === 0 ? (
				<div className="text-sm">No users online.</div>
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

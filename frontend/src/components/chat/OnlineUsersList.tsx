import React from 'react';

import type { User } from '@/shared.types';

interface UsersListProps {
	users: User[]; // all online users
	friends: User[]; // all friends (not necessarily online)
	loading: boolean;
	error: string | null;
	onUserClick: (user: User) => void;
	currentUserId: string;
}

const UsersList: React.FC<UsersListProps> = ({ users, friends, loading, error, onUserClick }) => {
	if (loading) return <div>Loading online users...</div>;
	if (error) return <div>Error: {error}</div>;

	// Get online friends and online others
	const friendIds = new Set(friends.map(f => String(f.id)));
	const onlineFriends = users.filter(u => friendIds.has(String(u.id)));
	const onlineOthers = users.filter(u => !friendIds.has(String(u.id)));

	return (
		   <div className='flex flex-col gap-4 text-white'>
			   {friends.length > 0 && (
				   <>
					   <div className='chat-labels relative flex items-center'>
						   <h3 className='private-message text-color-muted m-0 text-xs uppercase'>
							   Friends
						   </h3>
						   <hr className='ml-2 flex-1 border-t' />
					   </div>
					   {onlineFriends.length === 0 ? (
						   <div className='color[var(--color-text-muted)] text-sm'>No friends online.</div>
					   ) : (
						   <ul>
							   {onlineFriends.map((user) => (
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
				   </>
			   )}
			<div className='chat-labels relative flex items-center'>
				<h3 className='private-message text-color-muted m-0 text-xs uppercase'>
					Others
				</h3>
				<hr className='ml-2 flex-1 border-t' />
			</div>
			{onlineOthers.length === 0 ? (
				<div className='color[var(--color-text-muted)] text-sm'>No other users online.</div>
			) : (
				<ul>
					{onlineOthers.map((user) => (
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

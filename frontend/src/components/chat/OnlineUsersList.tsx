import { useEffect, useState } from 'react';
import { useSendFriendInvite } from './hooks/useSendFriendInvite';
import type { User } from '@/shared.types';
import GlobalAlert from '../GlobalAlert';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
interface UsersListProps {
	users: User[]; // all online users
	friends: User[]; // all friends (not necessarily online)
	loading: boolean;
	error: string | null;
	onUserClick: (user: User) => void;
	currentUserId: string;
}

function UsersList({ users, friends, loading, error, onUserClick, currentUserId }: UsersListProps) {
	const [alert, setAlert] = useState<{
		visible: boolean;
		message: string;
		type: string;
		userId?: string;
	}>({ visible: false, message: '', type: '' });
	const { friendRequests, lastRawMessage} = useNotificationSocket(true);
	const sendFriendInvite = useSendFriendInvite();

	if (loading) return <div>Loading online users...</div>;
	if (error) return <div>Error: {error}</div>;

	const filteredUsers = users.filter((u) => String(u.id) !== String(currentUserId));
	const friendIds = new Set(friends.map((f) => String(f.id)));
	const onlineFriends = filteredUsers.filter((u) => friendIds.has(String(u.id)));
	const onlineOthers = filteredUsers.filter((u) => !friendIds.has(String(u.id)));

	return (
		<div className='flex flex-col gap-4 text-white'>
			{/* Online Friends Section */}
			{friends.length > 0 && (
				<>
					<div className='chat-labels relative flex items-center'>
						<h3 className='private-message text-color-muted m-0 text-xs uppercase'>
							Friends
						</h3>
						<hr className='ml-2 flex-1 border-t' />
					</div>
					{onlineFriends.length === 0 ? (
						<div className='color[var(--color-text-muted)] text-sm'>
							No friends online.
						</div>
					) : (
						<ul>
							{onlineFriends.map((user) => (
								<li
									key={user.id}
									onClick={() => onUserClick(user)}
									className='cursor-pointer px-4 py-2 hover:bg-[var(--color-border)]'
								>
									{user.username}
								</li>
							))}
						</ul>
					)}
					<div className='chat-labels relative flex items-center'>
						<h3 className='private-message text-color-muted m-0 text-xs uppercase'>Others</h3>
						<hr className='ml-2 flex-1 border-t' />
					</div>
				</>
			)}
			{onlineOthers.length === 0 ? (
				<div className='color[var(--color-text-muted)] text-sm'>No users online.</div>
			) : (
				<ul>
					{onlineOthers.map((user) => {
						const status = friendRequests[String(user.id)] ?? null;
						console.log('User:', user.username, 'Request Status:', status);
						return (
							<li
								key={user.id}
								className='flex items-center justify-between px-4 py-2 hover:bg-[var(--color-border)]'
							>
								<span className='cursor-pointer' onClick={() => onUserClick(user)}>
									{user.username}
								</span>
								<button
									className={
										`ml-2 rounded px-2 py-1 text-xs text-white ` +
										(status === 'pending'
											? 'chat-btn-disabled'
											: 'bg-[var(--color-accent-pink)]')
									}
									onClick={(e) => sendFriendInvite(user, e)}
									disabled={status === 'pending'}
								>
									{status === 'pending' ? 'Invite Pending' : 'Add Friend'}
								</button>
							</li>
						);
					})}
				</ul>
			)}
			<GlobalAlert
				message={alert.message}
				visible={alert.visible}
				type={alert.type}
				onClose={() => setAlert({ ...alert, visible: false })}
			/>
		</div>
	);
}

export default UsersList;

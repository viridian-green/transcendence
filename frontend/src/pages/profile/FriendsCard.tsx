import GlobalAlert from '@/components/GlobalAlert';
import { X } from '@/icons';
import type { Friend } from '@/shared.types';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import type { NotificationFriendRequest } from '@/components/chat/types/chat';

interface FriendsCardProps {
	friends: Friend[];
	onRemoveFriend: (id: number) => void;
	onChallengeFriend: (id: number) => void;
	onRefreshFriends: () => void;
	lastRawMessage: NotificationFriendRequest | null;
}

export function FriendsCard({ friends, onRemoveFriend, onChallengeFriend, onRefreshFriends, lastRawMessage }: FriendsCardProps) {
	const navigate = useNavigate();
	const [deleteFriendAlert, setDeleteFriendAlert] = useState<{
		visible: boolean;
		message: string;
		type: string;
		userId: number;
	}>({ visible: false, message: '', type: '', userId: 0 });

	const onAcceptRemoveFriend = (userId: number) => {
		onRemoveFriend(userId);
		setDeleteFriendAlert({ ...deleteFriendAlert, visible: false });
	};
	const lastProcessedMessageKey = useRef<string | null>(null);

	useEffect(() => {
		const type = lastRawMessage?.type;
		if (
			type !== 'FRIEND_INVITE_ACCEPTED' &&
			type !== 'FRIEND_INVITE_CONFIRMED' &&
			type !== 'FRIEND_DELETED' &&
			type !== 'FRIEND_UNFRIENDED'
		)
			return;

		const messageKey = `${type}:${lastRawMessage?.fromUserId ?? ''}:${lastRawMessage?.toUserId ?? ''}`;
		if (lastProcessedMessageKey.current === messageKey) return;

		lastProcessedMessageKey.current = messageKey;
		onRefreshFriends();
	}, [lastRawMessage, onRefreshFriends]);

	return (
		<div className='border-border bg-surface max-h-[436px] overflow-y-auto rounded-2xl border p-8'>
			<h2 className='mb-6 text-(--color-accent-pink)'>Friends</h2>

			<div className='mb-6 flex'>
				{friends.length === 0 ? (
					<p className='text-text-muted text-center'>
						No friends yet. Add some friends via the Chat to get started!
					</p>
				) : (
					<p className='text-text-muted text-center'>
						Add more friends via the Chat to be able to challenge them!
					</p>
				)}
			</div>

			{/* Friends List */}
			<div className='space-y-3'>
				{friends.length !== 0 &&
					friends.map((friend) => (
						<div
							key={friend.id}
							className='border-border bg-elevated flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-(--color-accent-pink)/50'
						>
							{/* Avatar with Status */}
							<div className='relative'>
								<button
									className='border-border h-12 w-12 overflow-hidden rounded-full border-2 bg-(--color-bg) hover:cursor-pointer'
									onClick={() => {
										navigate(`/profile/${friend.id}`);
									}}
								>
									<img
										src={friend.avatar}
										alt={friend.username}
										className='h-full w-full object-cover'
									/>
								</button>
								{/* Status Indicator */}
								{friend.status === 'online' && (
									<div className='border-elevated bg-status-online absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2' />
								)}
								{friend.status === 'busy' && (
									<div className='border-elevated bg-status-busy absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2' />
								)}
								{friend.status === 'offline' && (
									<div className='border-elevated bg-text-muted absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2' />
								)}
							</div>

							{/* Username */}
							<div className='flex-1'>
								<p className='text-(--color-text-primary)'>{friend.username}</p>
								<p className='text-text-muted'>
									{friend.status === 'online' && 'Online'}
									{friend.status === 'busy' && 'Busy'}
									{friend.status === 'offline' && 'Offline'}
								</p>
							</div>
							{/* Challenge Button */}
							{friend.status === 'online' && (
								<button
									type='button'
									onClick={() => onChallengeFriend(friend.id)}
									className='text-text-muted hover:bg-accent-pink/10 hover:text-accent-pink rounded-md border-0 p-1'
								>
									Challenge
								</button>
							)}

							{/* Remove Button */}
							<button
								type='button'
								onClick={() =>
									setDeleteFriendAlert({
										visible: true,
										message: `Are you sure you want to remove ${friend.username} from your friends?`,
										type: 'remove',
										userId: friend.id,
									})
								}
								className='text-text-muted hover:bg-accent-pink/10 hover:text-accent-pink rounded-md border-0 p-1'
							>
								<X className='h-4 w-4' />
							</button>
						</div>
					))}
			</div>
			<GlobalAlert
				message={deleteFriendAlert.message}
				visible={deleteFriendAlert.visible}
				type={deleteFriendAlert.type}
				acceptText='Yes'
				declineText='No'
				onClose={() => setDeleteFriendAlert({ ...deleteFriendAlert, visible: false })}
				onDecline={() => setDeleteFriendAlert({ ...deleteFriendAlert, visible: false })}
				onAccept={() => onAcceptRemoveFriend(deleteFriendAlert.userId)}
			/>
		</div>
	);
}

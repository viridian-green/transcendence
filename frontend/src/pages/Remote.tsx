import { useEffect, useState } from 'react';
import { PinkButton } from '@/components';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import { useNavigate } from 'react-router-dom';
import type { Friend } from '@/shared.types';
import { useFriendsWithStatus } from '@/hooks/useFriendsPresence';
import { useAuth } from '@/hooks/useAuth';

type InvitePopupState = {
	fromUserId: string;
	fromUsername: string;
	gameMode: string;
} | null;

const Remote = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { friends, loading: friendsLoading } = useFriendsWithStatus(user?.id);
	//  console.log('🟢 FRIENDS WITH STATUS:', friends);
	const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
	const [incomingInvite, setIncomingInvite] = useState<InvitePopupState>(null);
	const { send, lastRawMessage, isConnected } = useNotificationSocket(true);

	useEffect(() => {
		if (!lastRawMessage) return;

		if (lastRawMessage.type === 'INVITE_RECEIVED') {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setIncomingInvite({
				fromUserId: lastRawMessage.fromUserId,
				fromUsername: lastRawMessage.fromUsername,
				gameMode: lastRawMessage.gameMode || 'pong',
			});
		}

		if (lastRawMessage.type === 'GAME_START') {
			const { gameId, leftPlayerId, rightPlayerId, yourSide, leftPlayer, rightPlayer } =
				lastRawMessage;

			navigate(`/game/${gameId}`, {
				state: {
					leftPlayerId: leftPlayerId,
					rightPlayerId: rightPlayerId,
					leftPlayer: leftPlayer,
					rightPlayer: rightPlayer,
					side: yourSide,
					mode: 'remote',
				},
			});
		}
	}, [lastRawMessage, navigate]);

	const handleChallenge = (friend: Friend) => {
		if (friend.status !== 'online' || !isConnected) return;

		send({
			type: 'INVITE',
			toUserId: friend.id,
			gameMode: 'pong',
		});
	};

	const handleInviteAccept = () => {
		if (!incomingInvite || !isConnected) {
			setIncomingInvite(null);
			return;
		}

		send({
			type: 'INVITE_ACCEPT',
			fromUserId: incomingInvite.fromUserId,
		});

		setIncomingInvite(null);
	};

	const handleInviteDecline = () => {
		setIncomingInvite(null);
	};

	return (
		<div className='flex flex-1 flex-col items-center justify-center gap-6 p-4'>
			<h1 className='text-accent-pink font-retro text-4xl font-bold'>Remote</h1>

			{friendsLoading ? (
				<p className='text-text-muted py-8 text-center'>Loading friends...</p>
			) : friends.length === 0 ? (
				<p className='text-text-muted py-8 text-center'>
					No friends yet. Add some friends via the Chat to get started!
				</p>
			) : (
				<div className='w-full max-w-xl space-y-4'>
					{friends.map((friend) => (
						<div
							key={friend.id}
							className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 ${
								selectedFriend?.id === friend.id
									? 'border-accent-pink bg-surface'
									: 'border-border bg-bg'
							}`}
						>
							<button
								type='button'
								onClick={() => setSelectedFriend(friend)}
								className='flex flex-1 items-center justify-between text-left'
							>
								<div>
									<p className='text-lg font-semibold'>{friend.username}</p>
									<p className='text-text-secondary text-sm'>
										{friend.status === 'online' && 'Online'}
										{friend.status === 'busy' && 'Playing'}
										{friend.status === 'offline' && 'Offline'}
									</p>
								</div>
								<span
									className={`ml-4 h-3 w-3 rounded-full ${
										friend.status === 'online'
											? 'bg-status-online'
											: friend.status === 'busy'
												? 'bg-status-busy'
												: 'bg-text-muted'
									}`}
								/>
							</button>

							<PinkButton
								text='Challenge'
								className={`text-accent-pink ml-4 ${friend.status !== 'online' || !isConnected ? 'no-scale opacity-50' : ''}`}
								disabled={friend.status !== 'online' || !isConnected}
								onClick={() => handleChallenge(friend)}
							/>
						</div>
					))}
				</div>
			)}

			{incomingInvite && (
				<div className='fixed inset-0 flex items-center justify-center bg-black/50'>
					<div className='bg-surface rounded-lg p-6 shadow-lg'>
						<p className='mb-4 text-lg font-semibold'>
							{incomingInvite.fromUsername} invites you to play{' '}
							{incomingInvite.gameMode}.
						</p>
						<div className='flex justify-end gap-2'>
							<button
								type='button'
								className='rounded border px-3 py-1'
								onClick={handleInviteDecline}
							>
								Cancel
							</button>
							<PinkButton
								text='Accept'
								className='px-3 py-1'
								onClick={handleInviteAccept}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Remote;

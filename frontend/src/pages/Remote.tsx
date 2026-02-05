import { useCallback, useEffect, useState } from 'react';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';
import { useNavigate } from 'react-router-dom';
import type { Friend } from '@/shared.types';
import { useFriendsWithStatus } from '@/hooks/useFriendsPresence';
import { useAuth } from '@/hooks/useAuth';
import GlobalAlert from '@/components/GlobalAlert';
import { FriendsCard } from './profile/FriendsCard';

type InvitePopupState = {
	fromUserId: string;
	fromUsername: string;
	gameMode: string;
} | null;

const Remote = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { friends, loading: friendsLoading, refetch } = useFriendsWithStatus(user?.id);
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

	const handleRefreshFriends = useCallback(() => {
		refetch();
	}, [refetch]);

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
					<FriendsCard
						friends={friends}
						onChallengeFriend={handleChallenge}
						onRefreshFriends={handleRefreshFriends}
						onRemoveFriend={() => {}}
						lastRawMessage={lastRawMessage}
						deleteable={false}
					/>
				</div>
			)}

			{incomingInvite && (
				<GlobalAlert
					message={`${incomingInvite.fromUsername} invites you to play ${incomingInvite.gameMode}.`}
					visible={incomingInvite !== null}
					type={'received'}
					acceptText='Yes'
					declineText='No'
					onClose={handleInviteDecline}
					onDecline={handleInviteDecline}
					onAccept={handleInviteAccept}
				/>
			)}
		</div>
	);
};

export default Remote;

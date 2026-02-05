import { Toast, type ToastType } from '@components/index';
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FriendsCard } from './profile/FriendsCard';
import { useFriendsWithStatus } from '@/hooks/useFriendsPresence';
import { useNavigate } from 'react-router-dom';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

type InvitePopupState = {
	fromUserId: string;
	fromUsername: string;
	gameMode: string;
} | null;

const Remote = () => {
	const { user } = useAuth();
	const { friends, error: friendsError, deleteFriend, refetch } = useFriendsWithStatus(user?.id);
	const [incomingInvite, setIncomingInvite] = useState<InvitePopupState>(null);
	const { send, lastRawMessage, isConnected } = useNotificationSocket(Boolean(user));
	const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>({
		show: false,
		message: '',
		type: 'success',
	});
	const navigate = useNavigate();

	// Memoize refetch to prevent infinite loops
	const handleRefreshFriends = useCallback(() => {
		refetch();
	}, [refetch]);

	// Handle incoming notifications (must be before conditional returns)
	useEffect(() => {
		if (!lastRawMessage) return;

		if (lastRawMessage.type === 'INVITE_RECEIVED') {
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

	const handleRemoveFriend = async (id: number) => {
		try {
			await deleteFriend(id);
		} catch (error) {
			setToast({
				show: true,
				message: error instanceof Error ? error.message : 'Failed to remove friend',
				type: 'failure',
			});
			return;
		}
		setToast({ show: true, message: `Friend removed`, type: 'success' });
	};

	// Check user/auth state first before showing loading UI
	if (!user || friendsError) {
		return null;
	}

	const handleChallengeFriend = (id: number) => {
		const friend = friends.find((f) => f.id === id);
		if (!friend || friend.status !== 'online') return;
		if (!isConnected) {
			setToast({
				show: true,
				message: 'Not connected to server. Try again later.',
				type: 'failure',
			});
			return;
		}

		send({
			type: 'INVITE',
			toUserId: friend.id,
			gameMode: 'pong',
		});
		setToast({
			show: true,
			message: 'Stay on this page while your friend accepts',
			type: 'success',
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
		<div className='flex flex-1'>
			{toast?.show && toast.message !== 'Stay on this page while your friend accepts' && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast({ show: false, message: '', type: 'success' })}
				/>
			)}

			{/* Invitation Received Modal */}
			{incomingInvite && (
				<div className='bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black'>
					<div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
						<h2 className='mb-2 text-lg font-bold text-black'>Game Invitation</h2>
						<p className='mb-4 text-black'>
							<strong className='text-black'>{incomingInvite.fromUsername}</strong>{' '}
							invited you to play{' '}
							<strong className='text-black'>{incomingInvite.gameMode}</strong>!
						</p>
						<div className='flex justify-end gap-2'>
							<button
								className='rounded border border-pink-700 bg-pink-500 px-4 py-2 font-semibold text-black hover:bg-pink-600'
								onClick={handleInviteAccept}
							>
								Accept
							</button>
							<button
								className='rounded border border-pink-400 bg-pink-200 px-4 py-2 font-semibold text-black hover:bg-pink-300'
								onClick={handleInviteDecline}
							>
								Decline
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Hang tight! Confirmation Modal */}
			{toast?.show &&
				toast.type === 'success' &&
				toast.message === 'Stay on this page while your friend accepts' && (
					<div className='bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black'>
						<div className='flex w-full max-w-sm flex-col items-center rounded-lg bg-white p-6 shadow-lg'>
							<p className='mb-4 text-center font-semibold text-black'>
								Stay on this page while your friend accepts
							</p>
							<button
								className='rounded border border-pink-700 bg-pink-500 px-4 py-2 font-semibold text-black hover:bg-pink-600'
								onClick={() =>
									setToast({ show: false, message: '', type: 'success' })
								}
							>
								Close
							</button>
						</div>
					</div>
				)}

			<main className='mx-auto my-auto max-w-6xl flex-1 overflow-y-auto px-6 py-8'>
				<div className='grid gap-6 md:grid-cols-2'>
					<FriendsCard
						friends={friends}
						onRemoveFriend={handleRemoveFriend}
						onChallengeFriend={handleChallengeFriend}
						onRefreshFriends={handleRefreshFriends}
						lastRawMessage={lastRawMessage}
					/>
				</div>
			</main>
		</div>
	);
};

export default Remote;

import { Toast, type ToastType } from '@components/index';
import { useState, useCallback, useEffect } from 'react';
import { ProfileCard } from './ProfileCard';
import { useAuth } from '@/hooks/useAuth';
import { FriendsCard } from './FriendsCard';
import { useFriendsWithStatus } from '@/hooks/useFriendsPresence';
import { useNavigate } from 'react-router-dom';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

const Profile = () => {
	const { user, avatarUrl } = useAuth();
	const {
		friends,
		loading: friendsWithStatusLoading,
		error: friendsError,
		deleteFriend,
		refetch,
	} = useFriendsWithStatus(user?.id);
	const { lastRawMessage } = useNotificationSocket(Boolean(user));
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

	const handleChallengeFriend = () => {
		navigate(`/remote`);
	};

	// Track initial load vs subsequent refreshes
	const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

	// Move state transition into useEffect to avoid render side-effects
	// Only set hasInitiallyLoaded once when loading completes
	useEffect(() => {
		if (!friendsWithStatusLoading && !hasInitiallyLoaded) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setHasInitiallyLoaded(true);
		}
	}, [friendsWithStatusLoading, hasInitiallyLoaded]);

	if (!hasInitiallyLoaded && friendsWithStatusLoading) {
		// Only show loading screen on initial load
		return <div>Loading friends...</div>;
	}

	if (!user || friendsError) {
		return null;
	}

	return (
		<div className='flex flex-1'>
			{toast?.show && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast({ show: false, message: '', type: 'success' })}
				/>
			)}
			<main className='mx-auto my-auto max-w-6xl flex-1 overflow-y-auto px-6 py-8'>
				<div className='grid gap-6 md:grid-cols-2'>
					<ProfileCard profile={user} avatar={avatarUrl} />
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

export default Profile;

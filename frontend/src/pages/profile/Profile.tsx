import { Toast, type ToastType } from '@components/index';
import { useState } from 'react';
import { ProfileCard } from './ProfileCard';
import { useAuth } from '@/hooks/useAuth';
import { FriendsCard } from './FriendsCard';
import { useFriends } from '@/hooks/useFriends';
import { useFriendsWithStatus } from '@/hooks/useFriendsPresence';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
	const { user, avatarUrl } = useAuth();
	const { deleteFriend, loading: friendsLoading, error: friendsError } = useFriends(user?.id);
	const { friends, loading: friendsWithStatusLoading } = useFriendsWithStatus(user?.id);
	const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>({
		show: false,
		message: '',
		type: 'success',
	});
	const navigate = useNavigate();

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

	if (!user || friendsError) {
		return null;
	}
	if (friendsLoading || friendsWithStatusLoading) {
		return <div>Loading friends...</div>;
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
						// onAddFriend={handleAddFriend}
						onRemoveFriend={handleRemoveFriend}
						onChallengeFriend={handleChallengeFriend}
					/>
				</div>
			</main>
		</div>
	);
};

export default Profile;

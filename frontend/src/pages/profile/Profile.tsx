import { Toast, type ToastType } from '@components/index';
import type { Friend } from '@/shared.types';
import { useState } from 'react';
import { ProfileCard } from './ProfileCard';
import { useAuth } from '@/hooks/useAuth';
import { FriendsCard } from './FriendsCard';

const MOCK_FRIENDS: Friend[] = [
	{
		id: 1,
		username: 'dai',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dai',
		status: 'online',
	},
	{
		id: 2,
		username: 'adele',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Adele',
		status: 'offline',
	},
	{
		id: 3,
		username: 'vanessa',
		avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vanessa',
		status: 'online',
	},
];

const Profile = () => {
	const { user, avatarUrl } = useAuth();
	const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
	const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>({
		show: false,
		message: '',
		type: 'success',
	});

	const handleAddFriend = (username: string) => {
		// TODO implement actual add friend logic
		setFriends((prev) => [
			...prev,
			{
				id: prev.length + 1,
				username,
				avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=128`,
				status: 'offline',
			},
		]);
		setToast({ show: true, message: `Friend request sent to ${username}`, type: 'success' });
	};

	const handleRemoveFriend = (id: number) => {
		// TODO implement actual remove friend logic
		setFriends((prev) => prev.filter((friend) => friend.id !== id));
		setToast({ show: true, message: `Friend removed`, type: 'success' });
	};

	const handleChallengeFriend = (id: number) => {
		// TODO implement actual challenge friend logic
		alert(`Challenge sent to friend with ID: ${id}`);
	};

	if (!user) {
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
			<main className='mx-auto max-w-6xl flex-1 overflow-y-auto px-6 py-8'>
				<div className='grid gap-6 md:grid-cols-2'>
					<ProfileCard profile={user} avatar={avatarUrl} />
					<FriendsCard
						friends={friends}
						onAddFriend={handleAddFriend}
						onRemoveFriend={handleRemoveFriend}
						onChallengeFriend={handleChallengeFriend}
					/>
				</div>
			</main>
		</div>
	);
};

export default Profile;

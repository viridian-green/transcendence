import { Avatar, Toast, type ToastType } from '@components/index';
import { ArrowLeft } from '@/icons';
import type { Friend, UserProfile } from '@/shared.types';
import { useState } from 'react';
import { ProfileCard } from './ProfileCard';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from './StatsCard';
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
	const { user } = useAuth();
	const profile: UserProfile = {
		id: user?.id as number,
		username: user?.username as string,
		email: user?.email as string,
		avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username as string)}&size=128`,
		bio: 'This is a sample bio.', // TODO backend bio field
	};

	const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
	const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>({
		show: false,
		message: '',
		type: 'success',
	});

	console.log(friends, setFriends);

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

	if (!user) {
		return null;
	}

	return (
		<div className='bg-bg min-h-screen'>
			{/* TODO create sonner or toaster component */}
			{toast?.show && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast({ show: false, message: '', type: 'success' })}
				/>
			)}
			<header className='border-border bg-surface border-b'>
				<div className='mx-auto max-w-6xl px-6 py-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-4'>
							<Avatar size={64} className='hover:opacity-100' url={profile.avatar} />
							<div>
								<h1 className='text-accent-pink'>{profile.username}</h1>
								<p className='text-text-secondary'>{profile.email}</p>
							</div>
						</div>
						{/* TODO extract to custom component */}
						<button
							type='button'
							className='text-text-secondary hover:bg-elevated hover:text-accent-pink rounded-lg px-2 py-1.5'
							onClick={() => window.history.back()}
						>
							<div className='flex items-center gap-2 hover:cursor-pointer'>
								<ArrowLeft className='h-5 w-5' />
								Back
							</div>
						</button>
					</div>
				</div>
			</header>

			<main className='mx-auto max-w-6xl px-6 py-8'>
				<div className='grid gap-6 md:grid-cols-2'>
					<ProfileCard profile={profile} />
					<FriendsCard
						friends={friends}
						onAddFriend={handleAddFriend}
						onRemoveFriend={handleRemoveFriend}
					/>
					<StatsCard />
				</div>

				<div className='mt-6 grid gap-6 md:grid-cols-2'>
					{/* <PasswordCard onUpdate={handlePasswordUpdate} /> */}
				</div>

				{profile.bio && (
					<div className='border-border bg-surface mt-6 rounded-2xl border p-8'>
						<h2 className='text-accent-pink mb-4'>About</h2>
						<p className='text-text-secondary leading-relaxed'>{profile.bio}</p>
					</div>
				)}
			</main>
		</div>
	);
};

export default Profile;

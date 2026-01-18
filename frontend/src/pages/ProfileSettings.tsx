import { Avatar, Toast, type ToastType } from '@components/index';
import { ArrowLeft } from '@/icons';
import type { UserProfile } from '@/shared.types';
import { useState } from 'react';
import { ProfileSettingsCard } from './ProfileSettingsCard';
import { ChangePasswordCard } from './ChangePasswordCard';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

const ProfileSettings = () => {
	const { user } = useAuth();
	const { updateProfile, updatePassword } = useUserProfile();
	const [profile, setProfile] = useState<UserProfile>({
		id: user?.id as number,
		username: user?.username as string,
		email: user?.email as string,
		avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username as string)}&size=128`,
		bio: 'This is a sample bio.', // TODO backend bio field
	});

	const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>({
		show: false,
		message: '',
		type: 'success',
	});

	const handleProfileUpdate = async (updatedProfile: UserProfile) => {
		try {
			const user = await updateProfile(updatedProfile);
			setProfile(user);
			setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
		} catch {
			setToast({ show: true, message: 'Failed to update profile.', type: 'failure' });
		}
	};

	const handlePasswordUpdate = async (newPassword: string) => {
		try {
			const user = await updatePassword(newPassword);
			setProfile(user);
			setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
		} catch {
			setToast({ show: true, message: 'Failed to update profile.', type: 'failure' });
		}
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
				<div className='mx-auto max-w-6xl px-6 py-6'>
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
					<ProfileSettingsCard profile={profile} onUpdate={handleProfileUpdate} />
					<div>
						<ChangePasswordCard onUpdate={handlePasswordUpdate} />
					</div>
				</div>
			</main>
		</div>
	);
};

export default ProfileSettings;

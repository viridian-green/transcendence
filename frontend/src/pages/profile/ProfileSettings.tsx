import { Toast, type ToastType } from '@components/index';
import type { User as UserProfile } from '@/shared.types';
import { useState } from 'react';
import { ProfileSettingsCard } from './ProfileSettingsCard';
import { ChangePasswordCard } from './ChangePasswordCard';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

const ProfileSettings = () => {
	const { user, avatarUrl } = useAuth();
	const { updateProfile, updatePassword, updateAvatar } = useUserProfile();
	const [profile, setProfile] = useState<UserProfile>({
		id: user?.id as number,
		username: user?.username as string,
		email: user?.email as string,
		avatar: user?.avatar,
		bio: user?.bio || '',
	});

	const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>({
		show: false,
		message: '',
		type: 'success',
	});

	const handleProfileUpdate = async (updatedProfile: UserProfile, avatarFile: File | null) => {
		try {
			const user = await updateProfile(updatedProfile);
			setProfile({
				...updatedProfile,
				id: user.id,
				username: user.username,
				email: user.email,
				bio: user.bio || '',
				avatar: user.avatar, // Update avatar in profile state
			});
			if (avatarFile) {
				const newAvatar = await updateAvatar(avatarFile);
				// Update profile state with new avatar filename
				setProfile((prev) => ({ ...prev, avatar: newAvatar }));
			}
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
					<ProfileSettingsCard
						profile={profile}
						avatar={avatarUrl}
						onUpdate={handleProfileUpdate}
					/>
					<div>
						<ChangePasswordCard onUpdate={handlePasswordUpdate} />
					</div>
				</div>
			</main>
		</div>
	);
};

export default ProfileSettings;

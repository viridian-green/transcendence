import { Toast, type ToastType } from '@components/index';
import type { UserProfile } from '@/shared.types';
import { useState, useEffect } from 'react';
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
		bio: '',
	});

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const response = await fetch('/api/users/me', {
					credentials: 'include',
				});
				if (response.ok) {
					const userData = await response.json();
					setProfile({
						id: userData.id,
						username: userData.username,
						email: userData.email,
						avatar: userData.avatar
							? `/uploads/avatars/${userData.avatar}`
							: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&size=128`,
						bio: userData.bio || '',
					});
				}
			} catch (error) {
				console.error('Failed to fetch user profile:', error);
			}
		};

		if (user) {
			fetchUserProfile();
		}
	}, [user]);

	const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType } | null>({
		show: false,
		message: '',
		type: 'success',
	});

	const handleProfileUpdate = async (updatedProfile: UserProfile) => {
		try {
			const user = await updateProfile(updatedProfile);
			setProfile({
				...updatedProfile,
				id: user.id,
				username: user.username,
				email: user.email,
				bio: user.bio || '',
			});
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

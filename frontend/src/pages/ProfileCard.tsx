import { Avatar } from '@/components';
import { Camera, Save } from '@/icons';
import type { UserProfile } from '@/shared.types';
import React, { useState } from 'react';

interface ProfileCardProps {
	profile: UserProfile;
	onUpdate: (profile: UserProfile) => void;
}

export function ProfileCard({ profile, onUpdate }: ProfileCardProps) {
	const [formData, setFormData] = useState(profile);
	const [previewUrl, setPreviewUrl] = useState(profile.avatar);

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const result = reader.result as string;
				setPreviewUrl(result);
				setFormData({ ...formData, avatar: result });
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onUpdate(formData);
	};

	return (
		<div className='text-text-secondary rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8'>
			<h2 className='mb-6 text-[var(--color-accent-pink)]'>Profile Settings</h2>

			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Avatar Upload */}
				<div className='flex flex-col items-center gap-4'>
					<div className='relative'>
						<Avatar size={128} className='hover:opacity-100' url={previewUrl} />
						<label
							htmlFor='avatar-upload'
							className='absolute right-0 bottom-0 cursor-pointer rounded-full bg-[var(--color-accent-pink)] p-2 transition-colors hover:bg-[var(--color-accent-pink-hover)]'
						>
							<Camera className='h-5 w-5 text-[var(--color-text-inverse)]' />
							<input
								id='avatar-upload'
								type='file'
								accept='image/*'
								onChange={handleAvatarChange}
								className='hidden'
							/>
						</label>
					</div>
				</div>

				{/* Username */}
				<div className='flex flex-col space-y-2'>
					<label htmlFor='username'>Username</label>
					<input
						type='text'
						id='username'
						value={formData.username}
						onChange={(e) => setFormData({ ...formData, username: e.target.value })}
						className='rounded-md border-[var(--color-border)] bg-[var(--color-elevated)] px-2 py-1 focus:border-[var(--color-accent-pink)]'
					/>
				</div>

				{/* Email */}
				<div className='flex flex-col space-y-2'>
					<label htmlFor='email'>Email</label>
					<input
						type='email'
						id='email'
						value={formData.email}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						className='rounded-md border-[var(--color-border)] bg-[var(--color-elevated)] px-2 py-1 focus:border-[var(--color-accent-pink)]'
					/>
				</div>

				{/* Bio */}
				<div className='flex flex-col space-y-2'>
					<label htmlFor='bio'>Bio</label>
					<textarea
						id='bio'
						value={formData.bio}
						onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
						rows={4}
						className='resize-none rounded-md border-[var(--color-border)] bg-[var(--color-elevated)] px-2 py-1 focus:border-[var(--color-accent-pink)]'
						placeholder='Tell us about yourself...'
					/>
				</div>

				{/* Save Button */}
				<button
					type='submit'
					className='flex w-full items-center justify-center rounded-lg bg-[var(--color-accent-pink)] px-4 py-2 text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-pink-hover)]'
				>
					<Save className='mr-2 h-4 w-4' />
					Save Changes
				</button>
			</form>
		</div>
	);
}

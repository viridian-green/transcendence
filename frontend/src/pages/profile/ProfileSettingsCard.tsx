import { Avatar, Card, CardTitle, ErrorMessage } from '@/components';
import { Camera, Save } from '@/icons';
import type { UserProfile } from '@/shared.types';
import React, { useState } from 'react';
import z, { ZodError } from 'zod';

const profileUpdateSchema = z.object({
	email: z.email('Invalid email address'),
	username: z
		.string()
		.min(1, 'Username is required')
		.max(15, 'Username must be at most 15 characters'),
	bio: z.string().max(160, 'Bio must be at most 160 characters'),
	avatar: z.string().url('Invalid avatar URL'),
});

interface ProfileSettingsCardProps {
	profile: UserProfile;
	onUpdate: (profile: UserProfile) => void;
}

export function ProfileSettingsCard({ profile, onUpdate }: ProfileSettingsCardProps) {
	const [formData, setFormData] = useState(profile);
	const [previewUrl, setPreviewUrl] = useState(profile.avatar);
	const [error, setError] = useState<string | null>(null);

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
		try {
			profileUpdateSchema.parse({
				email: formData.email,
				username: formData.username,
				bio: formData.bio,
				avatar: formData.avatar,
			});
			onUpdate(formData);
		} catch (err) {
			if (err instanceof ZodError) {
				setError(err.issues[0].message);
				return;
			}
			setError('An unexpected error occurred.');
		}
		if (error) {
			setError(null);
		}
	};

	return (
		<Card>
			<CardTitle>Profile Settings</CardTitle>

			<form onSubmit={handleSubmit} className='space-y-4'>
				{/* Avatar Upload */}
				<div className='flex flex-col items-center gap-4'>
					<div className='relative'>
						<Avatar size={128} className='hover:opacity-100' url={previewUrl} />
						<label
							htmlFor='avatar-upload'
							className='hover:bg-accent-pink-hover absolute right-0 bottom-0 cursor-pointer rounded-full bg-(--color-accent-pink) p-2 transition-colors'
						>
							<Camera className='h-5 w-5 text-(--color-text-inverse)' />
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
						className='border-border bg-elevated rounded-md px-2 py-1 focus:border-(--color-accent-pink)'
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
						className='border-border bg-elevated rounded-md px-2 py-1 focus:border-(--color-accent-pink)'
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
						className='border-border bg-elevated resize-none rounded-md px-2 py-1 focus:border-(--color-accent-pink)'
						placeholder='Tell us about yourself...'
					/>
				</div>
				{error && <ErrorMessage message={error} />}

				{/* Save Button */}
				<button
					type='submit'
					className='bg-accent-blue hover:bg-accent-blue/90 flex w-full items-center justify-center rounded-lg px-4 py-2 text-(--color-text-inverse)'
				>
					<Save className='mr-2 h-4 w-4' />
					Save Changes
				</button>
			</form>
		</Card>
	);
}

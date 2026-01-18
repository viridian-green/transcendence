import { Card, CardTitle, ErrorMessage } from '@/components';
import { EyeOff, Eye, Lock } from '@/icons';
import React, { useState } from 'react';
import z from 'zod';

const passwordSchema = z
	.object({
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.max(15, 'Password must be at most 15 characters')
			.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
			.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
			.regex(/[0-9]/, 'Password must contain at least one number')
			.regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

interface ChangePasswordCardProps {
	onUpdate: (newPassword: string) => void;
}

export function ChangePasswordCard({ onUpdate }: ChangePasswordCardProps) {
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		newPassword: '',
		confirmPassword: '',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		try {
			passwordSchema.parse({
				password: formData.newPassword,
				confirmPassword: formData.confirmPassword,
			});
		} catch (err) {
			if (err instanceof z.ZodError) {
				setError(err.issues[0].message);
				return;
			}
		}
		if (error) {
			setError(null);
		}
		onUpdate(formData.newPassword);
		setFormData({
			newPassword: '',
			confirmPassword: '',
		});
	};

	return (
		<Card>
			<CardTitle>Change Password</CardTitle>

			<form onSubmit={handleSubmit} className='space-y-4'>
				{/* New Password */}
				<div className='flex flex-col space-y-2'>
					<label htmlFor='new-password'>New Password</label>
					<div className='relative'>
						<input
							id='new-password'
							type={showNewPassword ? 'text' : 'password'}
							value={formData.newPassword}
							onChange={(e) =>
								setFormData({ ...formData, newPassword: e.target.value })
							}
							className='border-border bg-elevated w-full rounded-md px-2 py-1 focus:border-(--color-accent-pink)'
							required
						/>
						<button
							type='button'
							onClick={() => setShowNewPassword(!showNewPassword)}
							className='text-text-muted absolute top-1/2 right-3 -translate-y-1/2 hover:text-(--color-text-primary)'
						>
							{showNewPassword ? (
								<EyeOff className='h-4 w-4' />
							) : (
								<Eye className='h-4 w-4' />
							)}
						</button>
					</div>
				</div>

				{/* Confirm Password */}
				<div className='flex flex-col space-y-2'>
					<label htmlFor='confirm-password'>Confirm New Password</label>
					<div className='relative'>
						<input
							id='confirm-password'
							type={showConfirmPassword ? 'text' : 'password'}
							value={formData.confirmPassword}
							onChange={(e) =>
								setFormData({ ...formData, confirmPassword: e.target.value })
							}
							className='border-border bg-elevated w-full rounded-md px-2 py-1 focus:border-(--color-accent-pink)'
							required
						/>
						<button
							type='button'
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className='text-text-muted absolute top-1/2 right-3 -translate-y-1/2 hover:text-(--color-text-primary)'
						>
							{showConfirmPassword ? (
								<EyeOff className='h-4 w-4' />
							) : (
								<Eye className='h-4 w-4' />
							)}
						</button>
					</div>
				</div>
				{error && <ErrorMessage message={error} />}

				{/* Update Password Button */}
				<button
					type='submit'
					className='bg-accent-blue hover:bg-accent-blue/90 flex w-full items-center justify-center rounded-lg px-4 py-2 text-(--color-text-inverse)'
				>
					<Lock className='mr-2 h-4 w-4' />
					Update Password
				</button>
			</form>
		</Card>
	);
}

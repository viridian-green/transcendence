import { Avatar, Card, CardTitle } from '@/components';
import type { User as UserProfile } from '@/shared.types';

interface ProfileCardProps {
	profile: UserProfile;
	avatar: string | null;
}

export function ProfileCard({ profile, avatar }: ProfileCardProps) {
	return (
		<Card>
			<CardTitle>Profile</CardTitle>
			<div className='space-y-4'>
				{/* Avatar */}
				<div className='flex flex-col items-center gap-4'>
					<Avatar
						size={128}
						className='hover:opacity-100'
						url={
							avatar ??
							`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&size=128`
						}
					/>
				</div>

				{/* Username */}
				<div className='flex flex-col'>
					{/* <label className='text-text-muted'>Username</label> */}
					<p className='font-retro color-brand text-sm'>{profile.username}</p>
				</div>

				{/* Email */}
				<div className='flex flex-col'>
					<label className='text-text-muted'>Email</label>
					<p className='text-text'>{profile.email}</p>
				</div>

				{/* Bio */}
				{profile.bio && (
					<div className='flex flex-col'>
						<label className='text-text-muted'>Bio</label>
						<p className='text-text leading-relaxed'>{profile.bio}</p>
					</div>
				)}
			</div>
		</Card>
	);
}

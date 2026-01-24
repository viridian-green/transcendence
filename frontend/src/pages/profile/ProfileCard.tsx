import { Avatar, Card, CardTitle } from '@/components';
import type { UserProfile } from '@/shared.types';

interface ProfileCardProps {
	profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
	return (
		<Card>
			<CardTitle>Profile</CardTitle>
			<div className='space-y-6'>
				{/* Avatar */}
				<div className='flex flex-col items-center gap-4'>
					<Avatar size={128} className='hover:opacity-100' url={profile.avatar} />
				</div>

				{/* Username */}
				<div className='flex flex-col space-y-2'>
					<label className='text-text-secondary text-sm'>Username</label>
					<p className='text-accent-pink'>{profile.username}</p>
				</div>

				{/* Email */}
				<div className='flex flex-col space-y-2'>
					<label className='text-text-secondary text-sm'>Email</label>
					<p className='text-text'>{profile.email}</p>
				</div>

				{/* Bio */}
				{profile.bio && (
					<div className='flex flex-col space-y-2'>
						<label className='text-text-secondary text-sm'>Bio</label>
						<p className='text-text leading-relaxed'>{profile.bio}</p>
					</div>
				)}
			</div>
		</Card>
	);
}

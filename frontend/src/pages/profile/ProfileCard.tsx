import { Avatar, Card, CardTitle } from '@/components';
import type { UserProfile } from '@/shared.types';

interface ProfileCardProps {
	profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
	return (
		<Card>
			<CardTitle>Profile</CardTitle>
			{/* Avatar */}
			<div className='flex flex-col items-center gap-4'>
				<Avatar size={128} className='hover:opacity-100' url={profile.avatar} />
			</div>
			{/* Username */}
			<div className='flex flex-col space-y-2'>Username</div>
			{/* Email */}
			<div className='flex flex-col space-y-2'>Email</div>
		</Card>
	);
}

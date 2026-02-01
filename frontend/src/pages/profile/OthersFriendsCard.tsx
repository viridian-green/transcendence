import type { Friend } from '@/shared.types';
import { useNavigate } from 'react-router';

interface OthersFriendsCardProps {
	friends: Friend[];
}

export function OthersFriendsCard({ friends }: OthersFriendsCardProps) {
	const navigate = useNavigate();

	return (
		<div className='border-border bg-surface max-h-[436px] overflow-y-auto rounded-2xl border p-8'>
			<h2 className='mb-6 text-(--color-accent-pink)'>Friends</h2>

			{friends.length === 0 && (
				<div className='mb-6 flex'>
					<p className='text-text-muted text-center'>This user has no friends yet.</p>
				</div>
			)}

			{/* Friends List */}
			<div className='space-y-3'>
				{friends.length !== 0 &&
					friends.map((friend) => (
						<div
							key={friend.id}
							className='border-border bg-elevated flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-(--color-accent-pink)/50'
						>
							{/* Avatar with Status */}
							<div className='relative'>
								<button
									className='border-border h-12 w-12 overflow-hidden rounded-full border-2 bg-(--color-bg) hover:cursor-pointer'
									onClick={() => {
										navigate(`/profile/${friend.id}`);
									}}
								>
									<img
										src={friend.avatar}
										alt={friend.username}
										className='h-full w-full object-cover'
									/>
								</button>
								{/* Status Indicator */}
								{friend.status === 'online' && (
									<div className='border-elevated bg-status-online absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2' />
								)}
								{friend.status === 'busy' && (
									<div className='border-elevated bg-status-busy absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2' />
								)}
								{friend.status === 'offline' && (
									<div className='border-elevated bg-text-muted absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2' />
								)}
							</div>

							{/* Username */}
							<div className='flex-1'>
								<p className='text-(--color-text-primary)'>{friend.username}</p>
								<p className='text-text-muted'>
									{friend.status === 'online' && 'Online'}
									{friend.status === 'busy' && 'Busy'}
									{friend.status === 'offline' && 'Offline'}
								</p>
							</div>
						</div>
					))}
			</div>
		</div>
	);
}

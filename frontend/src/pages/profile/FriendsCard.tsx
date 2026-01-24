import { Search, UserPlus, X } from '@/icons';
import type { Friend } from '@/shared.types';
import { useState } from 'react';

interface FriendsCardProps {
	friends: Friend[];
	onAddFriend: (username: string) => void;
	onRemoveFriend: (id: number) => void;
	onChallengeFriend: (id: number) => void;
}

export function FriendsCard({
	friends,
	onAddFriend,
	onRemoveFriend,
	onChallengeFriend,
}: FriendsCardProps) {
	const [searchQuery, setSearchQuery] = useState('');

	const handleAddFriend = () => {
		if (searchQuery.trim()) {
			onAddFriend(searchQuery.trim());
			setSearchQuery('');
		}
	};

	return (
		<div className='border-border bg-surface max-h-[436px] overflow-y-auto rounded-2xl border p-8'>
			<h2 className='mb-6 text-(--color-accent-pink)'>Friends</h2>

			{/* Add Friend */}
			<div className='mb-6 flex gap-2'>
				<div className='relative flex-1'>
					<Search className='text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
					<input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
						placeholder='Search username...'
						className='border-border bg-elevated w-full rounded-md p-1 pl-10 text-(--color-text-primary) focus:border-(--color-accent-pink)'
					/>
				</div>
				<button
					type='button'
					onClick={handleAddFriend}
					className='bg-accent-blue hover:bg-accent-blue/90 rounded-md p-2 text-white'
				>
					<UserPlus className='h-4 w-4' />
				</button>
			</div>

			{/* Friends List */}
			<div className='space-y-3'>
				{friends.length === 0 ? (
					<p className='text-text-muted py-8 text-center'>
						No friends yet. Add some friends to get started!
					</p>
				) : (
					friends.map((friend) => (
						<div
							key={friend.id}
							className='border-border bg-elevated flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-(--color-accent-pink)/50'
						>
							{/* Avatar with Status */}
							<div className='relative'>
								<div className='border-border h-12 w-12 overflow-hidden rounded-full border-2 bg-(--color-bg)'>
									<img
										src={friend.avatar}
										alt={friend.username}
										className='h-full w-full object-cover'
									/>
								</div>
								{/* Status Indicator */}
								<div
									className={`border-elevated absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 ${
										friend.status === 'online'
											? 'bg-status-online'
											: 'bg-text-muted'
									}`}
								/>
							</div>

							{/* Username */}
							<div className='flex-1'>
								<p className='text-(--color-text-primary)'>{friend.username}</p>
								<p className='text-text-muted'>
									{friend.status === 'online' ? 'Online' : 'Offline'}
								</p>
							</div>
							{/* Challenge Button */}
							<button
								type='button'
								onClick={() => onChallengeFriend(friend.id)}
								className='text-text-muted hover:bg-accent-pink/10 hover:text-accent-pink'
							>
								Challenge
							</button>

							{/* Remove Button */}
							<button
								type='button'
								onClick={() => onRemoveFriend(friend.id)}
								className='text-text-muted hover:bg-accent-pink/10 hover:text-accent-pink'
							>
								<X className='h-4 w-4' />
							</button>
						</div>
					))
				)}
			</div>
		</div>
	);
}

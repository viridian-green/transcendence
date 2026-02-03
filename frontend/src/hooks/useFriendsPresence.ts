// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import { useFetchOnlineUsers } from './useFetchOnlineUsers';
import type { Friend } from '@/shared.types';
import { usePresenceSocket } from './usePresenceSocket';
import { useMemo } from 'react';

interface FriendStatusMap {
  [userId: string]: 'online' | 'offline' | 'busy';
}

export function useFriendsWithStatus(userId?: number) {
	const { friends, error: friendsError, loading: friendsLoading } = useFriends(userId);
	const { friendStatuses, isConnected } = usePresenceSocket(Boolean(userId));

	console.log('[ONLINE USERS] friends:', JSON.stringify(friends, null, 2));

	const friendsWithStatus: Friend[] = useMemo(
		() =>
			friends.map((friend) => {
				let status: Friend['status'] = 'offline';
				if (isConnected) {
					const wsStatus = friendStatuses[String(friend.id)];
					status = wsStatus || 'offline';
				}

				return {
					...friend,
					status: status as Friend['status']  // 'online' | 'offline' | 'busy'
				};
			}),
		[friends, friendStatuses, isConnected]
	);

	console.log('[FETCHING FRIENDS] friends:', JSON.stringify(friends, null, 2));

	return {
		friends: friendsWithStatus,
		loading: friendsLoading,
		error: friendsError,
	};
}

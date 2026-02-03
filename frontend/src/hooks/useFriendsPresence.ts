// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import { useFetchOnlineUsers } from './useFetchOnlineUsers';
import type { Friend } from '@/shared.types';
import { usePresenceSocket } from './usePresenceSocket';
import { useMemo } from 'react';

export function useFriendsWithStatus(userId?: number) {
	const { friends, error: friendsError, loading: friendsLoading } = useFriends(userId);
	const { ws, isConnected, statuses } = usePresenceSocket(Boolean(userId));
	const {
		// users: onlineUsers,
		error: onlineUsersError,
		loading: onlineUsersLoading,
	} = useFetchOnlineUsers(String(userId), ws.current);



	const friendsWithStatus: Friend[] = useMemo(
		() =>
			friends.map((friend) => {
				let status: Friend['status'] = 'offline';
                if (statuses[String(friend.id)])
                status = statuses[String(friend.id)] as Friend['status'];
                console.log('[FRIENDS STATUSES] friends:', status);
				const friendWithStatus = {
					...friend,
					status: status,
				};
				return friendWithStatus;
			}),
		[friends, isConnected],
	);

	return {
		friends: friendsWithStatus,
		loading: friendsLoading || onlineUsersLoading,
		error: friendsError || onlineUsersError,
	};
}

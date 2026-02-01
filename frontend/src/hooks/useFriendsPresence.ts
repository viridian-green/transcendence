// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import { useFetchOnlineUsers } from './useFetchOnlineUsers';
import type { Friend } from '@/shared.types';
import { usePresenceSocket } from './usePresenceSocket';
import { useMemo } from 'react';

export function useFriendsWithStatus(userId?: number) {
	const { friends, error: friendsError, loading: friendsLoading } = useFriends(userId);
	const { ws, isConnected } = usePresenceSocket(Boolean(userId));
	const {
		users: onlineUsers,
		error: onlineUsersError,
		loading: onlineUsersLoading,
	} = useFetchOnlineUsers(String(userId), ws.current);

	console.log('[ONLINE USERS] friends:', JSON.stringify(friends, null, 2));

	const friendsWithStatus: Friend[] = useMemo(
		() =>
			friends.map((friend) => {
				let status: Friend['status'];
				if (!isConnected) {
					status = 'offline';
				} else {
					status = onlineUsers.some((u) => String(u.id) === String(friend.id))
						? 'online'
						: 'offline';
				}
				const friendWithStatus = {
					...friend,
					status: status,
				};
				return friendWithStatus;
			}),
		[friends, onlineUsers, isConnected],
	);

	console.log('[FETCHING FRIENDS] friends:', JSON.stringify(friends, null, 2));

	return {
		friends: friendsWithStatus,
		loading: friendsLoading || onlineUsersLoading,
		error: friendsError || onlineUsersError,
	};
}

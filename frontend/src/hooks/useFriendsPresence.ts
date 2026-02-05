// hooks/useFriendsWithStatus.ts
import { useMemo, useState, useEffect } from 'react';
import { useFriends } from './useFriends';
import type { Friend } from '@/shared.types';
import { usePresenceSocket } from './usePresenceSocket';
import { useFetchOnlineUsers } from './useFetchOnlineUsers';

export function useFriendsWithStatus(userId?: number) {
	const {
		friends,
		error: friendsError,
		loading: friendsLoading,
		deleteFriend,
		refetch,
	} = useFriends(userId);
	const { ws, statuses, isConnected } = usePresenceSocket(Boolean(userId));

	// Track socket for useFetchOnlineUsers - update when connection status changes
	const [socket, setSocket] = useState<WebSocket | null>(null);

	// Update socket reference when connection status changes
	useEffect(() => {
		if (isConnected && ws.current) {
			setSocket(ws.current);
		} else {
			setSocket(null);
		}
	}, [isConnected, ws]);

	const {
		users: onlineUsers,
		error: onlineUsersError,
		loading: onlineUsersLoading,
	} = useFetchOnlineUsers(String(userId), socket);

	const friendsWithStatus: Friend[] = useMemo(
		() =>
			friends.map((friend) => {
				let status: Friend['status'];
				const wsStatus = statuses[String(friend.id)];
				if (wsStatus) {
					status = wsStatus as Friend['status'];
				} else if (!isConnected) {
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
		[friends, onlineUsers, isConnected, statuses],
	);

	return {
		friends: friendsWithStatus,
		loading: friendsLoading || onlineUsersLoading,
		error: friendsError || onlineUsersError,
		deleteFriend,
		refetch,
	};
}

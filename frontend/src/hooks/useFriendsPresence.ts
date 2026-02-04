// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import type { Friend } from '@/shared.types';
import { usePresenceSocket } from './usePresenceSocket';
import { useFetchOnlineUsers } from './useFetchOnlineUsers';

export function useFriendsWithStatus(userId?: number) {
	const { friends, error: friendsError, loading: friendsLoading } = useFriends(userId);
	const { ws, statuses, isConnected } = usePresenceSocket(Boolean(userId));
	const {
		users: onlineUsers,
		error: onlineUsersError,
		loading: onlineUsersLoading,
	} = useFetchOnlineUsers(String(userId), ws.current);


	const friendsWithStatus: Friend[] = friends.map((friend) => {
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
		return { ...friend, status : status };
	});

	return {
		friends: friendsWithStatus,
		loading: friendsLoading,
		error: friendsError,
	};
}

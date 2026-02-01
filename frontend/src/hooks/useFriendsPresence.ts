// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import { useFetchOnlineUsers } from './useFetchOnlineUsers';
import type { Friend } from '@/shared.types';

export function useFriendsWithStatus(userId?: number) {
	const { friends, error: friendsError, loading: friendsLoading } = useFriends(userId);
	const {
		users: onlineUsers,
		error: onlineUsersError,
		loading: onlineUsersLoading,
	} = useFetchOnlineUsers(String(userId));

	const friendsWithStatus: Friend[] = friends.map((friend) => {
		const status: Friend['status'] = onlineUsers.some((u) => String(u.id) === String(friend.id))
			? 'online'
			: 'offline';
		const friendWithStatus = {
			...friend,
			status: status,
		};
		return friendWithStatus;
	});

	return {
		friends: friendsWithStatus,
		loading: friendsLoading || onlineUsersLoading,
		error: friendsError || onlineUsersError,
	};
}

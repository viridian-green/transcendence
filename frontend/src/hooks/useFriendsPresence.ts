// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import { useFetchOnlineUsers } from './useFetchOnlineUsers';
import type { Friend } from '@/shared.types';

export function useFriendsWithStatus(userId?: number) {
	const { friends, error: friendsError } = useFriends(userId);
	const { users: onlineUsers, error: onlineUsersError } = useFetchOnlineUsers(String(userId));

	console.log('[ONLINE USERS] friends:', JSON.stringify(friends, null, 2));

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

	console.log('[FETCHING FRIENDS] friends:', JSON.stringify(friends, null, 2));

	return { friends: friendsWithStatus, loading: false, error: friendsError || onlineUsersError };
}

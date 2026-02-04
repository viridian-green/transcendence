// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import type { Friend } from '@/shared.types';
import { usePresenceSocket } from './usePresenceSocket';

export function useFriendsWithStatus(userId?: number) {
	console.log('[USER ID],', userId);
	const { friends, error: friendsError, loading: friendsLoading } = useFriends(userId);

	const { statuses } = usePresenceSocket(Boolean(userId));

	const friendsWithStatus: Friend[] = friends.map((friend) => {
		const wsStatus = statuses[String(friend.id)];
		// Default to 'offline' if no presence message received yet
		const status: Friend['status'] = (wsStatus as Friend['status']) || 'offline';

		return { ...friend, status };
	});

	return {
		friends: friendsWithStatus,
		loading: friendsLoading,
		error: friendsError,
	};
}

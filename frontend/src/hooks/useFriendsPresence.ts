// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import type { Friend } from '@/shared.types';
import { usePresenceSocket } from './usePresenceSocket';
import { useMemo } from 'react';

export function useFriendsWithStatus(userId?: number) {
	// console.log('[USER ID],', userId);
	const { friends, error: friendsError, loading: friendsLoading } = useFriends(userId);
	const { ws, statuses } = usePresenceSocket(Boolean(userId));

	console.log('WS STATE', ws?.current?.readyState, statuses, friendsLoading, friends);

	const friendsWithStatus: Friend[] = useMemo(() => {
		if (!friends || friendsLoading) return [];
		return friends.map((friend) => {
			const wsStatus = statuses[String(friend.id)];
			// Default to 'offline' if no WebSocket status is available
			const status = (wsStatus || 'offline') as Friend['status'];

			console.log(
				`🧑 ${friend.username}(${friend.id}): WS="${wsStatus || 'none'}", FINAL="${status}"`,
			);

			return { ...friend, status };
		});
	}, [friends, statuses, friendsLoading]);

	console.log('FRIENDS WITH STATUS', friendsWithStatus);

	return {
		friends: friendsWithStatus,
		loading: friendsLoading,
		error: friendsError,
	};
}

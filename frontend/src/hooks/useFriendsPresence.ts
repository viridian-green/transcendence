// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import { useFetchOnlineUsers } from './useFetchOnlineUsers';
import type { Friend } from '@/shared.types';
import { usePresenceSocket } from './usePresenceSocket';
import { useMemo } from 'react';

export function useFriendsWithStatus(userId?: number) {
    console.log('[USER ID],' , userId);
	const { friends, error: friendsError, loading: friendsLoading } = useFriends(userId);

	const { ws,  statuses } = usePresenceSocket(Boolean(userId));
	const {
		error: onlineUsersError,
		loading: onlineUsersLoading,
	} = useFetchOnlineUsers(String(userId), ws.current);


const friendsWithStatus: Friend[] = friends.map((friend) => {
    let status: Friend['status'];

    // 1. Check WebSocket real-time status FIRST
    const wsStatus = statuses[String(friend.id)];


    status = wsStatus as Friend['status'];

    console.log('[DEBUG] statuses keys:', Object.keys(statuses));
    console.log('[DEBUG] friend.id:', friend.id, 'as string:', String(friend.id));
    // 2. Fallback: Check HTTP API (your existing useFetchOnlineUsers)
    //  if (onlineUsers.some(u => String(u.id) === String(friend.id))) {
    //     status = 'online';
    // }

    console.log(`🧑 ${friend.username}(${friend.id}): WS="${wsStatus || 'none'}", HTTP="${status}", FINAL="${status}"`);

    return { ...friend, status };
});

    console.log('[MAPPING OUTPUT] friendsWithStatus:', friendsWithStatus.map(f => ({id: f.id, status: f.status})));
	return {
		friends: friendsWithStatus,
		loading: friendsLoading || onlineUsersLoading,
		error: friendsError || onlineUsersError,
	};
}

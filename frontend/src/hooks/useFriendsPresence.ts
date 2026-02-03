

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


    const friendsWithStatus: Friend[] = useMemo(() => {
        return friends.map((friend) => {
            let status: Friend['status'];

            const wsStatus = statuses[String(friend.id)];
            status = wsStatus as Friend['status'];

            console.log(`🧑 ${friend.username}(${friend.id}): WS="${wsStatus || 'none'}", HTTP="${status}", FINAL="${status}"`);

            return { ...friend, status };
        });
    }, [friends, statuses]);

    return {
        friends: friendsWithStatus,
        loading: friendsLoading || onlineUsersLoading,
        error: friendsError || onlineUsersError,
    };
}


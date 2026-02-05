// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import { useFetchOnlineUsers } from './useFetchOnlineUsers';
import type { Friend } from '@/shared.types';
import { usePresenceSocket } from './usePresenceSocket';
import { useMemo } from 'react';


export function useFriendsWithStatus(userId?: number) {
	const { friends, error: friendsError, loading: friendsLoading, deleteFriend, refetch } = useFriends(userId);
	const { ws, isConnected, statuses } = usePresenceSocket(Boolean(userId));
	const {
		users: onlineUsers,
		error: onlineUsersError,
		loading: onlineUsersLoading,
	} = useFetchOnlineUsers(String(userId), ws.current);


// 	const friendsWithStatus: Friend[] = useMemo(
//         () =>
//         friends.map((friend) => {
// 		let status: Friend['status'];
// 		// const wsStatus = statuses[String(friend.id)];
// 		// if (wsStatus) {
// 		// 	status = wsStatus as Friend['status'];
// 		} if (!isConnected) {
// 			status = 'offline';
// 		} else {
// 			status = onlineUsers.some((u) => String(u.id) === String(friend.id))
// 						? 'online'
// 						: 'offline';
// 		}
// 		const friendWithStatus = {
// 					...friend,
// 					status: status,
// 				};
//         return friendWithStatus;
//     }),
// 		[friends, onlineUsers, isConnected],
// 	);

// 	return {
// 		friends: friendsWithStatus,
// 		loading: friendsLoading || onlineUsersLoading,
// 		error: friendsError || onlineUsersError,
// 		deleteFriend,
// 		refetch,
//     };
// }


	const friendsWithStatus: Friend[] = useMemo(
		() =>
			friends.map((friend) => {
				let status: Friend['status'];
				if (!isConnected) {
					status = 'offline';
				} else {
					// TODO implement busy logic here
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

	return {
		friends: friendsWithStatus,
		loading: friendsLoading || onlineUsersLoading,
		error: friendsError || onlineUsersError,
		deleteFriend,
		refetch,
	};
}

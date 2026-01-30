// hooks/useFriendsWithStatus.ts
import { useFriends } from './useFriends';
import { useFetchOnlineUsers } from './useFetchOnlineUsers';
import type { Friend } from '@/shared.types';
import { useAuth } from '@/hooks/useAuth';

export function useFriendsWithStatus() {
  const { user } = useAuth();
  const { friends } = useFriends(user?.id);
  const { users: onlineUsers } = useFetchOnlineUsers(user?.id);

    console.log('[ONLINE USERS] friends:', JSON.stringify(friends, null, 2));

  const friendsWithStatus = friends.map(friend => ({
    ...friend,
    status: onlineUsers.some(u => String(u.id) === String(friend.id))
      ? 'online'
      : 'offline'  // Simple: online if in onlineUsers list
  }));


  console.log('[FETCHING FRIENDS] friends:', JSON.stringify(friends, null, 2));


  return { friends: friendsWithStatus as Friend[], loading: false };
}
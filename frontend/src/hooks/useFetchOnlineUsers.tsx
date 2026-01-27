import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export type OnlineUser = {
  id: string;
  username: string;
};

export function useFetchOnlineUsers(currentUserId?: string) {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) {
      setUsers([]);
      setLoading(false);
      return;
    }
    async function fetchOnlineUsers() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/presence/online-users', { credentials: 'include' });
        const data = await response.json();
        console.log('currentUserId:', currentUserId);
        console.log('API data:', data);
        let usersList = Array.isArray(data) ? data : data.users;
        if (usersList && usersList.length && usersList[0].username) {
          setUsers(usersList)
          console.log('Set users:', usersList);
        //   setUsers(
        //     usersList.filter((u: OnlineUser) => !currentUserId || u.id !== currentUserId)
        //   );
        } else {
            console.log('No users found or invalid data format');
          setUsers([]);
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOnlineUsers();
    // Optionally, add websocket or polling for live updates
  }, [currentUserId]);

  return { users, loading, error };
}
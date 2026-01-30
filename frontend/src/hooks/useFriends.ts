import { useEffect, useState } from 'react';
import type { User } from '@/shared.types';

export function useFriends(userId?: string | number) {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setFriends([]);
      setLoading(false);
      setError(null);
      return;
    }
    const fetchFriends = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/users/friends', { credentials: 'include' });
        if (!res.ok)
            throw new Error('Failed to fetch friends');
        const data = await res.json();
        setFriends(Array.isArray(data) ? data : data.friends);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
    console.log('[FETCH] friends:', JSON.stringify(friends, null, 2));
  }, [userId]);

  return { friends, loading, error };
}
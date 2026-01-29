import { useEffect, useState } from 'react';
import type { User } from '@/shared.types';

export function useFriends() {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:3003/users/friends', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch friends');
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
  }, []);

  return { friends, loading, error };
}

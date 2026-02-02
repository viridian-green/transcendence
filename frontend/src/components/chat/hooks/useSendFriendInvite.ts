import { useCallback, useState } from 'react';
import type { FriendRequest } from '../types/chat';


export function useSendFriendInvite() {
    const [alert, setAlert] = useState<{
        visible: boolean;
        message: string;
        type: string;
        userId?: string;
    }>({ visible: false, message: '', type: 'info' });

    const [friendRequests, setFriendRequests] = useState<Record<string, FriendRequest>>({});
    const sendInvite = useCallback(
        async (user: { id: number | string; username: string }, e?: React.MouseEvent) => {
            if (e) e.stopPropagation();
            try {
                const stateRes = await fetch(`/api/presence/state/${user.id}`);
                if (!stateRes.ok) throw new Error('Could not check user presence');
                const { state } = await stateRes.json();
                if (state !== 'online') {
                    setAlert({
                        visible: true,
                        message: 'You can only invite users who are online and not busy.',
                        type: 'error',
                    });
                    return;
                }
                const res = await fetch(`/api/users/friends/${user.id}`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Failed to send friend invite');

                setAlert({
                    visible: true,
                    message: `Friend invite sent to ${user.username}`,
                    type: 'sent',
                    userId: String(user.id),
                });

                setFriendRequests(prev => ({
                    ...prev,
                    [String(user.id)]: {
                        fromUserId: String(user.id),
                        fromUsername: user.username,
                        status: 'pending',
                    },
                }));
            } catch (err) {
                setAlert({
                    visible: true,
                    message: err instanceof Error ? err.message : 'Unknown error',
                    type: 'error',
                });
            }
        },
        [],
    );

    return { sendInvite, alert, friendRequests, setAlert, setFriendRequests };
}

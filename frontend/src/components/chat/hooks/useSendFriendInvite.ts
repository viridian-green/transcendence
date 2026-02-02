import { useCallback } from 'react';

interface UseSendFriendInviteOptions {
	setAlert: (alert: { visible: boolean; message: string; type: string; userId?: string }) => void;
	setFriendRequests?: (updater: (prev: Record<string, 'pending' | 'accepted' | 'rejected'>) => Record<string, 'pending' | 'accepted' | 'rejected'>) => void;
}

export function useSendFriendInvite({ setAlert, setFriendRequests }: UseSendFriendInviteOptions) {
	return useCallback(
		async (user: { id: number | string; username: string }, e?: React.MouseEvent) => {
			if (e) e.stopPropagation();
			try {
				// Check presence state from presence service
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
				if (setFriendRequests) {
					setFriendRequests(prev => ({ ...prev, [String(user.id)]: 'pending' }));
				}
			} catch (err) {
				setAlert({
					visible: true,
					message: err instanceof Error ? err.message : 'Unknown error',
					type: 'error',
				});
			}
		},
		[setAlert, setFriendRequests],
	);
}

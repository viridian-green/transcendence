import React, { useEffect, useState } from 'react';
import GlobalAlert from './GlobalAlert';
import { useNotificationSocket } from '@/hooks/useNotificationSocket';

type PendingInvite = {
	id: number | string;
	username: string;
};

const NotificationManager: React.FC = () => {
	const [visible, setVisible] = useState(false);
	const [alertProps, setAlertProps] = useState<any>(null);
	const [pendingQueue, setPendingQueue] = useState<PendingInvite[]>([]);
	const [activeInvite, setActiveInvite] = useState<PendingInvite | null>(null);
	const { lastRawMessage } = useNotificationSocket(true);

	useEffect(() => {
		const fetchPendingIncoming = async () => {
			try {
				const res = await fetch('/api/users/friends/pending', { credentials: 'include' });
				if (!res.ok) return;
				const data = await res.json();
				const incoming = Array.isArray(data?.incoming) ? data.incoming : [];
				setPendingQueue((prev) => [
					...prev,
					...incoming.map((u: any) => ({ id: u.id, username: u.username })),
				]);
			} catch {
				// silently ignore
			}
		};

		fetchPendingIncoming();
	}, []);

	useEffect(() => {
		if (!lastRawMessage) return;
		if (lastRawMessage.type === 'FRIEND_INVITE_RECEIVED') {
			setPendingQueue((prev) => [
				...prev,
				{ id: lastRawMessage.fromUserId, username: lastRawMessage.fromUsername },
			]);
		} else if (lastRawMessage.type === 'GAME_INVITE_RECEIVED') {
			const userId = lastRawMessage.fromUserId;
			setAlertProps({
				message: `${lastRawMessage.fromUsername} invites you to play ${lastRawMessage.gameMode || 'pong'}!`,
				visible: true,
				type: 'received',
				acceptText: 'Accept',
				declineText: 'Decline',
				onAccept: () => {
					// Send accept via WebSocket if needed
					if (window.notificationSocket && window.notificationSocket.readyState === 1) {
						window.notificationSocket.send(
							JSON.stringify({
								type: 'INVITE_ACCEPT',
								fromUserId: userId,
							}),
						);
					}
					setAlertProps((prev: any) => ({ ...prev, message: 'Game invite accepted!' }));
					setTimeout(() => setVisible(false), 1200);
				},
				onDecline: () => {
					// Optionally send decline via WebSocket
					setAlertProps((prev: any) => ({ ...prev, message: 'Game invite declined.' }));
					setTimeout(() => setVisible(false), 1200);
				},
				onClose: () => setVisible(false),
			});
			setVisible(true);
		}
	}, [lastRawMessage]);

	useEffect(() => {
		if (visible || activeInvite || pendingQueue.length === 0) return;
		const [next, ...rest] = pendingQueue;
		setPendingQueue(rest);
		setActiveInvite(next);
	}, [pendingQueue, visible, activeInvite]);

	useEffect(() => {
		if (!activeInvite) return;
		const userId = activeInvite.id;
		setAlertProps({
			message: `${activeInvite.username} sent you a friend invite!`,
			visible: true,
			type: 'received',
			acceptText: 'Accept',
			declineText: 'Decline',
			onAccept: async () => {
				try {
					const res = await fetch(`/api/users/friends/${userId}/accept`, {
						method: 'POST',
						credentials: 'include',
					});
					if (!res.ok) throw new Error('Failed to accept friend invite');
					setAlertProps((prev: any) => ({ 
						...prev, 
						message: 'Friend invite accepted!',
						onAccept: undefined,
						onDecline: undefined,
					}));
				} catch (err) {
					setAlertProps((prev: any) => ({
						...prev,
						message: err instanceof Error ? err.message : 'Unknown error',
						onAccept: undefined,
						onDecline: undefined,
					}));
				} finally {
					setTimeout(() => {
						setVisible(false);
						setActiveInvite(null);
					}, 1200);
				}
			},
			onDecline: async () => {
				try {
					const res = await fetch(`/api/users/friends/${userId}/reject`, {
						method: 'POST',
						credentials: 'include',
					});
					if (!res.ok) throw new Error('Failed to reject friend invite');
					setAlertProps((prev: any) => ({ 
						...prev, 
						message: 'Friend invite rejected.',
						onAccept: undefined,
						onDecline: undefined,
					}));
				} catch (err) {
					setAlertProps((prev: any) => ({
						...prev,
						message: err instanceof Error ? err.message : 'Unknown error',
						onAccept: undefined,
						onDecline: undefined,
					}));
				} finally {
					setTimeout(() => {
						setVisible(false);
						setActiveInvite(null);
					}, 1200);
				}
			},
			onClose: () => {
				setVisible(false);
				setActiveInvite(null);
			},
		});
		setVisible(true);
	}, [activeInvite]);

	if (!visible || !alertProps) return null;
	return <GlobalAlert {...alertProps} />;
};

export default NotificationManager;

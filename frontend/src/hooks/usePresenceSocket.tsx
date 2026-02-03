import { useEffect, useRef, useState } from 'react';

export function usePresenceSocket(enabled: boolean) {
	const [isConnected, setIsConnected] = useState(false);
	const [statuses, setStatuses] = useState<{ [userId: string]: string }>({});
	const ws = useRef<WebSocket | null>(null);

	useEffect(() => {
		if (!enabled) return;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		// Adjust the path if your API gateway proxies /api/presence to the presence service
		const wsUrl = `${protocol}//${window.location.host}/api/presence`;
		ws.current = new WebSocket(wsUrl);

		ws.current.onopen = () => {
			setIsConnected(true);
		};
		ws.current.onclose = () => setIsConnected(false);
		ws.current.onerror = () => setIsConnected(false);

		ws.current.onmessage = (event) => {
			console.log('[PRESENCE SOCKET] Raw message:', event.data);
			try {
				const data = JSON.parse(event.data);
				// Handle single user state change
				if (data.type === 'userStateChanged' && data.userId && data.state) {
					setStatuses((prev) => ({
						...prev,
						[String(data.userId)]: data.state, // 'online' | 'busy' | 'offline'
					}));
					console.log(
						'[PRESENCE SOCKET] Set status (userStateChanged):',
						String(data.userId),
						data.state,
					);
				}
				// Handle batch presence update
				if (data.type === 'presence_update' && Array.isArray(data.users)) {
					const newStatuses: { [userId: string]: string } = {};
					for (const user of data.users) {
						newStatuses[String(user.id)] = user.status;
						console.log(
							'[PRESENCE SOCKET] Set status (presence_update):',
							String(user.id),
							user.status,
						);
					}
					setStatuses(newStatuses);
				}
				console.log('type', data.type);
			} catch (e) {
				console.error('[PRESENCE SOCKET] Failed to parse message', event.data, e);
			}
		};
		return () => ws.current?.close();
	}, [enabled]);

	console.log('[USE PRESENCE] statuses:', statuses);

	return { isConnected, ws, statuses };
}

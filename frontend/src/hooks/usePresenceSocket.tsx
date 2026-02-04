import { useEffect, useState, useSyncExternalStore } from 'react';

// Global state for presence WebSocket - singleton pattern
let globalWs: WebSocket | null = null;
let globalStatuses: { [userId: string]: string } = {};
let connectionCount = 0;
const listeners = new Set<() => void>();
// Stable ref object to avoid creating new objects on every render
const wsRef = { current: null as WebSocket | null };

// Notify all subscribers when statuses change
function notifyListeners() {
	listeners.forEach((listener) => listener());
}

// Subscribe to status changes
function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

// Get current snapshot of statuses
function getSnapshot() {
	return globalStatuses;
}

// Initialize or reuse global WebSocket connection
function initializeWebSocket() {
	// Don't create a new connection if one exists and is connecting or open
	if (
		globalWs &&
		(globalWs.readyState === WebSocket.OPEN || globalWs.readyState === WebSocket.CONNECTING)
	) {
		return; // Already connected or connecting
	}

	const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	const wsUrl = `${protocol}//${window.location.host}/api/presence`;
	globalWs = new WebSocket(wsUrl);
	wsRef.current = globalWs;

	globalWs.onopen = () => {
		notifyListeners();
	};

	globalWs.onclose = () => {
		notifyListeners();
	};

	globalWs.onerror = () => {
		notifyListeners();
	};

	globalWs.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			// Handle single user state change
			if (data.type === 'userStateChanged' && data.userId && data.state) {
				globalStatuses = {
					...globalStatuses,
					[String(data.userId)]: data.state,
				};
				notifyListeners();
			}
			// Handle batch presence update
			if (data.type === 'presence_update' && Array.isArray(data.users)) {
				const newStatuses = { ...globalStatuses };
				for (const user of data.users) {
					newStatuses[String(user.id)] = user.status;
				}
				globalStatuses = newStatuses;
				notifyListeners();
			}
		} catch (e) {
			console.error('[PRESENCE SOCKET] Failed to parse message', event.data, e);
		}
	};
}

export function usePresenceSocket(enabled: boolean) {
	const [isConnected, setIsConnected] = useState(false);
	const statuses = useSyncExternalStore(subscribe, getSnapshot);

	useEffect(() => {
		if (!enabled) return;

		// Increment connection count
		connectionCount++;

		// Initialize WebSocket (function handles checking if already initialized)
		initializeWebSocket();

		// Update connection status
		const updateConnectionStatus = () => {
			setIsConnected(globalWs?.readyState === WebSocket.OPEN);
		};

		updateConnectionStatus();
		listeners.add(updateConnectionStatus);

		return () => {
			// Decrement connection count
			connectionCount--;
			listeners.delete(updateConnectionStatus);

			// Only close WebSocket when no more consumers
			if (connectionCount === 0 && globalWs) {
				globalWs.close();
				globalWs = null;
				wsRef.current = null;
				// Clear stale statuses when connection is closed
				globalStatuses = {};
			}
		};
	}, [enabled]);

	return { isConnected, ws: wsRef, statuses };
}

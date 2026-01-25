import { useEffect, useRef, useState } from 'react';
import type { ChatServerMessage, ChatRenderMessage } from '@/types/chat';

export function useChatSocket(
	enabled: boolean,
	recipientUserId?: string,
	onPrivateMessage?: (
		from: { id: string; username: string },
		text: string,
		kind: 'chat' | 'system',
	) => void,
) {
	const [messages, setMessages] = useState<ChatRenderMessage[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const ws = useRef<WebSocket | null>(null);

	useEffect(() => {
		if (!enabled) return;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		const wsUrl = `${protocol}//${window.location.host}/api/chat/websocket`;
		ws.current = new WebSocket(wsUrl);

		ws.current.onopen = () => setIsConnected(true);
		ws.current.onclose = () => setIsConnected(false);
		ws.current.onerror = () => setIsConnected(false);

		ws.current.onmessage = (event) => {
			let data: ChatServerMessage;
			try {
				data = JSON.parse(event.data);
			} catch {
				console.warn('Invalid JSON from WS:', event.data);
				return;
			}

			if (data.type === 'private_msg') {
				onPrivateMessage?.(data.from, data.text, 'chat');
				return;
			}

			switch (data.type) {
				case 'general_msg':
					setMessages((prev) => [
						...prev,
						{
							kind: 'chat',
							username: data.user?.username ?? 'unknown',
							text: data.text,
						},
					]);
					return;
				case 'welcome':
					setMessages((prev) => [...prev, { kind: 'system', text: data.message }]);
					return;
				case 'user_joined':
					setMessages((prev) => [
						...prev,
						{ kind: 'system', text: `${data.user.username} joined` },
					]);
					if (onPrivateMessage) {
						onPrivateMessage(
							{ id: data.user.id, username: data.user.username },
							`${data.user.username} joined the chat`,
							'system',
						);
					}
					return;
				case 'user_left':
					setMessages((prev) => [
						...prev,
						{ kind: 'system', text: `${data.user.username} left` },
					]);
					if (onPrivateMessage) {
						onPrivateMessage(
							{ id: data.user.id, username: data.user.username },
							`${data.user.username} left the chat`,
							'system',
						);
					}
					return;
			}
		};

		return () => ws.current?.close();
	}, [enabled]);

	const sendMessage = (payload: { type: string; text: string; to?: string }) => {
		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify(payload));
		}
	};

	return { messages, isConnected, sendMessage };
}

import { useEffect, useRef, useState } from 'react';
import type { ChatServerMessage, ChatRenderMessage } from '../components/chat/types/chat';
import { CHAT_WIDGET_STORAGE_KEYS } from '@/const';

export function useChatSocket(
	enabled: boolean,
	onPrivateMessage?: (
		from: { id: string; username: string },
		text: string,
		kind: 'chat' | 'system',
	) => void,
	initialMessages: ChatRenderMessage[] = [],
) {
	const [messages, setMessages] = useState<ChatRenderMessage[]>(initialMessages);
	const [isConnected, setIsConnected] = useState(false);
	const ws = useRef<WebSocket | null>(null);
	const welcomeShown = sessionStorage.getItem(CHAT_WIDGET_STORAGE_KEYS.welcomeShown)?.length;
	const joinedShown = sessionStorage.getItem(CHAT_WIDGET_STORAGE_KEYS.joinedShown)?.length;
	const didConnectRef = useRef(false);

	useEffect(() => {
		if (!enabled) return;
		if (didConnectRef.current) return;

		didConnectRef.current = true;
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
					if (welcomeShown) return;
					sessionStorage.setItem(CHAT_WIDGET_STORAGE_KEYS.welcomeShown, 'true');
					setMessages((prev) => [...prev, { kind: 'system', text: data.message }]);
					return;
				case 'user_joined':
					if (joinedShown) return;
					sessionStorage.setItem(CHAT_WIDGET_STORAGE_KEYS.joinedShown, 'true');
					setMessages((prev) => [
						...prev,
						{ kind: 'system', text: `${data.user.username} joined` },
					]);
					onPrivateMessage?.(
						{ id: data.user.id, username: data.user.username },
						`${data.user.username} joined the chat`,
						'system',
					);
					return;
				case 'user_left':
					setMessages((prev) => [
						...prev,
						{ kind: 'system', text: `${data.user.username} left` },
					]);
					onPrivateMessage?.(
						{ id: data.user.id, username: data.user.username },
						`${data.user.username} left the chat`,
						'system',
					);
					return;
			}
		};

		return () => {
			if (ws.current?.readyState === WebSocket.OPEN) {
				ws.current?.close();
				ws.current = null;
			}
		};
	}, [enabled]);

	const sendMessage = (payload: { type: string; text: string; to?: string }) => {
		if (ws.current && ws.current.readyState === WebSocket.OPEN) {
			ws.current.send(JSON.stringify(payload));
		}
	};

	return { messages, isConnected, sendMessage, ws };
}

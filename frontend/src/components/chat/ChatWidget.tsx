import './ChatWidget.css';
import { useState, useEffect } from 'react';
import { FaComments } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useFetchOnlineUsers } from '../../hooks/useFetchOnlineUsers';
import { useFriends } from '../../hooks/useFriends';
import { usePresenceSocket } from '@/hooks/usePresenceSocket';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useUnreadPrivateMessages } from '../../hooks/useUnreadPrivateMessages';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { ChatMessages } from './ChatMessages';
import { MessageInput } from './MessageInput';
import ChatHeader from './ChatHeader';
import UsersList from './OnlineUsersList';
import ChatTabs from './ChatTabs';
import type { User } from '@/shared.types';
import type { ChatRenderMessage } from '@/types/chat';

const TABS = [
	{ key: 'agora', label: 'Agora' },
	{ key: 'people', label: 'People' },
];

// Modular tab content renderer
interface TabContentProps {
	activeTab: 'agora' | 'people' | number;
	ws: React.MutableRefObject<WebSocket | null>;
	generalMessages: ChatRenderMessage[];
	user: User | null;
	sendGeneralMessage: (text: string) => void;
	onlinePeople: User[];
	loadingOnline: boolean;
	errorOnline: string | null;
	openPrivateTab: (person: { id: number; name: string }) => void;
	currentUserId: string;
	privateTabs: { id: number; name: string }[];
	privateMessages: Record<number, ChatRenderMessage[]>;
	sendPrivateMessage: (toId: number, text: string) => void;
}

const TabContent = ({
	activeTab,
	ws,
	generalMessages,
	user,
	sendGeneralMessage,
	onlinePeople,
	loadingOnline,
	errorOnline,
	openPrivateTab,
	currentUserId,
	privateTabs,
	privateMessages,
	sendPrivateMessage,
	friends,
}: TabContentProps & { friends: User[] }) => {
	const connected = ws.current?.readyState === WebSocket.OPEN;
	if (activeTab === 'agora') {
		return (
			<div className='chat-tab-content'>
				<ChatMessages messages={generalMessages} currentUsername={user?.username} />
				<MessageInput onSend={sendGeneralMessage} disabled={!connected} />
			</div>
		);
	}
	if (activeTab === 'people') {
		return (
			<UsersList
				users={onlinePeople}
				friends={Array.isArray(friends) ? friends : []}
				loading={loadingOnline}
				error={errorOnline}
				onUserClick={(user) => openPrivateTab({ id: Number(user.id), name: user.username })}
				currentUserId={currentUserId}
			/>
		);
	}
	// Private tab
	const privateUser = privateTabs.find((t) => t.id === activeTab);
	if (privateUser) {
		const msgs = privateMessages[privateUser.id] || [];
		const recipientOnline = onlinePeople.some((u) => u.id === privateUser.id);
		return (
			<div className='chat-tab-content'>
				<ChatMessages messages={msgs} currentUsername={user?.username || ''} />
				<MessageInput
					onSend={(text) => sendPrivateMessage(privateUser.id, text)}
					disabled={!connected || !recipientOnline}
				/>
			</div>
		);
	}
	return null;
};

const ChatWidget = () => {
	const { user } = useAuth();
	const currentUserId = user?.id ? String(user.id) : undefined;
	const { isConnected: isPresenceConnected, ws: presenceWs } = usePresenceSocket(Boolean(user));
	const { friends } = useFriends(currentUserId);
	const [expanded, setExpanded] = useState(false);
	const [activeTab, setActiveTab] = useState<'agora' | 'people' | number>('agora');
	const [privateTabs, setPrivateTabs] = useLocalStorageState<{ id: number; name: string }[]>(
		'privateTabs',
		[],
	);
	const [privateMessages, setPrivateMessages] = useLocalStorageState<
		Record<number, ChatRenderMessage[]>
	>('privateMessages', {});
	const [generalMessages, setGeneralMessages] = useLocalStorageState<ChatRenderMessage[]>(
		'generalMessages',
		[],
	);
	const { unreadPrivate, totalUnread } = useUnreadPrivateMessages(
		privateTabs,
		privateMessages,
		expanded,
		activeTab,
	);

	// Use chat socket hook for all chat logic, with private message handler
	const {
		ws,
		messages: socketGeneralMessages,
		sendMessage,
	} = useChatSocket(
		Boolean(user),
		undefined,
		(from, text, kind = 'chat') => {
			if (kind === 'chat') {
				// Open conversation if not already open
				setPrivateTabs((prev: { id: number; name: string }[]) => {
					if (prev.some((u) => u.id === Number(from.id))) return prev;
					return [...prev, { id: Number(from.id), name: from.username }];
				});
			}
			// Add message to private messages
			setPrivateMessages((prev) => {
				const updated = {
					...prev,
					[from.id]: [...(prev[from.id] || []), { kind, username: from.username, text }],
				};
				localStorage.setItem('privateMessages', JSON.stringify(updated));
				return updated;
			});
		},
		generalMessages, // Pass messages from localStorage as initialMessages
	);

	// Sync general messages from socket to state and localStorage
	useEffect(() => {
		setGeneralMessages(socketGeneralMessages);
	}, [socketGeneralMessages]);

	// ...localStorage logic now handled by useLocalStorageState hook...
	const {
		users: rawOnlinePeople,
		loading: loadingOnline,
		error: errorOnline,
	} = useFetchOnlineUsers(currentUserId, presenceWs.current);
	const onlinePeople: User[] = rawOnlinePeople.map((u: any) => ({
		id: typeof u.id === 'string' ? parseInt(u.id, 10) : u.id,
		username: u.username,
		email: u.email || `${u.username}@example.com`,
	}));

	const sendGeneralMessage = (text: string) => {
		if (!text) return;
		sendMessage({ type: 'general_msg', text });
		setGeneralMessages((prev: ChatRenderMessage[]) => {
			const updated = [
				...prev,
				{ kind: 'chat', username: user?.username || '', text } as ChatRenderMessage,
			];
			localStorage.setItem('generalMessages', JSON.stringify(updated));
			return updated;
		});
	};
	const sendPrivateMessage = (toId: number, text: string) => {
		if (!text) return;
		sendMessage({ type: 'private_msg', text, to: String(toId) });
		setPrivateMessages((prev: Record<number, ChatRenderMessage[]>) => {
			const updated = {
				...prev,
				[toId]: [
					...(prev[toId] || []),
					{ kind: 'chat', username: user?.username || '', text } as ChatRenderMessage,
				],
			};
			localStorage.setItem('privateMessages', JSON.stringify(updated));
			return updated;
		});
	};

	const openPrivateTab = (person: { id: number; name: string }) => {
		setPrivateTabs((tabs) => {
			if (tabs.find((t) => t.id === person.id)) return tabs;
			return [...tabs, person];
		});
		setActiveTab(person.id);
	};

	const closePrivateTab = (id: number) => {
		setPrivateTabs((tabs) => tabs.filter((t) => t.id !== id));
		setActiveTab((prev) => {
			if (prev === id) return 'agora';
			return prev;
		});
	};

	return (
		<div className={`chat-widget ${expanded ? 'expanded' : ''}`}>
			{expanded ? (
				<div className='chat-container'>
					<ChatHeader
						username={user?.username}
						isConnected={ws.current?.readyState === WebSocket.OPEN}
						isPresenceConnected={isPresenceConnected}
						onClose={() => setExpanded(false)}
					/>
					<ChatTabs
						activeTab={activeTab}
						setActiveTab={setActiveTab as (tab: string | number) => void}
						tabs={TABS}
						privateTabs={privateTabs}
						unreadPrivate={unreadPrivate}
						closePrivateTab={closePrivateTab}
					/>
					<div className='chat-content'>
						<TabContent
							activeTab={activeTab}
							ws={ws}
							generalMessages={generalMessages}
							user={user}
							sendGeneralMessage={sendGeneralMessage}
							onlinePeople={onlinePeople}
							loadingOnline={loadingOnline}
							errorOnline={errorOnline}
							openPrivateTab={openPrivateTab}
							currentUserId={currentUserId || ''}
							privateTabs={privateTabs}
							privateMessages={privateMessages}
							sendPrivateMessage={sendPrivateMessage}
							friends={Array.isArray(friends) ? friends : []}
						/>
					</div>
				</div>
			) : (
				<button className='chat-expand-btn' onClick={() => setExpanded(true)}>
					<FaComments size={28} />
					{totalUnread > 0 && (
						<span className='chat-unread-badge absolute -top-1.5 -right-2 z-20 rounded-full bg-[var(--color-accent-amber)] px-2 py-1 text-xs font-bold'>
							{totalUnread}
						</span>
					)}
				</button>
			)}
		</div>
	);
};

export default ChatWidget;

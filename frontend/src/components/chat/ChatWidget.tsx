import './ChatWidget.css';
import { useState, useEffect } from 'react';
import { FaComments } from 'react-icons/fa';
import { useState, useEffect } from 'react';
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

const TABS = [
	{ key: 'agora', label: 'Agora' },
	{ key: 'people', label: 'People' },
];

const ChatWidget = () => {
	const { user } = useAuth();
	const currentUserId = user?.id ? String(user.id) : undefined;
	const { isConnected: isPresenceConnected } = usePresenceSocket(Boolean(user));
	const [expanded, setExpanded] = useState(false);
	const [activeTab, setActiveTab] = useState<'agora' | 'people' | number>('agora');
	const [privateTabs, setPrivateTabs] = useLocalStorageState('privateTabs', []);
	const [privateMessages, setPrivateMessages] = useLocalStorageState('privateMessages', {});
	const [generalMessages, setGeneralMessages] = useLocalStorageState('generalMessages', []);
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
			// Open conversation if not already open
			setPrivateTabs((prev) => {
				if (prev.some((u) => String(u.id) === String(from.id))) return prev;
				return [...prev, { id: Number(from.id), name: from.username }];
			});
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
		users: onlinePeople,
		loading: loadingOnline,
		error: errorOnline,
	} = useFetchOnlineUsers(currentUserId, ws.current);

	const sendGeneralMessage = (text: string) => {
		if (!text) return;
		sendMessage({ type: 'general_msg', text });
		setGeneralMessages((prev) => {
			const updated = [...prev, { kind: 'chat', username: user?.username, text }];
			localStorage.setItem('generalMessages', JSON.stringify(updated));
			return updated;
		});
		setGeneralMessages((prev) => {
			const updated = [...prev, { kind: 'chat', username: user?.username, text }];
			localStorage.setItem('generalMessages', JSON.stringify(updated));
			return updated;
		});
	};
	const sendPrivateMessage = (toId: number, text: string) => {
		if (!text) return;
		sendMessage({ type: 'private_msg', text, to: String(toId) });
		setPrivateMessages((prev) => {
			const updated = {
				...prev,
				[toId]: [...(prev[toId] || []), { kind: 'chat', username: user?.username, text }],
			};
			localStorage.setItem('privateMessages', JSON.stringify(updated));
			return updated;
		});
		setPrivateMessages((prev) => {
			const updated = {
				...prev,
				[toId]: [...(prev[toId] || []), { kind: 'chat', username: user?.username, text }],
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

	// Modular tab content renderer
	const TabContent = () => {
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
					friends={friends}
					loading={loadingOnline || loadingFriends}
					error={errorOnline || errorFriends}
					onUserClick={(user) =>
						openPrivateTab({ id: Number(user.id), name: user.username })
					}
					currentUserId={currentUserId}
				/>
			);
		}
		// Private tab
		const privateUser = privateTabs.find((t) => t.id === activeTab);
		if (privateUser) {
			const msgs = privateMessages[privateUser.id] || [];
			return (
				<div className='chat-tab-content'>
					<ChatMessages messages={msgs} currentUsername={user?.username || ''} />
					<MessageInput
						onSend={(text) => sendPrivateMessage(privateUser.id, text)}
						disabled={!connected}
					/>
				</div>
			);
		}
		return null;
	};

	return (
		<div className={`chat-widget ${expanded ? 'expanded' : ''}`}>
		<div className={`chat-widget ${expanded ? 'expanded' : ''}`}>
			{expanded ? (
				<div className='chat-container'>
					<ChatHeader
						username={user?.username}
						isConnected={ws.current?.readyState === WebSocket.OPEN}
						isPresenceConnected={isPresenceConnected}
						onClose={() => setExpanded(false)}
						onClose={() => setExpanded(false)}
					/>
					<ChatTabs
						activeTab={activeTab}
						setActiveTab={setActiveTab}
						tabs={TABS}
						privateTabs={privateTabs}
						unreadPrivate={unreadPrivate}
						closePrivateTab={closePrivateTab}
					/>
					<div className='chat-content'>
						<TabContent />
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

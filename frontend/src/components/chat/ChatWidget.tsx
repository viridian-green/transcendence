import { useState } from 'react';
import { FaComments } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useFetchOnlineUsers } from '../../hooks/useFetchOnlineUsers';
import { usePresenceSocket } from '@/hooks/usePresenceSocket';
import { useChatSocket } from '@/hooks/useChatSocket';
import './ChatWidget.css';
import UsersList from './OnlineUsersList';
import { MessageInput } from './MessageInput';
import ChatHeader from './ChatHeader';
import ChatTabs from './ChatTabs';
import { ChatMessages } from './ChatMessages';

const TABS = [
	{ key: 'agora', label: 'Agora' },
	{ key: 'people', label: 'People' },
];

const ChatWidget = () => {
	const { user } = useAuth();
	const currentUserId = String(user?.id);
	const { isConnected: isPresenceConnected } = usePresenceSocket(Boolean(user));
	const [expanded, setExpanded] = useState(false);
	const [activeTab, setActiveTab] = useState<'agora' | 'people' | number>('agora');
	const [privateTabs, setPrivateTabs] = useState<{ id: number; name: string }[]>([]);
	const [privateMessages, setPrivateMessages] = useState({});

	// Use chat socket hook for all chat logic, with private message handler
	const {
		ws,
		messages: generalMessages,
		sendMessage,
	} = useChatSocket(Boolean(user), undefined, (from, text, kind = 'chat') => {
		// Open conversation if not already open
		setPrivateTabs((prev) => {
			if (prev.some((u) => String(u.id) === String(from.id))) return prev;
			return [...prev, { id: Number(from.id), name: from.username }];
		});
		// Add message to private messages
		setPrivateMessages((prev) => ({
			...prev,
			[from.id]: [...(prev[from.id] || []), { kind, username: from.username, text }],
		}));
	});
	const {
		users: onlinePeople,
		loading: loadingOnline,
		error: errorOnline,
	} = useFetchOnlineUsers(currentUserId, ws.current);

	const sendGeneralMessage = (text: string) => {
		if (!text) return;
		sendMessage({ type: 'general_msg', text });
	};
	const sendPrivateMessage = (toId: number, text: string) => {
		if (!text) return;
		sendMessage({ type: 'private_msg', text, to: String(toId) });
		setPrivateMessages((prev) => ({
			...prev,
			[toId]: [...(prev[toId] || []), { kind: 'chat', username: user?.username, text }],
		}));
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
					loading={loadingOnline}
					error={errorOnline}
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
						setActiveTab={setActiveTab}
						tabs={TABS}
						privateTabs={privateTabs}
						closePrivateTab={closePrivateTab}
					/>
					<div className='chat-content'>
						<TabContent />
					</div>
				</div>
			) : (
				<button className='chat-expand-btn' onClick={() => setExpanded(true)}>
					<FaComments size={28} />
				</button>
			)}
		</div>
	);
};

export default ChatWidget;

import { useState, useEffect } from 'react';
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
	onlinePeople: { id: string; username: string }[];
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
}: TabContentProps) => {
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
				onUserClick={(user) => openPrivateTab({ id: Number(user.id), name: user.username })}
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

const ChatWidget = () => {
	const { user } = useAuth();
	const currentUserId = String(user?.id);
	const { isConnected: isPresenceConnected } = usePresenceSocket(Boolean(user));
	const [expanded, setExpanded] = useState(false);
	const [activeTab, setActiveTab] = useState<'agora' | 'people' | number>('agora');
	const [privateTabs, setPrivateTabs] = useState<{ id: number; name: string }[]>([]);
	const [privateMessages, setPrivateMessages] = useState(() => {
		const saved = localStorage.getItem('privateMessages');
		return saved ? JSON.parse(saved) : {};
	});
	const [generalMessages, setGeneralMessages] = useState(() => {
		const saved = localStorage.getItem('generalMessages');
		return saved ? JSON.parse(saved) : [];
	});

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

	useEffect(() => {
		localStorage.setItem('generalMessages', JSON.stringify(generalMessages));
	}, [generalMessages]);

	useEffect(() => {
		localStorage.setItem('privateMessages', JSON.stringify(privateMessages));
	}, [privateMessages]);
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
						setActiveTab={setActiveTab}
						tabs={TABS}
						privateTabs={privateTabs}
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
							currentUserId={currentUserId}
							privateTabs={privateTabs}
							privateMessages={privateMessages}
							sendPrivateMessage={sendPrivateMessage}
						/>
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

import React, { useEffect, useState } from 'react';
import { FaComments } from 'react-icons/fa';
import { MessageInput } from './MessageInput';
import { useAuth } from '../../hooks/useAuth';
import UsersList from './OnlineUsersList';
import { useFetchOnlineUsers } from '../../hooks/useFetchOnlineUsers';
import './ChatWidget.css';
import { usePresenceSocket } from '@/hooks/usePresenceSocket';
import { useChatSocket } from '@/hooks/useChatSocket';
import ChatHeader from './ChatHeader';
import ChatTabs from './ChatTabs';
import { AllMessages } from './AllMessages';

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

	// Use chat socket hook for all chat logic
	const {
		ws,
		messages: generalMessages,
		isConnected,
		sendMessage,
	} = useChatSocket(Boolean(user));
	const {
		users: onlinePeople,
		loading: loadingOnline,
		error: errorOnline,
	} = useFetchOnlineUsers(currentUserId, ws.current);

	// --- Private message state ---
	const [privateMessages, setPrivateMessages] = useState({});

	const sendGeneralMessage = (text: string) => {
		if (!text) return;
		sendMessage({ type: 'general_msg', text });
	};
	const sendPrivateMessage = (toId: number, text: string) => {
		if (!text) return;
		sendMessage({ type: 'private_msg', text, to: String(toId) });
		setPrivateMessages((prev) => ({
			...prev,
			[toId]: [
				...(prev[toId] || []),
				{ text, username: user?.username, from: currentUserId, to: toId },
			],
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
					<AllMessages messages={generalMessages} currentUsername={user?.username} />
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
					<div className='chat-header py-4'>{privateUser.name}</div>
					<div className='chat-messages'>
						{msgs.map((msg, idx) => (
							<div key={idx}>
								<b>{msg.username}:</b> {msg.text}
							</div>
						))}
					</div>
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
		<div
			className={`chat-widget ${expanded ? 'expanded' : ''}`}
			style={{ background: 'var(--color-surface)' }}
		>
			{expanded ? (
				<div className='chat-container'>
					<ChatHeader
						username={user?.username}
						isConnected={ws.current?.readyState === WebSocket.OPEN}
						isPresenceConnected={isPresenceConnected}
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

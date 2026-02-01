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
import type { ChatRenderMessage } from './types/chat';
import type { User } from '@/shared.types';
import ChatHeader from './ChatHeader';
import ConversationTab from './ConversationTab';
import UsersListTab from './UsersListTab';
import ChatTabs from './ChatTabs';

const ChatWidget = () => {
	const { user } = useAuth();
	const currentUserId = user?.id ? String(user.id) : undefined;
	const { isConnected: isPresenceConnected, ws: presenceWs } = usePresenceSocket(Boolean(user));
	const { friends } = useFriends(currentUserId);
	const [expanded, setExpanded] = useState(false);
	const [activeTab, setActiveTab] = useState<'conversation_all' | 'users_list' | number>(
		'conversation_all',
	);
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
				return updated;
			});
		},
		generalMessages, // Pass messages from localStorage as initialMessages
	);

	// Sync general messages from socket to state and localStorage
	useEffect(() => {
		setGeneralMessages(socketGeneralMessages);
	}, [socketGeneralMessages, setGeneralMessages]);
	// Clear general messages when user logs out or goes offline
	useEffect(() => {
		if (!user || !isPresenceConnected) {
			setGeneralMessages([]);
			localStorage.removeItem('generalMessages');
		}
	}, [user, isPresenceConnected, setGeneralMessages]);

	// ...localStorage logic now handled by useLocalStorageState hook...
	const {
		users: rawOnlinePeople,
		loading: loadingOnline,
		error: errorOnline,
	} = useFetchOnlineUsers(currentUserId, presenceWs.current);
	const onlinePeople: User[] = rawOnlinePeople.map((u: any) => ({
		id: typeof u.id === 'string' ? parseInt(u.id, 10) : u.id,
		username: u.username,
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
			if (prev === id) return 'conversation_all';
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
						onClose={() => setExpanded(false)}
					/>
					<ChatTabs
						activeTab={activeTab}
						setActiveTab={setActiveTab as (tab: string | number) => void}
						tabs={[
							{ key: 'conversation_all', label: 'Agora' },
							{ key: 'users_list', label: 'Online Players' },
						]}
						privateTabs={privateTabs}
						unreadPrivate={unreadPrivate}
						closePrivateTab={closePrivateTab}
					/>
					<div className='chat-content'>
						{activeTab === 'conversation_all' && (
							<ConversationTab
								ws={ws}
								messages={generalMessages}
								user={user}
								onSend={sendGeneralMessage}
							/>
						)}
						{activeTab === 'users_list' && (
							<UsersListTab
								users={onlinePeople}
								friends={friends}
								loading={loadingOnline}
								error={errorOnline}
								onUserClick={(user) =>
									openPrivateTab({ id: user.id, name: user.username })
								}
								currentUserId={currentUserId}
							/>
						)}
						{typeof activeTab === 'number' &&
							privateTabs.some((t) => t.id === activeTab) &&
							(() => {
								const privateUser = privateTabs.find((t) => t.id === activeTab)!;
								const msgs = privateMessages[privateUser.id] || [];
								const recipientOnline = onlinePeople.some(
									(u) => u.id === privateUser.id,
								);
								return (
									<ConversationTab
										ws={ws}
										messages={msgs}
										user={user}
										onSend={(text) => sendPrivateMessage(privateUser.id, text)}
										disabled={!recipientOnline}
									/>
								);
							})()}
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

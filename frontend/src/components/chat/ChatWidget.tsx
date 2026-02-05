import './ChatWidget.css';
import { useState, useEffect } from 'react';
import { FaComments } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useFetchOnlineUsers, type OnlineUser } from '../../hooks/useFetchOnlineUsers';
import { useFriends } from '../../hooks/useFriends';
import { usePresenceSocket } from '@/hooks/usePresenceSocket';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useUnreadPrivateMessages } from '../../hooks/useUnreadPrivateMessages';
import { useSessionStorageState } from '../../hooks/useStorageState';
import type { ChatRenderMessage } from './types/chat';
import type { User } from '@/shared.types';
import ChatHeader from './ChatHeader';
import ConversationTab from './ConversationTab';
import UsersList from './OnlineUsersList';
import ChatTabs from './ChatTabs';
import { CHAT_WIDGET_STORAGE_KEYS } from '@/const';

const ChatWidget = () => {
	const { user } = useAuth();
	const currentUserId = user?.id ? String(user.id) : undefined;
	const { ws: presenceWs } = usePresenceSocket(Boolean(user));
	const { friends, refetch } = useFriends(currentUserId);
	const [expanded, setExpanded] = useState(false);
	const [activeTab, setActiveTab] = useState<'conversation_all' | 'users_list' | number>(
		'conversation_all',
	);
	const [privateTabs, setPrivateTabs] = useSessionStorageState<{ id: number; name: string }[]>(
		CHAT_WIDGET_STORAGE_KEYS.privateTabs,
		[],
	);
	const [privateMessages, setPrivateMessages] = useSessionStorageState<
		Record<number, ChatRenderMessage[]>
	>(CHAT_WIDGET_STORAGE_KEYS.privateMessages, {});
	const [generalMessages, setGeneralMessages] = useSessionStorageState<ChatRenderMessage[]>(
		CHAT_WIDGET_STORAGE_KEYS.generalMessages,
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
					[from.id]: [
						...(prev[Number(from.id)] || []),
						{ kind, username: from.username, text },
					],
				};
				return updated;
			});
		},
		generalMessages, // Pass messages from sessionStorage as initialMessages
	);

	// Sync general messages from socket to state and sessionStorage
	useEffect(() => {
		setGeneralMessages(socketGeneralMessages);
	}, [socketGeneralMessages, setGeneralMessages]);

	const {
		users: rawOnlinePeople,
		loading: loadingOnline,
		error: errorOnline,
	} = useFetchOnlineUsers(currentUserId, presenceWs.current);
	const onlinePeople: User[] = rawOnlinePeople.map((u: OnlineUser) => ({
		id: typeof u.id === 'string' ? parseInt(u.id, 10) : u.id,
		username: u.username,
		email: '',
	}));

	const sendGeneralMessage = (text: string) => {
		if (!text) return;
		sendMessage({ type: 'general_msg', text });
		setGeneralMessages((prev: ChatRenderMessage[]) => {
			const updated = [
				...prev,
				{ kind: 'chat', username: user?.username || '', text } as ChatRenderMessage,
			];
			sessionStorage.setItem(
				CHAT_WIDGET_STORAGE_KEYS.generalMessages,
				JSON.stringify(updated),
			);
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
			sessionStorage.setItem(
				CHAT_WIDGET_STORAGE_KEYS.privateMessages,
				JSON.stringify(updated),
			);
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
							<UsersList
								users={onlinePeople}
								friends={friends}
								loading={loadingOnline}
								error={errorOnline}
								onUserClick={(user) =>
									openPrivateTab({ id: user.id, name: user.username })
								}
								currentUserId={currentUserId ?? '0'}
								onRefreshFriends={refetch}
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

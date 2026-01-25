import { useState, useCallback } from 'react';
import { MessageInput } from '../components/chat/MessageInput';
import { AllMessages } from '../components/chat/AllMessages';
import { PrivateMessages } from '@/components/chat/PrivateMessages';
import UsersList from '../components/chat/UsersList';
import { useChatSocket } from '../hooks/useChatSocket';
import { useAuth } from '@/hooks/useAuth';
import type { ChatRenderMessage } from '@/types/chat';

export default function Chat() {
	const { user } = useAuth();

	const [openConversations, setOpenConversations] = useState<{ id: string; username: string }[]>(
		[],
	);

	const [privateMessages, setPrivateMessages] = useState<Record<string, ChatRenderMessage[]>>({});

	const addPrivateMessage = useCallback(
		(userId: string, username: string, text: string, kind: 'chat' | 'system' = 'chat') => {
			setPrivateMessages((prev) => ({
				...prev,
				[userId]: [...(prev[userId] || []), { kind, username, text }],
			}));
		},
		[],
	);

	const onPrivateMessage = useCallback(
		(from, text, kind = 'chat') => {
			setOpenConversations((prev) =>
				prev.some((u) => String(u.id) === String(from.id))
					? prev
					: [...prev, { id: String(from.id), username: from.username }],
			);
			addPrivateMessage(from.id, from.username, text, kind);
		},
		[addPrivateMessage, setOpenConversations],
	);

	const { messages, isConnected, sendMessage } = useChatSocket(
		Boolean(user),
		undefined,
		onPrivateMessage,
	);

	function handleUserClick(selectedUser: { id: string; username: string }) {
		setOpenConversations((prev) =>
			prev.some((u) => String(u.id) === String(selectedUser.id))
				? prev
				: [...prev, { id: String(selectedUser.id), username: selectedUser.username }],
		);
	}

	return (
		<div className='chat-container'>
			<h1>Chat</h1>
			<div className='status'>
				{isConnected ? '🟢 Your are online' : '🔴 You are offline'}
			</div>
			<AllMessages messages={messages} currentUsername={user?.username} />
			<MessageInput
				onSend={(text) => sendMessage({ type: 'general_msg', text })}
				disabled={!isConnected}
			/>
			<UsersList onUserClick={handleUserClick} currentUserId={String(user?.id || '')} />
			{openConversations.map((recipient) => (
				<PrivateMessages
					key={String(recipient.id)}
					recipient={recipient}
					messages={privateMessages[recipient.id] || []}
					currentUsername={user?.username || ''}
					onSend={(text) => {
						sendMessage({ type: 'private_msg', to: recipient.id, text });
						addPrivateMessage(String(recipient.id), user?.username || '', text);
					}}
				/>
			))}
		</div>
	);
}

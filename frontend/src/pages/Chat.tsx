import { useState } from 'react';
import { MessageInput } from '../components/chat/MessageInput';
import { AllMessages } from '../components/chat/AllMessages';
import { PrivateMessages } from '@/components/chat/PrivateMessages';
import UsersList from "../components/chat/UsersList";
import { useChatSocket } from '../hooks/useChatSocket';
import { useAuth } from '@/hooks/useAuth';
import type { ChatRenderMessage } from '@/types/chat';

export default function Chat() {
  const { user } = useAuth();
  const { messages, isConnected, sendMessage } = useChatSocket(Boolean(user));
	const [openConversations, setOpenConversations] = useState<{ id: string; username: string }[]>(
		[],
	);
	const [privateMessages, setPrivateMessages] = useState<Record<string, ChatRenderMessage[]>>({});

	function handleUserClick(selectedUser: { id: string; username: string }) {
		setOpenConversations((prev) =>
			prev.some((u) => u.id === selectedUser.id) ? prev : [...prev, selectedUser],
		);
	}

	function sendPrivateMessage(userId: string, text: string) {
		// TODO: send to backend via socket
		setPrivateMessages((prev) => ({
			...prev,
			[userId]: [
				...(prev[userId] || []),
				{ kind: 'chat', username: user?.username || 'me', text },
			],
		}));
	}

  return (
    <div className="chat-container">
      <h1>Chat</h1>
      <div className="status">{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      <AllMessages messages={messages} currentUsername={user?.username} />
      <MessageInput onSend={sendMessage} disabled={!isConnected} />
      <UsersList onUserClick={handleUserClick} />
			<br></br>
			{openConversations.map((recipient) => (
				<PrivateMessages
					key={recipient.id}
					recipient={recipient}
					messages={privateMessages[recipient.id] || []}
					currentUsername={user?.username || ''}
					onSend={(text) => sendPrivateMessage(recipient.id, text)}
				/>
			))}
    </div>
  );
}

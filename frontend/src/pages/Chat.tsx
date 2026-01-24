import { MessageInput } from '../components/chat/MessageInput';
import { MessageList } from '../components/chat/MessageList';
import { useChatSocket } from '../hooks/useChatSocket';
import { useAuth } from '@/hooks/useAuth';

export default function Chat() {
	const { user } = useAuth();
	const { messages, isConnected, sendMessage } = useChatSocket(Boolean(user));

	return (
		<div className='chat-container'>
			<h1>Chat</h1>
			<div className='status'>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
			<MessageList messages={messages} currentUsername={user?.username} />
			<MessageInput onSend={sendMessage} disabled={!isConnected} />
		</div>
	);
}

import { type RefObject } from 'react';
import { ChatMessages } from './ChatMessages';
import { MessageInput } from './MessageInput';
import type { User } from '@/shared.types';
import type { ChatRenderMessage } from './types/chat';

interface ConversationTabProps {
	ws: RefObject<WebSocket | null>;
	messages: ChatRenderMessage[];
	user: User | null;
	onSend: (text: string) => void;
	disabled?: boolean;
}

const ConversationTab = ({
	ws,
	messages,
	user,
	onSend,
	disabled = false,
}: ConversationTabProps) => {
	const connected = ws.current?.readyState === WebSocket.OPEN;
	return (
		<div className='chat-tab-content'>
			<ChatMessages messages={messages} currentUsername={user?.username || ''} />
			<MessageInput onSend={onSend} disabled={!connected || disabled} />
		</div>
	);
};

export default ConversationTab;

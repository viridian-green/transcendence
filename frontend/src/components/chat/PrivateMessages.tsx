import { useState } from 'react';
import { ChatMessages } from './ChatMessages';
import type { ChatRenderMessage } from '@/types/chat';

interface PrivateMessagesProps {
	recipient: { id: string; username: string };
	messages: ChatRenderMessage[];
	currentUsername: string;
	onSend: (text: string) => void;
}

export function PrivateMessages({
	recipient,
	messages,
	currentUsername,
	onSend,
}: PrivateMessagesProps) {
	const [input, setInput] = useState('');

	// const handleSend = () => {
	// 	if (input.trim()) {
	// 		onSend(input);
	// 		setInput('');
	// 	}
	// };
	return <ChatMessages messages={messages} currentUsername={currentUsername} />;
}

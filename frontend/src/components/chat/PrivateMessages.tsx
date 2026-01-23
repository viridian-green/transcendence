import { useState } from 'react';
import { AllMessages } from './AllMessages';
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

	const handleSend = () => {
		if (input.trim()) {
			onSend(input);
			setInput('');
		}
	};

	return (
		<div className='private-message'>
			<div className='header'>
				<span>
					Private chat with <strong>{recipient.username}</strong>
				</span>
			</div>
			<AllMessages messages={messages} currentUsername={currentUsername} />
			<div className='input-row'>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSend()}
					placeholder={`Message ${recipient.username}...`}
				/>
				<button onClick={handleSend}>Send</button>
			</div>
		</div>
	);
}

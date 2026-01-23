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
		<div className='private-message rounded-lg bg-stone-900 text-white'>
			<div className='header mb-2 rounded bg-stone-800 p-4'>
				<span>
					<strong>{recipient.username}</strong>
				</span>
			</div>
			<AllMessages messages={messages} currentUsername={currentUsername} />
			<div className='input-row flex gap-2 p-4 text-white'>
				<input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSend()}
					placeholder={`Message ${recipient.username}...`}
				/>
				<button
					className='cursor-pointer rounded bg-stone-600 px-4 py-2 font-bold text-white hover:bg-blue-800'
					onClick={handleSend}
				>
					Send
				</button>
			</div>
		</div>
	);
}

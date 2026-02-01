import { useRef, useEffect } from 'react';
import type { ChatRenderMessage } from './types/chat';

export function ChatMessages({
	messages,
	currentUsername,
}: {
	messages: ChatRenderMessage[];
	currentUsername?: string;
}) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
		}
	}, [messages]);
	return (
		<div className='chat-messages h-full snap-y snap-end overflow-y-auto'>
			{messages.map((msg, i) => (
				<div key={i} className='message overflow-hidden py-2 break-words'>
					{msg.kind === 'system' ? (
						<span className='text-[var(--color-text-muted)]'>{msg.text}</span>
					) : (
						<>
							<strong
								className={
									msg.username === currentUsername ? 'color-brand bold' : 'color-blue bold'
								}
							>
								{msg.username}:{' '}
							</strong>{' '}
							<span>{msg.text}</span>
						</>
					)}
				</div>
			))}
			<div ref={messagesEndRef} className='snap-end' />
		</div>
	);
}

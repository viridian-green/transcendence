import { useRef, useEffect } from 'react';

export type ChatRenderMessage =
	| { kind: 'chat'; username: string; text: string }
	| { kind: 'system'; text: string };

export function AllMessages({
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
		<div className='messages h-full snap-y snap-end overflow-y-auto'>
			{messages.map((msg, i) => (
				<div key={i} className='message overflow-hidden py-2 break-words'>
					{msg.kind === 'chat' ? (
						<>
							<strong
								className={
									msg.username === currentUsername ? 'color-brand' : 'color-blue'
								}
							>
								{msg.username}:{' '}
							</strong>{' '}
							<span>{msg.text}</span>
						</>
					) : (
						<span className='text-gray-500'>{msg.text}</span>
					)}
				</div>
			))}
			<div ref={messagesEndRef} className='snap-end' />
		</div>
	);
}

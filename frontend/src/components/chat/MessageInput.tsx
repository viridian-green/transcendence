import { useState } from 'react';

export function MessageInput({
	onSend,
	disabled,
}: {
	onSend: (text: string) => void;
	disabled: boolean;
}) {
	const [value, setValue] = useState('');
	const send = () => {
		const trimmed = value.trim();
		if (trimmed) {
			onSend(trimmed);
			setValue('');
		}
	};
	return (
		<div className='input-area'>
			<input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={(e) => e.key === 'Enter' && send()}
				placeholder='Type a message...'
			/>
			<button onClick={send} disabled={disabled}>
				Send
			</button>
		</div>
	);
}

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
			<button
				className='cursor-pointer rounded bg-stone-600 px-4 py-2 font-bold text-white hover:bg-blue-800'
				onClick={send}
				disabled={disabled}
			>
				Send
			</button>
		</div>
	);
}

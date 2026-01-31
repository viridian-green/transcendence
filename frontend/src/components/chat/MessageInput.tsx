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
		<div className='flex w-full items-end gap-2'>
			<input
				className='flex-1 rounded border px-3 py-2 text-sm focus:border-[var(--color-accent-pink)] focus:outline-none'
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={(e) => e.key === 'Enter' && send()}
				placeholder='Type a message...'
			/>
			<button
				className='cursor-pointer rounded bg-pink-500 px-4 py-2 font-bold text-white hover:bg-pink-600 disabled:bg-[var(--color-text-secondary)] disabled:opacity-50'
				onClick={send}
				disabled={disabled}
			>
				Send
			</button>
		</div>
	);
}

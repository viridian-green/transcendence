import React from 'react';

interface ChatHeaderProps {
	username?: string;
	isConnected: boolean;
	isPresenceConnected: boolean;
	onClose?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
	username,
	isConnected,
	isPresenceConnected,
	onClose,
}) => (
	<div className='chat-header space-between flex items-center'>
		<div className='flex items-baseline gap-2'>
			<h1 className='font-retro color-brand text-sm'>{username}</h1>
			<span className={`status ${isConnected ? 'color-online' : 'color-offline'}`}>
				{isConnected ? 'Online' : 'Offline'}
			</span>
			{/* <span className={`status ${isPresenceConnected ? 'color-online' : 'color-offline'}`}>
			{isPresenceConnected ? '🟢 Presence Connected' : '🔴 Presence Disconnected'}
		</span> */}
		</div>
		{onClose && (
			<button
				className='font-retro ml-auto px-2 py-1 text-lg text-[var(--color-text-muted)] transition-colors duration-150 hover:text-[var(--color-accent-pink)]'
				onClick={onClose}
				title='Close chat'
			>
				x
			</button>
		)}
	</div>
);

export default ChatHeader;

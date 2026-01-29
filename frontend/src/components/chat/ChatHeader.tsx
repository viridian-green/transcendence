import React from 'react';

interface ChatHeaderProps {
	username?: string;
	isConnected: boolean;
	isPresenceConnected: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ username, isConnected, isPresenceConnected }) => (
	<div className='chat-header space-between flex items-center'>
		<h1 className='font-retro color-brand text-xs'>{username}</h1>
		<span className={`status ${isConnected ? 'color-online' : 'color-offline'}`}>
			{isConnected ? '🟢 Chat Connected' : '🔴 Chat Disconnected'}
		</span>
		{/* <span className={`status ${isPresenceConnected ? 'color-online' : 'color-offline'}`}>
			{isPresenceConnected ? '🟢 Presence Connected' : '🔴 Presence Disconnected'}
		</span> */}
	</div>
);

export default ChatHeader;

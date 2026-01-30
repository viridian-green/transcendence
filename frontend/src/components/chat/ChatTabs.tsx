import React from 'react';

interface ChatTabsProps {
	activeTab: string | number;
	setActiveTab: (tab: string | number) => void;
	tabs: { key: string; label: string }[];
	privateTabs: { id: number; name: string }[];
	closePrivateTab: (id: number) => void;
}

const ChatTabs: React.FC<ChatTabsProps> = ({
	activeTab,
	setActiveTab,
	tabs,
	privateTabs,
	closePrivateTab,
}) => (
	<>
		<div
			className='chat-tabs flex w-full flex-wrap gap-2'
			style={{ display: 'flex', alignItems: 'center' }}
		>
			{tabs.map((tab) => (
				<button
					key={tab.key}
					className={`chat-tab-btn${activeTab === tab.key ? ' active' : ''}`} //keep the space before active
					onClick={() => setActiveTab(tab.key)}
				>
					{tab.label}
				</button>
			))}
			{privateTabs.map((tab) => (
				<button
					key={tab.id}
					className={`chat-tab-btn flex items-center${activeTab === tab.id ? ' active' : ''}`} //keep the space before active
					onClick={() => setActiveTab(tab.id)}
				>
					{tab.name}
						<span
							onClick={(e) => {
								e.stopPropagation();
								closePrivateTab(tab.id);
							}}
							className='close pointer close-btn-hover ml-1'
						>
							×
						</span>
				</button>
			))}
		</div>
	</>
);

export default ChatTabs;

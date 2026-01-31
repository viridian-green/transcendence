interface ChatTabsProps {
	activeTab: string | number;
	setActiveTab: (tab: string | number) => void;
	tabs: { key: string; label: string }[];
	privateTabs: { id: number; name: string }[];
	closePrivateTab: (id: number) => void;
	unreadPrivate?: { [id: number]: number };
}

function ChatTabs({
	activeTab,
	setActiveTab,
	tabs,
	privateTabs,
	closePrivateTab,
	unreadPrivate = {},
}: ChatTabsProps) {
	return (
		<>
			<div
				className='chat-tabs flex w-full flex-wrap gap-2'
				style={{ display: 'flex', alignItems: 'center' }}
			>
				{tabs.map((tab) => (
					<button
						key={tab.key}
						className={`chat-tab-btn${activeTab === tab.key ? ' active' : ''}`} // we neeed to keep the space before active
						onClick={() => setActiveTab(tab.key)}
					>
						{tab.label}
					</button>
				))}
				{privateTabs.map((tab) => (
					<button
						key={tab.id}
						className={`chat-tab-btn flex items-center${activeTab === tab.id ? ' active' : ''}`} // we need to keep the space before active
						onClick={() => setActiveTab(tab.id)}
					>
						{tab.name}
						{unreadPrivate[tab.id] > 0 && (
							<span className='chat-unread-badge ml-1 rounded-xs bg-[var(--color-accent-pink)] px-1 text-[0.7rem]'>
								{unreadPrivate[tab.id]}
							</span>
						)}
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
}

export default ChatTabs;

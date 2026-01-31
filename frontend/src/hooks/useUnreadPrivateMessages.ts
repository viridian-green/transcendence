import { useEffect, useRef, useState } from 'react';

interface UnreadPrivateMessages {
	[id: number]: number;
	[key: string]: any;
}

export function useUnreadPrivateMessages(
	privateTabs: { id: number; name: string }[],
	privateMessages: Record<number, any[]>,
	expanded: boolean,
	activeTab: string | number,
) {
	const [unreadPrivate, setUnreadPrivate] = useState<UnreadPrivateMessages>({});
	const prevCounts = useRef<{ [id: number]: number }>({});

	useEffect(() => {
		const newUnread: UnreadPrivateMessages = {};
		privateTabs.forEach((tab) => {
			const msgs = privateMessages[tab.id] || [];
			const prevCount = prevCounts.current[tab.id] || 0;
			if (!expanded || activeTab !== tab.id) {
				newUnread[tab.id] =
					(unreadPrivate[tab.id] || 0) +
					(msgs.length - prevCount > 0 ? msgs.length - prevCount : 0);
			} else {
				newUnread[tab.id] = 0;
			}
			prevCounts.current[tab.id] = msgs.length;
		});
		setUnreadPrivate((prev) => ({ ...prev, ...newUnread }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [privateMessages, privateTabs, expanded, activeTab]);

	useEffect(() => {
		if (expanded && typeof activeTab === 'number') {
			setUnreadPrivate((prev) => ({
				...prev,
				[activeTab]: 0,
			}));
			prevCounts.current[activeTab] = privateMessages[activeTab]?.length || 0;
		}
	}, [expanded, activeTab, privateMessages]);

	const totalUnread = Object.keys(unreadPrivate)
		.filter((key) => !isNaN(Number(key)))
		.map((key) => unreadPrivate[Number(key)])
		.reduce((a, b) => a + b, 0);

	return { unreadPrivate, totalUnread };
}

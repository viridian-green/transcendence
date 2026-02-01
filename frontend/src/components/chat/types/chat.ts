export type ChatRenderMessage =
	| { kind: 'chat'; username: string; text: string }
	| { kind: 'system'; text: string };

export type ChatServerMessage =
	| { type: 'private_msg'; from: { id: string; username: string }; text: string }
	| { type: 'general_msg'; user?: { id: string; username: string }; text: string }
	| { type: 'welcome'; message: string }
	| { type: 'user_joined' | 'user_left'; user: { id: string; username: string } };

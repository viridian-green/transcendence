export type User = {
	id: number;
	username: string;
	email: string;
};

export type UserProfile = {
	id: number;
	username: string;
	email: string;
	avatar?: string;
	bio?: string;
};

export type Friend = {
	id: number;
	username: string;
	avatar?: string;
	status: 'online' | 'offline';
};

// Game phase types
export type GamePhase = 'countdown' | 'playing' | 'paused' | 'ended';

// Game state structure that will be received from server
export interface GameState {
	phase: GamePhase;
	countdownText?: string; // e.g., "3", "2", "1", "GO!"
	ball: {
		x: number;
		y: number;
	};
	paddles: {
		left: {
			y: number;
		};
		right: {
			y: number;
		};
	};
	scores: {
		left: number;
		right: number;
	};
}

// WebSocket message types (examples)
export interface WSMessage {
	type: 'GAME_STATE' | 'TOGGLE_PAUSE' | 'MOVE_PADDLE';
	payload?: string; // TODO replace by actual type
}

export interface GameStateMessage extends WSMessage {
	type: 'GAME_STATE';
	payload: GameState;
}

export interface PaddleMoveMessage extends WSMessage {
	type: 'MOVE_PADDLE';
	payload: {
		player: 'left' | 'right';
		direction: 'up' | 'down';
	};
}

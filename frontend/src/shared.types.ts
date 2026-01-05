export type User = {
	id: number;
	username: string;
	email: string;
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
// NOTE: it is a contract between client and server, but currently not used in the codebase
export interface WSMessage<TWSMessage> {
	type: 'GAME_STATE' | 'TOGGLE_PAUSE' | 'MOVE_PADDLE';
	payload?: TWSMessage; // TODO replace by actual type
}

export interface GameStateMessage extends WSMessage<GameState> {
	type: 'GAME_STATE';
	payload: GameState;
}

export interface PaddlePayload {
	player: 'left' | 'right';
	direction: 'up' | 'down';
}

export interface PaddleMoveMessage extends WSMessage<PaddlePayload> {
	type: 'MOVE_PADDLE';
	payload: {
		player: 'left' | 'right';
		direction: 'up' | 'down';
	};
}

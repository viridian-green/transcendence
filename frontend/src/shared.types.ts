export type User = {
	id: number;
	username: string;
	email: string;
};

// Game phase types
export type GamePhase = 'countdown' | 'playing' | 'paused' | 'ended';

// Game state structure that will be received from server
export interface GameState {
	ball: {
		x: number;
		y: number;
		r: number;
		dx: number;
		dy: number;
	};
	paddles: {
		left: {
			x: number;
			y: number;
			dy: number;
		};
		right: {
			x: number;
			y: number;
			dy: number;
		};
	};
	phase: GamePhase;
	scores: {
		left: number;
		right: number;
	};
	countdown: number;
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
	playerIndex: 0 | 1;
	direction: 'up' | 'down';
}

export interface PaddleMoveMessage extends WSMessage<PaddlePayload> {
	type: 'MOVE_PADDLE';
	payload: PaddlePayload;
}

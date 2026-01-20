import { GAME_CONFIG } from "./game-logic.js";
export class AIController {
    constructor() {
            this.prevDy = 0; // vertical speed - wall bounce
            this.prevDx = 0; // horizontal speed - opponent hit
            this.reactionTimer = 0;
            this.lastMove = 0;
            this.aimOffset = 0;
    }

    getMove(ball, paddle, canvasHeight) {
        // Center Recovery
        if (ball.dx > 0) {
            const paddleCenter = paddle.y + (GAME_CONFIG.paddle.height / 2);
            const boardCenter = canvasHeight / 2;

            if (paddleCenter < boardCenter - 10) return GAME_CONFIG.paddle.speed;
            if (paddleCenter > boardCenter + 10) return -GAME_CONFIG.paddle.speed;
            return 0;
        }

        // 1. Detect Changes / Events
        const wallBounce = (this.prevDy !== 0 && Math.sign(ball.dy) !== Math.sign(this.prevDy));
        const opponentHit = (this.prevDx > 0 && ball.dx < 0);

        // If something changed, trigger a delay AND recalculate our aim
        if (wallBounce || opponentHit) {
            this.reactionTimer = 15; // Stop thinking for ~250ms (15 frames)
            this.aimOffset = (Math.random() - Math.random()) * 100; // adjust this number to make AI harder/easier - nb of pixels the AI can be "wrong" by
        }

        // Update history for next frame
        this.prevDy = ball.dy;
        this.prevDx = ball.dx;

        // 2. Apply Reaction Delay
        // If the timer is active, return the OLD move
        if (this.reactionTimer > 0) {
            this.reactionTimer--;
            return this.lastMove;
        }

        // 3. Initial logic - perfect tracking
        // (This only runs when the AI is NOT processing a delay)
        const paddleCenter = paddle.y + (GAME_CONFIG.paddle.height / 2);

        const targetY = ball.y + this.aimOffset;
        
        // Calculate the ideal move
        let newMove = 0;
        if (paddleCenter < targetY - 10) {
            newMove = GAME_CONFIG.paddle.speed; // Move Down
        } else if (paddleCenter > targetY + 10) {
            newMove = -GAME_CONFIG.paddle.speed; // Move Up
        }

        // Save this move so we can repeat it if we get delayed next frame
        this.lastMove = newMove;
        
        return newMove;
    }
}
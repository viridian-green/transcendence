import { GAME_CONFIG } from "./game-logic.js";
export class AIController {
    constructor() {
            this.prevDy = 0; // vertical speed - wall bounce
            this.prevDx = 0; // horizontal speed - opponent hit
            this.reactionTimer = 0;
            this.lastMove = 0;
            this.aimOffset = 0;
            this.recoveryOffset = 0;
    }

    getMove(ball, paddle, canvasHeight) {
        // 1. Detect Changes / Events
        const wallBounce = (this.prevDy !== 0 && Math.sign(ball.dy) !== Math.sign(this.prevDy));
        const opponentHit = (this.prevDx > 0 && ball.dx < 0);
        const aiHit = (this.prevDx < 0 && ball.dx > 0);

        // Update history for next frame (MUST be done every frame)
        this.prevDy = ball.dy;
        this.prevDx = ball.dx;

        // If something changed, trigger a delay
        if (wallBounce || opponentHit || aiHit) {
            this.reactionTimer = 15; // Stop thinking for ~250ms (15 frames)
        }

        // Recalculate offsets on specific hits
        if (wallBounce || opponentHit) {
            this.aimOffset = (Math.random() - Math.random()) * 100;
        }
        if (aiHit) {
            this.recoveryOffset = (Math.random() - Math.random()) * 100;
        }

        // 2. Apply Reaction Delay
        // If the timer is active, return the OLD move
        if (this.reactionTimer > 0) {
            this.reactionTimer--;
            return this.lastMove;
        }

        // 3. Logic
        const paddleCenter = paddle.y + (GAME_CONFIG.paddle.height / 2);
        let targetY = 0;

        if (ball.dx > 0) {
            // Center Recovery
            const boardCenter = canvasHeight / 2;
            targetY = boardCenter + this.recoveryOffset;
        } else {
            // Tracking
            targetY = ball.y + this.aimOffset;
        }

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
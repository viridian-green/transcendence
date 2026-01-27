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
        // Detect Changes
        const wallBounce = (this.prevDy !== 0 && Math.sign(ball.dy) !== Math.sign(this.prevDy));
        const opponentHit = (this.prevDx > 0 && ball.dx < 0);
        const aiHit = (this.prevDx < 0 && ball.dx > 0);

        // Update history for next frame
        this.prevDy = ball.dy;
        this.prevDx = ball.dx;

        if (wallBounce || opponentHit || aiHit) {
            this.reactionTimer = 15; // Stop thinking for ~250ms (15 frames)
        }

        if (wallBounce || opponentHit) {
            this.aimOffset = (Math.random() - Math.random()) * 100;
        }
        if (aiHit) {
            this.recoveryOffset = (Math.random() - Math.random()) * 60;
        }

        // If the timer is active, return the OLD move
        if (this.reactionTimer > 0) {
            this.reactionTimer--;
            return this.lastMove;
        }

        const paddleCenter = paddle.y + (GAME_CONFIG.paddle.height / 2);
        let targetY = 0;

        if (ball.dx > 0) { // Center Recovery
            const boardCenter = canvasHeight / 2;
            targetY = boardCenter + this.recoveryOffset;
        } else if (ball.isServing) { // Predictive Tracking
            const distToPaddle = ball.x - (paddle.x + GAME_CONFIG.paddle.width); 
            
            if (distToPaddle > 0) {
                const framesToImpact = distToPaddle / Math.abs(ball.dx);
                const currentY = ball.y;
                const futureDy = ball.dy * framesToImpact;
                
                const bounds = { min: GAME_CONFIG.ball.radius, max: canvasHeight - GAME_CONFIG.ball.radius };
                const range = bounds.max - bounds.min;

                let idealY = currentY + futureDy;
                let relativeY = idealY - bounds.min;
                const doubleRange = range * 2;
                let folded = (relativeY % doubleRange + doubleRange) % doubleRange;
                
                let finalY = (folded <= range) 
                    ? (bounds.min + folded) 
                    : (bounds.min + (doubleRange - folded));
                
                targetY = finalY + this.aimOffset;
            } else {
                targetY = ball.y + this.aimOffset;
            }
        } else { // Standard Tracking
            targetY = ball.y + this.aimOffset;
        }

        // Calculate the ideal move
        let newMove = 0;
        if (paddleCenter < targetY - 10) {
            newMove = GAME_CONFIG.paddle.speed; // Move Down
        } else if (paddleCenter > targetY + 10) {
            newMove = -GAME_CONFIG.paddle.speed; // Move Up
        }

        this.lastMove = newMove;
        
        return newMove;
    }
}
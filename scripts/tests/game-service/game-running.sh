#!/bin/bash

set -e

GAME_ID="test-game-$(date +%s)"
WS_URL="ws://localhost:3000/game/${gameId}"

echo "Testing game loop with WebSocket connection..."

# Use wscat or a simple Node script to connect and check state updates
node -e "
const WebSocket = require('ws');
const ws = new WebSocket('$WS_URL');
let stateReceived = false;
let gameLoopRunning = false;
let lastBallX = null;

ws.on('open', () => {
  console.log('Connected to game WS');
  ws.send(JSON.stringify({ type: 'RESET_GAME' }));
});

ws.on('message', (msg) => {
  const data = JSON.parse(msg);
  if (data.type === 'STATE') {
    stateReceived = true;
    const currentBallX = data.payload.ball.x;

    // Check if ball position changes (game loop running)
    if (lastBallX !== null && currentBallX !== lastBallX) {
      gameLoopRunning = true;
      console.log('✓ Game loop is running, ball moved from', lastBallX, 'to', currentBallX);
      ws.close();
      process.exit(0);
    }
    lastBallX = currentBallX;
  }
});

setTimeout(() => {
  if (!stateReceived) {
    console.error('✗ No state received from game server');
    process.exit(1);
  }
  if (!gameLoopRunning) {
    console.error('✗ Game loop not running, ball position unchanged');
    process.exit(1);
  }
}, 3000);
" || exit 1

echo "✓ Game running test passed"


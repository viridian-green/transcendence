#!/bin/bash

set -e

GAME_ID="test-game-reset-$(date +%s)"
WS_URL="wss://localhost:8443/game/${gameId}"

echo "Testing game reset on reconnect..."

node -e "
const WebSocket = require('ws');

// First connection: play a bit
const ws1 = new WebSocket('$WS_URL');
let firstBallX = null;

ws1.on('open', () => {
  console.log('First client connected');
  ws1.send(JSON.stringify({ type: 'RESET_GAME' }));
});

ws1.on('message', (msg) => {
  const data = JSON.parse(msg);
  if (data.type === 'STATE' && firstBallX === null) {
    firstBallX = data.payload.ball.x;
    console.log('First connection: ball at', firstBallX, 'phase:', data.payload.phase);

    // Simulate some game ticks, then disconnect
    setTimeout(() => {
      ws1.close();
      console.log('First client disconnected');

      // Second connection: should be reset to countdown
      setTimeout(() => {
        const ws2 = new WebSocket('$WS_URL');

        ws2.on('open', () => {
          console.log('Second client connected (simulating refresh)');
          ws2.send(JSON.stringify({ type: 'RESET_GAME' }));
        });

        ws2.on('message', (msg) => {
          const data = JSON.parse(msg);
          if (data.type === 'STATE') {
            const resetBallX = data.payload.ball.x;
            const resetPhase = data.payload.phase;

            console.log('Second connection: ball at', resetBallX, 'phase:', resetPhase);

            // Check if game was reset (ball should be near center, phase should be countdown)
            const isNearCenter = Math.abs(resetBallX - 400) < 50; // canvas width / 2
            const isCountdown = resetPhase === 'countdown';

            if (isNearCenter && isCountdown) {
              console.log('✓ Game reset correctly on refresh');
              ws2.close();
              process.exit(0);
            } else {
              console.error('✗ Game did not reset: ball far from center or wrong phase');
              process.exit(1);
            }
          }
        });
      }, 500);
    }, 1000);
  }
});

setTimeout(() => {
  console.error('✗ Test timeout');
  process.exit(1);
}, 5000);
" || exit 1

echo "✓ Game reset test passed"


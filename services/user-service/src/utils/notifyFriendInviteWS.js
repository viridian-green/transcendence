// User-service: send friend invite notification to notification-service via WebSocket
const WebSocket = require('ws');

const NOTIFICATION_WS_URL = process.env.NOTIFICATION_WS_URL || 'ws://notification-service:3006';
let ws = null;

function getNotificationSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) return ws;
  ws = new WebSocket(NOTIFICATION_WS_URL);
  ws.on('open', () => console.log('[UserService] Connected to notification-service'));
  ws.on('close', () => console.log('[UserService] Disconnected from notification-service'));
  ws.on('error', (err) => console.error('[UserService] Notification WS error:', err));
  return ws;
}

function notifyFriendInviteWS(toUserId, fromUserId, fromUsername) {
  const socket = getNotificationSocket();
  const payload = {
    type: 'FRIEND_INVITE',
    toUserId,
    fromUserId,
    fromUsername,
  };
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  } else {
    socket.on('open', () => socket.send(JSON.stringify(payload)));
  }
}

module.exports = { notifyFriendInviteWS };

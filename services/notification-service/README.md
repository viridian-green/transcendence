# Notification Service

The **notification-service** handles real-time notifications for remote players via WebSocket connections.

---

## Current responsibilities

- Real-time notification delivery via WebSocket
- Notification storage for offline users
- Support for various notification types:
  - Game invitations
  - Friend requests
  - Friend accepted notifications
  - Game start/end notifications
  - System messages

---

## Routes

All routes are prefixed with:
```bash
/api/notifications
```

| Method | Path        | Description                              | Status        |
|-------:|-------------|------------------------------------------|---------------|
| GET    | `/websocket` | WebSocket connection for notifications   | ✅ Implemented |

---

## WebSocket Protocol

### Connection

Connect to the WebSocket endpoint:
```
ws://localhost:8443/api/notifications/websocket?user=<username>
```

### Message Types (Client → Server)

#### Mark notification as read
```json
{
  "type": "mark_read",
  "notificationId": "notif-123"
}
```

#### Mark all notifications as read
```json
{
  "type": "mark_all_read"
}
```

#### Get all notifications
```json
{
  "type": "get_notifications"
}
```

### Message Types (Server → Client)

#### Welcome message
```json
{
  "type": "welcome",
  "message": "Notification service connected, username!",
  "user": { "id": "u1", "username": "alice" }
}
```

#### New notification
```json
{
  "type": "notification",
  "payload": {
    "id": "notif-123",
    "type": "game_invite",
    "title": "Game Invitation",
    "message": "alice invited you to play pong",
    "userId": "u2",
    "fromUserId": "u1",
    "fromUsername": "alice",
    "read": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "metadata": { "gameMode": "pong" }
  }
}
```

#### Pending notifications (on connect)
```json
{
  "type": "pending_notifications",
  "count": 5,
  "notifications": [...]
}
```

---

## Notification Types

- `game_invite`: Game invitation from another player
- `friend_request`: Friend request received
- `friend_accepted`: Friend request accepted
- `game_start`: Game is starting
- `game_end`: Game has ended
- `message`: Chat message notification
- `system`: System notification

---

## Usage Example

### Sending a notification from another service

```typescript
import { sendNotificationToUser, createGameInviteNotification } from './handlers/notifications';

// Create and send a game invite notification
const notification = createGameInviteNotification(
  'u2',           // toUserId
  'u1',           // fromUserId
  'alice',        // fromUsername
  'pong'          // gameMode
);

sendNotificationToUser('u2', notification);
```

---

## Port

- Default port: `3006`
- Configurable via `PORT` environment variable

---

## Development

```bash
npm run dev    # Start with hot reload
npm run build  # Build TypeScript
npm start      # Run production build
```


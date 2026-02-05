# Notification Service

The **notification-service** handles real-time friend request and friend status notifications via WebSocket connections. It subscribes to Redis events from other services and broadcasts them to connected clients.

---

## Architecture

The notification service follows a pub/sub pattern:

1. **Redis Subscriber**: Listens for events on the `notifications.events` Redis channel
2. **Event Handlers**: Process specific event types and route notifications to connected clients
3. **WebSocket Server**: Maintains active connections with authenticated clients and sends notifications

---

## Current Responsibilities

- Real-time friend request notifications
- Friend status change notifications (accepted, rejected, deleted/unfriended)
- WebSocket connection management with JWT authentication
- Client-to-user routing for targeted notifications

---

## Message Flow

### Friend Request Flow

```
1. Backend (User Service)
   ├─ DELETE /api/users/friends/:id (friend deletion)
   ├─ POST /api/users/friends/:id (friend request)
   ├─ POST /api/users/friends/:id/accept (accept request)
   └─ POST /api/users/friends/:id/reject (reject request)
   
   ↓ Emits event to Redis:
   {
     type: "FRIEND_DELETED" | "FRIEND_INVITE_RECEIVED" | "FRIEND_INVITE_ACCEPTED" | "FRIEND_INVITE_REJECTED",
     fromUserId: X,
     toUserId: Y,
     fromUsername: "..."
   }

2. Notification Service (Redis Subscriber)
   ├─ Listens on "notifications.events" Redis channel
   ├─ Parses event type
   └─ Routes to appropriate handler:
      ├─ handleFriendRequested() → sends FRIEND_INVITE_RECEIVED to recipient
      ├─ handleFriendAccepted() → sends FRIEND_INVITE_ACCEPTED to inviter + FRIEND_INVITE_CONFIRMED to accepter
      ├─ handleFriendRejected() → sends FRIEND_INVITE_REJECTED to inviter
      └─ handleFriendDeleted() → sends FRIEND_DELETED to initiator + FRIEND_UNFRIENDED to target

3. Notification Service (WebSocket Handler)
   ├─ Looks up connected sockets for target user(s)
   ├─ Sends WebSocket message to all active connections:
      {
        type: "FRIEND_INVITE_RECEIVED" | "FRIEND_INVITE_ACCEPTED" | "FRIEND_INVITE_CONFIRMED" | 
              "FRIEND_INVITE_REJECTED" | "FRIEND_DELETED" | "FRIEND_UNFRIENDED",
        fromUserId: X,
        toUserId: Y,
        fromUsername: "..."
      }

4. Frontend (Browser WebSocket)
   ├─ useNotificationSocket receives message
   ├─ Updates friendRequests state
   ├─ Sets lastRawMessage (triggers side effects)
   ├─ useNotificationSocket handlers:
   │  ├─ FRIEND_INVITE_RECEIVED → store pending request
   │  ├─ FRIEND_INVITE_ACCEPTED → update request status
   │  ├─ FRIEND_INVITE_REJECTED → update request status
   │  ├─ FRIEND_DELETED → remove request state
   │  └─ FRIEND_UNFRIENDED → remove request state
   │
   └─ Listeners refresh UI:
      ├─ OnlineUsersList → refreshes friends list on accept/confirm
      └─ FriendsCard → refreshes profile friend list on delete/unfriended
```

---

## Event Types

### Friend Invitation Events

| Event Type | From | To | Description |
|---|---|---|---|
| `FRIEND_INVITE_RECEIVED` | User Service | Recipient | Friend request received notification |
| `FRIEND_INVITE_ACCEPTED` | User Service | Inviter | Friend request was accepted |
| `FRIEND_INVITE_CONFIRMED` | User Service | Accepter | Confirmation that friendship was accepted |
| `FRIEND_INVITE_REJECTED` | User Service | Inviter | Friend request was rejected |
| `FRIEND_DELETED` | User Service | Initiator | Friendship deleted by you |
| `FRIEND_UNFRIENDED` | User Service | Target | You were removed as a friend |

---

## Redis Channel

**Channel**: `notifications.events`

Events are published in this format:

```json
{
  "type": "FRIEND_INVITE_RECEIVED",
  "fromUserId": 1,
  "toUserId": 2,
  "fromUsername": "alice",
  "at": "2024-01-01T00:00:00.000Z"
}
```

---

## WebSocket Protocol

### Connection

Connect using JWT authentication via cookies:

```
wss://localhost/api/notifications/websocket
```

**Authentication**: JWT token must be in `access_token` cookie

### Welcome Message

On successful connection:

```json
{
  "type": "welcome",
  "message": "Notification service connected, username!",
  "user": { "id": "123", "username": "alice" }
}
```

### Server → Client Messages

Friend request notification:

```json
{
  "type": "FRIEND_INVITE_RECEIVED",
  "fromUserId": "1",
  "fromUsername": "bob"
}
```

Friendship accepted notification:

```json
{
  "type": "FRIEND_INVITE_ACCEPTED",
  "fromUserId": "1",
  "fromUsername": "bob"
}
```

---

## Routes

All routes are prefixed with:

```bash
/api/notifications
```

| Method | Path | Description | Status |
|-------:|------|-------------|--------|
| GET | `/websocket` | WebSocket upgrade endpoint | ✅ Implemented |

---

## Port

- Default port: `3006`
- Configurable via `PORT` environment variable

---

## Environment Variables

- `REDIS_HOST`: Redis server hostname (default: `redis`)
- `REDIS_PORT`: Redis server port (default: `6379`)
- `REDIS_PASSWORD`: Redis password (optional)
- `JWT_SECRET`: Secret key for JWT verification

---

## Development

```bash
npm run dev    # Start with hot reload
npm run build  # Build TypeScript
npm start      # Run production build
```

---

## Error Handling

- Invalid JWT: Connection rejected with error message
- No active WebSocket connections for user: Event logged but processing continues
- Redis connection failure: Error logged, reconnection attempted
- Parse errors: Error logged, event skipped

# Presence Service API Usage

This document describes how to interact with the Presence Service to change a user's state, get a user's state, and retrieve the list of online users.

## 1. Change a User's State

**Endpoint:**
```
PATCH /state
```

**Request Body:**
```json
{
  "id": "USER_ID",
  "state": "online" | "busy" | "offline"
}
```

**Example (Node.js/fetch):**
```js
await fetch('http://presence:3005/state', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: userId, state: 'busy' }),
});
```

---

## 2. Get a User's State

**Endpoint:**
```
GET /state/:id
```

**Example:**
```js
const res = await fetch('http://presence:3005/state/USER_ID');
const data = await res.json();
console.log(data.state); // "online", "busy", or "offline"
```

---

## 3. Get List of Online Users

**Endpoint:**
```
GET /online-users
```

**Example:**
```js
const res = await fetch('http://presence:3005/online-users');
const data = await res.json();
console.log(data.users); // Array of user IDs who are online
```

---

## Notes
- Allowed states: `online`, `busy`, `offline`
- All endpoints return JSON responses.
- Make sure to use the correct base URL for your environment (e.g., `http://presence:3005`).

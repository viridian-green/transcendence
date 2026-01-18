# User State System

The user state system manages user online status. User states are stored in Redis for fast access and synchronized with the database default. Supported states are: `online`, `busy`, and `offline`.

## Storage

User states are stored in Redis with the key pattern: `user:state:<user_id>`

- States are automatically initialized to `offline` when a user registers or logs in
- If a state doesn't exist in Redis, it defaults to `offline`
- The database `users` table also has a `state` column with default `offline` for consistency

## Routes

All routes are prefixed with `/api/users/state`

### Update user state

```bash
PATCH /api/users/state/
```

Updates a user's state in Redis.

#### Request Body

```json
{
  "id": 1,
  "state": "online"
}
```

#### Valid States

- `online` - User is online and available
- `busy` - User is online but busy/occupied
- `offline` - User is offline (default)

#### Update Response

- `200 OK` - State updated successfully

```json
{
  "message": "User 1 state updated to online"
}
```

- `400 Bad Request` - Missing `id` or `state`, or invalid state value

```json
{
  "error": "Missing id or state"
}
```

- `500 Internal Server Error` - Failed to update state in Redis

### Get user state

```bash
GET /api/users/state/:id
```

Retrieves a user's current state from Redis.

#### Get Response

- `200 OK` - Returns the user's state (defaults to `offline` if not set)

```json
{
  "state": "online"
}
```

- `500 Internal Server Error` - Failed to retrieve state from Redis

## Notes

- User states are automatically initialized to `offline` on registration and login
- If a state key doesn't exist in Redis, the endpoint returns `offline` as the default value
- States are ephemeral and stored only in Redis (for performance), though the database maintains a default column for reference

# Friends System

The friends system allows users to create connections with other users. It supports sending friend requests, accepting/rejecting requests, removing friendships, and retrieving a user's friends list.

**Current limitations:**

- Checking a friend's status (_online, offline_) - handled by presence service

## Database model

`friends` table

```pg

CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_one INTEGER NOT NULL references users(id) ON DELETE CASCADE,
    user_two INTEGER NOT NULL references users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT no_self_friend CHECK (user_one <> user_two),
    CONSTRAINT unique_friendship UNIQUE (user_one, user_two)
);

```

### Notes

- A friendship always involves two users
- `status` represents the relationship state: `'pending'` (default) or `'accepted'`
- Users can accept or reject pending friend requests
- `ON DELETE CASCADE` ensures friendships are removed if a user is deleted
- A unique constraint prevents duplicate friendships, and this is also checked in the service layer

## Routes

All friend routes are protected and require a valid JWT cookie.

### Send a friend request

```bash
POST /api/users/friends/:id
```

Sends a friend request to the user with the given id.

- Requires auth
- Cannot add yourself
- Prevents duplicate or reverse friendship (if A adds B, B can't add A)
- Creates a `pending` friendship entry

#### Response

- `201 Created` - request created, returns friendship object
- `400 Bad Request` - user tried to add themselves
- `404 Not Found` - friend not found in database
- `409 Conflict` - user tried to add existing friend or friendship already exists

#### Example Response

```json
{
  "id": 1,
  "user_one": 1,
  "user_two": 3,
  "status": "pending",
  "created_at": "2025-12-24T10:42:00.000Z"
}
```

### Accept friend request

```bash
POST /api/users/friends/:id/accept
```

Accepts a pending friend request from the user with the given id.

- Requires auth
- Cannot accept from yourself
- Updates the friendship status from `'pending'` to `'accepted'`

#### Response

- `200 OK` - friendship accepted, returns updated friendship object
- `400 Bad Request` - user tried to accept from themselves
- `404 Not Found` - friend not found or friendship request doesn't exist

#### Example Response

```json
{
  "id": 1,
  "user_one": 1,
  "user_two": 3,
  "status": "accepted",
  "created_at": "2025-12-24T10:42:00.000Z"
}
```

### Reject friend request

```bash
POST /api/users/friends/:id/reject
```

Rejects a pending friend request from the user with the given id. This deletes the friendship record.

- Requires auth
- Cannot reject from yourself
- Deletes the friendship record

#### Response

- `200 OK` - friend request rejected, returns deleted friendship object
- `400 Bad Request` - user tried to reject from themselves
- `404 Not Found` - friend not found or friendship request doesn't exist

#### Example Response

```json
{
  "message": "Friend rejected",
  "friendship": {
    "id": 1,
    "user_one": 1,
    "user_two": 3,
    "status": "pending",
    "created_at": "2025-12-24T10:42:00.000Z"
  }
}
```

### Get friends list

```bash
GET /api/users/friends
```

Returns all friends of the authenticated user as user profile objects.

- Requires auth
- Returns user profiles (id, username, avatar, bio) for all friends
- Returns both pending and accepted friendships

#### Response

`200 OK` - friends list in body.

```json
[
  {
    "id": 3,
    "username": "friend_username",
    "avatar": "user-3-1234567890.jpg",
    "bio": "Friend's bio"
  },
  {
    "id": 5,
    "username": "another_friend",
    "avatar": "default.png",
    "bio": null
  }
]
```


### Remove friend

```bash
DELETE /api/users/friends/:id
```

Removes existing friendship or cancels pending request.

- Requires authentication
- Prevents user from deleting themselves
- Ensures other user both exists and is a friend
- Deletes from both lists

#### Response

- `200 OK`- friend removed, further info in body below.
- `400 Bad Request` - user tried to delete themselves.
- `404 Not Found`- friend or friendship not found in database.

```json
{
  "message": "Friend removed",
  "friendship": {
    "id": 12,
    "user_one": 5,
    "user_two": 9,
    "status": "accepted",
    "created_at": "2025-12-24T10:42:00.000Z"
  }
}
```

## Route Ordering

The routes are ordered with specific paths before generic ones to avoid route conflicts:
1. `POST /:id/accept` - must come before `POST /:id`
2. `POST /:id/reject` - must come before `POST /:id`
3. `POST /:id` - generic route for creating friend requests
4. `DELETE /:id` - for removing friends
5. `GET /` - for getting friends list

## Future improvements

- Filter friends by status (accepted only) in the GET endpoint

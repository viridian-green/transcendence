# Friends System

The friends system allow users to create connections with other users. It supports sending friend requests, removing friendships and retrieving a user's friends list. With further development of the project, other routes may come into necessity.

**Not still supported:**

- Accepting a request
- Checking a friend's status (_online, offline_)
- Get list is raw (returns all friendships, both accepted and pending)

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
- `status` represents the relationship state, albeit for now it's not possible for user to accept a friendship.
- `ON DELETE CASCADE` ensures friendships are removed if a user is deleted.
- A unique constraint that prevents duplicate friendships, even though this is constraint is also checked in service.

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

- `200 OK`- request created, friendshipId.
- `400 Bad Request` - user tried to add themselves.
- `404 Not Found`- friend not found in database.
- `409`- user tried to add existing friend.

### Get friends list

```bash
GET /api/users/friends
```

Returns all friendships of the authenticated user.

- Requires auth
- Returns **both** pending and accepted friendships

#### Response

`200 OK` - friends list in body.

```json
[
  {
    "id": 1,
    "user_one": 1,
    "user_two": 3,
    "status": "accepted",
    "created_at": "2025-12-24T10:42:00.000Z"
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

## Future improvements

- Accept/reject friend requests
- Online status integration
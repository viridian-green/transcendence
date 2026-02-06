# Database Migrations

This directory contains SQL migration files for the User Service database schema.

## Overview

We use **Postgrator** for database migrations. Migrations run automatically when the User Service starts, ensuring the database schema is always up to date.

---

## How Migrations Work

### Naming Convention

```
{version}.{action}.{description}.sql

Examples:
  001.do.create_users.sql      ← Version 1, "do" = apply, creates users table
  002.do.create_friends.sql    ← Version 2, "do" = apply, creates friends table
```

| Part | Description |
|------|-------------|
| `{version}` | Sequential number (001, 002, 003...) |
| `{action}` | `do` = apply migration, `undo` = rollback migration |
| `{description}` | Human-readable description |

### Automatic Execution

Migrations run on service startup via the database plugin:

```javascript
// services/user-service/src/plugins/db.js
app.addHook('onReady', async () => {
    const postgrator = new Postgrator({
        migrationPattern: path.join(process.cwd(), 'migrations/*'),
        driver: 'pg',
        database: 'user_db',
        schemaTable: 'schema_migrations',
        execQuery: (query) => app.pg.query(query)
    });

    const applied = await postgrator.migrate();
    app.log.info({ applied }, 'Database migrations completed');
});
```

### Migration Tracking

Postgrator creates a `schema_migrations` table to track which migrations have been applied:

```sql
SELECT * FROM schema_migrations;

 version |         name                              |       run_at
---------+-------------------------------------------+---------------------
       1 | 001.do.create_users                       | 2024-01-15 10:30:00
       2 | 002.do.create_friends                     | 2024-01-15 10:30:01
       3 | 003.do.add_friends_ordered_constraint     | 2024-01-15 10:30:02
       ...
```

---

## Current Migrations

### 001.do.create_users.sql

Creates the main `users` table for authentication and profiles.

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT NOT NULL DEFAULT 'default.png',
    created_at TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `username` | TEXT | Unique display name |
| `password` | TEXT | bcrypt-hashed password |
| `email` | TEXT | Unique email address |
| `avatar` | TEXT | Avatar filename (default: 'default.png') |
| `created_at` | TIMESTAMP | Account creation time |

---

### 002.do.create_friends.sql

Creates the `friends` table for managing friendships between users.

```sql
CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_one INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_two INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT no_self_friend CHECK (user_one <> user_two),
    CONSTRAINT unique_friendship UNIQUE (user_one, user_two)
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Auto-incrementing primary key |
| `user_one` | INTEGER | First user in friendship (FK → users) |
| `user_two` | INTEGER | Second user in friendship (FK → users) |
| `status` | TEXT | 'pending' or 'accepted' |
| `created_at` | TIMESTAMP | Friendship creation time |

**Constraints:**
- `no_self_friend` — Users cannot friend themselves
- `unique_friendship` — Only one record per user pair
- `ON DELETE CASCADE` — Friendships deleted when users are deleted

---

### 003.do.add_friends_ordered_constraint.sql

Ensures consistent ordering of user IDs in friendships.

```sql
ALTER TABLE friends
ADD CONSTRAINT friends_ordered CHECK (user_one < user_two);
```

**Why?** This prevents duplicate friendships like:
```
✗ (user_one=1, user_two=2) AND (user_one=2, user_two=1)  ← Both represent same friendship
✓ (user_one=1, user_two=2)  ← Always store smaller ID first
```

---

### 004.do.add_user_state.sql

Adds presence tracking to users.

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'offline';
```

| Value | Description |
|-------|-------------|
| `'online'` | User is connected |
| `'offline'` | User is disconnected |
| `'busy'` | User is in a game |

---

### 005.do.add_user_bio.sql

Adds a biography field to user profiles.

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio VARCHAR(150) DEFAULT 'Let''s play!';
```

- Maximum 150 characters
- Default value: "Let's play!"
- Sanitized on the backend to prevent XSS

---

### 006.do.add_friends_requested_by.sql

Tracks who initiated a friend request.

```sql
ALTER TABLE friends
ADD COLUMN IF NOT EXISTS requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

UPDATE friends
SET requested_by = user_one
WHERE requested_by IS NULL;
```

This enables showing "You sent a request" vs "They sent you a request" in the UI.

---

## Final Schema

After all migrations, the database looks like this:

```
┌─────────────────────────────────────────────────────────────┐
│                          users                               │
├─────────────────────────────────────────────────────────────┤
│ PK │ id          │ SERIAL       │ Auto-incrementing ID      │
│    │ username    │ TEXT         │ UNIQUE, NOT NULL          │
│    │ password    │ TEXT         │ NOT NULL (bcrypt hash)    │
│    │ email       │ TEXT         │ UNIQUE, NOT NULL          │
│    │ avatar      │ TEXT         │ DEFAULT 'default.png'     │
│    │ bio         │ VARCHAR(150) │ DEFAULT 'Let's play!'     │
│    │ state       │ TEXT         │ DEFAULT 'offline'         │
│    │ created_at  │ TIMESTAMP    │ DEFAULT NOW()             │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ 1:N (user can have many friendships)
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                         friends                              │
├─────────────────────────────────────────────────────────────┤
│ PK │ id           │ SERIAL    │ Auto-incrementing ID        │
│ FK │ user_one     │ INTEGER   │ REFERENCES users(id)        │
│ FK │ user_two     │ INTEGER   │ REFERENCES users(id)        │
│ FK │ requested_by │ INTEGER   │ REFERENCES users(id)        │
│    │ status       │ TEXT      │ DEFAULT 'pending'           │
│    │ created_at   │ TIMESTAMP │ DEFAULT NOW()               │
├─────────────────────────────────────────────────────────────┤
│ Constraints:                                                 │
│   • no_self_friend: user_one <> user_two                    │
│   • unique_friendship: UNIQUE(user_one, user_two)           │
│   • friends_ordered: user_one < user_two                    │
│   • ON DELETE CASCADE for user_one, user_two                │
│   • ON DELETE SET NULL for requested_by                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Adding New Migrations

### Step 1: Create the Migration File

```bash
# In services/user-service/migrations/
touch 007.do.add_new_column.sql
```

### Step 2: Write the SQL

```sql
-- 007.do.add_new_column.sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS new_column TEXT DEFAULT 'value';
```

### Step 3: Restart the Service

Migrations run automatically on startup:

```bash
make restart
# or
docker compose restart user
```

### Step 4: Verify

Check the logs for migration output:
```
Database migrations completed { applied: [{ version: 7, name: '007.do.add_new_column' }] }
```

---

## Rollback Migrations

To create a rollback migration, add an `undo` file:

```sql
-- 007.undo.add_new_column.sql
ALTER TABLE users
DROP COLUMN IF EXISTS new_column;
```

Then run Postgrator with a target version:

```javascript
await postgrator.migrate('006');  // Roll back to version 6
```

---

## Best Practices

1. **Never modify existing migrations** — Create a new migration instead
2. **Use `IF NOT EXISTS` / `IF EXISTS`** — Makes migrations idempotent
3. **Test migrations locally** — Before pushing to production
4. **Back up data before destructive changes** — DROP COLUMN, etc.
5. **Keep migrations small** — One logical change per file


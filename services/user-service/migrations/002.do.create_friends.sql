CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_one INTEGER NOT NULL references users(id) ON DELETE CASCADE,
    user_two INTEGER NOT NULL references users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT no_self_friend CHECK (user_one <> user_two),
    CONSTRAINT unique_friendship UNIQUE (user_one, user_two)
);
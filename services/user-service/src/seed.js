import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // <- important
});

/**
 * Seeds the database with initial data
 */
async function seed() {
  try {
    // Users to insert
    const users = [
      { username: 'alice',   email: 'alice@test.com',   password: 'Password123!', bio: 'Hi, I am Alice',   state: 'online' },
      { username: 'bob',     email: 'bob@test.com',     password: 'Password123!', bio: 'Bob here',         state: 'busy' },
      { username: 'charlie', email: 'charlie@test.com', password: 'Password123!', bio: 'Charlie checking', state: 'offline' },
      { username: 'diana',   email: 'diana@test.com',   password: 'Password123!', bio: 'Diana dev',        state: 'online' },
      { username: 'eve',     email: 'eve@test.com',     password: 'Password123!', bio: 'Eve lurking',      state: 'offline' }
    ];

    // Hash all passwords
    for (const user of users) {
      user.password = await bcrypt.hash(user.password, 10);
    }

	await client.query(`
  ALTER TABLE users
  ADD CONSTRAINT IF NOT EXISTS unique_email UNIQUE (email)
`);

await client.query(`
  ALTER TABLE friends
  ADD CONSTRAINT IF NOT EXISTS unique_friends_pair UNIQUE (user_one, user_two)
`);
    // Insert users
    for (const user of users) {
      await pool.query(
        `INSERT INTO users (username, email, password, avatar, bio, state)
         VALUES ($1, $2, $3, 'default.png', $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [user.username, user.email, user.password, user.bio, user.state]
      );
    }

    // Example friendships
    const friends = [
      [1, 2, 'accepted'],
      [1, 3, 'accepted'],
      [2, 3, 'accepted'],
      [1, 4, 'pending'],
      [2, 5, 'pending'],
      [3, 5, 'pending']
    ];

    for (const [user_one, user_two, status] of friends) {
      await pool.query(
        `INSERT INTO friends (user_one, user_two, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_one, user_two) DO NOTHING`,
        [user_one, user_two, status]
      );
    }

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await pool.end();
  }
}

export default seed;
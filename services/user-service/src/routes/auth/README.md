# Authentication & Password Security

This document explains how password security is implemented in the User Service.

## Overview

We use **bcrypt** for password hashing with automatic salting. Passwords are **never stored in plain text**.

---

## Password Hashing with bcrypt

### Registration Flow

When a user registers, the password goes through this process:

```javascript
// services/user-service/src/services/auth.service.js
export async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}
```

**Visual Example:**

```
User types:     "MyP@ssword123"
                       │
                       ▼
              ┌─────────────────┐
              │  bcrypt.hash()  │
              │                 │
              │ 1. Generate     │
              │    random salt  │───▶ "N9qo8uLOickgx2ZMRZoMy."
              │                 │
              │ 2. Hash password│
              │    with salt    │
              └────────┬────────┘
                       │
                       ▼
We store:   "$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQlGZ7dFwNBoZ0.YPVoG5I0b9W/C"
```

---

### Hash Structure

The bcrypt hash contains everything needed for verification:

```
$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQlGZ7dFwNBoZ0.YPVoG5I0b9W/C
 │   │  │                     │
 │   │  └─ SALT (22 chars) ───┘
 │   │                         └─ HASH (31 chars) ─────────────┘
 │   └─ Cost factor (10 = 2^10 = 1,024 iterations)
 └─ Algorithm version (2a = bcrypt)
```

---

## Login Verification

When a user logs in, we compare the plain password against the stored hash:

```javascript
// services/user-service/src/services/auth.service.js
export async function ensureValidPassword(password, user) {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        const err = new Error("Invalid credentials");
        err.statusCode = 401;
        throw err;
    }
}
```

### How bcrypt.compare() Works

```
User types: "MyP@ssword123"          From database:
                  │                  "$2a$10$N9qo8uLOickgx2ZMRZoMy.Mqr..."
                  │                           │
                  ▼                           ▼
          ┌─────────────────────────────────────────┐
          │           bcrypt.compare()              │
          │                                         │
          │  1. Extract salt from stored hash       │
          │     Salt = "N9qo8uLOickgx2ZMRZoMy."    │
          │                                         │
          │  2. Hash input with SAME salt           │
          │     hash("MyP@ssword123" + salt)        │
          │                                         │
          │  3. Compare result with stored hash     │
          │     Are they equal?                     │
          └────────────────┬────────────────────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                 YES               NO
                  │                 │
                  ▼                 ▼
               ✅ Valid          ❌ Invalid
```

**Key insight:** The salt is stored INSIDE the hash. When verifying, bcrypt extracts the original salt and re-hashes the input password with that same salt, then compares the results.

---

## Why Salting Matters

Without salt, identical passwords produce identical hashes:

```
Without salt (BAD):
  User A: password123 → abc123...
  User B: password123 → abc123...  ← Same hash! Attacker knows both

With salt (GOOD - what we use):
  User A: password123 → $2a$10$SALT1...HASH1...
  User B: password123 → $2a$10$SALT2...HASH2...  ← Different hashes!
```

Each password gets a **unique random salt**, so:
- Two users with the same password have different hashes
- Rainbow table attacks don't work
- If one password is cracked, others remain safe

---

## Cost Factor = 10

The `10` in `bcrypt.hash(password, 10)` is the **cost factor**:

```
Iterations = 2^cost
Cost 10 = 2^10 = 1,024 iterations
```

| Cost | Time per Hash | Use Case |
|------|---------------|----------|
| 8 | ~40ms | Fast, less secure |
| **10** | **~100ms** | **Standard (what we use)** |
| 12 | ~300ms | High security |
| 14 | ~1 second | Very high security |

**Why slow is good:**
- For a user: 100ms is imperceptible
- For an attacker: 1 million attempts × 100ms = **27+ hours**

---

## Password Requirements

We enforce strong passwords via Zod validation:

```javascript
// services/user-service/src/schemas/auth.schema.js
password: z
    .string().nonempty("Password required")
    .min(8, "Password must be at least 8 characters")
    .max(15, "Password must be at most 15 characters")
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/[a-z]/, "At least one lowercase letter")
    .regex(/[0-9]/, "At least one number")
    .regex(/[^A-Za-z0-9]/, "At least one special character")
```

| Requirement | Example |
|-------------|---------|
| 8-15 characters | ✅ `MyPass1!` |
| Uppercase letter | A-Z |
| Lowercase letter | a-z |
| Number | 0-9 |
| Special character | `!@#$%^&*` etc. |

---

## Security Summary

| Aspect | Implementation | Status |
|--------|----------------|--------|
| Plain text storage | Never | ✅ |
| Hashing algorithm | bcrypt | ✅ |
| Automatic salting | Yes (unique per password) | ✅ |
| Cost factor | 10 (brute-force resistant) | ✅ |
| Password validation | Server-side with Zod | ✅ |

---

## Full Registration & Login Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REGISTRATION                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  POST /api/auth/register
  { "email": "nat@example.com", "username": "natalia", "password": "MyP@ss1!" }
                    │
                    ▼
            ┌───────────────┐
            │ Zod Validation│ ──▶ Check password requirements
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │ bcrypt.hash() │ ──▶ Generate salt + hash password
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │  PostgreSQL   │ ──▶ Store: { email, username, hashedPassword }
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │  jwt.sign()   │ ──▶ Create JWT with user id/username
            └───────┬───────┘
                    │
                    ▼
         Set-Cookie: access_token=<JWT> (httpOnly)


┌─────────────────────────────────────────────────────────────────────────────┐
│                              LOGIN                                           │
└─────────────────────────────────────────────────────────────────────────────┘

  POST /api/auth/login
  { "email": "nat@example.com", "password": "MyP@ss1!" }
                    │
                    ▼
            ┌───────────────┐
            │ Zod Validation│ ──▶ Check email format, password not empty
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────┐
            │  PostgreSQL   │ ──▶ Find user by email
            └───────┬───────┘
                    │
                    ▼
            ┌───────────────────┐
            │ bcrypt.compare()  │ ──▶ Extract salt, re-hash, compare
            └───────┬───────────┘
                    │
              ┌─────┴─────┐
              │           │
           MATCH       NO MATCH
              │           │
              ▼           ▼
         jwt.sign()    401 Error
              │
              ▼
   Set-Cookie: access_token=<JWT> (httpOnly)
```


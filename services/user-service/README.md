# User Service

The **user-service** is responsible for user identity and authentication.
It manages user credentials, authentication logic, and JWT issuance.

---

## Current responsibilities

- User registration
- User authentication (login)
- Password hashing and validation
- JWT issuance
- User data retrieval and update

---

## Routes

All routes are prefixed with:
```bash
/api/users
```

| Method | Path        | Description                              | Status        |
|-------:|-------------|------------------------------------------|---------------|
| POST   | `/register` | Register a new user                      | ✅ Implemented |
| POST   | `/login`    | Authenticate user and issue JWT          | ✅ Implemented |
| GET    | `/:id`      | Get user by ID                           | 🚧 Planned    |
| PATCH  | `/:id`      | Update user                              | 🚧 Planned    |


---

## Authentication

### Login

**Request**
```json
{
  "username": "test",
  "password": "1234"
}
```

**Response**
```json
{
  "accessToken": "<jwt>"
}
```

- Passwords are validated using bcrypt
- On success, a JWT is returned
- Invalid credentials return 400
- The service does not return user records during login.


## Registration

### Endpoint
```bash
POST /api/users/register
```

### Description

Creates a new user account with a hashed password.
If registration is successful, the user is persisted in the database and can subsequently authenticate via the login endpoint.

### Request Body

```json
{
  "email": "test@test.com",
  "username": "test",
  "password": "1234"
}
```

### Behavior
- Validates required fields
- Hashes the password using **bcrypt**
- Stores the user in the database
- Rejects duplicate users (if already present)
- Does not issue a JWT (authentication is handled by /login)

### Responses

`201 Created` — user successfully registered
`400 Bad Request` — missing or invalid fields


### Docker Cache

Changes to routes or plugins require rebuilding the service image.
For this, are rule was created on the Makefile

```bash
make nocache
```

### Running Locally

The user-service listens on port 3003.

### Testing
Example register test (direct service access):

```bash
curl -X POST http://localhost:3000/api/users/register \
    -H "Content-type: application/json" \
    -d '{"email":"test@test.com", "username":"test","password":"1234"}'
```

Then, login:

```bash
curl -X POST http://localhost:3003/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"1234"}'
```

Naturally, user must be registered prior to having a sucessfull login.
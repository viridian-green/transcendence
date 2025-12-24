# User Service

The **user-service** is responsible for user identity and authentication.
It manages user credentials, authentication logic, and JWT issuance.

---

## Current responsibilities

- User registration
- User authentication (login)
- Password hashing and validation
- JWT issuance and verification
- Authenticated user data retrieval and update
- User sign out (cookie invalidation)
- Friend system (_in progress_)

---

## Routes

All routes are prefixed with:
```bash
/api/users
```

| Method | Path        | Description                              | Status        |
|-------:|-------------|------------------------------------------|---------------|
| POST   | `/register`     | Register a new user                      | ✅ Implemented |
| POST   | `/login`        | Authenticate user and issue JWT          | ✅ Implemented |
| GET    | `/me`           | Get current authenticated us             | ✅ Implemented |
| PUT    | `/me`           | Update current authenticated user        | ✅ Implemented |
| POST   | `/signout`      | Clear authentication cookie              | ✅ Implemented |
| POST   | `/friends/:id`  | Send a friend request                    | 🚧 In progress |
| DELETE | `/friends/:id`  | Remove an existing friend                | 🚧 Planned     |
| GET    | `/friends`      | See friends list.                        | 🚧 Planned     |

---

## Authentication

This service uses cookie bases authentication:
- JWTs are issued on login
- Tokens are store in an http only cookie
- Authenticated routes require a valid cookie


## Registration

### Endpoint
```bash
POST /api/users/register
```

### Description

Creates a new user account with a hashed password.
If registration is successful, the user is persisted in the database and can subsequently authenticate via the login endpoint.
Authentication is not automatic: user must login first.

### Request Body

```json
{
  "email": "test@test.com",
  "username": "test",
  "password": "1234"
}
```

### Behavior
- Validates request body using a schema-based validator
- Rejects missing or empty fields
- Enforces format and length constraints, not relying solely on frontend
- Hashes the password using **bcrypt**
- Stores the user in the database
- Rejects duplicate users (if already present)
- Does not authenticate user (authentication is handled by /login)

### Responses

`201 Created` — user successfully registered
`400 Bad Request` — missing or invalid fields

## Login

### Endpoint

```bash
POST /api/users/login
```

**Request**
```json
{
  "username": "test",
  "password": "1234"
}
```

**Response**

`200 OK` - authenticated
`400 Bad Request` - invalid credentials

- Passwords are validated using bcrypt
- On success, a JWT is returned

## Sign out

### Endpoint

```bash
POST /api/users/signout
```

### Behavior

- Clears the auth cookie

### Request

```json
{ "message": "Logged out" }
```

## Authenticated User /me

### Get current user

```bash
GET /api/users/me
```

Requires authentication via cookie.

### Update current user

```bash
PUT /api/users/me
```

#### Example payload

```json
{
  "username": "new_username",
  "password": "newStrongPassword123"
}
```

Only provided fields are updated, password are rehashed before storage.

## Database migrations

The service uses *Postgrator migrations*.

## Docker Cache

Changes to routes or plugins require rebuilding the service image.
For this, are rule was created on the Makefile

```bash
make nocache
```

## Testing & CI

### Automated API Tests

The user-service includes black-box API tests that verify backend validation
and registration behavior.

These tests ensure:
- Missing fields are rejected
- Empty fields are rejected
- Invalid payloads return `400 Bad Request`
- Valid payloads return `201 Created`

Tests are executed against the running stack via the API Gateway.

### Running tests locally

From the repository root:

```bash
make up
./init-scripts/test-scripts/user_service/register.sh
./init-scripts/test-scripts/user-service/login.sh
./init-scripts/test-scripts/user-service/me.sh
```

### Testing

Example register test (direct service access):

```bash
curl -X POST http://localhost:3000/api/users/register \
    -H "Content-type: application/json" \
    -d '{"email":"test@test.com", "username":"test","password":"1234"}'
```

Then, login:

```bash
curl -X POST http://localhost:3003/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"1234"}'
```

Naturally, user must be registered prior to having a sucessfull login.

## Validation

All user input is validated on the backend using shared schemas.

The service enforces:
- Required fields (`email`, `username`, `password`)
- Non-empty values
- Email format validation
- Username length limits
- Password complexity rules

This ensures the API remains secure even if requests bypass the frontend
(e.g. via curl or direct HTTP calls).
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
- User avatar management (upload and retrieval)
- Public user resources (profile and avatar lookup)
- User sign out (cookie invalidation)
- Friend system (_in progress_)

---

## Routes

**Route Prefixes:**
- Direct service access (port 3003): Routes shown below without `/api` prefix
- API Gateway access (port 3000): Routes are prefixed with `/api` (e.g., `/api/auth/register`)

| Method | Path                 | Description                              | Auth Required | Status        |
|-------:|----------------------|------------------------------------------|---------------|---------------|
| POST   | `/auth/register`     | Register a new user                      | ❌ No         | ✅ Implemented |
| POST   | `/auth/login`        | Authenticate user and issue JWT          | ❌ No         | ✅ Implemented |
| POST   | `/auth/signout`      | Clear authentication cookie              | ✅ Yes        | ✅ Implemented |
| GET    | `/users/username/:username` | Get user by username (public profile) | ❌ No         | ✅ Implemented |
| GET    | `/users/:id`         | Get user by ID (public profile)          | ❌ No         | ✅ Implemented |
| GET    | `/users/:id/avatar`  | Get user avatar by ID                    | ❌ No         | ✅ Implemented |
| GET    | `/users/me`          | Get current authenticated user           | ✅ Yes        | ✅ Implemented |
| PUT    | `/users/me`          | Update current authenticated user        | ✅ Yes        | ✅ Implemented |
| GET    | `/users/me/avatar`   | Get current user's avatar                | ✅ Yes        | ✅ Implemented |
| POST   | `/users/me/avatar`   | Upload avatar for current user           | ✅ Yes        | ✅ Implemented |
| GET    | `/users/friends`     | Get friends list                         | ✅ Yes        | ✅ Implemented |
| POST   | `/users/friends/:id` | Send a friend request                    | ✅ Yes        | ✅ Implemented |
| DELETE | `/users/friends/:id` | Remove an existing friend                | ✅ Yes        | ✅ Implemented |

---

## Authentication

This service uses cookie bases authentication:
- JWTs are issued on login
- Tokens are store in an http only cookie
- Authenticated routes require a valid cookie


## Registration

### Endpoint
```bash
POST /api/auth/register
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
POST /api/auth/login
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
POST /api/auth/signout
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

## User Avatar Management

### Get current user's avatar

```bash
GET /api/users/me/avatar
```

Requires authentication via cookie. Returns the avatar image file for the current authenticated user.

#### Response

- `200 OK` - Avatar file streamed (image/jpeg, image/png, etc.)
- `404 Not Found` - User has no avatar or avatar file not found

### Upload current user's avatar

```bash
POST /api/users/me/avatar
```

Requires authentication via cookie. Uploads a new avatar image for the current authenticated user.

#### Request

- **Content-Type**: `multipart/form-data`
- **Body**: File upload (max 5MB)

#### Response

```json
{
  "avatar": "user-123.jpg"
}
```

- `200 OK` - Avatar uploaded successfully
- `400 Bad Request` - No file uploaded or invalid file
- `413 Payload Too Large` - File exceeds 5MB limit

**Notes:**
- File is automatically renamed to `user-{userId}.{extension}`
- Old avatar files are overwritten
- Supported formats: jpg, jpeg, png, gif (based on file extension)

## Public User Resources

### Get user by username

```bash
GET /api/users/username/:username
```

Retrieves public user information by username. Does not require authentication.

#### Response

```json
{
  "id": 123,
  "username": "testuser",
  "email": "test@example.com",
  "avatar": "user-123.jpg"
}
```

- `200 OK` - User found
- `400 Bad Request` - Invalid username format
- `404 Not Found` - User not found

**Example:**
```bash
curl http://localhost:3003/users/username/testuser
```

### Get user by ID

```bash
GET /api/users/:id
```

Retrieves public user information by user ID. Does not require authentication.

#### Response

```json
{
  "id": 123,
  "username": "testuser",
  "email": "test@example.com",
  "avatar": "user-123.jpg"
}
```

- `200 OK` - User found
- `400 Bad Request` - Invalid user ID format
- `404 Not Found` - User not found

**Example:**
```bash
curl http://localhost:3003/users/123
```

### Get user avatar by ID

```bash
GET /api/users/:id/avatar
```

Retrieves a user's avatar image by user ID. Does not require authentication.

#### Response

- `200 OK` - Avatar file streamed (image/jpeg, image/png, etc.)
- `400 Bad Request` - Invalid user ID format
- `404 Not Found` - User not found, user has no avatar, or avatar file not found

**Notes:**
- This endpoint allows public access to user avatars
- Useful for displaying user avatars in the frontend without authentication
- Returns the raw image file with appropriate content-type header

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

#### Authentication Examples

Example register test (direct service access):

```bash
curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-type: application/json" \
    -d '{"email":"test@test.com", "username":"test","password":"1234"}'
```

Then, login:

```bash
curl -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"1234"}'
```

Naturally, user must be registered prior to having a successful login.

#### Public User Resources Examples

Get user by username (direct service access):

```bash
curl http://localhost:3003/users/username/testuser
```

Get user by ID (direct service access):

```bash
curl http://localhost:3003/users/1
```

Get user avatar by ID (direct service access):

```bash
curl http://localhost:3003/users/1/avatar -o avatar.jpg
```

#### Authenticated User Examples

Get current user profile (direct service access, requires auth cookie from login):

```bash
curl http://localhost:3003/users/me \
  -H "Cookie: access_token=YOUR_JWT_TOKEN"
```

Update current user profile (direct service access):

```bash
curl -X PUT http://localhost:3003/users/me \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -d '{"username":"new_username","password":"newPassword123"}'
```

Get current user's avatar (direct service access):

```bash
curl http://localhost:3003/users/me/avatar \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -o my_avatar.jpg
```

Upload avatar for current user (direct service access):

```bash
curl -X POST http://localhost:3003/users/me/avatar \
  -H "Cookie: access_token=YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**Note:** When accessing through the API Gateway (port 3000), routes are prefixed with `/api/` (e.g., `/api/users/me`). Direct service access (port 3003) uses routes without the `/api/` prefix.

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
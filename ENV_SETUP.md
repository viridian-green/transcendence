# Environment Variables Setup

This project uses per-service environment variables for better separation of concerns.

## Quick Setup

Copy all `.env.example` files to `.env` files:

```bash
# Root (shared infrastructure)
cp .env.example .env

# API Gateway
cp api-gateway/.env.example api-gateway/.env

# User Service
cp services/user-service/.env.example services/user-service/.env

# Game Service
cp services/game-service/.env.example services/game-service/.env

# Chat Service
cp services/chat-service/.env.example services/chat-service/.env

# Notification Service
cp services/notification-service/.env.example services/notification-service/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Or use this one-liner:

```bash
for file in $(find . -name ".env.example"); do cp "$file" "${file%.example}"; done
```

## Configuration Files

### Root `.env`

Contains shared infrastructure configuration:

- Database credentials
- Exposed ports (NGINX, PostgreSQL)

### `api-gateway/.env`

- Internal service URLs
- Gateway port and host
- Node environment

### `services/user-service/.env`

- Database connection URL
- JWT secrets
- Server configuration

### `services/game-service/.env`

- Database connection URL
- Server configuration

### `services/chat-service/.env`

- Server configuration
- Redis connection (if needed)

### `services/notification-service/.env`

- Server port (default: 3006)
- JWT secret for authentication
- Node environment

## Important Notes

1. **Never commit `.env` files** - they contain secrets
2. **Always update `.env.example`** when adding new variables
3. **Use strong secrets** in production (especially `JWT_SECRET`)
4. **Different values per environment** - use different `.env` for dev/staging/prod

## Troubleshooting

If environment variables aren't loading:

```bash
# Rebuild containers
docker compose down
docker compose up --build

# Check if .env files exist
ls -la .env
ls -la api-gateway/.env
ls -la services/*/.env
ls -la frontend/.env

# Or specifically check notification service
ls -la services/notification-service/.env
```

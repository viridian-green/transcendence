.PHONY: setup up down logs clean rebuild restart nocache

# Generate SSL certificates if they don't exist
setup:
	@echo "Setting up SSL certificates..."
	@mkdir -p nginx/ssl
	@if [ ! -f nginx/ssl/nginx.crt ]; then \
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/nginx.key \
            -out nginx/ssl/nginx.crt \
            -subj "/C=US/ST=State/L=City/O=Transcendence/CN=localhost" && \
        echo "✓ SSL certificates generated"; \
	else \
        echo "✓ SSL certificates already exist"; \
	fi

# Start services (generates certs if needed)
up: setup
	docker compose up -d

# Start with logs
logs: setup
	docker compose up

# Stop services
down:
	docker compose down

restart: down
	docker compose up -d --build

# No cache rebuild. Used on user service development.
nocache:
	docker compose down
	docker compose build --no-cache user
	docker compose up

# Clean everything including volumes
clean:
	docker compose down -v
	rm -rf nginx/ssl/*.crt nginx/ssl/*.key

# Rebuild from scratch
rebuild: clean setup
	docker compose up --build -d

open:
	open https://localhost:8443


## Testing

# Create test user
usertest:
	curl -X POST https://localhost:8443/api/auth/register \
  	-H "Content-Type: application/json" \
 	-d '{"email":"user@example.com","username":"testuser","password":"Password123!"}' \
  	-k  \

# Check for existing users in table
usertable:
	docker exec postgres_db psql -U myuser -d user_db -c "SELECT id, username, email, created_at FROM users ORDER BY id;"

.PHONY: setup up dev down logs logsdev restart restartdev nocache rebuild rebuilddev clean prune open usertest usertable


## === Bootstrap ===

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


## === Lifecycle: start/stop/restart ===

# Start services (base stack)
up: setup
	docker compose up -d

# Start services with dev overrides
dev: setup
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Tail logs (base stack)
logs: setup
	docker compose logs -f

# Tail logs (dev stack with overrides)
logsdev: setup
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Stop services
down:
	docker compose down

# Restart with rebuild (base stack)
restart:
	docker compose up -d --build

# Restart with rebuild (dev stack)
restartdev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build


## === Targeted rebuilds ===

# No cache rebuild. Used on user service development.
nocache:
	docker compose down
	docker compose build --no-cache user
	docker compose up

# Clean everything including volumes
clean:
	docker compose down -v
	rm -rf nginx/ssl/*.crt nginx/ssl/*.key

# Prune Docker cache/containers/networks (keeps volumes, e.g., database)
prune:
	docker stop $$(docker ps -aq) || true
	docker system prune -af
	docker image prune -af
	docker network prune -f
	docker builder prune -af

# Full reset: clean, prune, regenerate SSL certs, rebuild everything
reset:
	docker stop $$(docker ps -aq) || true
	docker compose down -v --rmi all --remove-orphans
	@echo "Pruning unused images, volumes and networks..."
	docker image prune -af || true
	docker volume prune -f || true
	docker network prune -f || true
	@echo "Removing SSL certs to force regeneration..."
	rm -rf nginx/ssl/*.crt nginx/ssl/*.key || true
	$(MAKE) setup
	docker compose build --no-cache --pull
	docker compose up --build -d

# Rebuild from scratch
rebuild: clean setup
	docker compose up --build -d

# Rebuild dev from scratch
rebuilddev: clean setup
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

## === Misc ===
open:
	open https://localhost:8443


## === Testing ===
# Create test user
usertest:
	@curl -X POST https://localhost:8443/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"user@example.com","username":"user","password":"Password123!"}' \
		-k
	@echo ""

# Check for existing users in table
usertable:
	docker exec postgres_db psql -U myuser -d user_db -c "SELECT id, username, email, created_at FROM users ORDER BY id;"

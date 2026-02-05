.PHONY: setup up dev down logs logsdev restart restartdev nocache rebuild rebuilddev clean prune open usertest usertable env env-check env-sync-overwrite


## === Bootstrap ===

# Generate SSL certificates if they don't exist
setup:
	@bash ./scripts/generate-secrets.sh
	./scripts/generate-ssl-certs.sh
	@bash ./scripts/generate-secrets.sh


## === Lifecycle: start/stop/restart ===

# Start services (base stack)

up: setup env
	docker compose up -d

# Start services with dev overrides
dev: setup env
	docker compose -f docker-compose.yml -f docker-compose.dev.yml build
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

# Restart
restart:
	docker compose up -d

# Restart dev
restartdev: setup
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d


## === Targeted rebuilds ===

# Clean everything including volumes
clean:
	docker compose down --remove-orphans
	rm -rf nginx/ssl/*.crt nginx/ssl/*.key

# Prune Docker cache/containers/networks (keeps certs and volumes, e.g., database)
prune:
	docker stop $$(docker ps -aq) || true
	docker system prune -af
	docker image prune -af
	docker network prune -f
	docker builder prune -af

# Full destructive reset: removes ALL containers, images, networks, and VOLUMES (data loss), regenerates SSL certs, rebuilds everything
reset:
	@echo "Stopping all containers..."
	docker stop $$(docker ps -aq) || true
	@echo "Removing all containers..."
	docker rm -f $$(docker ps -aq) || true
	@echo "Removing all volumes (data loss)..."
	docker volume prune -f || true
	docker volume rm -f $$(docker volume ls -q) || true
	@echo "Removing all images..."
	docker rmi -f $$(docker images -aq) || true
	@echo "Removing all networks..."
	docker network prune -f || true
	@echo "Removing all builders..."
	docker builder prune -af || true
	@echo "Removing SSL certs to force regeneration..."
	rm -rf nginx/ssl/*.crt nginx/ssl/*.key || true
#	$(MAKE) setup
# 	docker compose build --no-cache --pull
# 	docker compose up --build -d

# Rebuild from scratch
rebuild: clean setup
	docker compose up --build -d

# Rebuild dev from scratch
rebuilddev: clean setup
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

## === Env management ===
env:
	@for file in $$(find . -name ".env.example"); do cp "$$file" "$${file%.example}"; done
	@echo "Environment variables synced from .env.example files"

# Check that .env files match their .env.example counterparts
env-check:
	@bash scripts/check-env-examples.sh

## === Misc ===
open:
	open https://localhost:8443


## === Testing ===
# Create test user
users:
	@curl -X POST https://localhost:8443/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"a@a.aa","username":"u1","password":"Password123!"}' \
		-k
	@echo ""

	@curl -X POST https://localhost:8443/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"b@b.bb","username":"u2","password":"Password123!"}' \
		-k
	@echo ""

	@curl -X POST https://localhost:8443/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"c@c.cc","username":"u3","password":"Password123!"}' \
		-k
	@echo ""

	@curl -X POST https://localhost:8443/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"d@d.dd","username":"u4","password":"Password123!"}' \
		-k
	@echo ""

	@curl -X POST https://localhost:8443/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"e@e.ee","username":"u5","password":"Password123!"}' \
		-k
	@echo ""

	@curl -X POST https://localhost:8443/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"f@f.ff","username":"u6","password":"Password123!"}' \
		-k
	@echo ""


# Check for existing users in table
usertable:
	docker exec postgres_db psql -U myuser -d user_db -c "SELECT id, username, email, created_at FROM users ORDER BY id;"

friendstable:
	docker exec postgres_db psql -U myuser -d user_db -c "SELECT * FROM friends ORDER BY id;"


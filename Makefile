.PHONY: setup up dev down logs logsdev restart restartdev clean prune reset rebuild rebuilddev env env-check open users usertable friendstable


## === Bootstrap ===

setup:
	@bash ./scripts/generate-secrets.sh
	@bash ./scripts/generate-ssl-certs.sh


## === Lifecycle ===

up: setup env
	@echo "=== Starting services ==="
	@docker compose up -d

dev: setup env
	@echo "=== Starting services (dev) ==="
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml build
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

down:
	@echo "=== Stopping services ==="
	@docker compose down

restart:
	@echo "=== Restarting services ==="
	@docker compose up -d

restartdev:
	@echo "=== Restarting services (dev) ==="
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

logs:
	@docker compose logs -f

logsdev:
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f


## === Rebuild ===

clean:
	@echo "=== Cleaning ==="
	@docker compose down --remove-orphans
	@find . -type d -name "ssl" -exec sh -c 'rm -f "$$1"/*.crt "$$1"/*.key' _ {} \;

rebuild: clean setup
	@echo "=== Rebuilding ==="
	@docker compose up --build -d

rebuilddev: clean setup
	@echo "=== Rebuilding (dev) ==="
	@docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

prune:
	@echo "=== Pruning Docker ==="
	@docker stop $$(docker ps -aq) 2>/dev/null || true
	@docker system prune -af
	@docker image prune -af
	@docker network prune -f
	@docker builder prune -af

reset: clean
	@echo "=== Resetting (full) ==="
	@docker stop $$(docker ps -aq) 2>/dev/null || true
	@docker rm -f $$(docker ps -aq) 2>/dev/null || true
	@docker volume prune -f
	@docker volume rm -f $$(docker volume ls -q) 2>/dev/null || true
	@docker rmi -f $$(docker images -aq) 2>/dev/null || true
	@docker network prune -f
	@docker builder prune -af


## === Env ===

env:
	@echo "=== Syncing environment files ==="
	@for file in $$(find . -name ".env.example"); do cp "$$file" "$${file%.example}"; done

env-check:
	@bash scripts/check-env-examples.sh


## === Utilities ===

open:
	@open https://localhost:8443

users:
	@echo "=== Creating test users ==="
	@curl -s -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"a@a.aa","username":"u1","password":"Password123!"}' -k && echo ""
	@curl -s -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"b@b.bb","username":"u2","password":"Password123!"}' -k && echo ""
	@curl -s -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"c@c.cc","username":"u3","password":"Password123!"}' -k && echo ""
	@curl -s -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"d@d.dd","username":"u4","password":"Password123!"}' -k && echo ""
	@curl -s -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"e@e.ee","username":"u5","password":"Password123!"}' -k && echo ""
	@curl -s -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"f@f.ff","username":"u6","password":"Password123!"}' -k && echo ""

usertable:
	@docker exec user_db psql -U myuser -d user_db -c "SELECT id, username, email, created_at FROM users ORDER BY id;"

friendstable:
	@docker exec user_db psql -U myuser -d user_db -c "SELECT * FROM friends ORDER BY id;"

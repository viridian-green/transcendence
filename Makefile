.PHONY: setup up dev down logs logsdev restart restartdev clean prune reset rebuild rebuilddev env env-check open users usertable friendstable


## === Bootstrap ===

setup:
	@bash ./scripts/generate-secrets.sh
	./scripts/generate-ssl-certs.sh


## === Lifecycle ===

up: setup env
	docker compose up -d

dev: setup env
	docker compose -f docker-compose.yml -f docker-compose.dev.yml build
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

down:
	docker compose down

restart:
	docker compose up -d

restartdev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

logs:
	docker compose logs -f

logsdev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f


## === Rebuild ===

clean:
	docker compose down --remove-orphans
	find . -type d -name "ssl" -exec sh -c 'rm -f "$$1"/*.crt "$$1"/*.key' _ {} \;

rebuild: clean setup
	docker compose up --build -d

rebuilddev: clean setup
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d

prune:
	docker stop $$(docker ps -aq) || true
	docker system prune -af
	docker image prune -af
	docker network prune -f
	docker builder prune -af

reset: clean
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

# Rebuild from scratch
rebuild: clean setup
	docker compose up --build -d

## === Env ===

env:
	@for file in $$(find . -name ".env.example"); do cp "$$file" "$${file%.example}"; done
	@echo "Environment variables synced from .env.example files"

env-check:
	@bash scripts/check-env-examples.sh


## === Utilities ===

open:
	open https://localhost:8443

users:
	@curl -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"a@a.aa","username":"u1","password":"Password123!"}' -k && echo ""
	@curl -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"b@b.bb","username":"u2","password":"Password123!"}' -k && echo ""
	@curl -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"c@c.cc","username":"u3","password":"Password123!"}' -k && echo ""
	@curl -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"d@d.dd","username":"u4","password":"Password123!"}' -k && echo ""
	@curl -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"e@e.ee","username":"u5","password":"Password123!"}' -k && echo ""
	@curl -X POST https://localhost:8443/api/auth/register -H "Content-Type: application/json" -d '{"email":"f@f.ff","username":"u6","password":"Password123!"}' -k && echo ""

usertable:
	docker exec user_db psql -U myuser -d user_db -c "SELECT id, username, email, created_at FROM users ORDER BY id;"

friendstable:
	docker exec user_db psql -U myuser -d user_db -c "SELECT * FROM friends ORDER BY id;"

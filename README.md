## Transcendence Dev Environment

This repo is dockerized for a consistent local setup with Nginx as a reverse proxy, a Fastify gateway, the game service, and the frontend. SSL certs are self‑signed and generated automatically by the Makefile.

### Prerequisites

- Docker and Docker Compose plugin installed
- Linux/macOS recommended (Windows WSL2 also works)

---

## Start on 42 machines (goinfre)

1. Run the goinfre symlink helper once to fix Docker paths:

```bash
chmod +x ./script_goinfre_symlink.sh
./script_goinfre_symlink.sh
```

2. Bring the stack up (first run generates SSL certs automatically):

```bash
make up
```

If Docker didn’t start, you can manage it manually:

```bash
systemctl --user start docker.service
systemctl --user status docker
```

---

## Start on other machines

Just use the Makefile targets:

```bash
make up        # Start services in the background (generates certs)
make logs      # Start with attached logs
make down      # Stop services
make clean     # Stop and remove volumes + SSL certs
make rebuild   # Clean rebuild (build images from scratch)
```

---

## Services and Ports

- Nginx: http://localhost:8080 and https://localhost:8443
- Gateway (Fastify): http://localhost:3000
- Frontend (Vite dev): http://localhost:5173
- Game service: http://localhost:3002
- User Service: http://localhost:3003

Notes:

- SSL uses self‑signed certs generated into `nginx/ssl` by `make setup` (run implicitly by `make up`). Your browser may warn on first visit to https://localhost:8443.

---

## Common Tasks

- View logs for all services:

```bash
docker compose logs -f
```

- Check running services:

```bash
docker compose ps
```

- Full reset (volumes and certs):

```bash
make clean && make up
```

---

## Compose Modes

- `docker-compose.yml`: production stack (used in CI). Builds static frontend and runs Nginx/api/user/game.
- `docker-compose.dev.yml`: local dev overrides with volume mounts and hot reload (Vite, nodemon). Use with `make dev`.

## CI/CD Notes

- GitHub Actions uses `docker-compose.yml` to mirror prod; it rebuilds with `--no-cache` to avoid stale layers.
- Frontend `build` is non-blocking for TypeScript errors (errors log, build continues). Run `npm run build:strict` if you need strict TS enforcement for prod.

## Makefile Helpers

- `usertest`: create a sample user via gateway.
- `usertable`: inspect `user_db` users table.

## Gateway routes folder

The gateway modules now live in `gateway/routes` (previously `gateway/services`). Ensure imports/registrations use `./routes/...`. Example in `gateway/server.js`:

```js
const { registerGameModule } = require("./routes/game");
```

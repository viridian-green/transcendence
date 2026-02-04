*This project has been created as part of the 42 curriculum by <login1>[, <login2>[, <login3>[...]]].*

# Transcendence

## Description

**Transcendence** is a full-stack web application that brings the classic Pong game to the modern web. The project demonstrates a complete microservices architecture with real-time multiplayer gaming capabilities, social features, and a polished user interface.

### Project Goal

The goal of this project is to build a production-ready web application featuring:
- A playable Pong game with multiple game modes (local, AI, and online multiplayer)
- Real-time communication through WebSockets
- User authentication and profile management
- Social features including friend management
- A modern, responsive user interface

### Key Features

- **Pong Game**: Classic Pong gameplay with three modes:
  - Local multiplayer (two players on the same device)
  - AI opponent mode
  - Online multiplayer (real-time matches between users)
- **User Authentication**: Secure registration, login, and session management with JWT tokens
- **User Profiles**: Customizable profiles with avatar upload, statistics tracking, and settings management
- **Real-time Chat**: WebSocket-based chat system with online user presence
- **Friends System**: Add, remove, and manage friends
- **Presence Tracking**: Real-time user status (online/offline/in-game)
- **Responsive Design**: Modern UI built with React and TailwindCSS

### Architecture Overview

The application follows a microservices architecture:

- **Frontend**: React + TypeScript application served via Nginx
- **API Gateway**: Fastify-based gateway handling routing and authentication
- **User Service**: Manages user accounts, authentication, and profiles
- **Game Service**: Handles game logic, matchmaking, and game state
- **Chat Service**: Real-time messaging and chat functionality
- **Presence Service**: Tracks user online status and presence
- **Database**: PostgreSQL for persistent data storage
- **Cache**: Redis for real-time data and session management

## Instructions

### Prerequisites

Before running the project, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher, or Docker Compose plugin)
- **Make** (for using the Makefile commands)
- **OpenSSL** (for SSL certificate generation)
- **Git** (for cloning the repository)

**Recommended Operating Systems:**
- Linux (Ubuntu/Debian recommended)
- macOS
- Windows with WSL2

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd transcendence
   ```

2. **Set up environment variables and secrets:**

   Run the setup script to generate secrets and copy environment templates:
   ```bash
   make setup
   ```

   This will automatically:
   - Generate `secrets/jwt_secret`
   - Generate `secrets/postgres_password`
   - Generate `secrets/cookie_secret`
   - Generate SSL certificates

   You can also manually create a `.env` file in the root directory:
   ```bash
   # Database Configuration
   POSTGRES_USER=myuser
   POSTGRES_DB=transcendence_db
   ```

   **Note**: Secrets (JWT, Postgres password, Cookie secret) are stored in the `secrets/` directory and mounted as Docker secrets. Never commit the `secrets/` directory to version control.

   For detailed environment setup instructions, see [ENV_SETUP.md](./ENV_SETUP.md).

### Running the Project

#### For 42 School Machines (goinfre)

If you're running on a 42 school machine, first set up the goinfre symlink:

1. **Run the goinfre symlink helper:**
   ```bash
   chmod +x ./script_goinfre_symlink.sh
   ./script_goinfre_symlink.sh
   ```

2. **Start Docker service (if not running):**
   ```bash
   systemctl --user start docker.service
   systemctl --user status docker
   ```

3. **Start the application:**
   ```bash
   make up
   ```

#### For Other Machines

Simply use the Makefile commands:

**Start the application:**
```bash
make up
```

This command will:
- Automatically generate SSL certificates (if they don't exist)
- Build all Docker images
- Start all services in detached mode

**Other useful commands:**
```bash
make dev        # Start with development overrides (hot reload)
make logs       # View logs from all services
make logsdev    # View logs in development mode
make down       # Stop all services
make clean      # Stop services and remove volumes + SSL certs
make rebuild    # Clean rebuild from scratch
```

### Accessing the Application

Once the services are running, you can access:

- **Web Application**:
  - HTTPS: `https://localhost:8443` (self-signed certificate - browser will show a warning)
  - HTTP: `http://localhost:8080`
- **API Gateway**: `http://localhost:3000`
- **Game Service**: `http://localhost:3002`
- **User Service**: `http://localhost:3003`
- **Chat Service**: `http://localhost:3004`
- **Presence Service**: `http://localhost:3005`

### First Steps

1. **Register a new account:**
   - Navigate to the registration page
   - Create an account with a valid email, username, and password

2. **Login:**
   - Use your credentials to log in
   - You'll be redirected to the home page

3. **Start playing:**
   - Choose a game mode (Local, AI, or Online)
   - Invite friends to play online matches
   - Chat with other users in real-time

### Development Mode

For development with hot reload and volume mounts:

```bash
make dev
```

This uses `docker-compose.dev.yml` which includes:
- Volume mounts for live code reloading
- Vite dev server for frontend
- Nodemon for backend services

### Troubleshooting

**Services won't start:**
- Check Docker is running: `docker ps`
- View logs: `docker compose logs`
- Ensure ports are not in use: `lsof -i :8080 -i :8443`

**Database connection issues:**
- Verify `.env` file exists and has correct database credentials
- Check database container: `docker compose ps database`
- View database logs: `docker compose logs database`

**SSL certificate warnings:**
- This is expected with self-signed certificates
- Click "Advanced" → "Proceed to localhost" in your browser

**Full reset (removes all data):**
```bash
make clean && make up
```

## Resources

### Documentation and References

- **Fastify Documentation**: [https://www.fastify.io/](https://www.fastify.io/)
  - Used for building the API gateway and microservices
- **React Documentation**: [https://react.dev/](https://react.dev/)
  - Frontend framework documentation
- **PostgreSQL Documentation**: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)
  - Database system used for persistent storage
- **Redis Documentation**: [https://redis.io/docs/](https://redis.io/docs/)
  - In-memory data store for real-time features
- **WebSocket API**: [https://developer.mozilla.org/en-US/docs/Web/API/WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
  - Real-time communication protocol
- **Docker Documentation**: [https://docs.docker.com/](https://docs.docker.com/)
  - Containerization platform
- **Nginx Documentation**: [https://nginx.org/en/docs/](https://nginx.org/en/docs/)
  - Reverse proxy and web server
- **JWT (JSON Web Tokens)**: [https://jwt.io/introduction](https://jwt.io/introduction)
  - Authentication token standard
- **Bcrypt**: [https://www.npmjs.com/package/bcrypt](https://www.npmjs.com/package/bcrypt)
  - Password hashing library

### Tutorials and Learning Resources

- **Microservices Architecture Patterns**: Understanding service decomposition and communication
- **WebSocket Programming**: Real-time bidirectional communication
- **JWT Authentication**: Secure token-based authentication
- **Docker Compose**: Multi-container application orchestration
- **React Hooks**: Modern React state management and side effects

### AI Usage

AI tools were used in the following areas of this project:

- **Code Generation**: Initial scaffolding and boilerplate code for services, routes, and components
- **Documentation**: Assistance in writing and structuring documentation, including API documentation and code comments
- **Debugging**: Help identifying and resolving bugs, especially in WebSocket connections and authentication flows
- **Code Review**: Suggestions for code improvements, best practices, and refactoring opportunities
- **Architecture Design**: Consultation on microservices architecture patterns and service communication strategies
- **Configuration**: Assistance with Docker, Nginx, and environment variable configuration
- **Testing**: Help writing test cases and understanding testing strategies

**Note**: While AI tools were used as a learning and development aid, all code was reviewed, understood, and customized to fit the project's specific requirements. The final implementation reflects the developers' understanding and decisions.

---

## Additional Information

### Project Structure

```
transcendence/
├── api-gateway/          # API Gateway service
├── frontend/             # React frontend application
├── services/
│   ├── user-service/     # User management and authentication
│   ├── game-service/     # Game logic and matchmaking
│   ├── chat-service/     # Real-time chat functionality
│   └── presence-service/ # User presence tracking
├── nginx/                # Nginx configuration
├── init-scripts/         # Database initialization scripts
├── docker-compose.yml    # Production Docker Compose configuration
├── docker-compose.dev.yml # Development Docker Compose overrides
└── Makefile              # Build and deployment commands
```

### Check authentication status

```bash
curl https://localhost:8443/api/users/me -k -b cookies.txt
```

"Tests remote user"
url = remote?user=alice
url = remote?user=user2

### READS:
[Bcrypt](https://www.npmjs.com/package/bcrypt)

*This project has been created as part of the 42 curriculum by [nleite-s](https://github.com/schardot), [pebencze](https://github.com/pebencze), [vados-sa](https://github.com/vados-sa), [ademarti](https://github.com/viridian-green), [darotche](https://github.com/ProjectDaiana).*

# Retroscendence

> A modern take on the classic Pong game with real-time multiplayer, chat, and social features.

## Description

**Retroscendence** is a full-stack web application that brings the classic Pong game to the modern web with a retro-styled aesthetic. Built using a microservices architecture, the project demonstrates production-ready patterns including real-time communication, secure authentication, and containerized deployment.

### Project Goal

The goal of this project is to build a complete web application with the follwing **key features**:
| Feature | Description |
|---------|-------------|
| **Pong Game** | Classic Pong gameplay with three modes: local multiplayer, AI opponent, and online multiplayer |
| **User Authentication** | Secure registration, login, and session management with JWT tokens and HTTP-only cookies |
| **User Profiles** | Customizable profiles with avatar upload, game statistics, and match history |
| **Real-time Chat** | WebSocket-based chat system for instant messaging between users |
| **Friends System** | Add, remove, and manage friends with real-time friend requests |
| **Presence Tracking** | Real-time user status (online/offline/in-game) |
| **Notifications** | Real-time notifications for friend requests, game invites, and more |
| **Retro Design** | Modern UI with a nostalgic retro gaming aesthetic built with React and TailwindCSS |

---
## Architecture Overview

The application follows a microservices architecture with the following components:

```
┌─────────────────────────────────────────────────────────────────────┐
│                            NGINX                                    │
│                    (Reverse Proxy + SSL)                           │
│                      Port 8443 (HTTPS)                              │
└─────────────────────────────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌───────────────┐    ┌───────────────────┐    ┌──────────────────┐
│   Frontend    │    │    API Gateway    │    │  WebSocket       │
│   (React +    │    │    (Fastify)      │    │  Services        │
│   TypeScript) │    │    Port 3000      │    │                  │
└───────────────┘    └───────────────────┘    └──────────────────┘
                              │                        │
         ┌────────────────────┼────────────────────────┤
         │                    │                        │
         ▼                    ▼                        ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────┐
│   User      │    │   Game      │    │  Chat / Presence /          │
│   Service   │    │   Service   │    │  Notification Services      │
│   :3003     │    │   :3002     │    │  :3004 / :3005 / :3006      │
└─────────────┘    └─────────────┘    └─────────────────────────────┘
       │                                         │
       ▼                                         ▼
┌─────────────┐                          ┌─────────────┐
│ PostgreSQL  │                          │    Redis    │
│  (user_db)  │                          │   (cache)   │
└─────────────┘                          └─────────────┘
```

| Service | Technology | Description |
|---------|------------|-------------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS | Single-page application with retro UI |
| **API Gateway** | Fastify | Routes requests, handles authentication |
| **User Service** | Node.js, PostgreSQL | User accounts, auth, profiles |
| **Game Service** | Node.js, WebSocket | Game logic, matchmaking, real-time gameplay |
| **Chat Service** | TypeScript, WebSocket | Real-time messaging |
| **Presence Service** | Node.js, Redis | User online status tracking |
| **Notification Service** | TypeScript, WebSocket | Real-time notifications |

---

## Project Structure

```
transcendence/
├── api-gateway/              # API Gateway service (Fastify)
│   └── src/
│       ├── routes/           # Route handlers for each service
│       ├── plugins/          # Authentication plugins
│       └── services/         # Service utilities
├── frontend/                 # React frontend application
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Page components (routes)
│       ├── hooks/            # Custom React hooks
│       ├── icons/            # SVG icon components
│       └── utils/            # Utility functions
├── services/
│   ├── user-service/         # User management and authentication
│   ├── game-service/         # Game logic and matchmaking
│   ├── chat-service/         # Real-time chat functionality
│   ├── presence-service/     # User presence tracking
│   └── notification-service/ # Real-time notifications
├── nginx/                    # Nginx reverse proxy configuration
├── scripts/                  # Setup and utility scripts
├── secrets/                  # Generated secrets (not in git)
├── docker-compose.yml        # Production Docker configuration
├── docker-compose.dev.yml    # Development Docker overrides
└── Makefile                  # Build and deployment commands
```

---

## Instructions

### Prerequisites

Before running the project, ensure you have the following installed:

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Docker** | 20.10+ | Container runtime |
| **Docker Compose** | 2.0+ | Container orchestration |
| **Make** | Any | Build automation |
| **OpenSSL** | Any | SSL certificate generation |
| **Git** | Any | Version control |

**Supported Operating Systems:**
- Linux (Ubuntu/Debian recommended)
- macOS
- Windows with WSL2

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd transcendence
```

#### 2. Environment Setup

Run the setup command to generate all required secrets and SSL certificates:

```bash
make setup
```

This command automatically:
- Generates `secrets/jwt_secret` (JWT signing key)
- Generates `secrets/postgres_password` (database password)
- Generates `secrets/cookie_secret` (session cookie secret)
- Creates SSL certificates for HTTPS

**Optional**: Create a `.env` file in the root directory for custom database configuration:

```bash
# Database Configuration
POSTGRES_USER=myuser
POSTGRES_DB=transcendence_db
```

> ⚠️ **Security Note**: The `secrets/` directory contains sensitive data. Never commit it to version control.

#### 3. Start the Application

**Production mode:**
```bash
make up
```

**Development mode (with hot reload):**
```bash
make dev
```

#### For 42 School Machines

If running on a 42 school machine with goinfre storage:

```bash
# 1. Setup goinfre symlink for Docker
chmod +x ./script_goinfre_symlink.sh
./script_goinfre_symlink.sh

# 2. Start Docker service
systemctl --user start docker.service
systemctl --user status docker

# 3. Start the application
make up
```

### Accessing the Application

Once services are running:

| Service | URL | Notes |
|---------|-----|-------|
| **Web Application** | `https://localhost:8443` | Main entry point (self-signed cert warning expected) |
| **API Gateway** | `https://localhost:3000` | REST API endpoint |
| **Game Service** | `https://localhost:3002` | WebSocket for game |
| **User Service** | `https://localhost:3003` | User management API |
| **Chat Service** | `https://localhost:3004` | WebSocket for chat |
| **Presence Service** | `https://localhost:3005` | WebSocket for presence |
| **Notification Service** | `https://localhost:3006` | WebSocket for notifications |

### Available Commands

| Command | Description |
|---------|-------------|
| `make up` | Start all services in production mode |
| `make dev` | Start with development overrides (hot reload) |
| `make logs` | View logs from all services |
| `make logsdev` | View logs in development mode |
| `make down` | Stop all services |
| `make clean` | Stop services and remove SSL certificates |
| `make prune` | Clean Docker cache/containers/networks |
| `make reset` | Full destructive reset (removes all data) |
| `make rebuild` | Clean rebuild from scratch |
| `make rebuilddev` | Clean rebuild in development mode |
| `make open` | Open application in browser |

### First Steps After Installation

1. **Register an account** — Navigate to the registration page and create an account
2. **Login** — Use your credentials to access the application
3. **Customize your profile** — Upload an avatar and update your settings
4. **Start playing** — Choose a game mode: Local, AI, or Online
5. **Connect with others** — Add friends and chat in real-time

### Troubleshooting

<details>
<summary><strong>Services won't start</strong></summary>

```bash
# Check Docker is running
docker ps

# View logs for errors
docker compose logs

# Ensure ports are not in use
lsof -i :8080 -i :8443 -i :3000
```
</details>

<details>
<summary><strong>Database connection issues</strong></summary>

```bash
# Verify .env file exists
cat .env

# Check database container status
docker compose ps user-db

# View database logs
docker compose logs user-db
```
</details>

<details>
<summary><strong>SSL certificate warnings</strong></summary>

This is expected behavior with self-signed certificates. In your browser:
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"
</details>

<details>
<summary><strong>Full reset (removes all data)</strong></summary>

```bash
make reset
make up
```
</details>

---

## Resources

### Documentation and References

**Backend & APIs:**
- [Fastify Documentation](https://www.fastify.io/) — High-performance Node.js web framework
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) — Relational database
- [Redis Documentation](https://redis.io/docs/) — In-memory data store

**Frontend:**
- [React Documentation](https://react.dev/) — UI library
- [TailwindCSS Documentation](https://tailwindcss.com/docs) — Utility-first CSS framework
- [Vite Documentation](https://vitejs.dev/) — Next-generation frontend tooling

**Real-time & Networking:**
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) — Real-time communication
- [Socket.io Documentation](https://socket.io/docs/) — WebSocket library

**Security:**
- [JWT Introduction](https://jwt.io/introduction) — JSON Web Tokens
- [Bcrypt (npm)](https://www.npmjs.com/package/bcrypt) — Password hashing

**DevOps:**
- [Docker Documentation](https://docs.docker.com/) — Containerization
- [Nginx Documentation](https://nginx.org/en/docs/) — Reverse proxy and web server
- [Docker Compose](https://docs.docker.com/compose/) — Multi-container orchestration

### AI Usage

AI tools (including GitHub Copilot and Claude) were used as development aids in the following areas:

| Area | Description |
|------|-------------|
| **Code Generation** | Initial scaffolding, boilerplate code, and service templates |
| **Documentation** | README structure, API documentation, and code comments |
| **Debugging** | Identifying bugs in WebSocket connections and authentication flows |
| **Code Review** | Suggestions for best practices, refactoring, and optimization |
| **Architecture Design** | Consultation on microservices patterns and service communication |
| **Configuration** | Docker, Nginx, and environment variable setup |
| **Testing** | Test case generation and testing strategies |

> **Note**: All AI-generated code was reviewed, understood, and customized to meet project requirements. The final implementation reflects the developers' decisions and understanding of the codebase.

---

## Team Information

| Member | Login | Role(s) | Responsibilities |
|--------|-------|---------|------------------|
| **Daiana** | darotche | Product Owner, Developer | Defines product vision, prioritizes features, manages backlog, and participates in development |
| **Vanessa** | vados-sa | Project Manager, Developer | Coordinates team activities, tracks progress, manages timelines, and contributes to codebase |
| **Adèle** | ademarti | Tech Lead, Developer | Guides technical architecture, ensures code quality, resolves blockers, and leads core implementation |
| **Natália** | nleite-s | Developer | Backend development, feature implementation, and code maintenance |
| **Petra** | pebencze | Developer | Frontend development, feature implementation, and code maintenance |

---

## Project Management

### Work Organization

The team followed an **Agile-inspired workflow** with the following practices:

- **Biweekly Meetings** — Regular sync meetings twice a week to review progress, discuss blockers, and plan upcoming work
- **Kanban Board** — Visual task management using GitHub Projects to track work status (Backlog → To Do → In Progress → Done)
- **Git Workflow** — Feature branch workflow with pull requests linked to issues for traceability and code review

### Tools
- **GitHub Projects** — Kanban board for task tracking and sprint planning
- **GitHub Issues** — Bug tracking, feature requests, and task breakdown
- **GitHub Pull Requests** — Code review, discussion, and merge management
- **Git** — Version control with feature branch workflow

### Communication Channels
- **Discord** — Primary team communication, async discussions, and file sharing
- **In-person Meetings** — Biweekly syncs, pair programming, and collaborative problem-solving
- **WhatsApp** — Quick questions, impromptu conversations, and urgent communications

---

## Technical Stack

### Frontend

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **React** | 19 | UI Library | Component-based architecture enables reusable UI elements; large ecosystem and community support |
| **TypeScript** | 5.9 | Type Safety | Catches errors at compile-time, improves code maintainability and IDE support |
| **Vite** | 7 | Build Tool | Lightning-fast HMR (Hot Module Replacement) and optimized production builds compared to Webpack |
| **TailwindCSS** | 4 | Styling | Utility-first approach speeds up development; no context-switching between files |
| **React Router** | 7 | Routing | Declarative routing with protected routes support; industry standard for React SPAs |
| **Zod** | 4 | Validation | Runtime type validation with TypeScript inference; lightweight and composable schemas |

### Backend

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **Node.js** | 20 LTS | Runtime | Non-blocking I/O ideal for real-time applications; JavaScript across the full stack |
| **Fastify** | 4 | Web Framework | High performance (up to 2x faster than Express); built-in validation and TypeScript support |
| **WebSocket (ws)** | 8 | Real-time | Native WebSocket implementation for low-latency bidirectional communication |
| **JWT** | - | Authentication | Stateless authentication tokens; scalable across microservices without shared sessions |
| **Bcrypt** | - | Security | Industry-standard password hashing with configurable salt rounds |

### Database

| Technology | Version | Purpose | Justification |
|------------|---------|---------|---------------|
| **PostgreSQL** | 16 | Primary Database | Chosen over SQLite for robustness, better concurrency handling, ACID compliance, and production-ready features for multi-user applications |
| **Redis** | 7 | Cache & Real-time | In-memory data store for user presence tracking; sub-millisecond latency for real-time status updates |

### DevOps & Infrastructure

| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Docker** | Containerization | Consistent environments across development and production; isolated services |
| **Docker Compose** | Orchestration | Simplified multi-container management; single command to spin up entire stack |
| **Nginx** | Reverse Proxy | High-performance request routing, SSL termination, and static file serving |
| **SSL/TLS** | Security | HTTPS encryption for all communications; self-signed certificates for development |

### Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Microservices Architecture** | Separation of concerns allows independent scaling and deployment; easier to maintain and test individual services |
| **WebSockets over Polling** | Real-time bidirectional communication essential for live game state, chat, and presence; significantly lower latency and server load |
| **PostgreSQL over SQLite** | SQLite lacks concurrent write support needed for multi-user scenarios; PostgreSQL offers better performance, indexing, and production reliability |
| **Redis for Presence** | In-memory storage provides instant read/write for ephemeral data like online status; automatic key expiration for session cleanup |
| **JWT with HTTP-only Cookies** | Combines stateless auth benefits with XSS protection; tokens cannot be accessed by client-side JavaScript |
| **Fastify over Express** | Superior performance benchmarks; built-in schema validation reduces boilerplate; better TypeScript integration |

---

## Database Schema

The application uses PostgreSQL with the following schema structure:

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          users                               │
├─────────────────────────────────────────────────────────────┤
│ PK │ id          │ SERIAL       │ Auto-incrementing ID      │
│    │ username    │ TEXT         │ UNIQUE, NOT NULL          │
│    │ password    │ TEXT         │ NOT NULL (bcrypt hash)    │
│    │ email       │ TEXT         │ UNIQUE, NOT NULL          │
│    │ avatar      │ TEXT         │ DEFAULT 'default.png'     │
│    │ bio         │ VARCHAR(150) │ DEFAULT 'Let's play!'     │
│    │ state       │ TEXT         │ DEFAULT 'offline'         │
│    │ created_at  │ TIMESTAMP    │ DEFAULT NOW()             │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ 1:N (user can have many friendships)
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                         friends                              │
├─────────────────────────────────────────────────────────────┤
│ PK │ id           │ SERIAL    │ Auto-incrementing ID        │
│ FK │ user_one     │ INTEGER   │ References users(id)        │
│ FK │ user_two     │ INTEGER   │ References users(id)        │
│ FK │ requested_by │ INTEGER   │ References users(id)        │
│    │ status       │ TEXT      │ DEFAULT 'pending'           │
│    │ created_at   │ TIMESTAMP │ DEFAULT NOW()               │
└─────────────────────────────────────────────────────────────┘
```

### Tables Description

##### `users` Table

Stores user account information and profile data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique user identifier |
| `username` | TEXT | UNIQUE, NOT NULL | Display name for the user |
| `password` | TEXT | NOT NULL | Bcrypt-hashed password |
| `email` | TEXT | UNIQUE, NOT NULL | User's email address |
| `avatar` | TEXT | DEFAULT 'default.png' | Profile picture filename |
| `bio` | VARCHAR(150) | DEFAULT 'Let's play!' | User biography/status message |
| `state` | TEXT | DEFAULT 'offline' | Current user state (online/offline/in-game) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

##### `friends` Table

Manages friendship relationships between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique friendship identifier |
| `user_one` | INTEGER | FK → users(id), NOT NULL | First user in friendship (lower ID) |
| `user_two` | INTEGER | FK → users(id), NOT NULL | Second user in friendship (higher ID) |
| `requested_by` | INTEGER | FK → users(id) | User who initiated the friend request |
| `status` | TEXT | DEFAULT 'pending' | Friendship status: 'pending' or 'accepted' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Friendship creation timestamp |

**Constraints:**
- `no_self_friend` — Users cannot befriend themselves (`user_one <> user_two`)
- `unique_friendship` — Only one friendship record per user pair (`UNIQUE(user_one, user_two)`)
- `friends_ordered` — Ensures consistent ordering (`user_one < user_two`)
- `ON DELETE CASCADE` — Friendships are removed when users are deleted

### Redis Data Structures

Redis is used for ephemeral real-time data (not persisted):

| Key Pattern | Type | Purpose |
|-------------|------|---------|
| `presence:{userId}` | String | User's current online status |
| `user:{userId}:sockets` | Set | Active WebSocket connection IDs |

---

## Features List

| Feature | Description |
|---------|-------------|
| **User Authentication** | Secure registration, login, and logout functionality with JWT token-based sessions and HTTP-only cookies for XSS protection |
| **User Profiles** | Profile page displaying user information, avatar upload with image processing, editable bio, and account settings management |
| **Friends System** | Send/accept/decline friend requests, view friends list, unfriend users, with real-time status updates |
| **Real-time Chat** | WebSocket-based instant messaging system with chat widget, message history, and online user indicators |
| **Presence System** | Real-time tracking of user status (online/offline/in-game) using Redis pub/sub for instant updates across all clients |
| **Notifications** | Real-time push notifications for friend requests, game invitations, and system alerts via WebSocket |
| **Pong Game** | Classic Pong with three modes: local multiplayer (two players, same device), AI opponent, and online multiplayer with WebSocket sync |
| **Frontend UI/Design** | Retro-themed responsive interface with custom components, animations, and consistent design system |
| **API Gateway** | Central routing layer handling authentication, request forwarding, and service orchestration |
| **DevOps/Infrastructure** | Docker containerization, Nginx reverse proxy, SSL certificates, CI/CD pipeline, and deployment configuration |

## Modules

#### Point Calculation

| Type | Count | Points Each | Subtotal |
|------|-------|-------------|----------|
| **Major Modules** | 9 | 2 pts | 18 pts |
| **Minor Modules** | 1 | 1 pt | 1 pt |
| **Total** | 10 | — | **19 pts** |

### Major Modules

<details>
<summary><strong>1. Frontend & Backend Framework</strong> (2 pts)</summary>

**Justification:** Using established frameworks accelerates development, provides structure, and ensures maintainability. React's component model fits our UI needs, while Fastify's performance is ideal for real-time applications.

**Implementation:**
- **Frontend:** React 19 with TypeScript, Vite for bundling, React Router for navigation
- **Backend:** Fastify framework for all microservices with plugin architecture

**Team Members:** All team members (full-stack development)
</details>

<details>
<summary><strong>2. Real-time Features (WebSockets)</strong> (2 pts)</summary>

**Justification:** Real-time communication is essential for live gameplay, instant chat, and presence tracking. WebSockets provide low-latency bidirectional communication.

**Implementation:**
- Native WebSocket (`ws` library) for all real-time services
- Separate WebSocket connections for game, chat, presence, and notifications
- Heartbeat mechanism for connection health monitoring
- Graceful reconnection handling on client side
- Redis pub/sub for broadcasting across service instances

**Team Members:** Natália, Daiana, Adèle
</details>

<details>
<summary><strong>3. User Interaction (Chat, Profile, Friends)</strong> (2 pts)</summary>

**Justification:** Social features enhance user engagement and enable multiplayer coordination.

**Implementation:**
- **Chat:** Real-time messaging via WebSocket, chat widget component, message persistence
- **Profiles:** User profile pages with stats, avatar, bio, and settings
- **Friends:** Friend requests (send/accept/decline), friends list, real-time friend status

**Team Members:** Daiana, Natália, Petra
</details>

<details>
<summary><strong>4. Standard User Management & Authentication</strong> (2 pts)</summary>

**Justification:** Secure authentication is fundamental for user data protection and personalized experiences.

**Implementation:**
- JWT tokens stored in HTTP-only cookies (XSS protection)
- Bcrypt password hashing with configurable salt rounds
- Profile updates (username, email, bio)
- Avatar upload with default fallback
- Online status tracking integrated with presence service
- Profile page displaying all user information

**Team Members:** Natália
</details>

<details>
<summary><strong>5. AI Opponent</strong> (2 pts)</summary>

**Justification:** AI opponent allows single-player practice and ensures players can always find a match.

**Implementation:**
- Predictive paddle movement based on ball trajectory
- Simulated reaction delay for human-like behavior (not perfect play)
- Randomized error margin to allow player victories
- AI adapts to ball speed and angle changes
- Works with all game settings

**Team Members:** Vanessa
</details>

<details>
<summary><strong>6. Web-based Multiplayer Game</strong> (2 pts)</summary>

**Justification:** The classic Pong game provides engaging, easy-to-understand gameplay perfect for demonstrating real-time multiplayer.

**Implementation:**
- 2D Pong game rendered on HTML5 Canvas
- Keyboard controls: W/S (Player 1), ↑/↓ (Player 2)
- Clear win condition: first to reach score limit
- Smooth 60fps animation with requestAnimationFrame
- Game state management with start/pause/end screens
- Local multiplayer mode for same-device play

**Team Members:** Adèle, Vanessa, Petra
</details>

<details>
<summary><strong>7. Remote Players</strong> (2 pts)</summary>

**Justification:** Remote multiplayer is the core feature enabling competitive online play between users.

**Implementation:**
- WebSocket-based game state synchronization
- Server-authoritative game logic to prevent cheating
- Latency compensation for smooth gameplay
- Graceful disconnection handling with game pause
- Reconnection logic allowing players to rejoin mid-game
- Matchmaking system to pair players

**Team Members:** Adèle
</details>

<details>
<summary><strong>8. Backend as Microservices</strong> (2 pts)</summary>

**Justification:** Microservices enable independent scaling, easier maintenance, and clear separation of concerns.

**Implementation:**
- **6 loosely-coupled services:** User, Game, Chat, Presence, Notification, API Gateway
- REST APIs for synchronous communication
- Each service has single responsibility:
  - `user-service`: Authentication, profiles, friends
  - `game-service`: Game logic, matchmaking
  - `chat-service`: Messaging
  - `presence-service`: Online status
  - `notification-service`: Alerts
  - `api-gateway`: Routing, auth middleware
- Docker containers for service isolation
- Service discovery via Docker networking

**Team Members:** Natália, Daiana, Adèle
</details>

<details>
<summary><strong>8. Modules of Choice - Redis</strong> (2 pts)</summary>

**Justification:** 

**Implementation:**

**Team Members:** Daiana
</details>

### Minor Modules

<details>
<summary><strong>1. Custom Design System</strong> (1 pt)</summary>

**Justification:** A consistent design system ensures visual coherence and accelerates UI development with reusable components.

**Implementation:**

**Color Palette (CSS Variables):**
- `--color-background`, `--color-surface`, `--color-border`
- `--color-accent-pink`, `--color-accent-blue`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`

**Typography:**
- Custom retro fonts: `bit5x3`, `bit5x5`, `bit9x9`, `kongtext`
- Consistent font sizing scale

**Reusable Components (10+):**
| Component | Purpose |
|-----------|---------|
| `PinkButton` | Primary action button with retro styling |
| `Card` | Container component for content sections |
| `Avatar` | User profile picture with fallback |
| `Toast` | Notification popup messages |
| `GlobalAlert` | System-wide alert banner |
| `ErrorMessage` | Form validation error display |
| `ChatWidget` | Floating chat interface |
| `DropdownMenuAvatar` | Navigation dropdown menu |
| `BlackSphere` / `PinkSphere` | Decorative background elements |
| `LegalText` | Styled legal document component |
| `NotificationManager` | Real-time notification handler |
| Custom Icons | 15+ SVG icon components |

**Team Members:** Petra, Daiana
</details>

---

## Individual Contributions

<details>
<summary><strong>Natália (nleite-s)</strong> — Developer</summary>

#### Primary Contributions
| Area| Details |
|------|---------|
| **User Authentication** | Implemented JWT-based auth system, secure login/logout, HTTP-only cookies, bcrypt password hashing |
| **User Service** | Built user profiles, avatar upload, bio management, account settings |
| **API Gateway** | Designed routing layer, authentication middleware, service orchestration |
| **Presence Service** | Redis integration for real-time status tracking, WebSocket connection handling |
| **DevOps** | Docker configuration, docker-compose setup, CI/CD pipeline, SSL certificate generation |

#### Key Achievements
- Architected the microservices structure and inter-service communication
- Implemented secure secret management with Docker secrets
- Set up the complete development and production Docker environments

#### Challenges Overcome
- **Challenge:** Managing authentication state across microservices
- **Solution:** Implemented JWT verification middleware in the API Gateway that validates tokens before forwarding requests to services

</details>

<details>
<summary><strong>Daiana (darotche)</strong> — Product Owner, Developer</summary>

#### Primary Contributions
| Area | Details |
|------|---------|
| **Real-time Chat** | Built complete chat service, WebSocket handlers, chat widget UI, message broadcasting |
| **User Profiles** | Profile page components, profile data display |
| **Friends System** | Friend request handling, friends list integration |
| **Frontend UI** | Component development, page layouts, styling |
| **DevOps** | Docker configuration, Makefile commands, deployment setup |

#### Key Achievements
- Designed and implemented the entire real-time chat system from scratch
- Created the chat widget with intuitive UX for message composition and display
- Integrated chat with presence system to show online status

#### Challenges Overcome
- **Challenge:** Handling WebSocket disconnections and message delivery guarantees
- **Solution:** Implemented connection heartbeat monitoring and message queuing for offline users

</details>

<details>
<summary><strong>Petra (pebencze)</strong> — Developer</summary>

#### Primary Contributions
| Area | Details |
|------|---------|
| **Friends System** | Friend requests, accept/decline logic, friends list, unfriend functionality |
| **Frontend UI/Design** | Custom design system, reusable components, retro theme implementation |
| **User Profiles** | Profile page UI, settings interface |
| **Pong Game** | Game UI components, canvas styling |

#### Key Achievements
- Designed and built the custom retro design system with consistent styling
- Created 10+ reusable React components for the component library
- Implemented the complete friends management workflow

#### Challenges Overcome
- **Challenge:** Ensuring consistent styling across different components and pages
- **Solution:** Created CSS variables for colors and typography, built a component library with standardized props

</details>

<details>
<summary><strong>Adèle (ademarti)</strong> — Developer</summary>

#### Primary Contributions
| Area | Details |
|------|---------|
| **Pong Game (Local)** | Game logic, canvas rendering, keyboard controls, collision detection |
| **Pong Game (Online)** | WebSocket game state sync, multiplayer logic, matchmaking |
| **Notifications** | Contributor | Notification service, friend request alerts, game invite notifications |
| **API Gateway** | Contributor | Route handlers, service integration |

#### Key Achievements
- Implemented the complete Pong game engine with smooth 60fps rendering
- Built real-time multiplayer with server-authoritative game state
- Created the matchmaking system for pairing online players

#### Challenges Overcome
- **Challenge:** Synchronizing game state between two remote players with varying network latency
- **Solution:** Implemented server-authoritative logic where the server owns the game state and broadcasts updates; added client-side interpolation for smooth visuals

</details>

<details>
<summary><strong>Vanessa (vados-sa)</strong> — Project Manager, Developer</summary>

#### Primary Contributions
| Area | Details |
|------|---------|
| **AI Opponent** | AI paddle movement logic, difficulty balancing, human-like behavior simulation |
| **Pong Game** | Game features, testing, refinements |
| **Frontend** | UI components, page implementations, responsiveness |

#### Key Achievements
- Designed and implemented the AI opponent with believable human-like behavior
- Balanced AI difficulty to be challenging but beatable

#### Challenges Overcome
- **Challenge:** Making the AI feel human rather than a perfect robot player
- **Solution:** Added intentional reaction delays, prediction errors, and randomized decision-making to simulate human limitations while keeping gameplay competitive

</details>

---

## License

This project was created as part of the 42 school curriculum and is intended for educational purposes.

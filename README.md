# Quiz Buzz

A full-stack quiz application built with React, Node.js, and PostgreSQL. This monorepo contains three main applications:

- **Admin** - Question management dashboard for creating and managing quiz questions
- **Client** - Web application for players to take quizzes
- **API** - Central backend server that handles data and business logic

## Architecture

```
QuizBuzz/
├── apps/
│   ├── admin/          # Admin dashboard (React + Vite) - Port 3000
│   ├── client/         # Player interface (React + Vite) - Port 4000  
│   └── api/            # Backend API (Node.js + Express) - Port 5000
├── packages/           # Shared configurations and utilities
└── docker-compose.yml  # PostgreSQL database - Port 5432
```

## Prerequisites

Before getting started, ensure you have the following installed:

### 1. Node.js (Version 24 or higher)

**Using Node Version Manager (NVM) - Recommended**
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal or run:
source ~/.bashrc

# Install and use Node.js 21
nvm install 21
nvm use 24
nvm alias default 24
```

**Verify Installation:**
```bash
node --version  # Should be 24.x.x or higher
```

### 2. Docker & Docker Compose

**Docker Desktop (Recommended for beginners)**
- Download from [docker.com](https://www.docker.com/products/docker-desktop/)

**Verify Installation:**
```bash
docker --version
docker compose version
```

## Setup Instructions

Follow these steps to get the development environment running:

### 1. Clone the Repository
```bash
git clone <url>
cd quizbuzz
```

### 2. Install Dependencies
```bash
# Install all dependencies for all apps and packages
npm install
```

This will install dependencies for:
- Root workspace (Turbo, Prettier, TypeScript)
- Admin app (React, Vite, TypeScript)
- Client app (React, Vite, TypeScript)
- API app (Express, TypeScript, tsx)
- Shared packages (ESLint configs, TypeScript configs)

### 3. Start the Database
```bash
# Start PostgreSQL database in the background
docker compose up -d
```

**Database Details:**
- **Host:** localhost
- **Port:** 5432
- **Database:** postgres
- **Username:** postgres
- **Password:** postgres

**Verify Database is Running:**
```bash
docker compose ps
# Should show postgres container running on port 5432
```

### 4. Start Development Servers

```bash
npm run dev
```

This starts all three applications simultaneously using Turbo:
- Admin dashboard: http://localhost:3000
- Client app: http://localhost:4000  
- API server: http://localhost:5000

## Application URLs

Once all services are running, you can access:

| Service | URL | Purpose |
|---------|-----|---------|
| Admin Dashboard | http://localhost:3000 | Create and manage quiz questions |
| Client App | http://localhost:4000 | Player interface for taking quizzes |
| API Server | http://localhost:5000 | Backend API endpoints |
| PostgreSQL DB | localhost:5432 | Database (use DB client to connect) |

## Development Commands

### Root Level Commands (affects all apps)
```bash
npm run dev          # Start all development servers
npm run build        # Build all applications
npm run lint         # Lint all applications
npm run format       # Format code with Prettier
npm run check-types  # Type-check all TypeScript code
```

## Database Management

### Stop Database
```bash
docker compose down
```

### Reset Database (Delete all data)
```bash
docker compose down -v  # -v removes volumes
docker compose up -d
```

## Project Structure Details

### Monorepo Setup
This project uses:
- **Turbo** - For efficient monorepo task running and caching
- **npm workspaces** - For dependency management across packages
- **Shared packages** - Common ESLint and TypeScript configurations

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL 17
- **Development:** Turbo, ESLint, Prettier
- **Containerization:** Docker & Docker Compose

## Troubleshooting

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run check-types` to ensure code quality
4. Test your changes across all applications
5. Submit a pull request

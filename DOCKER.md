# Mushroom Hunter PWA - Docker Documentation

This guide explains how to run the Mushroom Hunter PWA application using Docker and Docker Compose.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Common Commands](#common-commands)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Overview

The application consists of three main services running in Docker containers:

1. **Frontend** - React + Vite development server (Port 5173)
2. **Backend** - Node.js Express API (Port 5000)
3. **Database** - PostgreSQL 16 (Port 5433)

All services are connected through a Docker network and orchestrated using Docker Compose.

## Prerequisites

- Docker Engine 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose 1.29+ ([Install Docker Compose](https://docs.docker.com/compose/install/))
- At least 2GB of free RAM
- Ports 5000, 5173, and 5433 available on your host machine

## Quick Start

### 1. Clone and Navigate to Project

```bash
cd /home/dubmosphere/git/aicoding/mushroom-hunter-pwa
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set secure values (at minimum):
# - JWT_SECRET (use a strong random string)
# - DB_PASSWORD (use a secure password)
```

**Important**: Never commit your `.env` file to version control!

### 3. Start the Application

```bash
# Build and start all services
docker-compose up -d

# View logs to verify startup
docker-compose logs -f
```

### 4. Initialize the Database

```bash
# Seed initial data (optional)
docker-compose exec backend npm run seed
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                Docker Network                        │
│                (mushroom-network)                    │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │   Frontend   │  │   Backend    │  │   DB     │ │
│  │              │  │              │  │          │ │
│  │ Vite Server  │──│ Express API  │──│ Postgres │ │
│  │ Port: 5173   │  │ Port: 5000   │  │ Port:    │ │
│  │              │  │              │  │ 5432     │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│        │                  │                 │       │
└────────┼──────────────────┼─────────────────┼───────┘
         │                  │                 │
    Host:5173          Host:5000         Host:5433
```

### Service Details

#### Frontend Container
- **Base Image**: node:20-alpine
- **Purpose**: Serves the React application with hot-reload
- **Build Context**: `./frontend`
- **Volumes**: Source code mounted for development hot-reload
- **Dependencies**: Backend service

#### Backend Container
- **Base Image**: node:20-alpine
- **Purpose**: Express REST API server
- **Build Context**: `./backend`
- **User**: Non-root user (nodejs:1001) for security
- **Dependencies**: Database service

#### Database Container
- **Base Image**: postgres:16-alpine
- **Purpose**: PostgreSQL database
- **Data Persistence**: Named volume `postgres_data`
- **Health Check**: `pg_isready` command

## Configuration

### Environment Variables

All configuration is managed through the `.env` file at the project root.

#### Port Configuration
```bash
FRONTEND_PORT=5173    # Frontend dev server port
BACKEND_PORT=5000     # Backend API port
DB_PORT=5433          # Database port (host access)
```

#### Backend Configuration
```bash
NODE_ENV=production   # Environment: development|production
```

#### Database Configuration
```bash
DB_NAME=mushroom_hunter               # Database name
DB_USER=postgres                      # Database user
DB_PASSWORD=your_secure_password      # Database password
```

#### JWT Configuration
```bash
JWT_SECRET=your_very_secure_secret    # JWT signing key
JWT_EXPIRES_IN=7d                     # Token expiration
```

#### CORS Configuration
```bash
# Comma-separated list of allowed origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Frontend Configuration
```bash
# API URL for frontend to connect to backend
VITE_API_URL=http://localhost:5000
```

### Docker Compose Override

For local development customizations, create a `docker-compose.override.yml`:

```yaml
version: '3.8'

services:
  backend:
    environment:
      NODE_ENV: development
    command: npm run dev  # Use nodemon for hot-reload
```

## Common Commands

### Starting Services

```bash
# Start all services in detached mode
docker-compose up -d

# Start and watch logs
docker-compose up

# Start specific service
docker-compose up -d frontend

# Rebuild and start
docker-compose up -d --build
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow logs (live tail)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# View last 50 lines
docker-compose logs --tail=50
```

### Stopping Services

```bash
# Stop all services (keeps containers)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (deletes data!)
docker-compose down -v
```

### Managing Containers

```bash
# Check service status
docker-compose ps

# Execute command in running container
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
docker-compose exec frontend npm install new-package

# Access container shell
docker-compose exec backend sh
docker-compose exec frontend sh

# Restart a service
docker-compose restart backend
```

### Database Operations

```bash
# Access PostgreSQL CLI
docker-compose exec db psql -U postgres -d mushroom_hunter

# Seed database with initial data
docker-compose exec -T backend npm run seed

# Import species data from CSV
docker-compose exec -T backend npm run import

# Generate test findings for development
docker-compose exec -T backend npm run generate-test-findings

# Check for orphaned findings (missing species)
docker-compose exec -T backend npm run check-orphaned-findings

# Backup database
docker-compose exec db pg_dump -U postgres mushroom_hunter > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U postgres -d mushroom_hunter

# View database logs
docker-compose logs db
```

**Note**: The `-T` flag disables pseudo-TTY allocation, which is necessary when piping input/output or running non-interactive commands.

## Development Workflow

### Frontend Development

The frontend has hot-reload enabled by default through volume mounts.

1. Make changes to files in `./frontend/src`
2. Changes are automatically detected and the browser refreshes
3. No need to rebuild the container

### Backend Development

For backend hot-reload during development:

1. Update `docker-compose.yml` or create `docker-compose.override.yml`:
   ```yaml
   services:
     backend:
       command: npm run dev
       volumes:
         - ./backend/src:/app/src
   ```

2. Restart the backend:
   ```bash
   docker-compose restart backend
   ```

### Installing New Dependencies

```bash
# Frontend
docker-compose exec frontend npm install package-name
docker-compose restart frontend

# Backend
docker-compose exec backend npm install package-name
docker-compose restart backend
```

Then rebuild for production:
```bash
docker-compose up -d --build
```

### Running Database Scripts

```bash
# Run migrations
docker-compose exec -T backend npm run migrate

# Run seeds
docker-compose exec -T backend npm run seed

# Import species data
docker-compose exec -T backend npm run import

# Generate test findings
docker-compose exec -T backend npm run generate-test-findings

# Check for orphaned findings
docker-compose exec -T backend npm run check-orphaned-findings
```

### Updating npm Scripts

When you add new scripts to `package.json`, you must rebuild the container:

**Important**: The `package.json` file is copied during Docker image build, not mounted as a volume. Changes to `package.json` on your host won't automatically appear in the running container.

```bash
# After modifying package.json or package-lock.json
docker-compose build backend

# Restart services
docker-compose down && docker-compose up -d
```

**Files that require rebuild**:
- `package.json` (scripts or dependencies)
- `package-lock.json`
- Backend source files (unless mounted as volumes)

**Files that update automatically** (mounted as volumes):
- Frontend: `src/` directory and `vite.config.js`
- Backend: None by default (production setup)

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Set secure `DB_PASSWORD`
- [ ] Update `ALLOWED_ORIGINS` to production URLs
- [ ] Set `NODE_ENV=production`
- [ ] Review and lock down firewall rules
- [ ] Enable HTTPS/SSL termination (use reverse proxy like nginx)
- [ ] Configure proper backup strategy
- [ ] Set up log aggregation
- [ ] Configure health monitoring

### Production Build

For production, consider using a multi-stage build for the frontend:

1. Create `frontend/Dockerfile.prod`:
   ```dockerfile
   # Build stage
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   # Production stage
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Update `docker-compose.yml` to use production Dockerfile

### Backup Strategy

```bash
# Automated daily backups
0 2 * * * docker-compose exec -T db pg_dump -U postgres mushroom_hunter | gzip > /backups/mushroom_$(date +\%Y\%m\%d).sql.gz
```

### Using with Reverse Proxy

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution**:
```bash
# Find what's using the port
sudo lsof -i :5432

# Kill the process or change port in .env
DB_PORT=5433
```

### Container Keeps Restarting

**Check logs**:
```bash
docker-compose logs backend
```

**Common causes**:
- Missing environment variables
- Database not ready
- Code syntax errors
- Port conflicts

### Cannot Connect to Database

**Solution**:
```bash
# Check if database is healthy
docker-compose ps

# Check database logs
docker-compose logs db

# Verify network connectivity
docker-compose exec backend ping db
```

### Frontend Not Hot-Reloading

**Solution**:
```bash
# Verify volume mounts in docker-compose.yml
docker-compose config

# Restart frontend service
docker-compose restart frontend

# Check file permissions
chmod -R 755 ./frontend/src
```

### Out of Disk Space

**Solution**:
```bash
# Remove unused containers, networks, images
docker system prune -a

# Remove unused volumes (WARNING: deletes data!)
docker volume prune
```

### Permission Denied Errors

**Solution**:
```bash
# Fix source code permissions
chmod -R 755 ./frontend/src
chmod -R 755 ./backend/src

# Rebuild containers
docker-compose up -d --build
```

### Database Connection Refused

**Check**:
1. Database container is running: `docker-compose ps db`
2. Database is healthy: Check health status
3. Backend can reach database: `docker-compose exec backend ping db`
4. Credentials are correct in `.env`

### Reset Everything

If all else fails:

```bash
# Stop and remove everything
docker-compose down -v

# Remove all project images
docker images | grep mushroom-hunter | awk '{print $3}' | xargs docker rmi

# Clean Docker system
docker system prune -a

# Start fresh
docker-compose up -d --build
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

## Support

For issues specific to the Docker setup, check:
1. This documentation
2. Container logs: `docker-compose logs`
3. Service health: `docker-compose ps`

For application-specific issues, refer to the main README.md

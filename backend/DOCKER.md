# Backend Docker Documentation

This document provides detailed information about the backend Docker setup for the Mushroom Hunter PWA.

## Container Overview

- **Base Image**: `node:20-alpine`
- **Exposed Port**: 5000
- **Container Name**: `mushroom-hunter-backend`
- **User**: Non-root user `nodejs` (UID: 1001)

## Dockerfile Structure

The backend Dockerfile uses the following stages:

```dockerfile
1. Base setup with Node.js 20 Alpine
2. Copy package files and install dependencies (production only)
3. Copy application code
4. Create non-root user and set permissions
5. Configure health check
6. Start application
```

### Key Features

- **Alpine Linux**: Minimal image size (~120MB)
- **Production Dependencies**: Only installs runtime dependencies
- **Non-root User**: Enhanced security by running as `nodejs:1001`
- **Health Check**: Automatic health monitoring via `/health` endpoint
- **Permission Management**: Ensures all files are readable by the nodejs user

## Building the Backend

### Standalone Build

```bash
cd backend
docker build -t mushroom-hunter-backend .
```

### Build with Docker Compose

```bash
# From project root
docker-compose build backend
```

### Build Arguments

The Dockerfile supports flexible dependency installation:

```bash
# With package-lock.json (recommended)
docker build --no-cache -t mushroom-hunter-backend .

# Force rebuild
docker build --pull --no-cache -t mushroom-hunter-backend .
```

## Running the Backend Container

### With Docker Compose (Recommended)

```bash
# Start backend with database
docker-compose up -d backend
```

### Standalone Container

```bash
docker run -d \
  --name mushroom-hunter-backend \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_NAME=mushroom_hunter \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your_secret \
  mushroom-hunter-backend
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `db` or `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `mushroom_hunter` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `secure_password` |
| `JWT_SECRET` | JWT signing secret | `random_string_32chars` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:5173` |

## File Structure

```
backend/
├── Dockerfile              # Container definition
├── .dockerignore          # Files to exclude from build
├── package.json           # Dependencies
├── package-lock.json      # Lock file
└── src/
    ├── server.js          # Application entry point
    ├── config/            # Configuration files
    ├── controllers/       # Route controllers
    ├── middleware/        # Express middleware
    ├── models/            # Sequelize models
    ├── routes/            # API routes
    └── utils/             # Utility functions
```

## .dockerignore

The `.dockerignore` file excludes the following from the build:

```
# Dependencies (installed during build)
node_modules

# Environment files (injected at runtime)
.env
.env.local

# Development files
.git
README.md
test/
coverage/

# IDE and OS files
.vscode
.DS_Store
```

## Health Check

The container includes an automatic health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', ...)"
```

**Endpoints monitored**: `GET /health`

**Status meanings**:
- `healthy`: Container is responding correctly
- `unhealthy`: Container failed 3 consecutive checks
- `starting`: Container is in the 5-second grace period

## Development Mode

For development with hot-reload:

### Option 1: Volume Mounting

Update `docker-compose.yml`:

```yaml
services:
  backend:
    command: npm run dev
    volumes:
      - ./backend/src:/app/src
      - backend_node_modules:/app/node_modules
```

### Option 2: Use Host Node.js

Run the database in Docker, but backend on host:

```bash
# Start only the database
docker-compose up -d db

# Run backend locally
cd backend
npm install
npm run dev
```

## Database Migrations

### Running Migrations

```bash
# Inside container
docker-compose exec backend npm run migrate

# Or standalone
docker exec mushroom-hunter-backend npm run migrate
```

### Seeding Database

```bash
# Seed sample data
docker-compose exec backend npm run seed

# Import species data
docker-compose exec backend npm run import
```

## Debugging

### View Logs

```bash
# Follow logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# With timestamps
docker-compose logs -f -t backend
```

### Access Container Shell

```bash
# Using docker-compose
docker-compose exec backend sh

# Direct docker command
docker exec -it mushroom-hunter-backend sh
```

### Common Debug Commands

```bash
# Check environment variables
docker-compose exec backend env

# Test database connection
docker-compose exec backend node -e "
  const { sequelize } = require('./src/models/index.js');
  sequelize.authenticate()
    .then(() => console.log('✓ Connected'))
    .catch(err => console.error('✗ Error:', err));
"

# Check file permissions
docker-compose exec backend ls -la /app/src/

# Test health endpoint
docker-compose exec backend wget -qO- http://localhost:5000/health
```

## Performance Optimization

### Multi-stage Build (Production)

For smaller production images:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN addgroup -g 1001 nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 5000
CMD ["node", "src/server.js"]
```

### Layer Caching

The Dockerfile is optimized for Docker layer caching:

1. Package files copied first (changes infrequently)
2. Dependencies installed (cached unless package.json changes)
3. Application code copied last (changes frequently)

## Security Considerations

### Non-root User

The container runs as user `nodejs:1001` to prevent privilege escalation:

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### File Permissions

All application files are owned by the nodejs user:

```dockerfile
RUN chown -R nodejs:nodejs /app && \
    chmod -R 755 /app
```

### Environment Variables

Never hardcode secrets in the Dockerfile. Use environment variables:

```bash
# Good
docker run -e JWT_SECRET=secret backend

# Bad (don't do this)
ENV JWT_SECRET=hardcoded_secret
```

## Troubleshooting

### Container Exits Immediately

**Check logs**:
```bash
docker-compose logs backend
```

**Common causes**:
- Missing environment variables
- Database connection failure
- Syntax errors in code

### Cannot Find Module Error

**Solution**:
```bash
# Rebuild with fresh dependencies
docker-compose build --no-cache backend
docker-compose up -d backend
```

### Permission Denied

**Fix source permissions**:
```bash
chmod -R 755 ./src
chmod -R 755 ./scripts

# Rebuild
docker-compose up -d --build backend
```

### Database Connection Refused

**Verify database is running**:
```bash
docker-compose ps db

# Test connection from backend
docker-compose exec backend ping db
```

### Port Already in Use

**Find process using port 5000**:
```bash
sudo lsof -i :5000

# Or change port in docker-compose.yml
ports:
  - "5001:5000"
```

## Production Deployment

### Environment Configuration

Create production environment file:

```bash
# .env.production
NODE_ENV=production
PORT=5000
DB_HOST=production-db-host
DB_NAME=mushroom_hunter_prod
JWT_SECRET=very-secure-random-string-min-32-chars
ALLOWED_ORIGINS=https://yourdomain.com
```

### Using Secrets

For sensitive data, use Docker secrets:

```yaml
services:
  backend:
    secrets:
      - db_password
      - jwt_secret
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
      JWT_SECRET_FILE: /run/secrets/jwt_secret

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

### Resource Limits

Set resource constraints:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Monitoring

### Health Check Endpoint

```bash
# Check health
curl http://localhost:5000/health

# Expected response
{
  "status": "ok",
  "timestamp": "2025-10-25T00:00:00.000Z"
}
```

### Container Stats

```bash
# Resource usage
docker stats mushroom-hunter-backend

# Container events
docker events --filter container=mushroom-hunter-backend
```

## Additional Commands

### Restart Policies

```yaml
services:
  backend:
    restart: unless-stopped  # or 'always', 'on-failure'
```

### Updating Dependencies

```bash
# Update package.json on host
cd backend
npm update

# Rebuild container
docker-compose build backend
docker-compose up -d backend
```

### Cleanup

```bash
# Remove backend container
docker-compose rm -f backend

# Remove backend image
docker rmi mushroom-hunter-pwa_backend

# Remove unused images
docker image prune
```

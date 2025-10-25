# Frontend Docker Documentation

This document provides detailed information about the frontend Docker setup for the Mushroom Hunter PWA.

## Container Overview

- **Base Image**: `node:20-alpine`
- **Exposed Port**: 5173
- **Container Name**: `mushroom-hunter-frontend`
- **Development Server**: Vite

## Dockerfile Structure

The frontend Dockerfile is optimized for development with hot-reload:

```dockerfile
1. Base setup with Node.js 20 Alpine
2. Copy package files and install all dependencies (including devDependencies)
3. Copy application code
4. Configure health check
5. Start Vite dev server with host binding
```

### Key Features

- **Alpine Linux**: Minimal base image
- **Hot Module Replacement (HMR)**: Instant updates during development
- **Host Binding**: Accessible from host machine via `0.0.0.0`
- **Health Check**: Monitors Vite dev server availability
- **Volume Mounts**: Source code mounted for live reload

## Building the Frontend

### Standalone Build

```bash
cd frontend
docker build -t mushroom-hunter-frontend .
```

### Build with Docker Compose

```bash
# From project root
docker-compose build frontend
```

### Build for Production

For production deployments, you may want a multi-stage build with nginx:

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

## Running the Frontend Container

### With Docker Compose (Recommended)

```bash
# Start frontend (and dependencies)
docker-compose up -d frontend
```

### Standalone Container

```bash
docker run -d \
  --name mushroom-hunter-frontend \
  -p 5173:5173 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  -e VITE_API_URL=http://localhost:5000 \
  mushroom-hunter-frontend
```

## Environment Variables

### Frontend Configuration

Vite uses environment variables prefixed with `VITE_`:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

### Adding Environment Variables

1. **Define in `.env`**:
   ```bash
   VITE_API_URL=http://localhost:5000
   VITE_CUSTOM_VAR=value
   ```

2. **Access in Code**:
   ```javascript
   const apiUrl = import.meta.env.VITE_API_URL;
   ```

3. **Pass to Container**:
   ```yaml
   services:
     frontend:
       environment:
         VITE_API_URL: ${VITE_API_URL}
   ```

## File Structure

```
frontend/
├── Dockerfile              # Container definition
├── .dockerignore          # Files to exclude from build
├── package.json           # Dependencies
├── package-lock.json      # Lock file
├── index.html             # HTML entry point
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
├── postcss.config.js      # PostCSS config
├── public/                # Static assets
│   └── icons/
└── src/
    ├── main.jsx           # Application entry
    ├── App.jsx            # Root component
    ├── components/        # React components
    ├── pages/             # Page components
    ├── hooks/             # Custom React hooks
    ├── services/          # API services
    ├── store/             # State management
    ├── utils/             # Utility functions
    └── styles/            # CSS files
```

## .dockerignore

The `.dockerignore` file excludes the following:

```
# Dependencies (installed during build)
node_modules

# Build artifacts (generated during build)
dist
build

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
    CMD wget --quiet --tries=1 --spider http://localhost:5173/ || exit 1
```

**Status meanings**:
- `healthy`: Vite server is responding
- `unhealthy`: Server failed 3 consecutive checks
- `starting`: Container is in the 5-second grace period

## Development Mode

### Hot Module Replacement (HMR)

HMR is enabled by default through volume mounts in `docker-compose.yml`:

```yaml
services:
  frontend:
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
```

**How it works**:
1. Edit any file in `./frontend/src`
2. Vite detects the change
3. Browser automatically updates without full reload

### Vite Configuration

The `vite.config.js` is configured for Docker:

```javascript
export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0',  // Important for Docker
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
```

**Key settings**:
- `host: '0.0.0.0'`: Allows access from outside container
- `proxy`: Routes API calls to backend

## Debugging

### View Logs

```bash
# Follow logs
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 frontend

# With timestamps
docker-compose logs -f -t frontend
```

### Access Container Shell

```bash
# Using docker-compose
docker-compose exec frontend sh

# Direct docker command
docker exec -it mushroom-hunter-frontend sh
```

### Common Debug Commands

```bash
# Check if Vite is running
docker-compose exec frontend wget -qO- http://localhost:5173/

# View environment variables
docker-compose exec frontend env | grep VITE

# Check file permissions
docker-compose exec frontend ls -la /app/src/

# Verify node modules
docker-compose exec frontend ls -la /app/node_modules/

# Check Vite process
docker-compose exec frontend ps aux | grep vite
```

### Browser DevTools

Access the app at http://localhost:5173 and use browser DevTools:

1. **Console**: Check for JavaScript errors
2. **Network**: Verify API calls to backend
3. **Application**: Inspect PWA manifest and service worker
4. **Sources**: Debug React components

## Installing Dependencies

### Add New Package

```bash
# Install in container
docker-compose exec frontend npm install package-name

# Or on host, then rebuild
cd frontend
npm install package-name
docker-compose restart frontend
```

### Update Dependencies

```bash
# Update specific package
docker-compose exec frontend npm update package-name

# Update all packages
docker-compose exec frontend npm update

# Rebuild after updates
docker-compose up -d --build frontend
```

## Building for Production

### Create Production Build

```bash
# Inside container
docker-compose exec frontend npm run build

# Output will be in /app/dist
```

### Test Production Build

```bash
# Preview production build
docker-compose exec frontend npm run preview
```

### Production Docker Image with Nginx

Create `Dockerfile.prod`:

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

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:

```bash
docker build -f Dockerfile.prod -t mushroom-hunter-frontend:prod .
docker run -p 80:80 mushroom-hunter-frontend:prod
```

## Progressive Web App (PWA)

### Service Worker

The app uses `vite-plugin-pwa` for PWA functionality:

```javascript
// vite.config.js
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Mushroom Hunter',
    short_name: 'MushroomHunter',
    theme_color: '#2d5016',
    // ... other manifest properties
  }
})
```

### Testing PWA Features

1. **Build the app**: `npm run build`
2. **Serve locally**: `npm run preview`
3. **Open DevTools** → Application → Manifest
4. **Test offline mode**: DevTools → Network → Offline

### PWA in Docker

The PWA features work automatically in the Docker container. The service worker is generated during build.

## Performance Optimization

### Development Build Performance

```bash
# Use Vite's dependency pre-bundling
docker-compose exec frontend rm -rf /app/node_modules/.vite
docker-compose restart frontend
```

### Reducing Container Size

For production, use multi-stage builds and remove devDependencies:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
```

## Troubleshooting

### HMR Not Working

**Check volume mounts**:
```bash
docker-compose config | grep -A 5 frontend
```

**Verify file permissions**:
```bash
chmod -R 755 ./frontend/src
docker-compose restart frontend
```

**Check Vite config**:
```javascript
// vite.config.js
server: {
  watch: {
    usePolling: true  // Enable if HMR is slow
  }
}
```

### Port Already in Use

```bash
# Find process
sudo lsof -i :5173

# Or change port
FRONTEND_PORT=5174 docker-compose up -d
```

### Blank Page or 404

**Check browser console** for errors

**Verify build output**:
```bash
docker-compose exec frontend ls -la /app/dist/
```

**Check nginx config** (if using production build)

### Slow Build Times

**Use Docker layer caching**:
```dockerfile
# Copy package files first
COPY package*.json ./
RUN npm install

# Copy source code last
COPY . .
```

**Enable BuildKit**:
```bash
DOCKER_BUILDKIT=1 docker-compose build frontend
```

### Module Not Found Errors

**Rebuild node_modules**:
```bash
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm install
docker-compose restart frontend
```

### Cannot Connect to Backend

**Check API URL**:
```bash
docker-compose exec frontend env | grep VITE_API_URL
```

**Test backend connectivity**:
```bash
docker-compose exec frontend ping backend
docker-compose exec frontend wget -qO- http://backend:5000/health
```

**Verify CORS settings** in backend

## Security Considerations

### Environment Variables

Never expose sensitive data in frontend environment variables:

```bash
# Good - public configuration
VITE_API_URL=https://api.example.com

# Bad - secrets visible in client code
VITE_API_SECRET=secret123  # Don't do this!
```

### Content Security Policy

Configure CSP headers in nginx for production:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

## Monitoring

### Container Stats

```bash
# Resource usage
docker stats mushroom-hunter-frontend

# Container logs
docker-compose logs -f frontend
```

### Application Monitoring

Use browser DevTools:
- **Performance**: Measure load times
- **Lighthouse**: PWA audit
- **Network**: Monitor API calls

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Docker for Node.js](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

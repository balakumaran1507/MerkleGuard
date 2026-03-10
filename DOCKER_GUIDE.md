# Docker Setup Guide for MerkleGuard

This guide explains how to run MerkleGuard using Docker and Docker Compose on any platform (Windows, macOS, Linux).

## Prerequisites

### Install Docker Desktop

#### Windows
1. Download Docker Desktop for Windows from: https://www.docker.com/products/docker-desktop/
2. Run the installer and follow the installation wizard
3. Restart your computer when prompted
4. Start Docker Desktop from the Start menu
5. Wait for Docker to start (you'll see the Docker icon in the system tray)

#### macOS
1. Download Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop/
2. Open the `.dmg` file and drag Docker to Applications
3. Open Docker from Applications
4. Grant permissions when prompted
5. Wait for Docker to start (you'll see the Docker icon in the menu bar)

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Fedora
sudo dnf install docker docker-compose

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER
# Log out and log back in for this to take effect
```

## Running MerkleGuard with Docker

### Option 1: Quick Start (Recommended)

Open a terminal (Command Prompt/PowerShell on Windows, Terminal on macOS/Linux) and navigate to the MerkleGuard directory:

```bash
# Windows
cd C:\path\to\MerkleGuard

# macOS/Linux
cd /path/to/MerkleGuard
```

Then run:

```bash
docker-compose up --build
```

This will:
- Build both frontend and backend Docker images
- Start both services
- Make the application available at `http://localhost:5288`
- Make the backend API available at `http://localhost:8288`

### Option 2: Background Mode

To run the services in the background:

```bash
docker-compose up -d --build
```

View logs:
```bash
docker-compose logs -f
```

Stop the services:
```bash
docker-compose down
```

### Option 3: Development Mode with Hot Reload

The docker-compose.yml is configured to mount your local files as volumes, so changes to the code will be reflected immediately without rebuilding.

To rebuild only when needed:
```bash
# Just start (without rebuilding)
docker-compose up

# Rebuild specific service
docker-compose up --build backend
docker-compose up --build frontend
```

## Accessing the Application

Once the containers are running:
- **Frontend Dashboard**: http://localhost:5288
- **Backend API**: http://localhost:8288
- **API Docs**: http://localhost:8288/docs

## Troubleshooting

### Port Already in Use

If you get an error that port 5288 or 8288 is already in use:

**Windows:**
```cmd
netstat -ano | findstr :5288
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:5288 | xargs kill -9
lsof -ti:8288 | xargs kill -9
```

Or change the ports in `docker-compose.yml`:
```yaml
ports:
  - "5289:5288"  # Change 5289 to any available port
```

### Docker Desktop Not Running

Make sure Docker Desktop is running:
- **Windows/Mac**: Look for the Docker icon in system tray/menu bar
- **Linux**: Run `sudo systemctl status docker`

### Permission Denied (Linux)

If you get permission errors on Linux:
```bash
sudo docker-compose up --build
```

Or add your user to the docker group (see Prerequisites section).

### Container Crashes or Won't Start

View detailed logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

Check container status:
```bash
docker-compose ps
```

Rebuild from scratch:
```bash
docker-compose down
docker-compose up --build --force-recreate
```

### WebSocket Connection Issues

If you see WebSocket errors in the browser console, make sure:
1. Both containers are running: `docker-compose ps`
2. Backend is healthy: Visit http://localhost:8288/docs
3. Check backend logs: `docker-compose logs backend`

## Advanced Usage

### Building Production Images

For production deployment, modify the frontend Dockerfile to build static assets:

```dockerfile
# Production build
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Custom Configuration

Create a `.env` file in the root directory:
```env
BACKEND_PORT=8288
FRONTEND_PORT=5288
```

Update `docker-compose.yml` to use these variables:
```yaml
ports:
  - "${BACKEND_PORT}:8288"
```

### Scaling Services

Run multiple backend instances:
```bash
docker-compose up --scale backend=3
```

### Viewing Resource Usage

```bash
docker stats
```

### Cleaning Up

Remove all containers and volumes:
```bash
docker-compose down -v
```

Remove all images:
```bash
docker-compose down --rmi all
```

## Platform-Specific Notes

### Windows
- Use PowerShell or Command Prompt, not Git Bash
- If using WSL2, Docker Desktop integrates automatically
- File paths use backslashes: `C:\Users\YourName\MerkleGuard`

### macOS
- Docker Desktop requires macOS 10.15 or newer
- Performance is optimized with Apple Silicon (M1/M2/M3)
- Use Terminal or iTerm2

### Linux
- Native Docker performance (fastest)
- No Docker Desktop required (use Docker Engine directly)
- May need `sudo` for Docker commands unless user is in docker group

## Next Steps

Once the application is running, visit:
1. **Dashboard**: http://localhost:5288/dashboard - Overview of all nodes
2. **Live Demo**: http://localhost:5288/demo-live - Attack simulation
3. **Showcase**: http://localhost:5288/showcase - Performance metrics
4. **Merkle Inspector**: http://localhost:5288/merkle - Tree visualization

# Running MerkleGuard with Docker on Windows - Step by Step Guide

This guide will walk you through every step to run MerkleGuard using Docker on Windows, from installation to accessing the application.

## Prerequisites

You need:
- Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 or higher)
- OR Windows 11
- Administrator access to your computer

---

## Step 1: Install Docker Desktop

### 1.1 Download Docker Desktop

1. Open your web browser (Chrome, Edge, Firefox, etc.)
2. Go to: https://www.docker.com/products/docker-desktop/
3. Click the **"Download for Windows"** button
4. Wait for the file `Docker Desktop Installer.exe` to download (about 500 MB)

### 1.2 Install Docker Desktop

1. **Locate the downloaded file**
   - Open your Downloads folder
   - Look for `Docker Desktop Installer.exe`

2. **Run the installer**
   - Double-click `Docker Desktop Installer.exe`
   - Click **"Yes"** if Windows asks "Do you want to allow this app to make changes?"

3. **Installation wizard**
   - Wait for the installer to extract files (1-2 minutes)
   - Check the box: ✅ **"Use WSL 2 instead of Hyper-V"** (recommended)
   - Click **"Ok"** to start installation
   - Wait 3-5 minutes for installation to complete

4. **Complete installation**
   - Click **"Close and restart"** when prompted
   - Your computer will restart

### 1.3 Start Docker Desktop

1. After your computer restarts, Docker Desktop should start automatically
2. If not, find Docker Desktop in the Start Menu:
   - Click the Windows Start button
   - Type "Docker Desktop"
   - Click on "Docker Desktop" to open it

3. **Accept the terms**
   - When Docker Desktop opens, you'll see a service agreement
   - Check the box: ✅ **"I accept the terms"**
   - Click **"Accept"**

4. **Wait for Docker to start**
   - You'll see "Docker Desktop is starting..."
   - Wait 1-2 minutes
   - Look for the Docker whale icon in the system tray (bottom-right corner)
   - When the whale icon stops animating, Docker is ready

### 1.4 Verify Docker is Running

1. Open **Command Prompt** or **PowerShell**:
   - Press `Windows Key + R`
   - Type `cmd` and press Enter

2. Type this command and press Enter:
   ```cmd
   docker --version
   ```

3. You should see something like:
   ```
   Docker version 24.0.7, build afdd53b
   ```

4. If you see an error, restart Docker Desktop from the system tray

---

## Step 2: Download MerkleGuard Code

### Option A: If you have Git installed

1. Open Command Prompt or PowerShell
2. Navigate to where you want the code:
   ```cmd
   cd C:\Users\YourUsername\Documents
   ```
3. Clone the repository:
   ```cmd
   git clone https://github.com/balakumaran1507/MerkleGuard
   ```
4. Go into the folder:
   ```cmd
   cd MerkleGuard
   ```

### Option B: Download as ZIP (No Git required)

1. Open your browser
2. Go to: https://github.com/balakumaran1507/MerkleGuard
3. Click the green **"Code"** button
4. Click **"Download ZIP"**
5. Wait for download to complete
6. **Extract the ZIP file**:
   - Go to your Downloads folder
   - Right-click on `MerkleGuard-main.zip`
   - Select **"Extract All..."**
   - Choose a location (e.g., `C:\Users\YourUsername\Documents`)
   - Click **"Extract"**
7. Open Command Prompt and navigate to the folder:
   ```cmd
   cd C:\Users\YourUsername\Documents\MerkleGuard-main
   ```

---

## Step 3: Run MerkleGuard with Docker Compose

### 3.1 Open Command Prompt in the MerkleGuard folder

**Method 1: From File Explorer**
1. Open File Explorer
2. Navigate to the MerkleGuard folder
3. Click in the address bar (where it shows the path)
4. Type `cmd` and press Enter
5. Command Prompt will open in that folder

**Method 2: Manual navigation**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Navigate to your MerkleGuard folder:
   ```cmd
   cd C:\Users\YourUsername\Documents\MerkleGuard
   ```

### 3.2 Verify you're in the correct folder

Type this command and press Enter:
```cmd
dir
```

You should see files including:
- `docker-compose.yml`
- `README.md`
- `backend` folder
- `frontend` folder

### 3.3 Build and start the containers

Type this command and press Enter:
```cmd
docker-compose up --build
```

**What happens next:**
1. Docker will download base images (first time only, 5-10 minutes)
2. Docker will build the backend container (2-3 minutes)
3. Docker will build the frontend container (2-3 minutes)
4. Both containers will start

**You'll see lots of text scrolling**. This is normal! Look for these success messages:

For backend:
```
backend_1   | INFO:     Uvicorn running on http://0.0.0.0:8288
```

For frontend:
```
frontend_1  | ➜  Local:   http://localhost:5288/
```

### 3.4 Wait for "ready" message

Keep the Command Prompt window open and wait until you see:
```
frontend_1  | ➜  Local:   http://localhost:5288/
frontend_1  | ➜  Network: use --host to expose
```

This means the application is ready!

---

## Step 4: Access the Application

### 4.1 Open your web browser

1. Open Chrome, Edge, Firefox, or any browser
2. In the address bar, type:
   ```
   http://localhost:5288
   ```
3. Press Enter

### 4.2 You should see MerkleGuard!

You'll see:
- A collapsible sidebar on the left
- Dashboard with security metrics
- Navigation to different pages

### 4.3 Test the application

Try clicking on:
- **Demo Live** - See a live attack simulation
- **Showcase** - View performance metrics
- **Merkle Inspector** - Explore the Merkle tree visualization
- Click the arrow button in the sidebar to collapse/expand it

---

## Step 5: Stop the Application

### To stop (but keep data):

1. Go back to the Command Prompt window where docker-compose is running
2. Press `Ctrl + C`
3. Wait for containers to stop (5-10 seconds)

### To stop and remove everything:

In Command Prompt, type:
```cmd
docker-compose down
```

---

## Step 6: Start Again Later

When you want to run MerkleGuard again:

1. Make sure Docker Desktop is running (check system tray)
2. Open Command Prompt
3. Navigate to MerkleGuard folder:
   ```cmd
   cd C:\Users\YourUsername\Documents\MerkleGuard
   ```
4. Start containers (without rebuilding):
   ```cmd
   docker-compose up
   ```
5. Open browser to http://localhost:5288

---

## Troubleshooting Common Issues

### Issue 1: "docker-compose is not recognized"

**Solution:**
1. Close Command Prompt
2. Open PowerShell instead (Windows Key + X, then click PowerShell)
3. Try:
   ```powershell
   docker compose up --build
   ```
   Note: Space between "docker" and "compose" (newer syntax)

### Issue 2: "Port 5288 is already in use"

**Solution:**
Something else is using that port.

1. Stop the conflicting service:
   ```cmd
   netstat -ano | findstr :5288
   ```
2. Note the PID number (last column)
3. Kill that process:
   ```cmd
   taskkill /PID <PID_NUMBER> /F
   ```
4. Try docker-compose again

**OR** change the port in `docker-compose.yml`:
1. Open `docker-compose.yml` in Notepad
2. Find the line:
   ```yaml
   - "5288:5288"
   ```
3. Change to:
   ```yaml
   - "5289:5288"
   ```
4. Save the file
5. Access at http://localhost:5289 instead

### Issue 3: "Docker Desktop is not running"

**Solution:**
1. Click the Windows Start button
2. Type "Docker Desktop"
3. Click to open it
4. Wait for the Docker whale icon in system tray
5. Try again when icon stops animating

### Issue 4: "Error response from daemon: driver failed programming external connectivity"

**Solution:**
1. Restart Docker Desktop:
   - Right-click Docker whale icon in system tray
   - Click "Quit Docker Desktop"
   - Wait 10 seconds
   - Start Docker Desktop again
2. Try docker-compose again

### Issue 5: Build is very slow or stuck

**Solution:**
1. Check your internet connection
2. Restart Docker Desktop
3. Try building one service at a time:
   ```cmd
   docker-compose build backend
   docker-compose build frontend
   docker-compose up
   ```

### Issue 6: "WSL 2 installation is incomplete"

**Solution:**
1. Open PowerShell as Administrator:
   - Windows Key + X
   - Click "Windows PowerShell (Admin)"
2. Run:
   ```powershell
   wsl --update
   ```
3. Restart your computer
4. Try Docker again

### Issue 7: Browser shows "This site can't be reached"

**Solution:**
1. Check Docker containers are running:
   ```cmd
   docker ps
   ```
   You should see 2 containers (backend and frontend)

2. If not running, check logs:
   ```cmd
   docker-compose logs
   ```

3. Try accessing backend directly:
   - Open browser to http://localhost:8288/docs
   - You should see API documentation

4. If backend works but frontend doesn't:
   ```cmd
   docker-compose restart frontend
   ```

### Issue 8: Want to see less text on screen

**Solution:**
Run in detached mode (background):
```cmd
docker-compose up -d
```

View logs when needed:
```cmd
docker-compose logs -f
```

Press `Ctrl + C` to stop viewing logs (containers keep running)

---

## Advanced: Updating MerkleGuard

If you need to get the latest version:

1. Stop containers:
   ```cmd
   docker-compose down
   ```

2. Update code:
   ```cmd
   git pull origin main
   ```

   OR download the ZIP again from GitHub

3. Rebuild and start:
   ```cmd
   docker-compose up --build
   ```

---

## Quick Reference Commands

| What you want to do | Command |
|---------------------|---------|
| Start for first time | `docker-compose up --build` |
| Start again | `docker-compose up` |
| Start in background | `docker-compose up -d` |
| Stop (keep data) | `Ctrl + C` in terminal |
| Stop and remove | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Restart | `docker-compose restart` |
| Check if running | `docker ps` |
| Remove everything | `docker-compose down -v` |

---

## Need More Help?

1. **Check Docker Desktop Dashboard:**
   - Open Docker Desktop
   - Click "Containers" on the left
   - See status of MerkleGuard containers

2. **View detailed logs:**
   ```cmd
   docker-compose logs backend
   docker-compose logs frontend
   ```

3. **Check Docker version:**
   ```cmd
   docker --version
   docker-compose --version
   ```

4. **Restart everything:**
   ```cmd
   docker-compose down
   docker-compose up --build --force-recreate
   ```

---

## What to Expect

**First run timing:**
- Docker image downloads: 5-10 minutes
- Building containers: 5-8 minutes
- Starting: 30 seconds
- **Total: ~15-20 minutes**

**Subsequent runs:**
- Starting: 30-60 seconds
- **Total: ~1 minute**

**System requirements:**
- Disk space: ~2-3 GB
- RAM: 4 GB minimum (8 GB recommended)
- CPU: Any modern processor

---

## Success Checklist

- ✅ Docker Desktop installed and running
- ✅ MerkleGuard code downloaded
- ✅ `docker-compose up --build` command executed
- ✅ Saw "Uvicorn running" message
- ✅ Browser opened to http://localhost:5288
- ✅ MerkleGuard dashboard visible
- ✅ Sidebar can collapse/expand
- ✅ Can navigate to different pages

**Congratulations! MerkleGuard is now running on your Windows machine! 🎉**

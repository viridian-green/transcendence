# # Run in 42 machines before make or compose

# --- Configuration ---
GOINFRE_PATH="$HOME/goinfre" 

# --- Safety Check ---
if [ ! -d "$GOINFRE_PATH" ]; then
    echo "ERROR: The /goinfre directory does not exist. Aborting script."
    exit 1
fi

echo "--- Starting Docker Rootless Symlink Repair ---"

# --- Step 1: Stop Docker and Clear Environment ---
echo "1. Stopping Docker daemon and clearing temp paths..."
# Stop the daemon to avoid file locking conflicts
systemctl --user stop docker.service 2>/dev/null 

# Clear temporary runtime files
rm -rf $XDG_RUNTIME_DIR/docker/ 2>/dev/null

# --- Step 2: Function to Create or Repair Symlinks ---
# Args: $1=Local Path, $2=Target Dir Name
fix_docker_symlink() {
    LOCAL_PATH="$1"
    TARGET_DIR="$GOINFRE_PATH/$2" # Note: Target Dir Name is now relative to goinfre

    echo "--- Repairing $LOCAL_PATH ---"

    # A. Remove local path to start clean (file, directory, or broken link)
    if [ -e "$LOCAL_PATH" ]; then
        echo "   -> Removing existing local path: $LOCAL_PATH"
        rm -rf "$LOCAL_PATH"
    fi

    # B. Create the target directory in goinfre (This fixes the "No such file or directory" error)
    if [ ! -d "$TARGET_DIR" ]; then
        echo "   -> Creating missing target directory: $TARGET_DIR"
    fi
    mkdir -p "$TARGET_DIR"

    # C. Create the symlink
    ln -s "$TARGET_DIR" "$LOCAL_PATH"
    echo "   -> Symlink created: $LOCAL_PATH -> $TARGET_DIR"
}

# --- Step 3: Fix Docker Symlinks ---
# Path 1: Docker Storage (where images/containers are kept - the big files)
fix_docker_symlink "$HOME/.local/share/docker" "docker-data/rootless_storage"

# Path 2: Docker Configuration (where config.json and certificates are kept - the file that caused the 'mkdir' error)
fix_docker_symlink "$HOME/.docker" ".docker"

# --- Step 4: Final Docker Daemon Management ---
# Copy init script to path, will be replaced by Dockerfike copying it to container
# echo "--- Copying init-scripts to local disk for Docker reliability ---"
# REPO_INIT_SCRIPTS="$HOME/sgoinfre/transcendence/init-scripts"
# LOCAL_INIT_SCRIPTS="$HOME/docker-init-scripts"
# if [ ! -d "$LOCAL_INIT_SCRIPTS" ]; then
#     mkdir -p "$LOCAL_INIT_SCRIPTS"
# fi
# cp -r "$REPO_INIT_SCRIPTS"/* "$LOCAL_INIT_SCRIPTS"/
# export INIT_SCRIPTS_PATH="$HOME/docker-init-scripts"
# echo "   -> Copied init-scripts to $LOCAL_INIT_SCRIPTS"

echo "--- Restarting Docker Daemon ---"
# Reload the user daemon to ensure it recognizes the updated symlinks
systemctl --user daemon-reload

# Start the Docker service
systemctl --user start docker.service

if docker ps > /dev/null 2>&1; then
    echo "SUCCESS: Docker daemon is running and storage paths are confirmed."
else
    echo "WARNING: Docker daemon failed to start. Check status and logs for specific errors."
    systemctl --user status docker.service
fi

echo "--- Script finished. Try your 'make rebuild' now. ---"
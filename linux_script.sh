# # Run in Linux before make
# # Define the required target path for the storage directory
# TARGET_DIR="$HOME/goinfre/docker-data/rootless_storage" # Using your existing goinfre target

# # 1. Create the new destination directory
# mkdir -p "$TARGET_DIR"

# # 2. Check if the default directory exists, and remove it if it's not a symlink
# if [ -d "$HOME/.local/share/docker" ] && [ ! -L "$HOME/.local/share/docker" ]; then
#     echo "Moving existing data..."
#     mv $HOME/.local/share/docker/* "$TARGET_DIR"
#     rmdir $HOME/.local/share/docker
# elif [ -e "$HOME/.local/share/docker" ]; then
#     echo "Removing conflicting file/link at $HOME/.local/share/docker"
#     rm -rf $HOME/.local/share/docker
# fi

# # 3. Create the symlink from the required path to the target directory
# ln -s "$TARGET_DIR" "$HOME/.local/share/docker"

#!/bin/bash

# --- Configuration ---
# Assuming /home/darotche/goinfre is the correct spacious partition
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
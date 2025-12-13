# Run in Linux before make
# Define the required target path for the storage directory
TARGET_DIR="$HOME/goinfre/docker-data/rootless_storage" # Using your existing goinfre target

# 1. Create the new destination directory
mkdir -p "$TARGET_DIR"

# 2. Check if the default directory exists, and remove it if it's not a symlink
if [ -d "$HOME/.local/share/docker" ] && [ ! -L "$HOME/.local/share/docker" ]; then
    echo "Moving existing data..."
    mv $HOME/.local/share/docker/* "$TARGET_DIR"
    rmdir $HOME/.local/share/docker
elif [ -e "$HOME/.local/share/docker" ]; then
    echo "Removing conflicting file/link at $HOME/.local/share/docker"
    rm -rf $HOME/.local/share/docker
fi

# 3. Create the symlink from the required path to the target directory
ln -s "$TARGET_DIR" "$HOME/.local/share/docker"
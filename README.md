## Quick Start

```bash
make up        # Start services (generates certs automatically)
make logs      # Start with live logs
make down      # Stop services
make rebuild   # Clean rebuild
```

### **Usage:**

```bash
# First time (or after git clone)
make up

# Subsequent starts
make up  # or just: docker compose up -d
```

# Docker daemon
systemctl --user start docker.service
systemctl --user stop docker.service
systemctl --user status docker
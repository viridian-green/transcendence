# =========================================
# Stage 1: Build React (Vite)
# =========================================
FROM node:24.7.0-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
RUN npm run build


# =========================================
# Stage 2: Serve with Nginx (SPA-safe)
# =========================================
FROM nginxinc/nginx-unprivileged:alpine3.22

USER root

# Create SSL directory with proper permissions
RUN mkdir -p /etc/nginx/ssl && \
    chown -R nginx:nginx /etc/nginx/ssl && \
    chmod 755 /etc/nginx/ssl

USER nginx

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Copy SSL certificates
COPY --chown=nginx:nginx ssl/frontend.crt /etc/nginx/ssl/frontend.crt
COPY --chown=nginx:nginx ssl/frontend.key /etc/nginx/ssl/frontend.key

# Switch back to root to fix permissions
USER root
RUN chmod 644 /etc/nginx/ssl/frontend.crt && \
    chmod 600 /etc/nginx/ssl/frontend.key && \
    chown nginx:nginx /etc/nginx/ssl/frontend.crt /etc/nginx/ssl/frontend.key

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
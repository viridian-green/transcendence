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

USER nginx

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
# =========================================================
# Frontend Multi-Stage Dockerfile for React SPA
# Stage 1: Build Application
# Stage 2: Production Nginx Server
# =========================================================

# Stage 1: Build React Assets
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# Stage 2: Production Nginx Engine
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx HTML files
RUN rm -rf ./*

# Copy built artifacts from builder stage
COPY --from=build /app/dist .

# Copy custom reverse-proxy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]


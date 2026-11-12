# =========================================================
# Backend Dockerfile for Smart Medicine Ordering Portal
# Multi-stage production container
# =========================================================

FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies first (leverage Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy application source code
COPY . .

# Ensure upload directory exists with proper permissions
RUN mkdir -p uploads && chown -R node:node /usr/src/app

# Switch to non-root user for security best practices
USER node

# Expose backend API port
EXPOSE 5000

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "server.js"]


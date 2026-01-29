FROM node:20-alpine

# Install build dependencies for better-sqlite3 and curl for healthcheck
RUN apk add --no-cache python3 make g++ curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY src ./src
COPY public ./public
COPY public-readonly ./public-readonly

# Create data directory
RUN mkdir -p /app/data/uploads && chmod 755 /app/data

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV PUBLIC_PORT=3001
ENV DB_PATH=/app/data/cv.db

# Expose ports
EXPOSE 3000 3001

# Health check (port 3001 runs in both admin and public-only modes)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3001/api/profile || exit 1

# Run as nobody:users (99:100) for Unraid compatibility
USER 99:100

CMD ["node", "src/server.js"]

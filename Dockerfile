FROM node:20-alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

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

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/profile || exit 1

# Run as root for Unraid compatibility with volume mounts
# (Unraid creates appdata directories with varying ownership)
CMD ["node", "src/server.js"]

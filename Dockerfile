# ============================================
# Stage 1: Build dependencies (optional optimization)
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including devDependencies for potential build steps)
RUN npm ci --only=production && npm cache clean --force

# ============================================
# Stage 2: Production image
# ============================================
FROM node:18-alpine

# Add metadata labels
LABEL maintainer="meeting-registration-system"
LABEL description="Meeting Registration System - Node.js web application"
LABEL version="1.0.0"

# Install dumb-init and wget for proper signal handling and healthchecks
RUN apk add --no-cache dumb-init wget

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Copy installed dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY --chown=nodejs:nodejs . .

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R nodejs:nodejs /app/data && \
    chmod 755 /app/data

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3030

# Add healthcheck (using wget which is available in alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3030 || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server.js"]

